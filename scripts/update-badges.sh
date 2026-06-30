#!/usr/bin/env bash
set -euo pipefail

# ───────────────────────────────────────────────────────────────────
# Regenerate all Tooltician "Part of" badges from shields.io
#
# Centralized update flow:
#   1. Edit the LABEL_MAP below to change badge text/color
#   2. Run this script
#   3. Commit + push → all repos pick up the new badges
#
# Labels from shields.io use underscores for spaces.
# ───────────────────────────────────────────────────────────────────

OUTPUT_DIR="public"
COLOR="6c47ff"

declare -A LABEL_MAP
LABEL_MAP[en]="Part_of"
LABEL_MAP[es]="Parte_de"
LABEL_MAP[fr]="Partie_de"
LABEL_MAP[de]="Teil_von"
LABEL_MAP[pt]="Parte_do"
# Default (no suffix) — same as English
DEFAULT_LABEL="Part_of"

echo "→ Generating Tooltician badges from shields.io..."

for lang in "${!LABEL_MAP[@]}"; do
  label="${LABEL_MAP[$lang]}"
  url="https://img.shields.io/badge/${label}-Tooltician.com-${COLOR}"
  file="${OUTPUT_DIR}/badge.${lang}.svg"

  if curl -sfL "$url" -o "$file"; then
    size=$(wc -c < "$file")
    width=$(grep -oP 'width="\K[0-9]+' "$file" | head -1)
    echo "  ✔ badge.${lang}.svg  (${width}px, ${size}B)"
  else
    echo "  ✗ badge.${lang}.svg  FAILED"
    exit 1
  fi
done

# Default = English
cp "${OUTPUT_DIR}/badge.en.svg" "${OUTPUT_DIR}/badge.svg"
echo "  ✔ badge.svg (copy of badge.en.svg)"

echo ""
echo "→ Done. Commit and push to deploy."
