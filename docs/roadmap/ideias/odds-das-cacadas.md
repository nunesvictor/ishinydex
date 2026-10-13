# Odds das caçadas: curadoria (v2.9.0)

Issues: [backend#113](https://github.com/nunesvictor/ishinydex-backend/issues/113) (o `shiny_odds.json`), [frontend#220](https://github.com/nunesvictor/ishinydex-frontend/issues/220) (Charm no save) e [frontend#221](https://github.com/nunesvictor/ishinydex-frontend/issues/221) (odds na caçada). Plano: [v2.9.0](../v2.9.0.md).

As regras de cada par método × jogo de save, para revisão **antes** do código. Fonte principal: Bulbapedia, consultada em 2026-10-13. Onde ela não bastava, Serebii e Rotom Labs, conferidos com PokémonDB e IGN. As páginas usadas estão em [Fontes](#fontes), e as decisões tomadas na revisão, em [Decisões](#decisões).

## Como ler

- **Sorteios (*rolls*).** Cada encontro sorteia uma ou mais vezes, com chance de 1/base cada:
  - a base é 1/4096 a partir da Gen VI;
  - no FRLG, que é jogo da Gen III, a base é 1/8192.

  As odds são `1 − (1 − 1/base)^sorteios`. Referência para base 4096:

  | Sorteios | Odds | Sorteios | Odds | Sorteios | Odds |
  |---:|---:|---:|---:|---:|---:|
  | 1 | 1/4096 | 7 | 1/585,57 | 13 | 1/315,54 |
  | 2 | 1/2048,25 | 8 | 1/512,44 | 15 | 1/273,53 |
  | 3 | 1/1365,67 | 9 | 1/455,56 | 19 | 1/216,05 |
  | 4 | 1/1024,38 | 10 | 1/410,05 | 26 | 1/158,02 |
  | 5 | 1/819,60 | 11 | 1/372,82 | 32 | 1/128,49 |
  | 6 | 1/683,08 | 12 | 1/341,79 | 41 | 1/100,39 |

- **Nem tudo é sorteio.** Por isso a regra tem três tipos:
  - **sorteios:** a maioria;
  - **chance:** uma fração direta, fixa ou numa tabela (Poké Radar, Dynamax Adventures, Ultra Wormhole, Reide Tera);
  - **DexNav:** tem fórmula própria.
- **Charm** é o que o Shiny Charm do save soma. "Não vale" quer dizer que o jogo ignora o Charm naquela situação.
- **Formas travadas** (`game_shiny_locks.json`) não têm odds: a caçada mostra "não pode ser shiny", como o app já faz.
- **Horas:** só as odds, sem probabilidade acumulada (decisão da v2.9.0).

## Regras por jogo

### X / Y

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1 | +2 |
| Soft reset | sorteios | 1 | +2 |
| Ovos | sorteios | 1 | +2 |
| Masuda | sorteios | 6 | +2 (8) |
| Encontro em horda | sorteios | 5 por horda (cada um dos 5 sorteia 1) | +2 por Pokémon (15 por horda) |
| Safári dos Amigos | sorteios | 5 | +2 (7) |
| Pesca em cadeia | sorteios + cadeia | `1 + 2 × cadeia`, até 41 com cadeia ≥ 20 | +2 (43 → 1/95,75) |
| Poké Radar | chance + cadeia | ver abaixo | não vale na moita da cadeia |

**Poké Radar (XY):**
- Com a cadeia em 1 ou mais, a moita da cadeia só é shiny se brilhar. A chance é `1/(8100 − 200 × cadeia)`, até 1/100 com a cadeia ≥ 40. Na prática:
  - cadeia 1: 1/7900;
  - cadeia 20: 1/4100;
  - cadeia 30: 1/2100;
  - cadeia 40+: 1/100.
- Com a cadeia em 0, vale o encontro normal: 1/4096, ou 3 sorteios com o Charm.
- A música alternativa ("Poké Radar Chain!") deixa a chance em 1/100 enquanto toca. Ela é rara e passageira, então fica de fora: não vira modificador.
- Até a cadeia ~20, a moita da cadeia tem odds **piores** que um encontro normal. O cálculo mostra isso como é.

### Omega Ruby / Alpha Sapphire

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1 | +2 |
| Soft reset | sorteios | 1 | +2 |
| Ovos | sorteios | 1 | +2 |
| Masuda | sorteios | 6 | +2 (8) |
| Encontro em horda | sorteios | 5 por horda | +2 por Pokémon (15) |
| Pesca em cadeia | sorteios + cadeia | como no XY | +2 |
| DexNav | DexNav | ver abaixo | +2 checagens e +2 sorteios |

**Pesca em cadeia no ORAS.** A Bulbapedia descreve a pesca em cadeia na Gen VI inteira, mas o `shiny_methods.json` só tem o método para `x` e `y`. **Decisão:** incluir `omega-ruby` e `alpha-sapphire` no método (backend#113).

**DexNav (Pokémon escondido):**
- **Chance forçada (*p*):** sai do Search Level (*L*). O valor-base cresce 6 por nível até o 100, 2 por nível do 101 ao 200 e 1 por nível acima disso. *p* = ⌈base/100⌉ / 10000.
- **Checagens:** 1 por encontro, mais:
  - +2 com o Charm;
  - +4 com o *boost* (todo 5º encontro da cadeia, ou 4% de chance nos outros);
  - +5 no 50º encontro;
  - +10 no 100º.
- **Odds do encontro:** `1 − (1 − p)^checagens × (1 − 1/4096)^(1 ou 3 com Charm)`, porque o shiny normal continua valendo.
  - Nos encontros que não são múltiplos de 5, o boost de 4% entra pela média: `0,96 × sem boost + 0,04 × com boost`.

Exemplos, como 1/x:

| Search Level | Encontro comum | 5º, 10º… | 50º | 100º | Comum c/ Charm | 100º c/ Charm |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 4096 | 4096 | 4096 | 4096 | 1366 | 1366 |
| 50 | 1689 | 574 | 309 | 211 | 596 | 172 |
| 100 | 1064 | 309 | 161 | 109 | 381 | 92 |
| 200 | 853 | 236 | 122 | 82 | 307 | 70 |
| 999 | 476 | 122 | 62 | 42 | 173 | 36 |

- O Search Level é a quantidade de vezes que a espécie foi vista, e sobe 1 a cada encontro. **Decisão:**
  - o usuário informa o nível ao começar;
  - cada +1 da caçada soma 1 ao nível;
  - o −1 desfaz;
  - o nível continua editável.

  Isso ajusta a decisão 4 (contadores "atualizados quando o usuário quiser"), porque aqui o jogo sobe sozinho a cada encontro.

### Sun / Moon e Ultra Sun / Ultra Moon

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1 | +2 |
| Soft reset | sorteios | 1 | +2 |
| Ovos | sorteios | 1 | +2 |
| Masuda | sorteios | 6 | +2 (8) |
| Corrente SOS | sorteios + cadeia | 0–10: 1 · 11–20: 5 · 21–30: 9 · 31+: 13 | +2 (31+: 15 → 1/273,53) |
| Ultra Wormhole (só USUM) | chance | ver abaixo | não muda a tabela; lendários e UBs +2 |

- **SOS no Sun/Moon:** a cadeia volta a 0 depois de 255 (estouro de 8 bits). No app, o +1 que passa de 255 zera a cadeia atual sozinho, mas só no SM. No USUM não há limite.
- **Ultra Wormhole (USUM):** a chance vem dos anéis do buraco e da distância. Os modificadores são "Anéis" (0, 1 ou 2) e "Distância" (faixas de 500 anos-luz).

  | Distância (anos-luz) | 0 anéis | 1 anel | 2 anéis |
  |---|---:|---:|---:|
  | 0–999 | 1% | — | — |
  | 1000–1499 | 1% | 2% | 3% |
  | 1500–1999 | 1% | 3% | 5% |
  | 2000–2499 | 1% | 4% | 7% |
  | 2500–2999 | 1% | 5% | 9% |
  | 3000–3499 | 1% | 6% | 11% |
  | 3500–3999 | 1% | 7% | 13% |
  | 4000–4499 | 1% | 8% | 15% |
  | 4500–4999 | 1% | 9% | 17% |
  | 5000+ | 1% | 10% | 19% |

  - O buraco de 3 anéis (16% a 36%) traz sempre lendário, que não tem a chance aumentada.
  - Lendários e Ultra Beasts usam a chance normal de encontro estático: 1 sorteio, +2 com o Charm (1/1365,67) (Rotom Labs).
  - Nenhuma fonte diz que o Charm muda a tabela dos outros Pokémon. A Serebii e o guia da Rotom Labs não citam o Charm, e a resposta do PokémonDB que fala em "metade sem o Charm" é uma estimativa do autor, sem fonte. **Decisão:** a tabela vale como está, e o cartão mostra "o Charm não muda essa chance".

### Let's Go, Pikachu! / Eevee!

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1; Lure +1 | +2 |
| Soft reset | sorteios | 1 | +2 (aves lendárias, Mewtwo, Snorlax) |
| Combo de captura | sorteios + cadeia | combo 0–10: 1 · 11–20: 4 · 21–30: 8 · 31+: 12; Lure +1 | +2 (31+ com Lure: 15 → 1/273,53) |

- O **Lure** é um modificador sim/não.
- O bônus do combo só vale para o **próximo** Pokémon da espécie da cadeia. O app conta os encontros da espécie, que é o caso normal da caçada.
- **Estáticos:** o Charm vale, mas Lure e combo não (Rotom Labs: "Only the Shiny Charm gives a boost", 1/1365,67). Smogon e Dexerto falam do Mewtwo do mesmo jeito.
- Trocas e presentes não recebem nenhum bônus (Serebii). Eles caem em "Soft reset" e só têm odds se a forma não for travada.

### Sword / Shield

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1; com aura, + bônus pelos derrotados | +2 |
| Soft reset | sorteios | 1 | +2, **menos as exceções abaixo** |
| Ovos | sorteios | 1 | **+1** (2: bug da Gen VIII) |
| Masuda | sorteios | 6 | +2 (8) |
| Reide Dynamax | sorteios | 1 | não vale |
| Dynamax Adventures | chance | 1/300 por Pokémon | 1/100 |

- **Derrotados da espécie** (o "Number Battled" da Pokédex) só valem para Pokémon **com aura** (*Brilliant*). Os sorteios a mais:

  | Derrotados | 1–49 | 50–99 | 100–199 | 200–299 | 300–499 | 500+ |
  |---|---:|---:|---:|---:|---:|---:|
  | Sorteios a mais | +1 | +2 | +3 | +4 | +5 | +6 |
  | Odds (sem / com Charm) | 1/2048 · 1/1024 | 1/1366 · 1/820 | 1/1024 · 1/683 | 1/820 · 1/586 | 1/683 · 1/512 | 1/586 · 1/456 |

  A aura aparece em 1,5% a 3% dos encontros, conforme os derrotados. Ver [Decisões](#decisões), item 1.
- **Ovos:**
  - Com o Charm e sem Masuda, o bug pula o sorteio inicial: são 2 sorteios (1/2048), não 3.
  - Com Masuda, ficam 6 sorteios; com Masuda e Charm, 8.
- **Onde o Charm não vale no SwSh**, para o "não vale" aparecer no cartão:
  - os lendários gigantes: Regirock, Regice, Registeel, Regigigas, Regieleki e **Regidrago**;
  - os fósseis revividos (Dracozolt, Arctozolt, Dracovish e Arctovish);
  - as tocas (Reide Dynamax);
  - os encontros do curry;
  - o estádio de Motostoke;
  - encontros roteirizados, como o Impidimp de Glimwood Tangle.

  No catálogo, entram como formas de exceção no Soft reset do SwSh, com a fonte.
- Os Pokémon "muito fortes" para as insígnias não podem ser shiny, exceto os encontros estáticos. O app não sabe as insígnias, então isso fica só como nota.

### Brilliant Diamond / Shining Pearl

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1 | **não vale** (no BDSP o Charm só vale para ovos) |
| Soft reset | sorteios | 1 | não vale |
| Ovos | sorteios | 1 | **+1** (2, o mesmo bug do SwSh) |
| Masuda | sorteios | 6 | +2 (8) |
| Poké Radar | chance + cadeia | tabela abaixo | não vale |
| Grande Subterrâneo | sorteios | 1; "algo bom vai acontecer" (Diglett) +1 | não vale |

- **Fontes do BDSP:**
  - A Rotom Labs, com dados do Anubis, dá os sorteios: ovos 1 → 2 com o Charm (1/2048,25), Masuda 6, Masuda e Charm 8, e Diglett 2 com ou sem Charm.
  - A Serebii confirma o Masuda (1/682,7 e 1/512) e que o Charm não vale em encontros selvagens.
  - Todo encontro estático do BDSP fica em 1/4096, com ou sem Charm.
  - A tabela-resumo da Rotom Labs diz que o Charm "afeta o bônus do Diglett", mas a página do BDSP, mais detalhada, mostra 2 sorteios com e sem o Charm. Vale a página detalhada, que bate com a Bulbapedia.

**Poké Radar (BDSP)**, a chance por moita (1/x):

| Cadeia | 1/x | Cadeia | 1/x | Cadeia | 1/x | Cadeia | 1/x |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 4096 | 10 | 2521 | 20 | 1820 | 30 | 1310 |
| 1 | 3855 | 11 | 2427 | 21 | 1771 | 31 | 1285 |
| 2 | 3640 | 12 | 2341 | 22 | 1724 | 32 | 1260 |
| 3 | 3449 | 13 | 2259 | 23 | 1680 | 33 | 1236 |
| 4 | 3277 | 14 | 2185 | 24 | 1638 | 34 | 1213 |
| 5 | 3121 | 15 | 2114 | 25 | 1598 | 35 | 1192 |
| 6 | 2979 | 16 | 2048 | 26 | 1560 | 36 | 993 |
| 7 | 2849 | 17 | 1986 | 27 | 1524 | 37 | 799 |
| 8 | 2731 | 18 | 1927 | 28 | 1489 | 38 | 400 |
| 9 | 2621 | 19 | 1872 | 29 | 1456 | 39 | 200 |
| | | | | | | 40+ | 99 |

### Legends: Arceus

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1 + pesquisa | **+3** |
| Soft reset | sorteios | 1 + pesquisa | +3 |
| Surto em massa | sorteios | surto +25 ou surto massivo +12, + pesquisa | +3 |

- **Pesquisa da espécie:** um modificador com três opções: abaixo de 10 (+0), nível 10 (+1) e perfeita (+3).
- **Tipo de surto:** um modificador com duas opções, surto (+25) e surto massivo (+12).
- Exemplo: surto com pesquisa perfeita e Charm dá 1 + 25 + 3 + 3 = 32 sorteios, 1/128,49.
- Lendários, míticos e presentes são travados (`game_shiny_locks.json`).

### Scarlet / Violet

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1; Sparkling Power +1/+2/+3 | +2 |
| Surto em massa | sorteios | 1; derrotados 30–59 +1, 60+ +2; Sparkling Power +1/+2/+3 | +2 |
| Sparkling Power (sanduíche) | sorteios | como o Encontro aleatório, com o nível obrigatório (1 a 3) e os derrotados se for num surto | +2 |
| Soft reset | sorteios | 1 | **não vale** (estáticos e *wanderers*) |
| Ovos | sorteios | 1 | **+1** (2: o mesmo bug da Gen VIII) |
| Masuda | sorteios | 6 | +2 (8) |
| Reide Tera | chance | 1/4103,05 (semente de 32 bits) | não vale |

- O máximo é 1 + 2 (surto 60+) + 3 (Sparkling 3) + 2 (Charm) = 8 sorteios, 1/512,44, como na tabela da Bulbapedia.
- Nos ovos, o Sparkling Power não vale.
- No caso de Pokémon Tera selvagem, *wanderers* e Area Zero Underdepths, nem o Charm nem o Sparkling Power valem. Pelo método, eles caem em "Soft reset".
- Os eventos de surto da Poké Portal News com bônus fixo de 0,5% ficam de fora: são temporários.

### Legends: Z-A

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1; Sparkling Power +1/+2/+3 **só no Hiperespaço** | **+3** |
| Soft reset | sorteios | 1 | **não vale** (fósseis) |

- **Sparkling Power do donut (DLC Mega Dimension):** vale só no Hyperspace Lumiose e só para o tipo do poder.
  - **Decisão:** um modificador "Sparkling Power (Hiperespaço)" com os níveis 0 a 3. Os sorteios conferem com a Serebii e a Rotom Labs; com o Charm, o máximo é 7 sorteios, 1/585,57.
  - **Nível 3:** o primeiro Pokémon do tipo que aparece perto do jogador ao entrar no Hiperespaço é shiny garantido (Serebii, Rotom Labs). Isso é um evento por entrada, não uma chance por encontro, então o cartão só mostra uma nota: "no nível 3, o primeiro do tipo é garantido".
  - O app não confere o tipo: o modificador só aparece, e só deve ser marcado, quando o usuário está no Hiperespaço com o poder do tipo do alvo.
- **Soft reset no Z-A:** os estáticos são travados, menos os fósseis e os 5 lendários do scan (Latias, Latios, Cobalion, Terrakion e Virizion).
  - Nos fósseis o Charm não vale (Rotom Labs, Dexerto, PokéJungle).
  - Os lendários do scan aparecem no Hiperespaço e seguem o Encontro aleatório, com o Sparkling Power do tipo (Serebii).
- Todo encontro selvagem segue essa regra, Alphas incluídos (Rotom Labs). Nada mais é somado.

### FireRed / LeafGreen (Switch)

| Método | Tipo | Regra | Charm |
|---|---|---|---|
| Encontro aleatório | sorteios | 1 (base **1/8192**) | não existe |
| Soft reset | sorteios | 1 (1/8192) | não existe |
| Ovos | sorteios | 1 (1/8192) | não existe |

- É o jogo do GBA relançado, sem mudanças de mecânica. A Gen III não tem Charm nem Masuda.
- No form do save, o "Tenho o Shiny Charm" não aparece para FRLG.

## Formato no catálogo (proposta para o backend#113)

```json
{
  "method": "sos",
  "versions": ["sun", "moon"],
  "kind": "rolls",
  "base": 4096,
  "rolls": 1,
  "charm": 2,
  "chain": { "steps": [[0, 0], [11, 4], [21, 8], [31, 12]], "resetAfter": 255 },
  "modifiers": [],
  "charmExceptForms": [],
  "sources": ["https://bulbapedia.bulbagarden.net/wiki/Shiny_Pok%C3%A9mon"]
}
```

- **`kind`:** `rolls`, `chance` ou `dexnav`.
  - Em `chance`, as entradas trazem a fração: `chance` fixa, `chain.steps` com `[cadeia, 1/x]`, ou a fórmula do Radar do XY como tabela gerada até 40.
  - Fica tudo em tabela para o app ter um cálculo só.
- **`charm`:** os sorteios que o Charm soma. `null` quando não vale. Em `chance`, traz a fração com o Charm.
- **`charmExceptForms`:** as formas em que o Charm não vale, como os gigantes no Soft reset do SwSh.
- **`modifiers`:** `[{id, label, options: [{label, rolls}]}]`, por exemplo a pesquisa do LA, o tipo de surto, o Sparkling Power, o Lure e a aura com os derrotados. A primeira opção é o padrão.
- **`chain.steps`:** a partir de qual cadeia vale cada bônus. `resetAfter` só existe no SOS do SM.
- **Ovos com o bug:** basta o `charm` valer 1 em `eggs` no SwSh e no SV. O Masuda tem entrada própria (`rolls: 6, charm: 2`).
- **Teste do backend:** todo par método × jogo de save tem uma entrada, e nenhum fica sem regra.

## Decisões

Revisão do usuário (2026-10-13): todas as recomendações foram aceitas. Os pontos sem fonte foram pesquisados em outras fontes.

1. **Aura no SwSh:** na caçada por Encontro aleatório no SwSh, um interruptor "Conto só os com aura".
   - Ligado, as odds usam os derrotados.
   - Desligado, fica 1 sorteio (+2 com o Charm), e o modificador dos derrotados some.
2. **Poké Radar:** o +1 conta encontros da cadeia, e as odds mostradas são as da moita (1/100 no XY, 1/99 no BDSP na cadeia 40+).
3. **Search Level do DexNav:** sobe com o +1, desce com o −1 e continua editável.
4. **Pontos que estavam sem fonte**, resolvidos com Serebii e Rotom Labs:
   - Ultra Wormhole: a tabela não muda com o Charm; lendários e UBs têm +2.
   - LGPE: o Charm vale nos estáticos.
   - Z-A: o Soft reset é dos fósseis, sem Charm.
   - BDSP: ovos como no SwSh.

   Nenhuma regra ficou "a confirmar".
5. **Pesca em cadeia no ORAS:** entra no `shiny_methods.json`.

## Fontes

Bulbapedia, wikitexto consultado em 2026-10-13:
- [Shiny Pokémon](https://bulbapedia.bulbagarden.net/wiki/Shiny_Pok%C3%A9mon): tabela-resumo, SOS, Ultra Wormhole, LGPE, SwSh, LA e SV.
- [Shiny Charm](https://bulbapedia.bulbagarden.net/wiki/Shiny_Charm): onde não vale no SwSh, SV e BDSP; +3 no LA e no Z-A; ovos na Gen VIII.
- [Masuda method](https://bulbapedia.bulbagarden.net/wiki/Masuda_method): sorteios por geração e o bug dos ovos.
- [Poké Radar](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Radar): fórmula do XY e tabela do BDSP.
- [Fishing](https://bulbapedia.bulbagarden.net/wiki/Fishing): pesca em cadeia na Gen VI.
- [DexNav](https://bulbapedia.bulbagarden.net/wiki/DexNav): checagens e Search Level.
- [Brilliant Pokémon](https://bulbapedia.bulbagarden.net/wiki/Brilliant_Pok%C3%A9mon): derrotados e aura.
- [Catch Combo](https://bulbapedia.bulbagarden.net/wiki/Catch_Combo): combo do LGPE.
- [Donut](https://bulbapedia.bulbagarden.net/wiki/Donut): Sparkling Power no Z-A.
- [Pokémon FireRed and LeafGreen Versions](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_FireRed_and_LeafGreen_Versions): o relançamento no Switch.

Outras fontes, consultadas em 2026-10-13:
- Serebii:
  - [Shiny Pokémon no BDSP](https://www.serebii.net/brilliantdiamondshiningpearl/shinypokemon.shtml);
  - [no LGPE](https://www.serebii.net/letsgopikachueevee/shinypokemon.shtml);
  - [no Z-A](https://www.serebii.net/legendsz-a/shinypokemon.shtml);
  - [Ultra Wormholes](https://www.serebii.net/ultrasunultramoon/ultrawormholes.shtml).
- Rotom Labs:
  - [taxas por jogo](https://rotomlabs.net/shiny-rates);
  - [BDSP](https://rotomlabs.net/brilliant-diamond-shining-pearl/shiny-rates);
  - [Z-A](https://rotomlabs.net/legends-z-a/shiny-rates);
  - [Ultra Wormhole](https://rotomlabs.net/guide/ultra-wormhole-shiny-hunting).
- [PokémonDB, chance no Ultra Wormhole](https://pokemondb.net/pokebase/295854/shiny-chance-in-the-ultra-wormhole): estimativa sem fonte, não usada.
- [Smogon, guia de shiny do LGPE](https://www.smogon.com/ingame/guides/lgpe_shiny_hunt) e [Dexerto, odds do Z-A](https://www.dexerto.com/wikis/pokemon-legends-z-a/shiny-odds-pokemon-legends-z-a).
- IGN: a busca não achou página da IGN com esses números.
