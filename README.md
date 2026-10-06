# iShinyDex

Gerenciador pessoal de PersonalDex no estilo das boxes do Pokémon HOME: dexes,
boxes, espécimes (shiny, alfa, pokébola, OT…) e progresso por geração.

**Abra o app:** https://nunesvictor.github.io/ishinydex/ (ou a
[demonstração](https://nunesvictor.github.io/ishinydex/demo/), com dados de
exemplo).

- Sem servidor e sem conta: os dados ficam no seu aparelho.
- Instala como app no iPhone, no iPad e no PC (Safari → Compartilhar →
  **Adicionar à Tela de Início**; no Chrome/Edge, o ícone de instalar na
  barra de endereço).
- Funciona offline.
- **Backup:** Ajustes → Seus dados → **Exportar dados** (um arquivo `.json`)
  e **Importar dados**.
- **Sincronização opcional com o Dropbox** (Ajustes → Sincronização): os
  mesmos dados em todos os aparelhos, na sua própria conta.

Privacidade: o app não tem servidor nem coleta dados
([política de privacidade](https://nunesvictor.github.io/ishinydex/privacidade/)).

> Este README ganha um guia completo na etapa 10 de
> [#48](https://github.com/nunesvictor/ishinydex/issues/48).

## Código

| Pasta | Repositório | O que é |
| --- | --- | --- |
| `frontend/` | [ishinydex-frontend](https://github.com/nunesvictor/ishinydex-frontend) | O app (Flutter) |
| `backend/` | [ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend) | Gera o catálogo (dados de referência, da PokéAPI) |

Este repositório junta os dois como **git submodules**, publica o app no
GitHub Pages a cada tag `v*` e guarda as releases. Fluxo de trabalho e
versões: [CONTRIBUTING.md](CONTRIBUTING.md).

Até a `v1.0.0`, o iShinyDex era um servidor (Django + Postgres) rodando com
`docker compose`. A partir da `v2.0.0`, os dados ficam nos aparelhos.
