import { business, launchIssues } from "./src/config.ts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const issues = launchIssues();
if (
  business.photo &&
  (!business.photo.startsWith("/") ||
    !existsSync(resolve("support/public", business.photo.slice(1))))
)
  issues.push("El retrato debe existir en support/public");
if (issues.length) {
  console.error("PUBLICACIÓN BLOQUEADA\n- " + issues.join("\n- "));
  process.exitCode = 1;
} else
  console.log(
    "Datos de lanzamiento completos. Verificar DNS, TLS, GA4 y teléfono en producción antes de promocionar.",
  );
