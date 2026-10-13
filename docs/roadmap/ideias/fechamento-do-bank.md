# Fechamento do Pokémon Bank (ideia no pool)

Issues: [backend#114](https://github.com/nunesvictor/ishinydex-backend/issues/114) (`homeUntil` no catálogo) e [frontend#222](https://github.com/nunesvictor/ishinydex-frontend/issues/222) (aviso, caçadas e saves). Proposta aprovada em 2026-10-13; entra na [v2.10.0](../v2.10.0.md). O prazo: o aviso precisa sair até dezembro de 2026.

## O que foi anunciado

- **Anúncio:** 13/08/2026, na mesma notícia em que a The Pokémon Company confirmou o FRLG do Switch no HOME ([portal-pokemon](https://sg.portal-pokemon.com/topics/pokemonbank/)).
- **Fim:** o Pokémon Bank e a transferência Bank → HOME acabam em **26/02/2027, 03:00 UTC**. É o mesmo instante em cada fuso:
  - 25/02, 19:00 em Los Angeles;
  - 26/02, 00:00 em Brasília;
  - 26/02, 12:00 em Tóquio.

  Fontes: [Bill's Archive](https://billsarchive.com/articles/pokemon-bank-shutdown.html) e [Dexerto](https://www.dexerto.com/pokemon/pokemon-bank-shutdown-shiny-forms-ribbons-3398610/).
- **Poké Transporter:** o único destino dele é o Bank, então deixa de servir junto.
- **Até lá:**
  - o Bank está gratuito desde 27/03/2023, mas não dá mais para baixá-lo;
  - passar do Bank para o HOME exige o **HOME Premium**;
  - a transferência é só de ida.
- **Depois:**
  - o que ficar no Bank não tem caminho para o HOME, e nenhum período extra foi anunciado;
  - o que já está no HOME não muda.
- **Jogos que perdem o caminho para o HOME:**
  - XY, ORAS, SM e USUM (pelo Bank);
  - BW e B2W2 (Transporter);
  - Gen IV e Gen III do GBA (Pal Park e Poké Transfer até a Gen V);
  - Virtual Console de RBY e GSC.
- **Jogos sem mudança:** os do Switch e o FRLG do Switch, que manda direto para o HOME desde outubro de 2026.

## Impacto no app

Hoje o app trata **XY, ORAS, SM e USUM como jogos "só de ida"** (`Save.oneWayVersions` no frontend e `HOME_ORIGIN_VERSIONS` no backend), junto com o FRLG do Switch. A regra "só de ida" continua certa até o fechamento. Depois dele, esses quatro grupos viram **jogos sem caminho**, e nada no app sabe disso.

| Onde | Hoje | Depois de 26/02/2027 |
|---|---|---|
| **Caçadas → Faltam** (`Catalog.huntableVersions`) | Conta XY/ORAS/SM/USUM como jogos onde caçar a forma | Caçar ali não enche mais o dex do HOME. As formas que só existem nesses jogos ficariam como "caçável", mas não são. |
| **Filtro Jogo e "Começar caçada"** | Os saves do 3DS aparecem como "só ida" | Precisam de outro rótulo ("sem caminho para o HOME") |
| **Espécime num save do 3DS** (`location_flow.dart`) | Pode ir para o HOME | Fica **preso no 3DS**: o app não pode oferecer "mover para o HOME" |
| **Saves** (`saves_page.dart`) | A seção "só de ida" junta FRLG e 3DS | O FRLG continua só de ida, e os do 3DS viram outra seção |
| **Novo save de jogo do 3DS** (`createSave`) | Permitido, para caçar e para o OT | Continua útil só para registrar o que ficou preso e o OT. Não deve aparecer como opção de caçada para o HOME. |
| **Odds das caçadas (v2.9.0)** | Regras de XY, ORAS, SM e USUM | Continuam certas: o jogo ainda funciona. A caçada ali só não leva ao HOME, e o cartão precisa avisar. |
| **Marca de origem, OT e espécimes já no HOME** | Kalos, Alola e GBA | Nada muda: as marcas só ficam finitas |
| **Backlog: Gen V e IV ([backend#111](https://github.com/nunesvictor/ishinydex-backend/issues/111), [frontend#199](https://github.com/nunesvictor/ishinydex-frontend/issues/199)) e Gen III/VC ([backend#112](https://github.com/nunesvictor/ishinydex-backend/issues/112), [frontend#200](https://github.com/nunesvictor/ishinydex-frontend/issues/200))** | Planejadas como caçadas "só de ida" pelo Bank | **Perdem o sentido**: o caminho que elas mapeiam acaba antes de valer a pena implementar |

### Formas que deixam de ter shiny possível no HOME
Algumas formas só têm shiny pelos jogos do Bank, porque são travadas no Switch. Exemplos da Dexerto, a conferir na curadoria:
- Type: Null, Silvally, Poipole e Naganadel;
- Pikachu com boné;
- Celebi do VC Crystal.

Com o fechamento, ficam **sem caçada possível** para o HOME. Com a regra da proposta 2 abaixo, o app calcula isso sozinho: sem jogo válido, a forma sai da lista de caçáveis.

## Proposta

A ideia central: **a data vai no catálogo, e o app muda de comportamento sozinho no instante do fechamento**, pelo relógio do aparelho. Não precisa de release no dia, e funciona offline, porque a data já vem no catálogo baixado.

### 1. Data de corte por jogo no catálogo (backend)
- Cada versão do catálogo ganha `homeUntil` (opcional, ISO 8601 UTC). Nos oito jogos do Bank, `"2027-02-26T03:00:00Z"`.
- É uma chave aditiva, então o `schemaVersion` continua 1, e o app antigo ignora a chave.
- A fonte fica no JSON do backend (uma lista `bank_shutdown` com a data e os links), no mesmo padrão das curadorias.
- **Por que no catálogo e não no código:** se a TPC adiar a data, basta uma release do catálogo, sem mexer no app.

### 2. "Caminho para o HOME" no app (frontend)
- `Catalog` ganha `reachesHome(version, now)`: o jogo recebe do HOME, ou é só de ida e ainda não passou do `homeUntil`.
- `huntableVersions` usa essa regra. Depois do corte, XY, ORAS, SM e USUM saem de "Faltam", do filtro Jogo das Caçadas e do "Começar caçada" para o dex. As formas que só tinham esses jogos ficam sem jogo, como uma forma travada.
- O relógio entra por um provider (`clockProvider`), para os testes fixarem a data antes e depois do corte.

### 3. Saves e espécimes do 3DS depois do corte
- **Saves:** os do 3DS saem da seção "só de ida" para uma seção "**Sem caminho para o HOME**", com a data do fechamento.
  - Continuam existindo e podem ser criados, porque guardam o OT e o que ficou preso.
  - Não aparecem para começar caçadas.
- **Espécime num save do 3DS:**
  - o fluxo de mudar o local não oferece mais o HOME, e explica por quê ("O Pokémon Bank fechou em 26/02/2027");
  - o detalhe mostra o local com a etiqueta "Preso no 3DS".
- **Caçadas em andamento num save do 3DS:**
  - continuam: a pessoa pode querer terminar no jogo;
  - o cartão ganha a nota "Não chega mais ao HOME";
  - o "Encontrei!" continua funcionando.

### 4. Aviso antes do corte (o que mais ajuda o usuário)
- Enquanto o corte não chega, o app mostra um aviso com a contagem: "**N espécimes em saves do 3DS** · o Pokémon Bank fecha em 26/02/2027. Mova-os para o HOME (precisa do HOME Premium)."
  - Fica no topo da tela de Saves e no inventário filtrado por esses saves.
  - Tocar no aviso abre o inventário filtrado pelos saves do 3DS. O filtro "Está em" já existe, então não precisa de tela nova.
  - Some quando não há espécime nesses saves, ou depois do corte.
- O aviso fica mais visível nos últimos 30 dias.
- Isso só serve **antes** de fevereiro de 2027, então é o item com prazo. Ele precisa sair numa versão até **dezembro de 2026** para dar tempo de usar.

### 5. Backlog
- **Gen V/IV e Gen III/VC** (backend#111/#112, frontend#199/#200): **fechadas como "não planejado"** em 2026-10-13 e removidas do pool.
  - Fazer a curadoria de 20 jogos para um caminho que fecha em fevereiro não compensa.
  - O plano em `cacadas-jogos-antigos.md` ganha uma nota com o motivo.
- **Pokémon Bank como local** (registrar o que está guardado no Bank): **descartado**. O app não tem o conceito de "caixa fora de um jogo", e o valor dura só até fevereiro.
- **Odds da v2.9.0:** seguem como estão. A nota "Não chega mais ao HOME" do item 3 vale para elas.

## Ordem e custo

| Parte | Repo | Quando | Custo |
|---|---|---|---|
| 1. `homeUntil` no catálogo + release do catálogo | backend | antes do item 4 | pequeno |
| 4. Aviso com a contagem | frontend | **até dezembro de 2026** | pequeno |
| 2. `reachesHome` + relógio + caçadas | frontend | junto do 4 (já fica pronto para virar no dia) | médio |
| 3. Saves e espécimes "sem caminho" | frontend | junto do 2 | médio |
| 5. Backlog | docs/issues | agora | trivial |

Tudo cabe numa minor só (v2.10.0 ou a que vier depois da v2.9.0), desde que saia até dezembro.
- **Dados:** nenhum campo novo nos dados do usuário, então não precisa de schema novo. A data vem do catálogo, e o "preso" é calculado.
- **Mock antes:** o aviso, a seção de saves e o fluxo de mudar o local sem o HOME.

## Testes
- Backend:
  - `homeUntil` nas oito versões do Bank, e só nelas;
  - o formato ISO;
  - o `exportcatalog`.
- Frontend, com o relógio fixo antes e depois do corte:
  - `reachesHome`;
  - `huntableVersions` antes e depois;
  - uma forma só do 3DS sem jogo depois do corte;
  - o aviso com a contagem e sumindo (sem espécimes, ou depois do corte);
  - a seção de saves;
  - o fluxo de mudar o local sem o HOME;
  - a nota na caçada em andamento;
  - o catálogo antigo sem `homeUntil`, que mantém o comportamento de hoje.
- As telas em `compactSize` e `expandedSize`.
