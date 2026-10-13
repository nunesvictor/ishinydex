# Gerenciar arquivos de save (ideia no pool)

Issue: [frontend#225](https://github.com/nunesvictor/ishinydex-frontend/issues/225). Sem versão; ver [backlog](../backlog.md). Análise de viabilidade de 2026-10-13, para conversar antes de planejar.

## A ideia
O app lê arquivos de save, os do Virtual Console (RBY/GSC) e os backups do Checkpoint (3DS: XY, ORAS, SM, USUM), e mostra a party e as boxes. Com isso, o usuário confere e atualiza os espécimes sem digitar e acha no save o shiny de uma caçada.

O motivo: o usuário continua jogando e caçando em jogos que não chegam (ou deixam de chegar) ao HOME. Saves e caçadas não dependem do HOME; ver [fechamento-do-bank.md](fechamento-do-bank.md).

## Por que é viável
- **Os arquivos chegam abertos:**
  - o backup do Checkpoint no 3DS (o arquivo `main`) já sai descriptografado, porque o Checkpoint lê pelo próprio sistema do console;
  - o save do Virtual Console é a SRAM crua, 32 KB.
- **Os formatos são públicos:** a Bulbapedia e o Project Pokémon descrevem boxes, party e a estrutura de cada Pokémon de todas as gerações.
- **O app já tem a base:** o seletor de arquivos do importar/exportar (`file_picker`, no iPhone e no PC) e a regra de rodar tudo no aparelho, sem servidor. Ler 0,5 MB em Dart é instantâneo.
- **Só leitura:** sem gravar no save, não é preciso refazer checksums, e não há risco de corromper o jogo.

## Dificuldades por parte

| Parte | O que envolve | Dificuldade |
|---|---|---|
| **Gen VI e VII** (XY, ORAS, SM, USUM), Checkpoint | Offsets das boxes e da party em cada jogo. Cada Pokémon tem 232 bytes, **criptografados** (XOR com uma sequência derivada da *encryption constant* e blocos embaralhados), um algoritmo conhecido. Depois: shiny pelo PID e pelo TID/SID, espécie, forma, OT, bola, idioma, natureza, habilidade e golpes. | Média. É o núcleo, e o mesmo leitor serve aos 4 jogos. |
| **Virtual Console** (RBY e GSC) | Estrutura simples (33 e 32 bytes, sem criptografia), com pegadinhas: a Gen I usa um **índice interno de espécies**, que não é o da dex; os saves japoneses têm layout diferente dos internacionais; Gold/Silver e Crystal diferem; o shiny vem dos **DVs**. | Média, pelas variações. |
| **Formas e ids** | Converter "espécie + índice de forma" do jogo na **forma do catálogo** (Alola, os padrões do Vivillon, os bonés do Pikachu…). Os ids de golpe, item e habilidade vêm da PokéAPI, que o backend já usa. | Média. Curadoria no backend, como as outras. |
| **Casar com o que já está cadastrado** | O espécime não guarda PID nem encryption constant, então não há como ter certeza de que o Pokémon do save é o do app. Dois caminhos: guardar esses ids (schema 4) ou casar por aproximação (espécie, OT, TID, shiny, apelido) com a confirmação do usuário. | Grande: é decisão de modelo de dados. |
| **Telas** | Importar o save; revisar o encontrado (novo, já cadastrado, diferente); criar ou atualizar em lote; o "Encontrei!" automático ao achar o shiny da caçada. Mock antes. | Média a grande. |
| **Testes** | Saves reais não vão para o repositório. A saída é um **gerador de saves sintéticos** nos testes (escrever os bytes e ler de volta), mais saves do usuário conferidos só na máquina dele. Os 100% de cobertura seguem valendo. | Média, mas é o que dá confiança. |

## Riscos e decisões antes do código
1. **Licença.** O PKHeX, a referência mais completa, é **GPL-3.0**. Copiar código dele obrigaria o app a ser GPL. A saída é reimplementar pela documentação (Bulbapedia e Project Pokémon) e usar o PKHeX só para conferir os resultados, abrindo o mesmo save nele. O frontend não tem `LICENSE` hoje, e vale decidir isso antes.
2. **Uso.** O backup fica no cartão SD do 3DS. O usuário precisa copiá-lo para o celular ou o PC (FTP, leitor de cartão) antes de importar. O app não resolve essa parte.
3. **Identidade do espécime.** A escolha entre guardar o PID/EC e casar por aproximação muda o formato dos dados. Vale decidir uma vez só.
4. **Os jogos do Switch ficam de fora no começo.** Os saves de SwSh, SV, LA e Z-A têm criptografia e estrutura próprias (blocos SCBlock), e o do BDSP é outro formato: é outro projeto. O FRLG do Switch precisa de pesquisa (o save pode ser o do GBA).

## Estimativa
A unidade é a v2.9.0 (odds das caçadas): uma sessão longa e 4 PRs.

| Fase | O que entrega | Tamanho | PRs |
|---|---|---|---|
| 0 · Pesquisa e plano | Offsets conferidos, as decisões de identidade e de licença, mock | pequeno | 1 (docs) |
| 1 · Gen VI e VII | Leitor do Checkpoint, formas no catálogo e a tela de revisão (criar e atualizar) | ≈ 1,5× a v2.9.0 | 3–4 (backend + frontend) |
| 2 · Virtual Console | RBY e GSC, shiny pelos DVs, as variações de layout | ≈ 0,7× | 2 |
| 3 · "Encontrei!" automático | Achar no save importado o shiny da caçada aberta | ≈ 0,3× | 1 |
| Switch (fora do escopo) | SCBlocks, um formato por jogo | ≥ 2× | — |

As fases 0 a 3 somam cerca de **2,5× a v2.9.0**, em 2 ou 3 versões minor. A fase 1 sozinha já entrega valor: cobre os 4 jogos do 3DS que o usuário segue jogando depois do Bank.

## Para a próxima conversa
- Recomendação: começar pela fase 0 depois da v2.10.0.
- Questões em aberto:
  - identidade do espécime (schema 4 ou aproximação);
  - a licença do app;
  - se a fase 1 cria espécimes ou só confere os já cadastrados;
  - em que ordem entram o Virtual Console e o Switch.
