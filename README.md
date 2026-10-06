# iShinyDex

Organize sua coleção de Pokémon no estilo das boxes do **Pokémon HOME**:
monte o seu PersonalDex (a Living Dex, a Shiny Living Dex ou outra), veja o
que falta em cada box, cadastre os espécimes (shiny, alfa, pokébola,
treinador, data de captura…) e acompanhe o progresso por geração.

### ▶️ [Abrir o iShinyDex](https://nunesvictor.github.io/ishinydex/)

Quer só dar uma olhada? A
[**demonstração**](https://nunesvictor.github.io/ishinydex/demo/) vem com
dados de exemplo, que somem ao recarregar a página.

- **Sem conta e sem servidor:** seus dados ficam no seu aparelho.
- **Funciona offline**, depois de aberto uma vez.
- **Instala como app** no iPhone, no iPad e no computador.
- **Sincronização opcional** com o seu Dropbox, para ter os mesmos dados em
  todos os aparelhos.

## Instalar

O iShinyDex roda no navegador. Instalado, ele abre em tela cheia, com ícone
próprio, como um app.

**iPhone e iPad**
1. Abra o [link do app](https://nunesvictor.github.io/ishinydex/) no
   **Safari**.
2. Toque em **Compartilhar** (o quadrado com a seta) → **Adicionar à Tela de
   Início** → **Adicionar**.
3. Use sempre pelo ícone da Tela de Início. No iPhone e no iPad, o app
   instalado guarda os dados separados do Safari.

**Computador (Chrome ou Edge)**
1. Abra o [link do app](https://nunesvictor.github.io/ishinydex/).
2. Clique no ícone de **instalar** na barra de endereço (ou procure a opção
   de instalar no menu ⋮ do navegador).

Também dá para usar direto no navegador, sem instalar.

**Atualizações** chegam sozinhas: se a versão em **Ajustes → Sobre o
iShinyDex** não mudou depois de uma novidade, feche o app e abra de novo.

## Seus dados

Tudo o que você cadastra fica **no aparelho**, no armazenamento do navegador
(ou do app instalado). Ninguém mais tem acesso, nem quem mantém o projeto.

Isso também quer dizer que, se você apagar os dados do site no navegador ou
remover o app, os dados vão junto. Por isso:

### Faça backup

Em **Ajustes → Seus dados**:
- **Exportar dados** baixa um arquivo `.json` com tudo. No iPhone e no iPad,
  dá para salvá-lo no iCloud Drive (**Salvar em Arquivos**).
- **Importar dados** lê um arquivo exportado e mostra um resumo antes de
  aplicar:
  - **Substituir** deixa o aparelho exatamente como o arquivo;
  - **Juntar** mantém os dois lados; se o mesmo registro mudou nos dois, vale
    a mudança mais recente.

O mesmo arquivo serve para levar seus dados para outro aparelho sem usar o
Dropbox.

## Sincronizar com o Dropbox (opcional)

Com o Dropbox ligado, PC, iPhone e iPad ficam com os mesmos dados, e você
ganha um backup automático na sua própria conta.

1. Em **Ajustes → Seus dados → Sincronização**, toque em **Conectar ao
   Dropbox** e autorize no site do Dropbox.
2. Repita em cada aparelho. Se o aparelho já tiver dados e o Dropbox também,
   o app pergunta o que fazer: **juntar os dois** (recomendado), usar só os do
   Dropbox ou usar só os do aparelho.

Daí em diante, o app sincroniza sozinho: ao abrir, ao voltar para ele,
alguns segundos depois de cada mudança e quando você puxa a lista de dexes
para atualizar. Sem internet, ele guarda as mudanças e envia quando a
conexão voltar.

- O app só enxerga **a pasta dele**, dentro de `Apps` no seu Dropbox, onde
  grava um único arquivo (`ishinydex.json`). Ele não vê nenhum outro arquivo
  seu.
- **Desconectar** (na mesma tela) só desliga a sincronização: os dados
  continuam no aparelho e no Dropbox.
- Se aparecer "Não foi possível sincronizar" porque o acesso expirou,
  desconecte e conecte de novo.

## Privacidade

O iShinyDex não tem servidor, não tem conta, não usa cookies de
rastreamento, análise de uso nem anúncios. Detalhes na
[**política de privacidade**](https://nunesvictor.github.io/ishinydex/privacidade/).

## Hospede sua cópia

O link acima é a cópia publicada por quem mantém o projeto. Você pode
publicar a sua, de graça, no GitHub Pages da sua conta: os dados de quem usa
a sua cópia ficam nos aparelhos dessas pessoas, e o app não fala com a cópia
original. (Só o build baixa o catálogo das releases do
[ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend/releases).)

1. Faça um **fork** deste repositório no GitHub.
2. No fork, abra a aba **Actions** e ative os workflows (o GitHub os deixa
   desligados em forks).
3. Em **Settings → Pages**, escolha **Source: GitHub Actions**.
4. Publique: **Actions → Pages → Run workflow** (na `main`). O app fica em
   `https://<seu-usuário>.github.io/<nome-do-repositório>/`. Para publicar
   também por tags `v*`, como aqui, permita esse padrão em **Settings →
   Environments → github-pages**.
5. **Dropbox (opcional):** sem este passo, a sua cópia funciona sem a
   sincronização (exportar e importar continuam valendo).
   1. Em [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps),
      crie um app: **Scoped access** → **App folder**.
   2. Em **Permissions**, marque `files.content.read`, `files.content.write` e
      `account_info.read` e clique em **Submit**.
   3. Em **Settings → OAuth 2 → Redirect URIs**, adicione o endereço exato da
      sua cópia, com a barra no final
      (`https://<seu-usuário>.github.io/<nome-do-repositório>/`).
   4. Copie a **App key** (é pública; o *App secret* não é usado) e grave-a
      no fork em **Settings → Secrets and variables → Actions → Variables**,
      com o nome `DROPBOX_APP_KEY`.
   5. Publique de novo (passo 4).

   Enquanto o app do Dropbox estiver em desenvolvimento, só a sua conta
   conecta. Para liberar outras pessoas, use **Enable additional users** no
   painel do Dropbox (até 500 contas; a partir de 50, o Dropbox exige o
   pedido de produção).

## Aviso legal

O iShinyDex é um projeto de fã, gratuito e sem fins lucrativos. Pokémon e os
nomes, imagens e marcas relacionados são propriedade da Nintendo, Creatures,
GAME FREAK e The Pokémon Company. Os dados de referência vêm da
[PokéAPI](https://pokeapi.co/) e as imagens do repositório
[PokeAPI/sprites](https://github.com/PokeAPI/sprites). O iShinyDex não é
afiliado a nenhuma dessas empresas, nem ao Dropbox.

## Para quem desenvolve

| Pasta | Repositório | O que é |
| --- | --- | --- |
| `frontend/` | [ishinydex-frontend](https://github.com/nunesvictor/ishinydex-frontend) | O app (Flutter) |
| `backend/` | [ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend) | Gera o catálogo (dados de referência, da PokéAPI) |

Este repositório junta os dois como **git submodules**, publica o app no
GitHub Pages a cada tag `v*` e guarda as releases. Fluxo de trabalho e
versões: [CONTRIBUTING.md](CONTRIBUTING.md). Problemas e sugestões:
[issues](https://github.com/nunesvictor/ishinydex/issues).

Até a `v1.0.0`, o iShinyDex era um servidor (Django + Postgres) rodando com
`docker compose`. A partir da `v2.0.0`, os dados ficam nos aparelhos.
