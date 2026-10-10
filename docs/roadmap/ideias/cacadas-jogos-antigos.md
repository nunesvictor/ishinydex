# Caçadas em jogos da Gen VII e anteriores (ideia no pool)

Issues: [backend#107](https://github.com/nunesvictor/ishinydex-backend/issues/107) (jogos no catálogo), [frontend#186](https://github.com/nunesvictor/ishinydex-frontend/issues/186) (save só de ida) e [frontend#187](https://github.com/nunesvictor/ishinydex-frontend/issues/187) (marcas, nomes e ícones). Sem versão; ver [backlog](../backlog.md).

## O que o diagrama diz

O gráfico do r/PokemonHOME mostra que tudo da Gen VII para trás chega ao HOME por **um caminho só de ida**, que termina no **Pokémon Bank** (pago):

| Jogos | Caminho até o HOME | Marca de origem no HOME |
| --- | --- | --- |
| Sun, Moon, Ultra Sun, Ultra Moon | Bank → HOME | Alola (trevo) |
| X, Y, Omega Ruby, Alpha Sapphire | Bank → HOME | Kalos (pentágono) |
| Black, White, Black 2, White 2 | Poké Transporter → Bank → HOME | sem marca |
| Diamond, Pearl, Platinum, HeartGold, SoulSilver | Poké Transfer → Gen V → Transporter → Bank → HOME | sem marca |
| Ruby, Sapphire, Emerald, FireRed e LeafGreen (GBA) | Pal Park → Gen IV → … → HOME | sem marca |
| Red, Blue, Yellow, Gold, Silver, Crystal (Virtual Console do 3DS) | Poké Transporter → Bank → HOME | Game Boy |
| Cartuchos originais de Game Boy | **não chegam** (rota inacessível no gráfico) | — |

Isso é o mesmo caso do FRLG do Switch, que já está no app desde a v2.5.0: o Pokémon sai do jogo para o HOME e nunca volta. A ideia, então, é **estender o conceito "jogo ligado ao HOME só de ida"** (`HOME_ORIGIN_VERSIONS`) para esses jogos.

## Como o app funciona hoje (o que precisa mudar)

- **Backend:** `HOME_ORIGIN_VERSIONS` (`src/home/models.py:117`) decide quais grupos de jogos entram no catálogo com pokédex (`_pokedexes` em `src/catalog/build.py:294`). Hoje são os jogos que recebem do HOME e mais o FRLG.
- **Curadoria por jogo:** `version_exclusives.json`, `game_shiny_locks.json`, `regional_forms.json` e `special_encounters.json` só cobrem os jogos do Switch. O `shiny_methods.json` **já cobre** todos os jogos antigos (de `red` até `ultra-moon`), porque foi feito pensando no OT.
- **Frontend:** `Catalog.huntableVersions` (`lib/features/catalog/domain/catalog.dart:492`) já calcula as caçadas a partir das pokédex do catálogo. Então, com os dados no catálogo, a lista do que falta passa a reconhecer os jogos antigos quase sozinha.
- **O gargalo está nos saves.** Uma caçada em andamento escolhe um **save**, não um jogo (`ShinyHunt.save`), e o filtro "Jogo" da tela Caçadas só lista os jogos dos seus saves (`hunts_page.dart:213`). Só que save só existe para jogos que recebem do HOME (`Save.transferVersions`). Por isso, hoje já não dá para escolher o FRLG numa caçada nem no filtro, mesmo ele sendo caçável. É isso que este plano precisa resolver, e a correção vale também para o FRLG.

## Decisões

### 1. Como escolher um jogo antigo na caçada (decidido em 2026-10-10: save só de ida)
- **(Escolhido) Save só de ida.** Um save passa a poder ser de qualquer jogo ligado ao HOME, mas o save de um jogo só de ida não aparece como **destino** de transferência: dele, o Pokémon só vai para o HOME. A caçada, o filtro "Jogo" e o "Encontrei!" (que preenche o OT pelo save) funcionam sem mudança. O formato dos dados não muda, só a regra de criar o save (`createSave` no `fake_backend.dart:1868`) e a de destino (`transferCheck`).
- **(Descartado) Jogo na caçada, sem save.** A `ShinyHunt` ganha um campo `version`, e o filtro "Jogo" passa a listar também os jogos das caçadas. Mexe menos no conceito de save, mas o "Encontrei!" não sabe o OT, e o formato dos dados ganha um campo (as caçadas são do schema 2, então não exige schema 3).

A recomendação é o save só de ida porque ele reaproveita tudo que já existe (filtro, OT, métodos por jogo) e corrige o FRLG de graça.

### 2. FireRed e LeafGreen do GBA × do Switch
A PokéAPI tem uma versão `firered` só, e o app já a usa para o Switch (marca GBA). Pokédex, exclusivos e locks são os mesmos nas duas plataformas, então, **para caçar, os dois são o mesmo jogo**. A diferença é só a marca: o GBA original não tem marca no HOME. **Proposta:** manter uma versão só e não deduzir a marca pelo jogo nesse caso (a marca fica como a pessoa escolher no espécime). Fica anotado no plano.

### 3. Gen I no Virtual Console
Não existe shiny na Gen I. Pelo que sei, o Poké Transporter decide se o Pokémon vem shiny pelos DVs, com a mesma fórmula da Gen II, e por isso há quem cace no RBY do VC. **É uma inferência**, a conferir na Bulbapedia antes de entrar. Se não se confirmar, o RBY fica de fora.

### 4. O que fica de fora
Colosseum, XD, Pokémon Box, Ranch, Battle Revolution, Dream World e Dream Radar. São jogos de apoio com encontros fixos ou presentes, e a caçada de shiny neles não é o caso comum. Os cartuchos originais de Game Boy também ficam de fora, porque não chegam ao HOME.

## Fases (uma versão minor cada, ou um lote só)

A parte cara é a **curadoria por jogo**: exclusivos, locks, formas e encontros fora da pokédex regional. São cerca de 30 versões, contra as 2 do FRLG. Por isso a proposta é dividir por geração, na ordem do caminho até o HOME:

1. **Fase 1: base + Gen VII e VI** (SM, USUM, XY, ORAS)
   - Backend: os grupos de jogos em `HOME_ORIGIN_VERSIONS`; curadoria dos 4 grupos, incluindo encontros fora da pokédex regional (Ultra Wormholes, Mirage Spots, DexNav, SOS); release do catálogo.
   - Frontend: o save só de ida (decisão 1), que corrige também o FRLG; `OriginMark.fromVersion` para Kalos e Alola; nomes em `_versionLabels` (`lib/core/utils/format.dart`); ícones em `assets/game_icons/` + `assets/README.md`.
   - Mock antes: o save só de ida na tela de saves e no diálogo de destino (onde ele não aparece).
2. **Fase 2: Gen V e IV** (BW, B2W2, DPPt, HGSS). É só curadoria e ícones, sem marca.
3. **Fase 3: Gen III e Virtual Console** (RSE, FRLG do GBA, RBY e GSC do VC). Inclui a marca Game Boy no `fromVersion` e as decisões 2 e 3.

A fase 1 é a que mais pesa no frontend, e as fases 2 e 3 são quase só dados no backend.

## Issues
| Parte | Issue |
| --- | --- |
| Jogos no catálogo (entra primeiro) | [backend#107](https://github.com/nunesvictor/ishinydex-backend/issues/107) |
| Save só de ida | [frontend#186](https://github.com/nunesvictor/ishinydex-frontend/issues/186) |
| Marcas, nomes e ícones | [frontend#187](https://github.com/nunesvictor/ishinydex-frontend/issues/187) |

## Verificação
- Backend: testes dos JSON curados (ids, versões e formas válidos) e do `exportcatalog`, gerando as pokédex e os exclusivos dos jogos novos.
- Frontend: `flutter analyze`, `flutter test` e 100% de cobertura. Testes de: `huntableVersions` num jogo antigo (exclusivo, lock, forma regional que ainda não existia, como o Raichu de Alola fora da Gen VII); save só de ida criado e fora da lista de destinos; filtro "Jogo" com save de jogo antigo; "Encontrei!" preenchendo o OT do save antigo. Telas em `compactSize`/`expandedSize`.
