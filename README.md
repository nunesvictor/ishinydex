# iShinyDex

Gerenciador pessoal de PersonalDex no estilo das boxes do Pokémon HOME: dexes,
boxes, espécimes (shiny, alfa, pokébola, OT…) e progresso por geração.

Este repositório junta a aplicação completa e sobe tudo com um único
`docker compose`. O código fica em dois repositórios, incluídos aqui como
**git submodules**:

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

## Rodando

Pré-requisitos: Docker com o plugin compose.

```sh
git clone --recurse-submodules https://github.com/nunesvictor/ishinydex.git
cd ishinydex
cp .env.example .env        # troque todos os valores change-me
docker compose up -d --build
```

Abra `http://localhost:8090` (ou `http://<ip-do-pc>:8090` pela rede).

- **Primeiro build:** baixa os sprites da PokeAPI e o SDK do Flutter, então
  demora alguns minutos. Os seguintes usam o cache do Docker.
- **Migrations:** o backend aplica as migrations sozinho ao subir.
- **Porta:** mude `X_WEB_PORT` no `.env` para usar outra.
- **Usuário do admin/app:** crie com
  `docker compose exec backend python manage.py createsuperuser`.

### Dados

- **Backup:** `docker compose exec backend python manage.py backupdb` grava em
  `backups/`.
- **Restauração:** `docker compose exec backend python manage.py restoredb`
  restaura o `.backup` mais recente de `backups/`.
- **Instalação nova:** a carga dos dados da PokeAPI e a criação das boxes são
  feitas com os comandos do backend (`sync_pokeapi`, `create_home_boxes`,
  `create_personal_dex`). Veja o
  [README do backend](https://github.com/nunesvictor/ishinydex-backend).

## Atualizando

```sh
git pull
git submodule update --init --recursive
docker compose up -d --build
```

Os submodules apontam para um commit fixo de cada repositório. O Dependabot
abre um PR por semana atualizando esses commits.

## Desenvolvimento

O desenvolvimento acontece em cada repositório, com o compose e as instruções
de cada um (hot reload no backend, `flutter run` no frontend).

**Porta:** este compose só publica a `:8090`, a mesma do compose do frontend;
os dois não rodam juntos. O compose do backend (dev em `:8008`, prod em `:8080`)
pode rodar junto, mas usa outro banco.

Fluxo de contribuição: [CONTRIBUTING.md](CONTRIBUTING.md).
