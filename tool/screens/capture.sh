#!/usr/bin/env bash
# Capturas do app para o canvas "Telas do app" (ishinydex#222).
#
#   tool/screens/capture.sh <backup.json> <saída> [prefixo]
#
# Builda o app no modo local a partir do commit do submodule frontend/ (a
# versão publicada), com o catálogo de catalog.version, serve o build só em
# 127.0.0.1, captura as cenas de plan.json (as que começam com [prefixo], se
# ele vier) e converte os PNGs para WebP:
#   <saída>/png/<cena>.png e <saída>/webp/<cena>.webp
#
# O backup (Ajustes → Exportar) tem dados reais: passe o caminho, nunca o
# copie para o repositório, e deixe a <saída> fora dele.
#
# Precisa do Flutter no PATH, do Node (npm) e do Python 3 com o Pillow.
# PORT (ambiente, padrão 8765): a porta do servidor local.
set -euo pipefail

backup="$(realpath "$1")"
out="$(realpath -m "$2")"
only="${3:-}"
port="${PORT:-8765}"
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"

case "$out/" in
  "$root"/*) echo "erro: a saída tem dados reais; use uma pasta fora do repositório" >&2; exit 1 ;;
esac

site="$(mktemp -d)"
server=""
cleanup() {
  [[ -n "$server" ]] && kill "$server" 2>/dev/null || true
  rm -rf "$site"
}
trap cleanup EXIT

# A versão no "Sobre": a tag do commit do frontend (ex.: v2.18.0).
version="$(git -C "$root/frontend" describe --tags --always)"

# O mesmo catálogo que o Pages publica.
catalog_version="$(tr -d '[:space:]' < "$root/catalog.version")"
mkdir -p "$site/catalog"
curl -fsSL -o "$site/catalog/catalog.json" \
  "https://github.com/nunesvictor/ishinydex-backend/releases/download/$catalog_version/catalog.json"
# E o arquivo dos golpes ao lado, como no tool/build_pages.sh (sem ele, as
# telas de golpes e de times dizem que não deu para baixar).
moves_file="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1])).get("movesFile") or "")' "$site/catalog/catalog.json")"
if [[ -n "$moves_file" ]]; then
  curl -fsSL -o "$site/catalog/$moves_file" \
    "https://github.com/nunesvictor/ishinydex-backend/releases/download/$catalog_version/$moves_file"
fi

(
  cd "$root/frontend"
  flutter pub get
  dart run build_runner build
  # Os mesmos --dart-define do modo local em tool/build_pages.sh, sem o
  # Dropbox (a captura não sincroniza).
  flutter build web --release --no-web-resources-cdn --output "$site/app" \
    --dart-define=APP_VERSION="$version" \
    --dart-define=LOCAL_DATA=true \
    --dart-define=CATALOG_URL=catalog/catalog.json
)
mv "$site/catalog" "$site/app/catalog"

(cd "$here" && npm ci --silent && npx playwright install chromium)

python3 -m http.server "$port" --bind 127.0.0.1 -d "$site/app" >/dev/null 2>&1 &
server=$!
for _ in $(seq 50); do
  curl -fs "http://127.0.0.1:$port/" >/dev/null && break
  sleep 0.2
done

status=0
BACKUP="$backup" OUT="$out/png" BASE="http://127.0.0.1:$port/" \
  node "$here/capture.js" "$here/plan.json" $only || status=$?

# WebP: ~1/10 do PNG, e o canvas guarda cada imagem como asset.
mkdir -p "$out/webp"
python3 - "$out/png" "$out/webp" <<'EOF'
import os, sys
from PIL import Image
src, dst = sys.argv[1:]
for name in sorted(os.listdir(src)):
    if name.endswith('.png'):
        Image.open(os.path.join(src, name)).convert('RGB').save(
            os.path.join(dst, name[:-4] + '.webp'), 'WEBP', quality=82, method=6)
EOF
echo "capturas em $out/webp"
exit "$status"
