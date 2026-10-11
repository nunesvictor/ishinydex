#!/usr/bin/env bash
# Prepara um ambiente do Claude Code na nuvem (claude.ai/code) para testar os
# três repositórios sem Docker: Flutter para o frontend; Python, Postgres e
# pre-commit para o backend. Na máquina local não é preciso (lá vale o
# docker compose do backend).
#
# Uso: no "Setup script" do ambiente da nuvem (claude.ai/code → nome do
# ambiente → engrenagem), só a linha abaixo, que baixa o script da main.
# Colado inteiro, a indentação pode quebrá-lo; e, com o `|| echo`, uma
# falha não impede a sessão de abrir (ela só começa sem o ambiente pronto):
#   curl -fsSL https://raw.githubusercontent.com/nunesvictor/ishinydex/main/tool/cloud_setup.sh | bash || echo "cloud_setup falhou; a sessão segue sem o ambiente"
# Ou numa sessão: bash ishinydex/tool/cloud_setup.sh
# Idempotente: o que já existe é reaproveitado.
set -euo pipefail

# O Setup script roda num bash sem login, sem o PATH do .bashrc: o uv e o
# poetry da imagem ficam em ~/.local/bin.
export PATH="$HOME/.local/bin:$PATH"

# As mesmas versões da CI (FLUTTER_VERSION nos workflows, PYTHON_VERSION no
# backend). O Postgres é o do sistema (16; a CI usa o 17).
FLUTTER_VERSION=3.47.2
PYTHON_VERSION=3.14
FLUTTER_HOME=/opt/flutter
# Onde a nuvem clona os repositórios, lado a lado.
REPOS=${REPOS:-/home/user}

# Flutter: o pacote oficial (storage.googleapis.com) em vez de um clone do
# repositório, que o proxy da nuvem não libera.
if ! "$FLUTTER_HOME/bin/flutter" --version 2>/dev/null | grep -q "Flutter $FLUTTER_VERSION "; then
  rm -rf "$FLUTTER_HOME"
  curl -fsSL "https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_$FLUTTER_VERSION-stable.tar.xz" \
    | tar -xJ -C "$(dirname "$FLUTTER_HOME")"
fi
# O pacote vem com outro dono; sem a exceção o git recusa o repositório do SDK.
git config --global --get-all safe.directory | grep -qx "$FLUTTER_HOME" \
  || git config --global --add safe.directory "$FLUTTER_HOME"
ln -sf "$FLUTTER_HOME/bin/flutter" "$FLUTTER_HOME/bin/dart" /usr/local/bin/
flutter --disable-analytics >/dev/null
flutter precache --web >/dev/null

# gettext: o compilemessages do backend (os testes conferem textos em pt-BR).
command -v msgfmt >/dev/null || { apt-get update -q && apt-get install -y -q gettext; }

# Postgres local aceitando qualquer senha em localhost, como o da CI
# (POSTGRES_HOST_AUTH_METHOD: trust): nada com cara de segredo em arquivo.
hba=$(ls /etc/postgresql/*/main/pg_hba.conf | head -1)
if grep -qE '^host\s+all\s+all\s+127.0.0.1/32\s+scram-sha-256' "$hba"; then
  sed -i -E 's/^(host\s+all\s+all\s+(127.0.0.1\/32|::1\/128)\s+)scram-sha-256/\1trust/' "$hba"
  service postgresql restart >/dev/null
fi
service postgresql status >/dev/null || service postgresql start >/dev/null
su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='ishinydex'\"" | grep -q 1 \
  || su postgres -c "createdb ishinydex"

# Frontend: dependências e arquivos gerados (não vão para o git).
if [ -f "$REPOS/ishinydex-frontend/pubspec.yaml" ]; then
  (cd "$REPOS/ishinydex-frontend" && flutter pub get >/dev/null && dart run build_runner build -d >/dev/null)
fi

# Backend: o Python da CI num .venv do projeto (como no ci.yml), as
# dependências do poetry.lock e um src/.env só desta máquina (o .env está
# no .gitignore). Os ganchos do pre-commit ficam no cache para o lint.
backend="$REPOS/ishinydex-backend"
if [ -f "$backend/pyproject.toml" ]; then
  cd "$backend"
  uv venv -q --allow-existing -p "$PYTHON_VERSION" .venv
  POETRY_VIRTUALENVS_CREATE=true POETRY_VIRTUALENVS_IN_PROJECT=true \
    poetry install -q --no-root
  if [ ! -f src/.env ]; then
    printf 'POSTGRES_HOST=localhost\nPOSTGRES_PASSWORD=%s\nSECRET_KEY=%s\nDEBUG=True\n' \
      "$(openssl rand -hex 16)" "$(openssl rand -hex 32)" > src/.env
  fi
  .venv/bin/pre-commit install-hooks >/dev/null
fi

echo "Ambiente pronto: $(flutter --version | head -1); $("$backend/.venv/bin/python" --version 2>/dev/null || echo 'sem backend'); $(psql --version)"
