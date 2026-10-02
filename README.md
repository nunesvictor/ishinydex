# iShinyDex

Gerenciador pessoal de PersonalDex no estilo das boxes do Pokémon HOME: dexes,
boxes, espécimes (shiny, alfa, pokébola, OT…) e progresso por geração.

Este repositório junta a aplicação completa e sobe tudo com um único
`docker compose`: é **o único jeito de instalar e fazer deploy**. O código fica
em dois repositórios, incluídos aqui como **git submodules** (os composes que
eles têm, quando têm, são só para desenvolvimento e testes):

| Pasta | Repositório | O que é |
| --- | --- | --- |
| [`backend/`](https://github.com/nunesvictor/ishinydex-backend) | `ishinydex-backend` | API REST e admin (Django + DRF, PostgreSQL) |
| [`frontend/`](https://github.com/nunesvictor/ishinydex-frontend) | `ishinydex-frontend` | App Flutter (web responsiva + iOS), servido por nginx |

```
navegador ──► :8090 frontend (nginx)
                │  /            → app Flutter (build web)
                │  /api /admin  → backend:8000 (uWSGI + Django) ──► db (PostgreSQL 17)
                │  /static /media
```

Só a porta do nginx (`8090` por padrão) é publicada no host. Backend e banco
ficam na rede interna do compose.

## 1. Pré-requisitos

- **Docker** com o plugin **compose** (`docker compose version`).
- **git**.
- ~6 GB livres em disco no primeiro build (SDK do Flutter, sprites da PokeAPI,
  imagens do Python e do Postgres).
- Acesso à internet no **primeiro** build. Depois disso tudo roda offline: os
  sprites ficam num volume local.

## 2. Clonar

```sh
git clone --recurse-submodules https://github.com/nunesvictor/ishinydex.git
cd ishinydex
```

Se clonou sem `--recurse-submodules`, as pastas `backend/` e `frontend/` vêm
vazias. Para buscar:

```sh
git submodule update --init --recursive
```

## 3. Configurar o `.env`

```sh
cp .env.example .env
```

Troque **todos** os `change-me`. Um jeito de gerar cada valor:

```sh
python3 -c "import secrets; print(secrets.token_urlsafe(24))"   # POSTGRES_PASSWORD
python3 -c "import secrets; print(secrets.token_urlsafe(50))"   # SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(18))"   # DJANGO_SUPERUSER_PASSWORD
```

| Variável | Para quê |
| --- | --- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Banco do serviço `db`. A senha só vale para um volume novo: depois de criado, mudar aqui não muda a senha do banco. |
| `SECRET_KEY` | Assinatura de sessões do Django (admin). Trocar derruba as sessões do admin; os logins do app, por token, continuam valendo. |
| `ALLOWED_HOSTS` | Hosts aceitos pelo Django. `"*"` serve para uso na rede local. |
| `DJANGO_SUPERUSER_*` | Dados usados pelo `createsuperuser --noinput` (ver abaixo). |
| `FRONTEND_ORIGINS` | CORS: só é preciso se o app for servido de outro endereço. Pelo nginx daqui é a mesma origem. |
| `X_WEB_PORT` | Porta do app no host (padrão `8090`). |
| `X_WEB_WASM` | `true` (padrão) compila o app também em WebAssembly, mais fluido nos navegadores Chromium; Safari e Firefox seguem no JavaScript. `false` gera só JavaScript. Vale no próximo `docker compose up -d --build`. |

O `.env` não vai para o git (`.gitignore`). Guarde uma cópia em lugar seguro.

## 4. Subir

```sh
docker compose up -d --build
```

- **Primeiro build:** leva vários minutos. Baixa os sprites da PokeAPI (e os
  comprime), o SDK do Flutter, e compila o app. Os builds seguintes usam o cache
  do Docker e levam segundos.
- **Ordem de subida:**
  1. o `sprites` popula o volume e encerra (fica como `Exited (0)`, é normal);
  2. o `db` fica saudável;
  3. o `backend` aplica as migrations e sobe o uWSGI;
  4. o `frontend` (nginx) passa a servir o app.
- **Conferir:**

  ```sh
  docker compose ps                        # backend, db e frontend "running"
  docker compose logs -f backend           # migrations e uWSGI
  curl -s -o /dev/null -w '%{http_code}\n' localhost:8090/api/   # 401 = ok
  ```

Abra `http://localhost:8090` no PC, ou `http://<ip-do-pc>:8090` no celular (mesma
rede Wi-Fi). O admin do Django fica em `http://localhost:8090/admin/`.

### Usuário para entrar no app e no admin

Num banco novo, crie o superusuário:

```sh
# usa DJANGO_SUPERUSER_USERNAME/EMAIL/PASSWORD do .env
docker compose exec backend python manage.py createsuperuser --noinput
# ou, perguntando os dados:
docker compose exec backend python manage.py createsuperuser
```

Para trocar a senha depois:
`docker compose exec backend python manage.py changepassword admin`.

## 5. Dados

### Instalação nova (banco vazio)

As migrations criam as tabelas, mas os dados dos Pokémon, as boxes e o dex vêm
de comandos do backend:

```sh
docker compose exec backend python manage.py sync_pokeapi          # espécies, formas etc. (demorado)
docker compose exec backend python manage.py create_home_boxes      # 200 boxes espelhando o HOME
docker compose exec backend python manage.py create_personal_dex "Living Dex" -i
```

O `-i` instala o esquema do dex nas boxes. Depois disso, também dá para criar
dexes pelo próprio app, em **Novo PersonalDex**.

### Backup e restauração

Os backups ficam em `backups/`, montado no backend:

```sh
docker compose exec backend python manage.py backupdb     # gera backups/dump-<banco>-<data>.backup
docker compose exec backend python manage.py restoredb    # restaura o .backup mais recente
```

O `restoredb` substitui o conteúdo do banco atual pelo do backup (`pg_restore
-c`). Os backups não vão para o git.

## 6. Dia a dia

| O que | Comando |
| --- | --- |
| Ver o estado | `docker compose ps` |
| Logs | `docker compose logs -f backend` (ou `frontend`, `db`) |
| Parar tudo | `docker compose stop` (os dados ficam nos volumes) |
| Subir de novo | `docker compose up -d` |
| Atualizar para a versão mais nova | `git pull && git submodule update --init --recursive && docker compose up -d --build` |
| Backup | `docker compose exec backend python manage.py backupdb` |

Com `restart: unless-stopped`, a stack volta sozinha quando o PC reinicia, a
menos que tenha sido parada com `docker compose stop`.

**Não use `docker compose down -v`:** o `-v` apaga os volumes, e com eles o
banco.

### Versões

Os submodules apontam para um commit fixo de cada repositório. O Dependabot
abre um PR por semana atualizando esses commits. Um bump só deve apontar para
commits que já estão na `main` do backend/frontend; nunca para o commit de um
PR, que deixa de existir depois do squash merge.

## 7. Problemas comuns

| Sintoma | Causa provável / solução |
| --- | --- |
| `backend/` ou `frontend/` vazios, ou o build diz que não acha o Dockerfile | Submodules não baixados: `git submodule update --init --recursive`. |
| `port is already allocated` na 8090 | Outro serviço usa a porta (ex.: o compose antigo do frontend). Pare-o ou mude `X_WEB_PORT` no `.env`. |
| App abre, mas o login falha ou a API dá 502 | Backend ainda subindo (migrations) ou caiu: `docker compose logs backend`. |
| `db` não fica saudável | `POSTGRES_PASSWORD` vazio no `.env`, ou senha diferente da usada quando o volume foi criado. |
| Sprites faltando (imagens quebradas) | O `sprites` não rodou até o fim: `docker compose logs sprites` e `docker compose up -d sprites`. |
| Mudança nova não aparece no navegador | Faltou `--build`; depois, recarregue a página (o app usa endereços versionados, então não precisa limpar o cache). |
| `restoredb`: "No .backup files found" | O arquivo não está em `backups/` deste repositório. |

## Desenvolvimento

O desenvolvimento acontece em cada repositório, com o compose e as instruções
de cada um: hot reload do Django no backend (`:8008`) e `flutter run` no
frontend.

**Porta:** este compose só publica a `:8090`, a mesma do compose do frontend;
os dois não rodam juntos. O compose do backend (dev em `:8008`, prod em `:8080`)
pode rodar junto, mas usa outro banco.

Fluxo de contribuição: [CONTRIBUTING.md](CONTRIBUTING.md).
