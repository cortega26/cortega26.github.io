#!/usr/bin/env bash
# Crea las dos reglas de CSP por ruta descritas en docs/cloudflare-security-headers.md.
#
#   ./scripts/cloudflare-csp-rules.sh --dry-run   # solo muestra lo que enviaría (no necesita token)
#   ./scripts/cloudflare-csp-rules.sh             # aplica (pide el token sin mostrarlo)
#
# Token: permisos "Zone > Transform Rules > Edit" y "Zone > Zone > Read", limitado a tooltician.com.
# Idempotente: hace upsert por expresión. Nota API (verificado 2026-09-21):
# el PUT por regla (.../rules/{id}) rechaza Bearer tokens (10405/405), pero
# POST (crear) y DELETE sí funcionan; por eso el upsert es POST de la nueva
# + DELETE de las anteriores. Seguro ante fallos: si el POST falla, la regla
# vieja sigue intacta; la nueva siempre queda última, que es la que gana
# ("last rule wins") entre expresiones no solapadas.
set -euo pipefail

DOMAIN="tooltician.com"
CF="https://api.cloudflare.com/client/v4"
DOC="$(cd "$(dirname "$0")/.." && pwd)/docs/cloudflare-security-headers.md"
DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

command -v jq >/dev/null   || { echo "Falta jq (sudo apt install jq)"; exit 1; }
command -v curl >/dev/null || { echo "Falta curl"; exit 1; }

# CSP exactas desde el doc: línea 1 = base host-wide, 2 = tooltician-site, 3 = chile-hub.
CSP_BASE=$(grep '^default-src' "$DOC" | sed -n 1p)
CSP_SITE=$(grep '^default-src' "$DOC" | sed -n 2p)
CSP_HUB=$(grep '^default-src' "$DOC" | sed -n 3p)
[[ $(grep -o 'static.cloudflareinsights.com' <<<"$CSP_SITE" | wc -l) -eq 1 ]] || { echo "CSP_SITE inesperada"; exit 1; }
# ADR-020 (2026-09-21): el contador GoatCounter se retiró por falta de cuenta
# del mantenedor — ningún origen suyo puede volver a ninguna regla.
[[ "$CSP_BASE" != *goatcounter* && "$CSP_BASE" != *zgo.at* ]] || { echo "CSP_BASE no debe incluir GoatCounter"; exit 1; }
[[ "$CSP_SITE" != *goatcounter* && "$CSP_SITE" != *zgo.at* ]] || { echo "CSP_SITE no debe incluir GoatCounter"; exit 1; }
[[ "$CSP_HUB" != *goatcounter* && "$CSP_HUB" != *zgo.at* ]] || { echo "CSP_HUB no debe incluir GoatCounter"; exit 1; }

DESC_SITE="CSP tooltician-site + Cloudflare Web Analytics"
DESC_HUB="CSP chile-hub + Cloudflare Web Analytics"
EXPR_BASE='(http.host eq "tooltician.com")'
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

upsert_rule() { # $1 descripción, $2 expresión, $3 CSP
  # Match por expresión (estable aunque cambie la descripción, p. ej. al
  # retirar un origen). POST crea al final (= la que gana); después se
  # borran las anteriores con la misma expresión, si las hay.
  local old_ids out new_id del
  old_ids=$(jq -r --arg e "$2" '[.result.rules[]? | select(.expression == $e) | .id] | join(" ")' <<<"$R")
  # Si ya existe con el mismo valor, no hay nada que hacer (idempotente).
  if jq -e --arg e "$2" --arg c "$3" '[.result.rules[]? | select(.expression == $e and (.action_parameters.headers."Content-Security-Policy".value // "") == $c)] | length > 0' >/dev/null <<<"$R"; then
    echo "   sin cambios: $1"; return
  fi
  out=$(rule_json "$1" "$2" "$3" | api -X POST --data @- "$CF/zones/$ZONE_ID/rulesets/$RULESET_ID/rules")
  need_ok "$out"; echo "   creada: $1"
  for del in $old_ids; do
    out=$(api -X DELETE "$CF/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$del")
    need_ok "$out"; echo "   retirada anterior: $del"
  done
}
echo "4) Creando/actualizando reglas (al final, debajo de la base)…"
# La base gestiona más headers que la CSP (Permissions-Policy, Referrer-Policy,
# ...): solo se reemplaza su valor CSP, preservando el resto byte a byte.
base_cur=$(jq -c --arg e "$EXPR_BASE" '[.result.rules[]? | select(.expression == $e)][0] // empty' <<<"$R")
[[ -n "$base_cur" ]] || { echo "No veo la regla base de tooltician.com; abortando por seguridad."; exit 1; }
if [[ $(jq -r '.action_parameters.headers."Content-Security-Policy".value // ""' <<<"$base_cur") == "$CSP_BASE" ]]; then
  echo "   sin cambios: CSP (base)"
else
  out=$(jq --arg c "$CSP_BASE" '.description = "CSP" | {action, description, expression, enabled, action_parameters: (.action_parameters | .headers."Content-Security-Policy".value = $c)}' <<<"$base_cur" | api -X POST --data @- "$CF/zones/$ZONE_ID/rulesets/$RULESET_ID/rules")
  need_ok "$out"; echo "   creada: CSP (base, CSP estrechada)"
  out=$(api -X DELETE "$CF/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$(jq -r '.id' <<<"$base_cur")")
  need_ok "$out"; echo "   retirada anterior: $(jq -r '.id' <<<"$base_cur")"
fi
upsert_rule "$DESC_SITE" "$EXPR_SITE" "$CSP_SITE"
upsert_rule "$DESC_HUB"  "$EXPR_HUB"  "$CSP_HUB"

echo "5) Verificando (espera 10 s a la propagación)…"
sleep 10
FAIL=0
for p in / /en/ /es/ /chile-hub/ /polla/; do
  n=$(curl -sSI "https://$DOMAIN$p" | grep -ci '^content-security-policy' || true)
  [[ "$n" == "1" ]] && s=OK || { s="FALLA (headers=$n)"; FAIL=1; }
  echo "   $p -> $s"
done
curl -sSI "https://$DOMAIN/chile-hub/" | grep -i '^content-security-policy' | grep -qi 'goatcounter\|zgo\.at' \
  && { echo "   /chile-hub/ permite el contador retirado: FALLA"; FAIL=1; } || echo "   /chile-hub/ sin contador: OK"
curl -sSI "https://$DOMAIN/polla/" | grep -i '^content-security-policy' | grep -qi 'cloudflareinsights\|goatcounter\|zgo\.at' \
  && { echo "   /polla/ permite analítica: FALLA"; FAIL=1; } || echo "   /polla/ sin analítica: OK"
[[ $FAIL -eq 0 ]] && echo "Listo." || { echo "Revisa las FALLAS (ver 'Verify the rules override' en el doc)."; exit 1; }
