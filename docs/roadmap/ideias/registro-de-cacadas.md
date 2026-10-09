# Registro de caçadas (ideia no pool)

Issues: [backend#103](https://github.com/nunesvictor/ishinydex-backend/issues/103) (métodos no catálogo), [frontend#163](https://github.com/nunesvictor/ishinydex-frontend/issues/163) (A: registro no espécime) e [frontend#164](https://github.com/nunesvictor/ishinydex-frontend/issues/164) (B: caçadas em andamento). Sem versão; ver [backlog](../backlog.md).

## Contexto
Hunts de shiny levam de horas a meses (soft resets, encontros aleatórios, Dynamax Adventures, surtos...). O usuário quer guardar, junto do espécime capturado, **como** saiu o shiny e **quanto custou**. O espécime já tem data do encontro (`capturedAt`) e OT, e o OT tem o jogo (`Trainer.version`). Faltam: método, contagem com unidade, data de início e link do post (ex.: r/shinypokemon).
Decisões do usuário: campos = método + contagem + data de início + URL do post; vai para o **pool (Backlog)**, não para a v2.5.0. Além do registro no espécime, é preciso acompanhar **caçadas em andamento**: começar a caçada de um Pokémon, interromper para outra e voltar sem perder os SRs já contados.
**Nomes:** "Registro da caçada" (no espécime) e "Em andamento" (caçadas abertas). A tela "Caçadas" (lista do que falta) continua com esse nome e ganha a lista das em andamento. No código, `ShinyHunt` (para não confundir com `HuntQuery`, que é a lista do que falta).

Duas partes, que podem sair em versões diferentes: **A** = registro no espécime (base) e **B** = caçadas em andamento (usa os campos da A ao terminar).

## A. Registro no espécime

### Modelo
- **Métodos no catálogo (backend):** lista curada `src/pokedex/data/shiny_methods.json`, no mesmo esquema dos `game_shiny_locks.json`: `{id, label, units: [...], versions: [...]}`.
  - `units`: as unidades aceitas, a primeira é o padrão (`resets`, `encounters`, `hours`, `runs`, `eggs`, `outbreaks`...). Ex.: encontro aleatório aceita encontros **ou** horas; Dynamax Adventures, runs; soft reset, resets.
  - `versions`: jogos onde o método existe (Dynamax Adventures só em `sword`/`shield`; surtos em massa em `legends-arceus`/`scarlet`/`violet`...). Curadoria por script a partir da Bulbapedia ("Shiny Pokémon", métodos por geração), como na v2.4.0, cobrindo todos os jogos que podem ser OT.
  - O `exportcatalog` publica `shinyMethods` no catálogo. A chave nova é aditiva: o `schemaVersion` do catálogo continua 1 (o app antigo ignora).
- **Campos no espécime (frontend):** `huntMethod` (id), `huntCount` (int), `huntUnit`, `huntStartedAt` (data), `huntPostUrl`. Todos opcionais, em `Specimen`, `SpecimenDraft` (`toRequestJson`/`toUpdateJson`/`fromSpecimen`) e nos `records` do `FakeBackend` (`lib/fake/fake_backend.dart`, bloco `'specimens'`).
- **Arquivo de dados:** `LocalStore.schemaVersion` 1 → 2 (`lib/features/local/data/local_store.dart`). Motivo: um app antigo (PWA ainda não atualizado em outro aparelho) leria o arquivo, descartaria os campos novos ao regravar e, pelo sync, apagaria o registro. Com o 2 ele recusa ("salvos por uma versão mais nova"). O app novo lê o 1 sem migração (campos ausentes = nulos).

### Regras
- A seção só aparece com **shiny** marcado.
- Métodos filtrados pelo jogo do OT (`originVersion`). Sem OT ou com jogo sem métodos curados, mostra todos. Vindo do GO, sem métodos.
- Trocar o OT para um jogo onde o método não existe: o método fica marcado como inválido no formulário (não apaga sozinho).
- `huntCount` > 0; `huntUnit` entre as do método; `huntStartedAt` ≤ `capturedAt`; URL `http(s)`. Validação no `FakeBackend` (como as outras, com mensagem por campo).

### Telas (mock no canvas antes, padrão do projeto)
- **Formulário** (`specimen_form_page.dart`): seção recolhível "Registro da caçada" depois da data do encontro: método (`ChoiceSelect`, `widgets/choice_select.dart`), contagem + unidade (segmentos com as unidades do método), data de início (reaproveitar `capture_date_field.dart`) e link.
- **Detalhe** (`specimen_detail.dart`, e o corpo unificado da #155 quando existir): linha "Soft reset · 4.213 resets · 3 meses" (duração = início → encontro) e botão para abrir o post.
- Fica para depois (não entra): filtro por método no inventário, estatísticas.

## B. Caçadas em andamento
- **Registro novo `shinyHunts`** no arquivo de dados (entra em `FakeBackend.recordTypes` depois de `saves`, antes de `specimens`): `{id, form, status: active|paused, version?, save?, method?, unit, count, accumulatedSeconds, runningSince?, startedAt?, observation?}`. Com o `updatedAt` por registro que o `LocalStore` já dá, o sync junta como os outros; dois aparelhos contando a mesma caçada ao mesmo tempo = vale a última gravação (aceitável, anotar).
- **Qualquer forma, quantas quiser:** vale para Pokémon que falta ou que já tenho (hunt de novo), e pode haver mais de uma caçada da mesma forma. Interromper é só ir para outra; todas ficam na lista e podem ser atualizadas a qualquer momento.
- **O que se edita:** contagem (+1, −1 ou digitar o número), unidade, método, jogo/save e observação, a qualquer momento. **Data de início:** opcional; vazia, pode ser preenchida a qualquer momento. Depois de informada, trocar pede confirmação: "A duração da caçada vai mudar".
- **Cronômetro** (unidade horas): `runningSince` guarda quando começou a contar, então sobrevive a fechar o app; parar soma em `accumulatedSeconds`. Começar o cronômetro de uma caçada para o de outra que esteja rodando.
- **Como termina** (só de dois jeitos):
  - **Captura:** "Encontrei!" abre o formulário de espécime já preenchido (forma, shiny, data de hoje, método, contagem, unidade, data de início e o OT do save, se houver). Ao salvar, a caçada some e os dados ficam no espécime. Se eu cadastrar direto um espécime shiny de uma forma que tem caçada aberta, o formulário pergunta se é o fim dela (e preenche os campos).
  - **Desistência:** vai para **Pausadas** (para o cronômetro). Dali, "Retomar" (volta para Em andamento, com a contagem preservada) ou "Excluir" (com confirmação). Excluir só existe nas pausadas.
  - **Retroativa:** registro de caçada feito direto no espécime (parte A) já nasce terminado; não passa por `shinyHunts`.
- **Telas:**
  - "Caçadas" ganha os segmentos "Faltam | Em andamento (n) | Pausadas (n)".
  - Começar: botão "Começar caçada" num item do que falta (já sabe a forma e, pelo filtro de jogo, o jogo/save), na ficha da forma/detalhe do espécime e na aba Em andamento (escolhe a forma com o `form_picker.dart`). Escolhe jogo/save, método e unidade (mesmo catálogo `shinyMethods`); data de início com hoje sugerido.
  - Cartão da caçada: sprite, método, duração (se houver início), contagem grande com **+1** (alvo de toque grande, mobile first), −1 e tocar no número para digitar; em horas, iniciar/parar o cronômetro. Menu: editar, "Encontrei!", desistir.
- **Indicação no slot da box:** o slot mostra um selo de "caçada em andamento" quando existe caçada **ativa** (as pausadas não contam) da mesma forma do slot e o slot ainda precisa dela: vazio (faltando) em qualquer dex, ou preenchido com um não shiny num dex shiny. Slot já resolvido (shiny no dex shiny, qualquer espécime no dex normal) não mostra nada. Tocar no selo (ou no detalhe do slot) leva ao cartão da caçada. O desenho do selo (canto do slot, sem esconder sprite nem os indicadores atuais) sai no mock; precisa ser legível no slot pequeno do iPhone.
- Mocks no canvas (Caçadas com os três segmentos, cartão no iPhone e no PC, começar caçada, pausadas, selo no slot da box) antes de implementar.

## Quando for implementar
- Ordem: backend (curadoria + release do catálogo no lote) → mocks → frontend A → frontend B.
- Custo: A médio (a curadoria dos métodos por jogo é a parte mais trabalhosa; o resto segue padrões que já existem). B médio/grande: registro novo, telas novas e o cronômetro.
- Versão: minor. O schema 2 do arquivo é compatível para frente (o novo lê o antigo).

## Verificação
- Backend: testes do `shiny_methods.json` (ids únicos, unidades e versões válidas) e do `exportcatalog`.
- Frontend: `flutter analyze`, `flutter test`, 100% de cobertura; testes de: filtro de métodos pelo OT, validações, ida e volta dos campos nos `records`, recusa do arquivo schema 2 num `LocalStore` que só lê o 1, leitura do arquivo 1 pelo app novo; B: +1/−1, aviso ao trocar a data de início, desistir → pausada → retomar/excluir, cadastro direto fechando a caçada aberta, selo no slot (vazio, não shiny em dex shiny, resolvido, caçada pausada), cronômetro com relógio falso (iniciar, fechar e reabrir, parar, só um rodando), "Encontrei!" preenchendo o formulário e apagando a caçada, ida e volta de `shinyHunts` nos `records` e no sync; telas em `compactSize`/`expandedSize`.
