#!/usr/bin/env bash
# Monta o site do GitHub Pages:
#   /            o app no modo local (os dados ficam no aparelho; ishinydex#48)
#   /demo/       a demonstração, com dados de exemplo
#   /catalog/    o pacote do catálogo, usado pelos dois
#   + as páginas fixas de site/ (como o protótipo /spike/dropbox/)
#
#   tool/build_pages.sh <versão> <base-href> <saída>
#   tool/build_pages.sh v2.0.0-alpha.1 /ishinydex/ _site
#
# Roda no workflow Pages e também na máquina (precisa do Flutter no PATH).
#
# DROPBOX_APP_KEY (ambiente, opcional): a App key do app do Dropbox de quem
# publica. Com ela, o modo local ganha a sincronização (ishinydex#48); sem
# ela, sai sem. Cada cópia do projeto usa o próprio app do Dropbox.
set -euo pipefail

version="$1"
base_href="$2"
# Absoluta: o build roda de dentro de frontend/.
out="$(realpath -m "$3")"
root="$(cd "$(dirname "$0")/.." && pwd)"
app="$root/frontend"

# Nenhum endereço fixo (#48): o app carrega tudo do endereço onde está, e uma
# cópia nunca pode depender do Pages do mantenedor.
if grep -rn "github\.io" "$app/lib" "$app/web" "$root/site"; then
  echo "erro: endereço do GitHub Pages fixo no código (acima)" >&2
  exit 1
fi

# --build-name/--build-number só com SemVer (mesma regra do Dockerfile).
names=()
if [[ "$version" =~ ^v?([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
  major="${BASH_REMATCH[1]}" minor="${BASH_REMATCH[2]}" patch="${BASH_REMATCH[3]}"
  names=(--build-name="$major.$minor.$patch"
         --build-number="$((major * 10000 + minor * 100 + patch))")
fi

# Catálogo (etapa 3 de #48): a versão fixada em catalog.version, baixada da
# release do backend. Só no build: com o app no ar, ele vem do próprio site.
catalog_version="$(tr -d '[:space:]' < "$root/catalog.version")"
catalog_dir="$(mktemp -d)"
curl -fsSL -o "$catalog_dir/catalog.json" \
  "https://github.com/nunesvictor/ishinydex-backend/releases/download/$catalog_version/catalog.json"

cd "$app"
flutter pub get
dart run build_runner build -d

# Builda o app com o <base-href> e os --dart-define dados e o copia para
# <destino>. Cache-busting (frontend#5): no Docker, o nginx serve
# /v/<hash>/x como /x; aqui não há reescrita, então os arquivos vão de fato
# para v/<hash>/ (o hash é o mesmo cálculo do Dockerfile).
build() {
  local base="$1" dest="$2"
  shift 2
  flutter build web --release --wasm --base-href "$base" "${names[@]}" \
    --dart-define=APP_VERSION="$version" "$@"
  local web="$app/build/web" hash
  hash=$({ find "$web" -maxdepth 1 -type f -name 'main.dart.*' -print0
           find "$web/assets" -type f -print0; } \
         | sort -z | xargs -0 sha256sum | sha256sum | cut -c1-12)
  mkdir -p "$web/v/$hash"
  mv "$web"/main.dart.* "$web/assets" "$web/v/$hash/"
  # O service worker (frontend web/sw.js) usa a mesma versão no nome do
  # cache.
  sed -i "s/__BUILD_VERSION__/$hash/" "$web/flutter_bootstrap.js" "$web/sw.js"
  grep -q "'$hash'" "$web/flutter_bootstrap.js"
  grep -q "'$hash'" "$web/sw.js"
  mkdir -p "$dest"
  cp -r "$web"/. "$dest"/
  echo "$dest: build $hash"
}

rm -rf "$out"
build "$base_href" "$out" \
  --dart-define=LOCAL_DATA=true \
  --dart-define=CATALOG_URL=catalog/catalog.json \
  --dart-define=DROPBOX_APP_KEY="${DROPBOX_APP_KEY:-}"
build "${base_href}demo/" "$out/demo" \
  --dart-define=USE_FAKE_API=true \
  --dart-define=CATALOG_URL=../catalog/catalog.json

# Com a App key no ambiente, ela precisa estar no app do modo local (no
# #71, faltou repassá-la ao build e o Pages saiu sem sync, sem erro).
if [ -n "${DROPBOX_APP_KEY:-}" ] &&
  ! grep -rqF --include=main.dart.js --exclude-dir=demo "$DROPBOX_APP_KEY" "$out"; then
  echo "A DROPBOX_APP_KEY não chegou ao build do modo local." >&2
  exit 1
fi

cp -r "$root/site"/. "$out"/
mkdir -p "$out/catalog"
cp "$catalog_dir/catalog.json" "$out/catalog/"
echo "site em $out (versão $version, $catalog_version)"
