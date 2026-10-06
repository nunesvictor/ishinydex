# ishinydex

Repositório unificador do iShinyDex: `backend/` (ishinydex-backend, Django) e `frontend/` (ishinydex-frontend, Flutter) como **git submodules**. Desde a v2.0.0 o app não tem servidor: roda no GitHub Pages, com os dados no aparelho e sync opcional pelo Dropbox (#48). O backend só gera o **catálogo** (dados de referência). O código muda nos repositórios de cada submodule; aqui só a publicação (Pages), docs, CI, releases e bumps de submodule.
O usuário está aprendendo Flutter: explique as decisões. Textos, issues e PRs em pt-BR.

## Onde fica cada coisa
- Só existe este clone (`~/dev/pessoal/ishinydex`). Desenvolve-se em **git worktrees dos submodules**, a partir de `origin/main`, fora da pasta do repositório:
  `git -C backend worktree add ../../be-<n>-<resumo> -b <n>-<resumo> origin/main` (idem `frontend`). Isso não muda o commit checado no submodule (o repo pai não fica sujo). Remova a worktree ao final (`git worktree remove`).
- Convenções do frontend: `frontend/CLAUDE.md` (feature-first, Riverpod à mão, o backend local em `lib/fake/fake_backend.dart`, 100% de cobertura, telas testadas em `compactSize`/`expandedSize`); depois de clonar ou trocar de commit, `dart run build_runner build`.
- Backend: `CONTRIBUTING.md` de lá; pre-commit (black, isort, flake8, pyright) com `PYENV_VERSION=ishinydex-3.14 pre-commit run --all-files`, **depois** do `git add` (arquivos não rastreados ficam de fora).
- **Testes do backend:** o compose do backend é só de dev/testes. Numa worktree, cada cópia vira um projeto compose isolado (volumes próprios, banco sem porta publicada):
  `cp .env.example src/.env && ln -s src/.env .env` (troque os `change-me`), depois `docker compose run --rm web sh -c "python manage.py compilemessages -l pt_BR && python manage.py test"`. No fim, `docker compose -p <nome-da-worktree> down -v` apaga **só** o projeto da worktree; confira com `docker compose ls` antes.
- **Catálogo:** release `catalog-AAAA.MM.DD` do backend (workflow Catálogo, `exportcatalog`); a versão usada pelo Pages fica em `catalog.version`.
- **Git nos submodules:** sem `user.name`/`user.email` configurados. Use `git -c user.name="Victor Nunes" -c user.email=…` no commit e faça o push com a credencial do `gh`: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`. O `git push` puro trava pedindo senha. O token tem escopo `workflow`.

## Publicação
- **GitHub Pages** (`https://nunesvictor.github.io/ishinydex/`): o app no modo local na raiz e a demonstração em `/demo/`, publicados pela tag `v*` (workflow `Pages` → `tool/build_pages.sh`); o ambiente `github-pages` aceita `main` e `v*`. Nada de endereço `github.io` fixo no código.
- A variável do repositório `DROPBOX_APP_KEY` (pública) liga o sync no build do modo local; o script falha se ela não chegar ao app.
- `backups/` (fora do git) guarda o último dump do servidor antigo e o arquivo da migração (etapa 7).

## Fluxo (os três repositórios)
- Issue → branch `<n>-<resumo>` → PR com `Closes #n` → CI verde → **o usuário revisa e faz squash merge**, exceto quando ele autoriza explicitamente o merge naquele pedido. Nunca push direto na `main` (protegida, vale para admin).
- Com 2+ PRs abertos, sempre informar a **ordem de merge** (repo + número com link, checks e o porquê).
- Mudança que atravessa repos: issue em cada, com links cruzados; o PR do backend entra primeiro.
- Itens aceitos sem data vão para a milestone **Backlog** do repositório onde o trabalho começa.
- **Submodules:** só apontar para commits da `main` de cada repositório, nunca para o commit de um PR (fica órfão depois do squash); a CI daqui confere.
- **Depois dos merges:** PR de bump dos submodules → merge → release com `tool/release.py <tag>` (a tag publica no Pages) → conferir o workflow Pages e o `sw.js` publicado.
- **Versões:** SemVer, a mesma tag nos três repositórios, release só aqui, com `tool/release.py <tag>` (ver `CONTRIBUTING.md`). Títulos de PR no padrão `tipo: descrição` (viram as categorias das notas). `v1.0.0` = última versão com servidor; local-first = `v2.0.0` (pré-releases `-alpha.N`/`-beta.N` nas etapas da #48).
- Segredos: nada real em arquivos de exemplo (usar `change-me`); o GitGuardian barra até mensagens com cara de senha. Operações em credenciais ou dados reais: script para o usuário rodar com `!`.
