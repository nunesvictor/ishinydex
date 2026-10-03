#!/usr/bin/env bash
# Monta o site do GitHub Pages: o app (frontend) em modo demonstração na raiz
# e as páginas fixas de site/ (como o protótipo /spike/dropbox/).
#
#   tool/build_pages.sh <versão> <base-href> <saída>
#   tool/build_pages.sh v2.0.0-alpha.1 /ishinydex/ _site
#
# Roda no workflow Pages e também na máquina (precisa do Flutter no PATH).
set -euo pipefail

version="$1"
base_href="$2"
out="$3"
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

cd "$app"
flutter pub get
dart run build_runner build -d
flutter build web --release --wasm --base-href "$base_href" "${names[@]}" \
  --dart-define=USE_FAKE_API=true \
  --dart-define=APP_VERSION="$version"

# Cache-busting (frontend#5): no Docker, o nginx serve /v/<hash>/x como /x;
# aqui não há reescrita, então os arquivos vão de fato para v/<hash>/. O
# hash é o mesmo cálculo do Dockerfile: código (main.dart.*) e assets.
web="$app/build/web"
hash=$({ find "$web" -maxdepth 1 -type f -name 'main.dart.*' -print0
         find "$web/assets" -type f -print0; } \
       | sort -z | xargs -0 sha256sum | sha256sum | cut -c1-12)
mkdir -p "$web/v/$hash"
mv "$web"/main.dart.* "$web/assets" "$web/v/$hash/"
sed -i "s/__BUILD_VERSION__/$hash/" "$web/flutter_bootstrap.js"
grep -q "'$hash'" "$web/flutter_bootstrap.js"

rm -rf "$out"
mkdir -p "$out"
cp -r "$web"/. "$out"/
cp -r "$root/site"/. "$out"/
echo "site em $out (versão $version, build $hash)"
