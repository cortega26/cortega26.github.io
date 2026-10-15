#!/usr/bin/env python3
"""Python Performance Lab v3: independent-process, counterbalanced CPython benchmarks.

Works with Python >= 3.11 on Linux; uses the standard library only. It never
changes the machine's governor, compiler flags, pyenv selection, or projects.

Examples:
  python3 benchmark_python_versions_v3.py --audit
  python3 benchmark_python_versions_v3.py --quick
  python3 benchmark_python_versions_v3.py --rounds 7
  python3 benchmark_python_versions_v3.py --cpu 2 --rounds 9
  python3 benchmark_python_versions_v3.py --self-test --quick
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import datetime as datetime
import hashlib
import html
import itertools
import json
import math
import os
import platform
import random
import re
import resource
import shutil
import sqlite3
import statistics as stats
import subprocess
import sys
import sysconfig
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

SCHEMA = "3.0"
DEFAULT_VERSIONS = ("3.13.12", "3.14.3", "3.15.0")
# Fixtures are created before the clock starts. Every process uses identical data.
CASES = {
    "enteros": ("Python puro", "Aritmética entera y sumatoria"),
    "flotantes": ("Cálculo", "Funciones float/math (incluye libm en C)"),
    "comprehensions": ("Python puro", "Construcción y filtrado de listas"),
    "etl_puro": ("Datos", "Filtrado y agregación de registros sin Pandas"),
    "json_encode": ("Datos", "Serialización JSON de 900 registros"),
    "json_decode": ("Datos", "Deserialización del mismo JSON"),
    "regex": ("Texto", "Extracción de patrones precompilados"),
    "sqlite": ("Datos", "SELECT/GROUP BY en SQLite en memoria"),
    "asyncio": ("Concurrencia", "Planificación de 500 corrutinas triviales"),
    "hilos_io": ("Concurrencia", "40 esperas artificiales con ocho hilos; NO es prueba de CPU"),
    "base32": ("Codificación", "Codificación Base32 de 8 KiB"),
    "base64": ("Codificación", "Codificación Base64 de 8 KiB"),
}
START_CASES = {"arranque_normal": "Inicio de Python (-I -c pass)",
               "arranque_sin_site": "Inicio de Python (-I -S -c pass)"}
ALL_CASES = (*CASES, *START_CASES)


def fixture(name: str):
    if name == "enteros":
        nums = tuple(range(30000))
        return lambda: sum((i*i + 7*i) % 10007 for i in nums)
    if name == "flotantes":
        nums = tuple(i / 1000.0 for i in range(14000))
        return lambda: sum(math.sin(x) * math.cos(x) + math.sqrt(x + 1) for x in nums)
    if name == "comprehensions":
        nums = tuple(range(30000))
        def go():
            vals = [(i*i) % 9973 for i in nums if i % 3]
            return (len(vals), sum(vals), vals)
        return go
    if name == "etl_puro":
        rows = tuple((i % 137, (i*17) % 10007, i % 5) for i in range(22000))
        def go():
            groups = {}
            for key, amount, status in rows:
                if status <= 2 and amount > 300:
                    groups[key] = groups.get(key, 0) + amount
            return (len(groups), sum(groups.values()), groups)
        return go
    if name in ("json_encode", "json_decode"):
        obj = {"records": [{"id": i, "name": f"item-{i}", "value": i % 101,
                            "active": i % 3 == 0} for i in range(900)]}
        payload = json.dumps(obj, separators=(",", ":"))
        if name == "json_encode":
            def go():
                encoded = json.dumps(obj, separators=(",", ":"))
                return encoded
            return go
        def go():
            decoded = json.loads(payload)
            return decoded
        return go
    if name == "regex":
        corpus = " ".join(f"id={i:06d}; name=item{i}; amount={i%1000}" for i in range(3000))
        compiled = re.compile(r"id=(\d{6}); name=(item\d+); amount=(\d+)")
        def go():
            matches = compiled.findall(corpus)
            return matches
        return go
    if name == "sqlite":
        conn = sqlite3.connect(":memory:")
        conn.execute("CREATE TABLE measurements (group_id INTEGER, amount INTEGER)")
        conn.executemany("INSERT INTO measurements VALUES (?, ?)",
                         ((i % 137, (i*17) % 10007) for i in range(12000)))
        query = "SELECT group_id, SUM(amount) FROM measurements GROUP BY group_id"
        def go():
            rows = conn.execute(query).fetchall()
            return (len(rows), sum(v for _, v in rows), rows)
        go.close = conn.close
        return go
    if name == "asyncio":
        async def go_async():
            async def task(i):
                await asyncio.sleep(0)
                return i
            values = await asyncio.gather(*(task(i) for i in range(500)))
            return (sum(values), values)
        return lambda: asyncio.run(go_async())
    if name == "hilos_io":
        def go():
            def task(i):
                time.sleep(.001)
                return i
            with ThreadPoolExecutor(max_workers=8) as executor:
                values = list(executor.map(task, range(40)))
                return (sum(values), values)
        return go
    if name in ("base32", "base64"):
        import base64
        binary = bytes((i * 73 + 19) % 256 for i in range(8192))
        encoder = base64.b32encode if name == "base32" else base64.b64encode
        def go():
            data = encoder(binary)
            return data
        return go
    raise ValueError(name)


def digest_output(value):
    """Hash the *whole* output outside timed work; stable across Python versions.

    Type separation avoids conflating textual and binary encodings of equal bytes.
    """
    if isinstance(value, bytes):
        prefix, payload = b"bytes:", value
    elif isinstance(value, str):
        prefix, payload = b"str:", value.encode("utf-8")
    else:
        prefix = b"json:"
        payload = json.dumps(value, sort_keys=True, separators=(",", ":"),
                             ensure_ascii=True, allow_nan=False).encode("utf-8")
    return hashlib.sha256(prefix + payload).hexdigest()


def worker(name: str, samples: int, budget_ms: int):
    fn = fixture(name)
    checksum = None
    for _ in range(5):
        checksum = fn()
    before_sha256 = digest_output(checksum)
    # Autocalibrate to amortize overhead and normalize run durations.
    loops = 1
    while True:
        t0 = time.perf_counter_ns()
        for _ in range(loops):
            fn()
        elapsed_ns = time.perf_counter_ns() - t0
        if elapsed_ns >= int(budget_ms * .75 * 1e6) or loops >= 100000:
            break
        loops = min(100000, max(loops+1, int(loops * budget_ms * 1e6 / max(1, elapsed_ns))))
    times = []
    for _ in range(samples):
        start = time.perf_counter_ns()
        for _ in range(loops):
            fn()
        times.append((time.perf_counter_ns() - start) / loops / 1e6)
    after_sha256 = digest_output(fn())
    if before_sha256 != after_sha256:
        raise RuntimeError(f"Salida inestable para el escenario {name}")
    if hasattr(fn, "close"):
        fn.close()
    jit = getattr(sys, "_jit", None)
    jit_active = getattr(jit, "is_enabled", None)
    flags = {k: sysconfig.get_config_var(k) for k in
             ("CONFIG_ARGS", "CC", "CFLAGS", "PY_CFLAGS", "LDFLAGS", "Py_GIL_DISABLED", "Py_DEBUG", "WITH_PYMALLOC")}
    ru = resource.getrusage(resource.RUSAGE_SELF)
    print(json.dumps({
        "case": name, "samples_ms": times, "median_ms": stats.median(times),
        "loops": loops, "checksum": before_sha256,
        "checksum_algorithm": "sha256(full-output; outside timing)",
        "rss_peak_mib": ru.ru_maxrss / 1024,
        "involuntary_context_switches": ru.ru_nivcsw,
        "voluntary_context_switches": ru.ru_nvcsw,
        "version": platform.python_version(), "implementation": platform.python_implementation(),
        "jit_enabled": bool(jit_active()) if callable(jit_active) else False,
        "free_threaded": bool(sysconfig.get_config_var("Py_GIL_DISABLED")),
        "config": flags, "timer_resolution_ns": time.get_clock_info("perf_counter").resolution*1e9,
    }, ensure_ascii=False, default=str))


def read_text(path):
    try:
        return Path(path).read_text(encoding="utf-8").strip()
    except (OSError, UnicodeError):
        return None


def cpu_info(cpu):
    base = Path(f"/sys/devices/system/cpu/cpu{cpu}")
    freq = base / "cpufreq"
    def mhz(name):
        val = read_text(freq / name)
        try:
            return round(int(val)/1000, 1)
        except (ValueError, TypeError):
            return None
    return {"logical_cpu": cpu,
            "core_id": read_text(base / "topology/core_id"),
            "siblings": read_text(base / "topology/thread_siblings_list"),
            "core_type": read_text(base / "topology/core_type"),
            "maximum_mhz": mhz("cpuinfo_max_freq"),
            "current_mhz": mhz("scaling_cur_freq"),
            "governor": read_text(freq / "scaling_governor"),
            "driver": read_text(freq / "scaling_driver")}


def available_cpus():
    if hasattr(os, "sched_getaffinity"):
        return sorted(os.sched_getaffinity(0))
    return list(range(os.cpu_count() or 1))


def select_cpu(allowed, target):
    if target is not None:
        if target not in allowed:
            raise ValueError(f"CPU {target} no permitido. Disponibles: {allowed}")
        return target
    # Prefer a P core based on kernel core_type=2 (Core), then max frequency.
    # Never assume CPU 0 is a P-core if the OS does not report topology.
    details = [cpu_info(cpu) for cpu in allowed]
    return max(details, key=lambda d: (d["core_type"] == "2",
                                      d["maximum_mhz"] or 0,
                                      -(d["logical_cpu"]))) ["logical_cpu"]


def audit(selected_cpu):
    allowed = available_cpus()
    cpus = [cpu_info(c) for c in allowed]
    model = None
    cpuinfo = read_text("/proc/cpuinfo") or ""
    match = re.search(r"^model name\s*:\s*(.+)$", cpuinfo, re.M)
    if match:
        model = match.group(1)
    temps = {}
    hwmon = Path("/sys/class/hwmon")
    if hwmon.exists():
        for node in sorted(hwmon.glob("hwmon*")):
            sensor = read_text(node / "name") or node.name
            for t in node.glob("temp*_input"):
                label = read_text(t.with_name(t.name.replace("_input", "_label"))) or t.stem
                milli = read_text(t)
                try:
                    celsius = int(milli) / 1000
                    if -20 <= celsius <= 150:
                        temps[f"{sensor}/{label}"] = round(celsius, 1)
                except (ValueError, TypeError):
                    pass
    return {
        "utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "cpu_model": model,
        "platform": platform.platform(), "kernel": platform.release(),
        "logical_cpu_allowed": allowed, "selected_cpu": selected_cpu,
        "selected_cpu_info": cpu_info(selected_cpu) if selected_cpu is not None else None,
        "cpu_topology": cpus,
        "load_average": list(os.getloadavg()) if hasattr(os, "getloadavg") else None,
        "temperatures_c": temps,
        "intel_turbo_disabled": read_text("/sys/devices/system/cpu/intel_pstate/no_turbo"),
        "isolated_cpus": read_text("/sys/devices/system/cpu/isolated"),
    }


def env_clean():
    env = os.environ.copy()
    for key in list(env):
        if key.startswith("PYTHON") or key in ("VIRTUAL_ENV", "PYENV_VERSION", "CONDA_PREFIX"):
            env.pop(key, None)
    env.update({"PYTHONHASHSEED": "0", "PYTHONNOUSERSITE": "1",
                "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C", "TZ": "UTC"})
    return env


def run_process(cmd, *, cpu, env, timeout):
    # POSIX subprocess affinity applied before interpreter starts.
    def pin():
        os.sched_setaffinity(0, {cpu})
    res = subprocess.run(cmd, capture_output=True, text=True, env=env,
                         timeout=timeout, preexec_fn=pin if cpu is not None else None)
    if res.returncode:
        raise RuntimeError(f"Error ({res.returncode}) en {cmd[0]}: {res.stderr[-1800:]}")
    return res.stdout.strip()


def start_case(executable, case, *, sample_count, cpu, env):
    cmd = [str(executable), "-I"]
    if case == "arranque_sin_site":
        cmd.append("-S")
    cmd.extend(["-c", "pass"])
    for _ in range(3):
        run_process(cmd, cpu=cpu, env=env, timeout=10)
    result = []
    for _ in range(sample_count):
        t0 = time.perf_counter_ns()
        run_process(cmd, cpu=cpu, env=env, timeout=10)
        result.append((time.perf_counter_ns() - t0) / 1e6)
    return {"samples_ms": result, "median_ms": stats.median(result),
            "loops": 1, "checksum": None, "rss_peak_mib": None,
            "involuntary_context_switches": None, "voluntary_context_switches": None}


def find_binaries(versions, self_test):
    if self_test:
        p = Path(sys.executable).resolve()
        return {"local": p}, "self-test; interpreter currently executing the script"
    pyenv = shutil.which("pyenv")
    if not pyenv:
        raise RuntimeError("pyenv no está disponible. Usa --self-test solo para validar el script")
    root = Path(subprocess.check_output([pyenv, "root"], text=True).strip()).expanduser()
    result = {v: root / "versions" / v / "bin" / "python3" for v in versions}
    missing = [str(p) for p in result.values() if not p.is_file()]
    if missing:
        raise RuntimeError("Intérpretes no encontrados: " + ", ".join(missing))
    return result, str(root)


def balanced_order(labels, round_index, case_index):
    # Latin-square-like rotation over rounds per scenario; reverse alternate rounds.
    k = len(labels)
    shift = ((round_index % k) + case_index) % k
    order = labels[shift:] + labels[:shift]
    if (round_index // k) % 2:
        order.reverse()
    return order


def percentile(sorted_values, quantile):
    if not sorted_values:
        return None
    pos = (len(sorted_values)-1) * quantile
    floor = int(pos)
    fraction = pos - floor
    return sorted_values[floor] * (1-fraction) + sorted_values[min(floor+1, len(sorted_values)-1)] * fraction


def paired_bootstrap(old, new, *, seed=42117, iterations=6000):
    # Independent *process rounds* as units; do not treat within-process samples
    # as independent experimental replicates.
    assert len(old) == len(new) and len(new) > 0
    log_ratios = [math.log(a/b) for a, b in zip(old, new)]
    log_mean = stats.mean(log_ratios)
    rng = random.Random(seed)
    boots = []
    n = len(log_ratios)
    for _ in range(iterations):
        boots.append(math.expm1(sum(log_ratios[rng.randrange(n)] for _ in range(n)) / n) * 100)
    boots.sort()
    return {"speedup_pct": math.expm1(log_mean) * 100,
            "ci95_lo_pct": percentile(boots, .025),
            "ci95_hi_pct": percentile(boots, .975),
            "pair_ratios": [math.exp(x) for x in log_ratios]}


def aggregate(records, labels, *, baseline, candidate, rounds, seed):
    indices = {(r["case"], r["label"], r["round"]): r for r in records}
    out = []
    for case in ALL_CASES:
        if any((case, v, rr) not in indices for v in labels for rr in range(1, rounds+1)):
            continue
        medians = {v: [indices[(case, v, rr)]["median_ms"] for rr in range(1, rounds+1)] for v in labels}
        cvs = {v: (stats.stdev(vals) / stats.mean(vals) * 100) if len(vals)>1 else None
               for v, vals in medians.items()}
        comparisons = {}
        for a, b in ((baseline, candidate), (labels[0], candidate)):
            if a == b or (a, b) in comparisons:
                continue
            comparison = paired_bootstrap(medians[a], medians[b], seed=seed+len(out))
            ci = (comparison["ci95_lo_pct"], comparison["ci95_hi_pct"])
            comparison["interpretation"] = (
                "mejora probable" if rounds >= 5 and ci[0] > 0 and comparison["speedup_pct"] >= 2 else
                "regresión probable" if rounds >= 5 and ci[1] < 0 and comparison["speedup_pct"] <= -2 else
                "inconcluso")
            comparisons[f"{b}_vs_{a}"] = comparison
        out.append({"case": case,
                    "category": CASES.get(case, ("Arranque", ""))[0],
                    "description": CASES.get(case, (None, START_CASES.get(case)))[1],
                    "median_ms": {v: stats.median(x) for v,x in medians.items()},
                    "cv_round_pct": cvs,
                    "comparisons": comparisons})
    return out


def warnings_for(machine, summaries, rounds, quick, records=None):
    notes = []
    if quick or rounds < 5:
        notes.append("Modo preliminar: menos de cinco procesos independientes por escenario y versión")
    cpu = machine["start"]["selected_cpu_info"]
    if cpu and cpu["governor"] not in ("performance", None):
        notes.append(f"Gobernador CPU '{cpu['governor']}': la frecuencia puede variar entre mediciones")
    if not machine["start"]["isolated_cpus"]:
        notes.append("Afinidad no implica aislamiento: el sistema puede programar otras tareas en el núcleo")
    if cpu and cpu["core_type"] is None:
        notes.append("El kernel no expone core_type: se eligió el núcleo por frecuencia máxima. Comprueba P/E con lscpu -e")
    if machine["start"]["load_average"] and machine["start"]["load_average"][0] > max(2, len(machine["start"]["logical_cpu_allowed"])*.22):
        notes.append("Carga del sistema elevada al inicio; repetir con el equipo en reposo")
    temps = [v for snapshot in [machine["start"], *machine["rounds"], machine["end"]] if snapshot for k,v in snapshot["temperatures_c"].items() if "coretemp" in k.lower()]
    if temps and max(temps) >= 90:
        notes.append(f"Temperatura de CPU ≥90 °C observada (máxima {max(temps):g} °C); posible throttling")
    if machine["start"]["temperatures_c"] == {}:
        notes.append("No se pudo registrar la temperatura; posible throttling no verificable")
    if any((s["cv_round_pct"].get(v) or 0) > 5 for s in summaries for v in s["cv_round_pct"]):
        notes.append("Al menos un escenario tuvo dispersión >5% entre procesos independientes")
    notes.append("Informe de una sola sesión: intervalos bootstrap exploratorios; corrección múltiple en consolidado")
    busy = [r.get("sibling_busy_pct") for r in (records or [])]
    if any(x is not None and x > 15 for x in busy):
        notes.append("Se detectó actividad >15% en el hilo lógico hermano durante al menos una medición")
    notes.append("Resultados locales: no son representativos de todas las arquitecturas o configuraciones")
    return notes


def inline_forest_svg(summaries, key, *, graph_width=900):
    # Publication-ready SVG; clipping reveals extreme speedups instead of hiding them.
    relevant = [s for s in summaries if key in s["comparisons"]]
    max_abs = max([15.0] + [abs(s["comparisons"][key][k]) for s in relevant
                             for k in ("speedup_pct", "ci95_lo_pct", "ci95_hi_pct")])
    # Cap axis to make ordinary performance differences readable; clipped points get arrows.
    bound = 35.0 if max_abs > 35 else max(15, math.ceil(max_abs / 5) * 5)
    height = 115 + len(relevant) * 35
    x0, x1 = 250, graph_width - 165
    mid = (x0+x1)/2
    def xpos(percent):
        return mid + max(-bound,min(bound,percent)) / bound * (x1-x0)/2
    rows = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{graph_width}" height="{height}" viewBox="0 0 {graph_width} {height}" role="img" aria-label="Comparación de velocidad por escenario">',
            '<rect width="100%" height="100%" fill="#0d1422"/>',
            '<text x="26" y="34" fill="#f0f5ff" font-size="20" font-weight="700" font-family="sans-serif">Python: rendimiento medido, no prometido</text>',
            f'<text x="26" y="57" fill="#a4b4cc" font-size="12" font-family="sans-serif">Ventaja porcentual del candidato · referencia: {html.escape(key.split("_vs_")[-1])} · barras: IC exploratorio del 95%</text>']
    for tick in (-bound, -bound/2, 0, bound/2, bound):
        x = xpos(tick)
        rows.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="78" y2="{height-44}" stroke="{ "#66748c" if tick==0 else "#263449" }" stroke-width="{2 if tick==0 else 1}"/>')
        rows.append(f'<text x="{x:.1f}" y="{height-23}" fill="#a4b4cc" font-size="11" text-anchor="middle" font-family="sans-serif">{tick:+g}%</text>')
    for i, item in enumerate(relevant):
        y = 94 + i * 35
        comp = item["comparisons"][key]
        v,lo,hi = (comp[k] for k in ("speedup_pct","ci95_lo_pct","ci95_hi_pct"))
        positive = lo > 0
        negative = hi < 0
        color = "#42c9a1" if positive else "#fa8f7e" if negative else "#a6a8f7"
        rows.append(f'<text x="26" y="{y+5}" fill="#f0f5ff" font-family="sans-serif" font-size="13">{html.escape(item["case"])}</text>')
        rows.append(f'<line x1="{xpos(lo):.1f}" x2="{xpos(hi):.1f}" y1="{y}" y2="{y}" stroke="{color}" stroke-width="5" stroke-linecap="round" opacity=".63"/>')
        rows.append(f'<circle cx="{xpos(v):.1f}" cy="{y}" r="5" fill="{color}"/>')
        suffix = " →" if v > bound else " ←" if v < -bound else ""
        rows.append(f'<text x="{graph_width-145}" y="{y+5}" fill="{color}" font-family="monospace" font-size="13">{v:+.1f}%{suffix}</text>')
    rows.append(f'<text x="26" y="{height-7}" fill="#8da2c2" font-size="11" font-family="sans-serif">Menos tiempo / mayor velocidad = valor positivo · valores extremos recortados visualmente a ±{bound:g}%</text>')
    rows.append('</svg>')
    return "\n".join(rows)


def make_report(target, dataset, *, baseline, candidate, quick):
    summaries = dataset["summary"]
    versions = dataset["config"]["versions"]
    warnings = dataset["warnings"]
    comparison_keys = [(name, f"{candidate}_vs_{name}") for name in versions if name != candidate]
    chart_files = {}
    for reference, key in comparison_keys:
        file = f"comparacion_{candidate.replace('.', '')}_vs_{reference.replace('.', '')}.svg"
        (target / file).write_text(inline_forest_svg(summaries, key), encoding="utf-8")
        chart_files[reference] = file
    if baseline in chart_files:
        (target/"comparacion.svg").write_text((target/chart_files[baseline]).read_text(encoding="utf-8"), encoding="utf-8")

    columns = ["Escenario", *[f"{v} (ms)" for v in versions],
               *[f"3.15 vs {ref} [% / IC95%]".replace("3.15", candidate) for ref, _ in comparison_keys]]
    sep = [":--", *["--:"]*len(versions), *[":--"]*len(comparison_keys)]
    rows = []
    htmlrows = []
    for item in summaries:
        cells = [item["case"], *[f"{item['median_ms'][v]:.4f}" for v in versions]]
        details = []
        for ref, key in comparison_keys:
            comp = item["comparisons"].get(key)
            if comp:
                cells.append(f"{comp['speedup_pct']:+.1f}% [{comp['ci95_lo_pct']:+.1f}, {comp['ci95_hi_pct']:+.1f}]")
                details.append(f"{comp['speedup_pct']:+.1f}%")
            else:
                cells.append("—")
                details.append("—")
        rows.append("| " + " | ".join(cells) + " |")
        htmlrows.append('<tr><th scope="row">'+html.escape(item['case'])+'</th>'+''.join(
            '<td>'+html.escape(v)+'</td>' for v in [*[f"{item['median_ms'][version]:.4f}" for version in versions], *details])+'</tr>')
    snapshots = {}
    for version in versions:
        row = next((r for r in dataset["runs"] if r["label"] == version and r["case"] not in START_CASES), {})
        snapshots[version] = {"jit_enabled": row.get("jit_enabled"),
                              "free_threaded": row.get("free_threaded"),
                              "config_args": row.get("config",{}).get("CONFIG_ARGS"),
                              "cc": row.get("config",{}).get("CC"),
                              "cflags": row.get("config",{}).get("CFLAGS")}
    md = ["# Python Performance Lab — Comparación reproducible", "",
          f"- Fecha UTC: {dataset['machine']['start']['utc']}",
          f"- CPU: {dataset['machine']['start']['cpu_model']}",
          f"- Linux: {dataset['machine']['start']['platform']}",
          f"- CPU lógico elegido: {dataset['machine']['start']['selected_cpu']}",
          f"- Topología: `{json.dumps(dataset['machine']['start']['selected_cpu_info'],ensure_ascii=False)}`",
          f"- Python: {', '.join(versions)}",
          f"- Rondas independientes: {dataset['config']['rounds']}",
          f"- Muestras por proceso: {dataset['config']['samples']}",
          f"- Objetivo temporal por muestra: {dataset['config']['budget_ms']} ms",
          f"- Semilla del orden: {dataset['config']['seed']}",
          f"- SHA-256 del script: `{dataset['config']['script_sha256']}`", "",
          "## Todos los resultados", "",
          "Los tiempos son la mediana entre medianas de procesos independientes (ms). "
          "Los porcentajes son **aceleración relativa**: +10% significa 1,10× más velocidad, no una reducción del 10% del tiempo.", "",
          "| " + " | ".join(columns) + " |",
          "| " + " | ".join(sep) + " |", *rows, ""]
    for reference, key in comparison_keys:
        md += [f"### Python {candidate} frente a {reference}", "",
               f"![Comparación con intervalos de confianza]({chart_files[reference]})", ""]
    md += ["## Precauciones metodológicas", "", *[f"- {w}" for w in warnings], "",
           "## Compilaciones verificadas (metadatos de cada proceso)", "",
           "```json", json.dumps(snapshots, indent=2, ensure_ascii=False), "```", "",
           "## Protocolo de medición", "",
           "1. Cada combinación versión × escenario × ronda se mide en un **proceso nuevo**.",
           "2. Las entradas se construyen fuera de la región cronometrada. Hay precalentamiento y calibración.",
           "3. El orden de versiones se contrabalancea y el de escenarios se permuta por ronda de forma reproducible.",
           "4. La afinidad de CPU y el ambiente son iguales en cada invocación; no se toca la configuración del sistema.",
           "5. Las comparaciones utilizan razones pareadas por ronda y bootstrap a nivel de ronda; las muestras internas NO se tratan como observaciones independientes.",
           "6. Los intervalos son exploratorios y no ajustados por múltiples pruebas; 'mejora probable' es una descripción local, no garantía estadística universal.",
           "7. SQLite y las funciones `math` incluyen librerías C. Los hilos simulan latencia I/O; no son una prueba multicore.",
           "8. El arranque mide también creación de proceso. '-S' excluye importación de `site`; '-I' aísla ambiente Python.",
           "9. `rss_peak_mib` incluye memoria del proceso y datos de entrada, no solo objetos Python.",
           "10. Se comparan las **compilaciones realmente instaladas**, no builds garantizados equivalentes en cada flag del compilador.", "",
           "## Archivos que permiten reproducir y auditar", "",
           "`resultados.json`, `muestras.csv`, `resumen.csv`, este documento, gráficos SVG y script original.", ""]
    (target/"informe.md").write_text("\n".join(md)+"\n", encoding="utf-8")
    header = ''.join('<th>'+html.escape(x)+'</th>' for x in columns[:1]+[*[f"{v} (ms)" for v in versions]]+[f"Δ vs {x}" for x,_ in comparison_keys])
    plots = ''.join(f'<section class="panel"><h2>{html.escape(candidate)} frente a {html.escape(ref)}</h2><img loading="lazy" src="{filename}" alt="Diferencia de velocidad e intervalos por escenario"></section>' for ref,filename in chart_files.items())
    note_html = ''.join(f'<li>{html.escape(w)}</li>' for w in warnings)
    page = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Python Performance Lab · Resultados reales</title>
<style>body{{margin:0;background:#090f1c;color:#edf4ff;font:16px/1.55 system-ui,sans-serif}}main{{max-width:1000px;margin:auto;padding:clamp(18px,4vw,55px)}}h1{{font-size:clamp(32px,5vw,50px);line-height:1.13}}p,.sub{{color:#becde1}}.lead{{font-size:20px}}.eyebrow{{color:#60dbc1;font-size:13px;letter-spacing:.13em;font-weight:800}}.panel{{background:#111d30;border:1px solid #2a3b57;border-radius:16px;padding:22px;margin:22px 0;overflow:hidden}}.panel img{{display:block;width:100%;max-width:900px;margin:auto;height:auto}}.scroll{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{padding:11px;border-bottom:1px solid #33445c;text-align:right;white-space:nowrap}}th:first-child,td:first-child{{text-align:left}}tr:hover{{background:#1b2a41}}a{{color:#74d5fc}}.small,footer{{font-size:13px;color:#a8b8cf}}.method{{max-width:78ch}}</style></head>
<body><main><p class="eyebrow">BENCHMARK REAL · CPYTHON · LINUX</p><h1>Python 3.13, 3.14 y 3.15: ¿cuál gana realmente?</h1><p class="lead">{html.escape(dataset['machine']['start']['cpu_model'] or 'CPU desconocida')} · {dataset['config']['rounds']} rondas independientes · datos completos disponibles.</p>
{plots}<section class="panel scroll"><h2>Los números, sin filtros</h2><table><thead><tr>{header}</tr></thead><tbody>{''.join(htmlrows)}</tbody></table><p class="small">Δ positivo indica mayor velocidad del candidato. Intervalos completos en <a href="informe.md">informe.md</a>.</p></section>
<section class="panel method"><h2>¿Cómo lo probamos?</h2><p>Mismo hardware, afinidad de CPU y datos por escenario. Repetimos mediciones en procesos nuevos y contrabalanceamos el orden de versiones para reducir sesgos. Publicamos scripts, metadatos y cada muestra.</p><h3>Limitaciones honestas</h3><ul>{note_html}</ul></section>
<footer>Visualización autogenerada · <a href="informe.md">Metodología completa</a> · <a href="resultados.json">Datos JSON</a> · <a href="muestras.csv">Muestras CSV</a></footer></main></body></html>'''
    (target/"reporte.html").write_text(page,encoding="utf-8")

def save(target, machine, config, records, summaries, warnings, baseline, candidate, quick):
    dataset={"schema_version":SCHEMA,"machine":machine,"config":config,
             "runs":records,"summary":summaries,"warnings":warnings}
    (target/"resultados.json").write_text(json.dumps(dataset,indent=2,ensure_ascii=False,default=str),encoding="utf-8")
    with (target/"muestras.csv").open("w",newline="",encoding="utf-8") as f:
        fields=["round","case","version","sample_index","ms_per_call"]
        writer=csv.DictWriter(f,fieldnames=fields); writer.writeheader()
        for record in records:
            for i,ms in enumerate(record["samples_ms"],1):
                writer.writerow({"round":record["round"],"case":record["case"],
                    "version":record["label"],"sample_index":i,"ms_per_call":ms})
    with (target/"resumen.csv").open("w",newline="",encoding="utf-8") as f:
        fields=["case","category","version","median_ms","cv_round_pct",
                "baseline","candidate","speedup_pct","ci95_lo_pct","ci95_hi_pct","interpretation"]
        writer=csv.DictWriter(f,fieldnames=fields); writer.writeheader()
        for row in summaries:
            comp=row["comparisons"].get(f"{candidate}_vs_{baseline}") or {}
            for v in config["versions"]:
                writer.writerow({"case":row["case"],"category":row["category"],"version":v,
                                 "median_ms":row["median_ms"][v],"cv_round_pct":row["cv_round_pct"][v],
                                 "baseline":baseline,"candidate":candidate,
                                 "speedup_pct":comp.get("speedup_pct"),"ci95_lo_pct":comp.get("ci95_lo_pct"),
                                 "ci95_hi_pct":comp.get("ci95_hi_pct"),"interpretation":comp.get("interpretation")})
    if summaries and baseline in config["versions"] and candidate in config["versions"]:
        make_report(target,dataset,baseline=baseline,candidate=candidate,quick=quick)
    return dataset



def read_cpu_counters(cpu: int | None):
    """Capture /proc/stat counters for the sibling logical CPU (not a perf event)."""
    if cpu is None:
        return None
    try:
        siblings = cpu_info(cpu)["siblings"]
        if not siblings:
            return None
        sibling_ids = []
        for group in siblings.split(","):
            if "-" in group:
                lo, hi = map(int, group.split("-"))
                sibling_ids.extend(range(lo, hi + 1))
            else:
                sibling_ids.append(int(group))
        others = [x for x in sibling_ids if x != cpu]
        if not others:
            return None
        sibling = others[0]
        for line in Path("/proc/stat").read_text().splitlines():
            cols = line.split()
            if cols and cols[0] == f"cpu{sibling}":
                ticks = list(map(int, cols[1:]))
                return (sibling, sum(ticks), ticks[3] + (ticks[4] if len(ticks) > 4 else 0))
    except (OSError, ValueError, IndexError):
        pass
    return None


def sibling_busy_pct(first, last):
    if not first or not last or first[0] != last[0]:
        return None
    total = last[1] - first[1]
    idle = last[2] - first[2]
    return round(100 * (1 - idle / total), 2) if total > 0 else None


def exact_signflip_p(values):
    """Two-sided exact randomization p on paired log-speed ratios.

    At most 18 independent units; larger samples use a fixed-seed simulation.
    For multiple sessions, session-level means (not individual rounds) are units.
    """
    data = [float(v) for v in values]
    n = len(data)
    if n < 2:
        return 1.0
    obs = abs(sum(data))
    if n <= 18:
        total = 1 << n
        n_extreme = 0
        for bits in range(total):
            alternate = sum(v if bits >> i & 1 else -v for i, v in enumerate(data))
            if abs(alternate) >= obs - 1e-12:
                n_extreme += 1
        return n_extreme / total
    rng = random.Random(20261014)
    total = 50_000
    n_extreme = 1
    for _ in range(total):
        alternate = sum(v if rng.getrandbits(1) else -v for v in data)
        if abs(alternate) >= obs - 1e-12:
            n_extreme += 1
    return n_extreme / (total + 1)


def holm_adjust(raw):
    """Holm family-wise error correction; p-values keyed by scenario."""
    ordered = sorted(raw, key=raw.get)
    m = len(ordered)
    adjusted = {}
    floor = 0.0
    for i, key in enumerate(ordered):
        floor = max(floor, min(1.0, raw[key] * (m - i)))
        adjusted[key] = floor
    return adjusted


def cluster_bootstrap(log_sessions, *, seed, iterations=5000):
    """Two-level bootstrap resampling sessions first, paired rounds second.

    Session-level equal weighting; no claim of population inference with N=3.
    """
    means = [stats.mean(session) for session in log_sessions]
    point = math.expm1(stats.mean(means)) * 100
    rng = random.Random(seed)
    dist = []
    n = len(log_sessions)
    for _ in range(iterations):
        sampled = [log_sessions[rng.randrange(n)] for _ in range(n)]
        per_session = [sum(s[rng.randrange(len(s))] for _ in range(len(s))) / len(s)
                       for s in sampled]
        dist.append(math.expm1(stats.mean(per_session)) * 100)
    dist.sort()
    return point, percentile(dist, .025), percentile(dist, .975)


def summarize_sessions(sessions, *, baseline, candidate, seed):
    """Aggregate only compatible complete sessions; preserve session nesting."""
    versions = sessions[0]["config"]["versions"]
    case_data = {}
    raw_p = {}
    for case in ALL_CASES:
        log_by_session = []
        all_medians = {v: [] for v in versions}
        speedups = []
        for payload in sessions:
            rows = {(r["case"], r["label"], r["round"]): r for r in payload["runs"]}
            rounds = payload["config"]["rounds"]
            paired = []
            for rr in range(1, rounds+1):
                old = rows[(case, baseline, rr)]["median_ms"]
                new = rows[(case, candidate, rr)]["median_ms"]
                if old <= 0 or new <= 0:
                    raise ValueError(f"Tiempo inválido en {case}, ronda {rr}")
                paired.append(math.log(old / new))
                for v in versions:
                    all_medians[v].append(rows[(case, v, rr)]["median_ms"])
            log_by_session.append(paired)
            speedups.append(math.expm1(stats.mean(paired))*100)
        unit_values = [stats.mean(x) for x in log_by_session]
        pval = exact_signflip_p(unit_values if len(sessions)>1 else log_by_session[0])
        raw_p[case] = pval
        pct, lo, hi = cluster_bootstrap(log_by_session, seed=seed + list(ALL_CASES).index(case))
        key = f"{candidate}_vs_{baseline}"
        case_data[case] = {
            "case": case,
            "median_ms": {v: stats.median(all_medians[v]) for v in versions},
            "comparisons": {key: {"speedup_pct": pct, "ci95_lo_pct": lo, "ci95_hi_pct": hi,
                                  "session_speedup_pct": speedups,
                                  "direction_agreement": len(set(v>0 for v in speedups)) == 1,
                                  "p_raw_exact": pval}},
        }
    adjusted = holm_adjust(raw_p)
    output = []
    for case in ALL_CASES:
        entry=case_data[case]
        comp=entry["comparisons"][f"{candidate}_vs_{baseline}"]
        comp["p_holm"] = adjusted[case]
        repeat = len(sessions) >= 3 and comp["direction_agreement"]
        if len(sessions) >= 3 and adjusted[case] < .05 and abs(comp["speedup_pct"]) >= 2:
            verdict = "evidencia estadística ajustada (sesiones independientes)"
        elif repeat and abs(comp["speedup_pct"]) >= 2:
            verdict = "tendencia reproducida; evidencia inferencial insuficiente"
        else:
            verdict = "inconcluso"
        comp["interpretation"] = verdict
        output.append(entry)
    return output


def analyze_sessions(paths, *, out: Path | None, seed: int):
    files = [p / "resultados.json" if p.is_dir() else p for p in paths]
    sessions = []
    for path in files:
        session = json.loads(path.expanduser().read_text(encoding="utf-8"))
        if session.get("schema_version") != SCHEMA:
            raise ValueError(f"{path}: requiere schema {SCHEMA}; los resultados v2 no se mezclan")
        sessions.append(session)
    if len(sessions) != len(set(str(p.resolve()) for p in files)):
        raise ValueError("Una misma sesión se incluyó más de una vez")
    if not sessions:
        raise ValueError("Faltan sesiones")
    common = sessions[0]
    versions=common["config"]["versions"]
    if len(versions) < 2:
        raise ValueError("Se necesitan al menos dos versiones")
    # Pairwise comparisons across all versions; Holm controls the entire family.
    pairs=list(itertools.combinations(versions,2))
    required = ("versions", "samples", "budget_ms", "script_sha256", "python_worker_flags")
    issues = []
    session_starts = set()
    session_times = []
    for index, session in enumerate(sessions, 1):
        if any(session["config"].get(k) != common["config"].get(k) for k in required):
            raise ValueError(f"Sesión {index} incompatible: intérpretes, configuración o script distintos")
        start = session["machine"]["start"]
        ref_start = common["machine"]["start"]
        if (start["cpu_model"], start["selected_cpu"], start["platform"]) != (ref_start["cpu_model"], ref_start["selected_cpu"], ref_start["platform"]):
            raise ValueError(f"Sesión {index}: hardware, Linux o afinidad distintos")
        cpu_start = start.get("selected_cpu_info") or {}
        cpu_ref = ref_start.get("selected_cpu_info") or {}
        if cpu_start.get("governor") != cpu_ref.get("governor") or start.get("intel_turbo_disabled") != ref_start.get("intel_turbo_disabled"):
            raise ValueError(f"Sesión {index}: governor o Turbo distintos; no mezclar perfiles energéticos")
        if start["utc"] in session_starts:
            raise ValueError(f"Sesión {index}: se repite la misma hora de inicio")
        session_starts.add(start["utc"])
        session_times.append(datetime.datetime.fromisoformat(start["utc"].replace("Z", "+00:00")))
        expected = len(ALL_CASES) * len(versions) * session["config"]["rounds"]
        if len(session["runs"]) != expected:
            raise ValueError(f"Sesión {index} incompleta: {len(session['runs'])} / {expected}")
        identifiers = [(r["case"],r["round"],r["label"]) for r in session["runs"]]
        if len(set(identifiers)) != len(identifiers):
            raise ValueError(f"Sesión {index}: mediciones duplicadas")
        if session["config"]["rounds"] < 5:
            issues.append(f"Sesión {index}: menos de cinco rondas")
        if session.get("warnings"):
            issues.append(f"Sesión {index}: {len(session['warnings'])} advertencias (ver JSON)")
    # Build flags are recorded and disclosed: same interpreter family does not
    # imply identical native compiler options across *versions*.
    for s in sessions:
        build_by_version = {}
        for row in s["runs"]:
            if row["case"] in CASES and row.get("config"):
                build_by_version.setdefault(row["label"],row["config"])
        if len(build_by_version) == len(versions):
            signatures = {(x.get("CFLAGS"),x.get("CONFIG_ARGS")) for x in build_by_version.values()}
            if len(signatures) > 1:
                issues.append("Compilaciones distintas entre versiones: consultar config por intérprete en resultados.json")
                break
    checksums = {}
    for i, session in enumerate(sessions):
        for r in session["runs"]:
            if r["case"] in CASES:
                checksums.setdefault(r["case"],set()).add(r["checksum"])
    invalid = [k for k,v in checksums.items() if len(v) != 1]
    if invalid:
        raise ValueError("Salida funcional diferente entre sesiones/versiones: " + ", ".join(invalid))
    summary_map = {}
    if len(session_times)>1:
        gaps = [(b-a).total_seconds() for a,b in zip(sorted(session_times),sorted(session_times)[1:])]
        if min(gaps) < 1800:
            issues.append("Hay sesiones separadas por menos de 30 minutos; preferir distintas franjas del día")
    for baseline,candidate in pairs:
        partial=summarize_sessions(sessions,baseline=baseline,candidate=candidate,seed=seed)
        for item in partial:
            summary_map.setdefault(item["case"],{"case":item["case"],"median_ms":item["median_ms"],"comparisons":{}})
            summary_map[item["case"]]["comparisons"].update(item["comparisons"])
    combined=[summary_map[case] for case in ALL_CASES]
    tests={f"{case}::{b}::{c}": summary_map[case]["comparisons"][f"{c}_vs_{b}"]["p_raw_exact"]
           for case in ALL_CASES for b,c in pairs}
    corrected=holm_adjust(tests)
    for item in combined:
        for b,c in pairs:
            comp=item["comparisons"][f"{c}_vs_{b}"]
            comp["p_holm"]=corrected[f"{item['case']}::{b}::{c}"]
            repeat=len(sessions)>=3 and comp["direction_agreement"]
            if len(sessions)>=3 and comp["p_holm"]<.05 and abs(comp["speedup_pct"])>=2:
                verdict="evidencia estadística ajustada (sesiones independientes)"
            elif repeat and abs(comp["speedup_pct"])>=2:
                verdict="tendencia reproducida; evidencia inferencial insuficiente"
            else:
                verdict="inconcluso"
            comp["interpretation"]=verdict
    date=datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    dest=(out or (Path.home()/"python-benchmarks"/f"analysis-v3-{date}")).expanduser().resolve()
    dest.mkdir(parents=True,exist_ok=False)
    for baseline,candidate in pairs:
        key=f"{candidate}_vs_{baseline}"
        name=f"comparacion_{candidate.replace('.','')}_vs_{baseline.replace('.','')}.svg"
        (dest/name).write_text(inline_forest_svg(combined,key),encoding="utf-8")
    family = len(tests)
    if len(sessions)<3:
        issues.append("Menos de tres sesiones: evidencia temporal insuficiente")
    if len(sessions)<9:
        issues.append("Con pocas sesiones la prueba exacta tiene escasa potencia; el p de Holm puede no ser significativo")
    issues.append(f"Holm corrige las {family} comparaciones (todas las parejas/versiones y escenarios)")
    issues.append("La prueba exacta usa medias por sesión, no considera rondas del mismo día como sesiones independientes")
    issues.append("Los IC95 bootstrap jerárquicos son exploratorios, especialmente con menos de cinco sesiones")
    report=["# Python Performance Lab v3 — Consolidado de sesiones", "",
            f"Sesiones independientes: **{len(sessions)}**. Versiones: **{', '.join(versions)}**.",
            f"CPU: {common['machine']['start']['cpu_model']}, lógico {common['machine']['start']['selected_cpu']}.",
            "", "**Método:** log-razones pareadas por escenario/ronda y medias por sesión,",
            f"bootstrap jerárquico de sesiones y rondas; prueba bilateral exacta por sesión y Holm para {family} tests.",
            "Son resultados locales. Porcentajes positivos: versión candidata más rápida."]
    csvrows=[]
    for baseline,candidate in pairs:
        key=f"{candidate}_vs_{baseline}"
        report.extend(["",f"## {candidate} frente a {baseline}","",
          "| Escenario | Cambio de velocidad | IC95% exploratorio | p Holm | Sesiones favorables | Lectura |",
          "|---|---:|---:|---:|---:|---|"])
        for item in combined:
            c=item["comparisons"][key]
            yes=sum(x>0 for x in c["session_speedup_pct"])
            report.append(f"| {item['case']} | {c['speedup_pct']:+.2f}% | [{c['ci95_lo_pct']:+.2f}%, {c['ci95_hi_pct']:+.2f}%] | {c['p_holm']:.4f} | {yes}/{len(sessions)} | {c['interpretation']} |")
            csvrows.append({"case":item["case"],"baseline":baseline,"candidate":candidate,
                "speedup_pct":c["speedup_pct"],"ci95_lo_pct":c["ci95_lo_pct"],"ci95_hi_pct":c["ci95_hi_pct"],
                "p_raw_exact":c["p_raw_exact"],"p_holm":c["p_holm"],"favorable_sessions":yes,
                "sessions":len(sessions),"interpretation":c["interpretation"]})
    report.extend(["", "## Limitaciones y advertencias", ""]+[f"- {w}" for w in issues])
    report.extend(["", "## Trazabilidad", ""]+[f"- Sesión {i}: `{path.resolve()}` · inicio `{s['machine']['start']['utc']}` · rondas {s['config']['rounds']}" for i,(path,s) in enumerate(zip(files,sessions),1)])
    (dest/"informe_multisesion.md").write_text("\n".join(report)+"\n",encoding="utf-8")
    with (dest/"resumen_multisesion.csv").open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=list(csvrows[0]));writer.writeheader();writer.writerows(csvrows)
    (dest/"consolidado.json").write_text(json.dumps({"schema_version":SCHEMA,"session_files":[str(p.resolve()) for p in files],
        "pairs":[f"{c}_vs_{b}" for b,c in pairs],"summary":combined,"warnings":issues,
        "method":"hierarchical bootstrap; session-level exact sign-flip; global Holm"},
        ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"Sesiones consolidadas: {len(sessions)} | parejas: {len(pairs)} | pruebas corregidas: {family}")
    print(f"Informe: {dest/'informe_multisesion.md'}")
    for baseline,candidate in pairs:
        key=f"{candidate}_vs_{baseline}"
        print(f"\n{candidate} frente a {baseline}:")
        for item in combined:
            c=item["comparisons"][key]
            print(f"  {item['case']:20s} {c['speedup_pct']:+8.2f}%  IC95% [{c['ci95_lo_pct']:+.1f}, {c['ci95_hi_pct']:+.1f}]  Holm p={c['p_holm']:.3f}")


def main():
    parser=argparse.ArgumentParser(description="Benchmark reproducible: CPython 3.13/3.14/3.15, stdlib-only")
    parser.add_argument("--audit",action="store_true",help="Inspeccionar entorno y topología sin ejecutar benchmark")
    parser.add_argument("--self-test",action="store_true",help="Validar harness con el Python actual; no compara versiones")
    parser.add_argument("--quick",action="store_true",help="Prueba corta del protocolo, NO publicable")
    parser.add_argument("--versions",nargs="+",default=list(DEFAULT_VERSIONS))
    parser.add_argument("--rounds",type=int,default=9,help="Procesos independientes por versión/caso (predeterminado: 9)")
    parser.add_argument("--samples",type=int,default=9,help="Muestras por proceso (predeterminado: 9)")
    parser.add_argument("--budget-ms",type=int,default=110,help="Tiempo objetivo de cada muestra (ms)")
    parser.add_argument("--cpu",type=int,help="CPU lógico concreto, ver --audit")
    parser.add_argument("--no-pin",action="store_true",help="Sin afinidad; NO recomendado para publicación")
    parser.add_argument("--seed",type=int,default=20261014,help="Semilla del orden de escenarios")
    parser.add_argument("--out",type=Path,help="Directorio NUEVO para resultados")
    parser.add_argument("--session",type=str,help="Identificador corto de esta sesión (ej: manana-1)")
    parser.add_argument("--analyze",nargs="+",type=Path,metavar="SESIÓN",help="Combinar sesiones v3: archivos resultados.json o carpetas")
    parser.add_argument("--worker",choices=CASES,help=argparse.SUPPRESS)
    parser.add_argument("--worker-samples",type=int,default=9,help=argparse.SUPPRESS)
    parser.add_argument("--worker-budget",type=int,default=110,help=argparse.SUPPRESS)
    args=parser.parse_args()
    if args.analyze:
        analyze_sessions(args.analyze, out=args.out, seed=args.seed)
        return
    if args.worker:
        worker(args.worker,args.worker_samples,args.worker_budget)
        return
    if args.cpu is not None and args.no_pin:
        parser.error("--cpu y --no-pin son incompatibles")
    allowed=available_cpus()
    cpu=None if args.no_pin else select_cpu(allowed,args.cpu)
    first=audit(cpu)
    if args.audit:
        print(json.dumps(first,indent=2,ensure_ascii=False))
        return
    if args.quick:
        args.rounds=2
        args.samples=5
        args.budget_ms=40
    if args.rounds < 1 or args.samples < 3 or args.budget_ms < 10:
        parser.error("Usa --rounds >=1, --samples >=3 y --budget-ms >=10")
    if cpu is None:
        print("AVISO: afinidad desactivada, resultados más sensibles al ruido",file=sys.stderr)
    binaries, root = find_binaries(args.versions,args.self_test)
    labels=list(binaries)
    baseline=labels[-2] if len(labels)>1 else labels[0]
    candidate=labels[-1]
    if args.self_test:
        args.rounds=1
        args.samples=3
        args.budget_ms=20
    env=env_clean()
    timestamp=datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    session_name = re.sub(r"[^A-Za-z0-9_.-]", "_", args.session or timestamp)[:60]
    output=args.out or (Path.home()/"python-benchmarks"/f"lab-v3-{timestamp}-{session_name}")
    output=output.expanduser().resolve()
    output.mkdir(parents=True,exist_ok=False)
    script_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    config={"versions":labels,"paths":{v:str(p) for v,p in binaries.items()},
            "session_name":session_name,"harness_version":SCHEMA,
            "pyenv_root":root,"rounds":args.rounds,"samples":args.samples,
            "budget_ms":args.budget_ms,"startup_samples_per_round":12 if not args.quick and not args.self_test else 5,
            "seed":args.seed,"script_sha256":script_hash,
            "python_worker_flags":["-S","-B"],
            "env_overrides":{k:env[k] for k in ("PYTHONHASHSEED","PYTHONNOUSERSITE","PYTHONDONTWRITEBYTECODE","LC_ALL","TZ")}}
    machine={"start":first,"end":None,"rounds":[]}
    records=[]
    print(f"Python Performance Lab v3 · {', '.join(labels)}")
    print(f"CPU lógico: {cpu}; tipo: {first['selected_cpu_info']['core_type'] if cpu is not None else 'sin fijar'}; directorio: {output}")
    try:
        for rr in range(args.rounds):
            print(f"\n=== Ronda {rr+1}/{args.rounds} ===",flush=True)
            cases=list(ALL_CASES)
            random.Random(args.seed+rr).shuffle(cases)
            for ix, case in enumerate(cases):
                order=balanced_order(labels,rr,list(ALL_CASES).index(case))
                for label in order:
                    binary=binaries[label]
                    print(f" {case:20} {label}",flush=True)
                    f_before = cpu_info(cpu)["current_mhz"] if cpu is not None else None
                    sib_before = read_cpu_counters(cpu)
                    if case in START_CASES:
                        values=start_case(binary,case,sample_count=config['startup_samples_per_round'],cpu=cpu,env=env)
                    else:
                        cmd=[str(binary),"-S","-B",str(Path(__file__).resolve()),"--worker",case,
                             "--worker-samples",str(args.samples),"--worker-budget",str(args.budget_ms)]
                        values=json.loads(run_process(cmd,cpu=cpu,env=env,timeout=120))
                        if not args.self_test and values["version"] != label:
                            raise RuntimeError(f"Esperábamos {label}, pero {binary} devolvió {values['version']}")
                    sib_after = read_cpu_counters(cpu)
                    f_after = cpu_info(cpu)["current_mhz"] if cpu is not None else None
                    values.update({"round":rr+1,"label":label,"case":case,"executable":str(binary),
                                   "cpu_mhz_before":f_before,"cpu_mhz_after":f_after,
                                   "sibling_busy_pct":sibling_busy_pct(sib_before,sib_after)})
                    records.append(values)
                checks={repr(rec["checksum"]) for rec in records if rec["case"]==case and rec["round"]==rr+1}
                if len(checks)>1:
                    raise RuntimeError(f"Resultados funcionales distintos en {case}: {checks}")
            machine["rounds"].append(audit(cpu))
    finally:
        machine["end"]=audit(cpu)
        summaries=aggregate(records,labels,baseline=baseline,candidate=candidate,
                            rounds=args.rounds,seed=args.seed)
        warnings=warnings_for(machine,summaries,args.rounds,args.quick or args.self_test,records)
        if cpu is None: warnings.insert(0,"Sin afinidad fija: no publicar comparaciones concluyentes")
        save(output,machine,config,records,summaries,warnings,baseline,candidate,args.quick)
        print(f"\nResultados: {output}")
    if len(labels)>=2:
        print(f"\n{candidate} frente a {baseline} (IC exploratorios por ronda):")
        for row in summaries:
            c=row["comparisons"].get(f"{candidate}_vs_{baseline}")
            if c:
                print(f"  {row['case']:20} {c['speedup_pct']:+7.1f}% "
                      f"[{c['ci95_lo_pct']:+.1f}, {c['ci95_hi_pct']:+.1f}]  {c['interpretation']}")
    print("Archivos generados: " + ", ".join(sorted(p.name for p in output.iterdir() if p.is_file())))


if __name__ == "__main__":
    main()
