# ishinydex

Repositório unificador do iShinyDex: `backend/` (ishinydex-backend, Django) e `frontend/` (ishinydex-frontend, Flutter) como **git submodules**, e um `docker-compose.yml` que sobe tudo. O código muda nos repositórios de cada submodule; aqui só compose, `.env.example`, docs, CI e bumps de submodule.
O usuário está aprendendo Flutter: explique as decisões. Textos, issues e PRs em pt-BR.

## Onde fica cada coisa
- Clones locais: `~/dev/pessoal/ishinydex` (este), `~/dev/pessoal/ishinydex-backend` e `~/dev/pessoal/ishinydex-frontend` (onde se desenvolve e abre PR).
- Convenções do frontend: `~/dev/pessoal/ishinydex-frontend/CLAUDE.md` (feature-first, Riverpod à mão, fake backend espelhando a API, 100% de cobertura, telas testadas em `compactSize`/`expandedSize`).
- Backend: `CONTRIBUTING.md` e `docs/plans/frontend-api.md` (contrato da API) no repo do backend; testes no container de dev (`docker compose exec web python manage.py test`), pre-commit (black, isort, flake8).

## Rodar
- `docker compose up -d --build` → só `:8090` publicado (nginx → `backend:8000` pela rede interna; `backend` roda `migrate` ao subir).
- Backup/restore: `docker compose exec backend python manage.py backupdb|restoredb` (pasta `backups/`).
- Nunca `docker compose down -v` (apaga o banco). O compose de dev do backend (`:8008`, banco antigo `django-pokedex`) pode rodar junto; o compose do frontend (`:8090`) não.

## Fluxo (os três repositórios)
- Issue → branch `<n>-<resumo>` → PR com `Closes #n` → CI verde → **o usuário revisa e faz squash merge**. Nunca push/merge direto na `main` (protegida, vale para admin).
- Com 2+ PRs abertos, sempre informar a **ordem de merge** (repo + número com link, checks e o porquê).
- Mudança que atravessa repos: issue em cada, com links cruzados; o PR do backend entra primeiro.
- Itens aceitos sem data vão para a milestone **Backlog** do repositório onde o trabalho começa.
- **Submodules:** só apontar para commits da `main` de cada repositório, nunca para o commit de um PR (fica órfão depois do squash).
- **Deploy** após os merges: PR de bump dos submodules → merge do usuário → aqui `git pull --ff-only && git submodule update --init --recursive && docker compose up -d --build`, **em segundo plano**, e verificar ao terminar (versão do bundle em `/flutter_bootstrap.js`, `/api/` = 401).
- Segredos: nada real em `.env.example` (usar `change-me`); o GitGuardian barra até mensagens com cara de senha no compose ou no CI. Operações em credenciais ou dados de produção: script para o usuário rodar com `!`.
