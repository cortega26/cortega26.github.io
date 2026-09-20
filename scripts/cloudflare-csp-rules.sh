#!/usr/bin/env bash
# Crea las dos reglas de CSP por ruta descritas en docs/cloudflare-security-headers.md.
#
#   ./scripts/cloudflare-csp-rules.sh --dry-run   # solo muestra lo que enviaría (no necesita token)
#   ./scripts/cloudflare-csp-rules.sh             # aplica (pide el token sin mostrarlo)
#
# Token: permisos "Zone > Transform Rules > Edit" y "Zone > Zone > Read", limitado a tooltician.com.
# Idempotente: si una regla con la misma descripción ya existe, no la duplica.
set -euo pipefail

DOMAIN="tooltician.com"
CF="https://api.cloudflare.com/client/v4"
DOC="$(cd "$(dirname "$0")/.." && pwd)/docs/cloudflare-security-headers.md"
DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

command -v jq >/dev/null   || { echo "Falta jq (sudo apt install jq)"; exit 1; }
command -v curl >/dev/null || { echo "Falta curl"; exit 1; }

# CSP exactas desde el doc: línea 2 = tooltician-site, línea 3 = chile-hub.
CSP_SITE=$(grep '^default-src' "$DOC" | sed -n 2p)
CSP_HUB=$(grep '^default-src' "$DOC" | sed -n 3p)
[[ $(grep -o 'static.cloudflareinsights.com' <<<"$CSP_SITE" | wc -l) -eq 1 ]] || { echo "CSP_SITE inesperada"; exit 1; }
[[ "$CSP_HUB" == *chile-hub.goatcounter.com* ]] || { echo "CSP_HUB inesperada"; exit 1; }
[[ "$CSP_SITE" != *goatcounter.com* ]] || { echo "CSP_SITE no debe incluir GoatCounter"; exit 1; }

DESC_SITE="CSP tooltician-site + Cloudflare Web Analytics"
DESC_HUB="CSP chile-hub + GoatCounter + Cloudflare Web Analytics"
EXPR_SITE='(http.host eq "tooltician.com" and (http.request.uri.path eq "/" or starts_with(http.request.uri.path, "/en/") or starts_with(http.request.uri.path, "/es/")))'
EXPR_HUB='(http.host eq "tooltician.com" and starts_with(http.request.uri.path, "/chile-hub/"))'

rule_json() { # $1 descripción, $2 expresión, $3 CSP
  jq -n --arg d "$1" --arg e "$2" --arg c "$3" '{
    action: "rewrite", description: $d, expression: $e, enabled: true,
    action_parameters: { headers: { "Content-Security-Policy": { operation: "set", value: $c } } } }'
}

if [[ $DRY_RUN -eq 1 ]]; then
  echo "== DRY RUN: no se llama a la API =="
  rule_json "$DESC_SITE" "$EXPR_SITE" "$CSP_SITE" | jq .
  rule_json "$DESC_HUB"  "$EXPR_HUB"  "$CSP_HUB"  | jq .
  exit 0
fi

if [[ -z "${CF_API_TOKEN:-}" ]]; then
  read -r -s -p "Cloudflare API token: " CF_API_TOKEN; echo
fi
api() { curl -sS -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" "$@"; }
need_ok() { jq -e '.success == true' >/dev/null <<<"$1" || { echo "Error de la API:"; jq '.errors' <<<"$1"; exit 1; }; }

echo "1) Verificando token…"
R=$(api "$CF/user/tokens/verify"); need_ok "$R"
[[ $(jq -r .result.status <<<"$R") == "active" ]] || { echo "Token no activo"; exit 1; }

echo "2) Buscando la zona $DOMAIN…"
R=$(api "$CF/zones?name=$DOMAIN"); need_ok "$R"
ZONE_ID=$(jq -r '.result[0].id // empty' <<<"$R")
[[ -n "$ZONE_ID" ]] || { echo "Zona no encontrada (¿el token tiene Zone:Read?)"; exit 1; }
echo "   zone_id=$ZONE_ID"

echo "3) Leyendo el ruleset de cabeceras de respuesta…"
R=$(api "$CF/zones/$ZONE_ID/rulesets/phases/http_response_headers_transform/entrypoint"); need_ok "$R"
RULESET_ID=$(jq -r .result.id <<<"$R")
echo "$R" | jq -r '.result.rules[]? | "   existente: \(.description // "(sin descripción)")"'
jq -e '[.result.rules[]? | select((.expression // "") | contains("tooltician.com"))] | length > 0' >/dev/null <<<"$R" \
  || { echo "No veo la regla base de tooltician.com; abortando por seguridad."; exit 1; }

add_rule() { # $1 descripción, $2 expresión, $3 CSP
  if jq -e --arg d "$1" '[.result.rules[]? | select(.description == $d)] | length > 0' >/dev/null <<<"$R"; then
    echo "   ya existe, se omite: $1"; return
  fi
  local out; out=$(rule_json "$1" "$2" "$3" | api -X POST --data @- "$CF/zones/$ZONE_ID/rulesets/$RULESET_ID/rules")
  need_ok "$out"; echo "   creada: $1"
}
echo "4) Creando reglas (se añaden al final, debajo de la base)…"
add_rule "$DESC_SITE" "$EXPR_SITE" "$CSP_SITE"
add_rule "$DESC_HUB"  "$EXPR_HUB"  "$CSP_HUB"

echo "5) Verificando (espera 10 s a la propagación)…"
sleep 10
FAIL=0
for p in / /en/ /es/ /chile-hub/ /polla/; do
  n=$(curl -sSI "https://$DOMAIN$p" | grep -ci '^content-security-policy' || true)
  [[ "$n" == "1" ]] && s=OK || { s="FALLA (headers=$n)"; FAIL=1; }
  echo "   $p -> $s"
done
curl -sSI "https://$DOMAIN/chile-hub/" | grep -i '^content-security-policy' | grep -q 'chile-hub.goatcounter.com' \
  && echo "   /chile-hub/ permite GoatCounter: OK" || { echo "   /chile-hub/ NO permite GoatCounter (¿caché? purga y reintenta)"; FAIL=1; }
curl -sSI "https://$DOMAIN/polla/" | grep -i '^content-security-policy' | grep -qi 'cloudflareinsights\|goatcounter' \
  && { echo "   /polla/ permite analítica: FALLA"; FAIL=1; } || echo "   /polla/ sin analítica: OK"
[[ $FAIL -eq 0 ]] && echo "Listo." || { echo "Revisa las FALLAS (ver 'Verify the rules override' en el doc)."; exit 1; }
