# Fluxo de trabalho

O código da aplicação vive em
[ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend) e
[ishinydex-frontend](https://github.com/nunesvictor/ishinydex-frontend), cada
um com o seu fluxo (ver o `CONTRIBUTING.md` de cada). Este repositório só
**junta os dois**: submodules, `docker-compose.yml`, `.env.example` e CI da
stack completa.

1. **Issue** descrevendo a mudança (em pt-BR).
2. **Branch** `<número>-<resumo>`, a partir da `main` atualizada.
3. **Pull request** com `Closes #<número>`. O CI sobe a stack completa
   (`docker compose`) e confere o app, a API e o admin.
4. **Revisão e squash merge** pelo dono do repositório. A branch é apagada
   sozinha.

## Versões e releases

- **SemVer** com `v`: `vMAJOR.MINOR.PATCH`. MINOR para funcionalidades,
  PATCH para correções, MAJOR quando algo deixa de ser compatível.
  Pré-releases: `v2.0.0-alpha.1`, `v2.0.0-beta.1`, `v2.0.0-rc.1`.
- **Uma versão para o produto:** a mesma tag anotada nos três repositórios,
  nos commits que os submodules apontam na `main` daqui. A release do GitHub
  (com as notas) fica só neste repositório.
- **A versão vem da tag**, não de arquivo: o build do frontend recebe
  `APP_VERSION` (no compose, `X_APP_VERSION=$(git describe --tags)`) e a
  mostra em Ajustes. A versão do `pubspec.yaml` e do `pyproject.toml` não é
  usada.
- **Versões de dados** (a partir da arquitetura local-first, #48) são
  separadas da versão do app: o arquivo de sync tem um `schemaVersion`
  inteiro e o pacote do catálogo usa a data (`catalog-AAAA.MM.DD`).

Linha do tempo: `v1.0.0` é a última versão com servidor; as etapas da
migração local-first saem como `v2.0.0-alpha.N`/`-beta.N`, e a `v2.0.0` é a
migração concluída.

### Como fazer uma release

Com o bump dos submodules já na `main`:

```sh
git checkout main && git pull --ff-only && git submodule update --init
tool/release.py v1.1.0 --dry-run   # confere e mostra as notas
tool/release.py v1.1.0             # tags nos três repositórios + release
```

O script recusa a release se este repositório não estiver na `origin/main`,
se um submodule apontar para um commit fora da `main` dele ou se a tag já
existir. As notas juntam os PRs dos três repositórios desde a release
anterior (a última versão final, para uma versão final), agrupados pelo
prefixo do título: `feat` → Novidades, `fix` → Correções, `perf`, `docs`;
o resto vai para Manutenção. Por isso o título do PR segue o padrão
`tipo: descrição`. O script roda na máquina, e não no CI, porque o token do
CI de um repositório não cria tags nos outros.

### GitHub Pages

A tag `v*` publica o app em modo demonstração em
`https://<dono>.github.io/<repositório>/` (workflow **Pages**). O site é
montado por `tool/build_pages.sh <versão> <base-href> <saída>`, que também
roda na máquina (com o Flutter no PATH): app na raiz, páginas fixas de
`site/` junto, e o app carregado de `v/<hash>/` (cache-busting). O script
falha se algum endereço `github.io` aparecer no código: uma cópia nunca pode
depender do Pages de outra pessoa. O ambiente `github-pages` aceita publicar
a partir da `main` e das tags `v*`.

## Atualizar os submodules

O Dependabot abre os PRs toda semana. Para fazer à mão:

```sh
git submodule update --remote backend frontend
git commit -am "chore(deps): atualizar submodules"
```

Quando um PR daqui depende de mudanças nos outros repositórios, mergeie
primeiro os PRs de lá e só então atualize o submodule aqui.
