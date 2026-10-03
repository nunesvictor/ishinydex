# ishinydex

Repositório unificador do iShinyDex: `backend/` (ishinydex-backend, Django) e `frontend/` (ishinydex-frontend, Flutter) como **git submodules**, e um `docker-compose.yml` que sobe tudo. O código muda nos repositórios de cada submodule; aqui só compose, `.env.example`, docs, CI e bumps de submodule.
O usuário está aprendendo Flutter: explique as decisões. Textos, issues e PRs em pt-BR.

## Onde fica cada coisa
- Só existe este clone (`~/dev/pessoal/ishinydex`). Desenvolve-se em **git worktrees dos submodules**, a partir de `origin/main`, fora da pasta do repositório:
  `git -C backend worktree add ../../be-<n>-<resumo> -b <n>-<resumo> origin/main` (idem `frontend`). Isso não muda o commit checado no submodule (o repo pai não fica sujo). Remova a worktree ao final (`git worktree remove`).
- Convenções do frontend: `frontend/CLAUDE.md` (feature-first, Riverpod à mão, fake backend espelhando a API, 100% de cobertura, telas testadas em `compactSize`/`expandedSize`); depois de clonar ou trocar de commit, `dart run build_runner build`.
- Backend: `CONTRIBUTING.md` e `docs/plans/frontend-api.md` (contrato da API); pre-commit (black, isort, flake8) com `PYENV_VERSION=ishinydex-3.14 pre-commit run --all-files`.
- **Testes do backend:** o compose do backend é só de dev/testes. Numa worktree, cada cópia vira um projeto compose isolado (volumes próprios, banco sem porta publicada, runserver em `:8008`):
  `cp .env.example src/.env && ln -s src/.env .env` (troque os `change-me`), depois `docker compose run --rm web sh -c "python manage.py compilemessages -l pt_BR && python manage.py test"`. No fim, `docker compose -p <nome-da-worktree> down -v` apaga **só** o projeto da worktree; confira com `docker compose ls` antes.
- **Git nos submodules:** sem `user.name`/`user.email` configurados. Use `git -c user.name="Victor Nunes" -c user.email=…` no commit e faça o push com a credencial do `gh`: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`. O `git push` puro trava pedindo senha. O token tem escopo `workflow` (para refazê-lo: `gh auth refresh -h github.com -s workflow`).

## Rodar
- `docker compose up -d --build` → só `:8090` publicado (nginx → `backend:8000` pela rede interna; `backend` roda `migrate` ao subir). É o **único** deploy: os submodules não têm compose de deploy.
- Backup/restore: `docker compose exec backend python manage.py backupdb|restoredb` (pasta `backups/`).
- Nunca `docker compose down -v` aqui (apaga o banco).
- iPhone: Safari em `http://<ip-do-host>:8090` → "Adicionar à Tela de Início" (sem HTTPS; decisão em #10).

## Fluxo (os três repositórios)
- Issue → branch `<n>-<resumo>` → PR com `Closes #n` → CI verde → **o usuário revisa e faz squash merge**, exceto quando ele autoriza explicitamente o merge naquele pedido. Nunca push direto na `main` (protegida, vale para admin).
- Com 2+ PRs abertos, sempre informar a **ordem de merge** (repo + número com link, checks e o porquê).
- Mudança que atravessa repos: issue em cada, com links cruzados; o PR do backend entra primeiro.
- Itens aceitos sem data vão para a milestone **Backlog** do repositório onde o trabalho começa.
- **Submodules:** só apontar para commits da `main` de cada repositório, nunca para o commit de um PR (fica órfão depois do squash).
- **Deploy** após os merges: PR de bump dos submodules → merge do usuário → aqui `git pull --ff-only && git submodule update --init --recursive && X_APP_VERSION=$(git describe --tags) docker compose up -d --build`, **em segundo plano**, e verificar ao terminar (versão do bundle em `/flutter_bootstrap.js`, `/api/` = 401).
- **GitHub Pages** (`https://nunesvictor.github.io/ishinydex/`): o app no modo local na raiz e a demonstração em `/demo/`, publicados pela tag `v*` (workflow `Pages` → `tool/build_pages.sh`); o ambiente `github-pages` aceita `main` e `v*`. Nada de endereço `github.io` fixo no código.
- **Versões:** SemVer, a mesma tag nos três repositórios, release só aqui, com `tool/release.py <tag>` (ver `CONTRIBUTING.md`). Títulos de PR no padrão `tipo: descrição` (viram as categorias das notas). `v1.0.0` = última versão com servidor; local-first = `v2.0.0` (pré-releases `-alpha.N`/`-beta.N` nas etapas da #48).
- Segredos: nada real em `.env.example` (usar `change-me`); o GitGuardian barra até mensagens com cara de senha no compose ou no CI. Operações em credenciais ou dados de produção: script para o usuário rodar com `!`.
