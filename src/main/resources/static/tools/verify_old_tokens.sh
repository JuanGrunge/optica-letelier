#!/usr/bin/env bash
# tools/verify_old_tokens.sh — busca tokens antiguos para limpieza
set -euo pipefail
ROOT="${1:-.}"
echo "Buscando tokens antiguos en $ROOT ..."
grep -RIn --color=always -E --include='*.css' --include='*.html' \
  --exclude-dir='node_modules' --exclude-dir='.git' \
  '(--bg|--card|--text[^-]|--muted|--border[^-]|--input-bg|--input-border|--accent[^-]|--accent-contrast|--header-height|--overlay-alpha)' \
  "$ROOT" || echo "OK: no se encontraron tokens antiguos."
