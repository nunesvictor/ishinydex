#!/usr/bin/env bash
# Prints do README com dados inventados (ishinydex#251).
#
#   tool/screens/showcase.sh
#
# Gera o arquivo de vitrine pelo frontend/tool/showcase (as regras do app
# sobre o catálogo de catalog.version: nenhum dado de alguém), captura as
# cenas readme-* de plan.json com o capture.sh e põe em docs/screenshots/
# os cartões recortados e a imagem de abertura (showcase_images.py). Como os dados são inventados, as imagens podem ir para
# o repositório.
#
# Precisa do mesmo que o capture.sh: Flutter, Node (npm) e Python 3 com o
# Pillow.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
catalog_version="$(tr -d '[:space:]' < "$root/catalog.version")"
curl -fsSL -o "$work/catalog.json" \
  "https://github.com/nunesvictor/ishinydex-backend/releases/download/$catalog_version/catalog.json"
(
  cd "$root/frontend"
  flutter pub get
  dart run build_runner build
  CATALOG="$work/catalog.json" OUT="$work/showcase.json" \
    flutter test tool/showcase
)
"$here/capture.sh" "$work/showcase.json" "$work/out" readme-
mkdir -p "$root/docs/screenshots"
# Os cartões recortados e a abertura (showcase_images.py).
python3 "$here/showcase_images.py" "$work/out/png" "$root/docs/screenshots"
echo "prints em docs/screenshots/"
