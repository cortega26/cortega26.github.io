import { business, hardLaunchIssues, softLaunchIssues } from "./src/config.ts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const hard = hardLaunchIssues();
const soft = softLaunchIssues();
if (business.photo && !existsSync(resolve(import.meta.dirname, business.photo)))
  hard.push(`El retrato debe existir en el repositorio: ${business.photo}`);
if (soft.length) console.warn(`POST-LANZAMIENTO (no bloquea)\n- ${soft.join("\n- ")}`);
if (hard.length) {
  console.error(`PUBLICACIÓN BLOQUEADA\n- ${hard.join("\n- ")}`);
  process.exitCode = 1;
} else
  console.log(
    "Sin hard blockers. Verificar DNS, TLS, GA4 y teléfono en producción antes de promocionar.",
  );
