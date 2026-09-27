import { business, launchIssues } from "./src/config.ts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const issues = launchIssues();
if (business.photo && !existsSync(resolve(import.meta.dirname, business.photo)))
  issues.push(`El retrato debe existir en el repositorio: ${business.photo}`);
if (issues.length) {
  console.error("PUBLICACIÓN BLOQUEADA\n- " + issues.join("\n- "));
  process.exitCode = 1;
} else
  console.log(
    "Datos de lanzamiento completos. Verificar DNS, TLS, GA4 y teléfono en producción antes de promocionar.",
  );
