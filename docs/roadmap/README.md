# Roadmap

Um plano por versão, com os itens do lote, as issues e a ordem de execução. As mudanças acumulam na `main` e saem juntas na release da versão; hotfix sai à parte (ver "Fluxo" no `CLAUDE.md`). O plano pode mudar até a implementação começar.

As ideias ainda sem versão ficam no [backlog](backlog.md), de onde escolhemos os itens de cada versão.

**Mocks** (desde a v2.17.0, decidido em 2026-10-25):
- **Um canvas por versão**, com uma página por issue e uma página de índice com o status de cada item. O plano da versão e cada issue apontam para ele.
- **O canvas antigo** guarda os mocks da v2.0.0 à v2.17.0 e fica como arquivo: https://claude.ai/artifact/R6eiYXXmrXtvS2PrTJYZVo. Ele bateu no limite de 40 páginas por canvas.
- **Telas do app** (montado em 2026-10-25, na v2.17.0; atualizado para a v2.18.0): https://claude.ai/artifact/Vi9vv7fxZmVqVJPyevFvpk.
  - São capturas do app real: o build da versão publicada num navegador do tamanho do iPhone (402×812), com os dados do backup do usuário.
  - Atualizado ao fechar cada versão com `tool/screens/capture.sh <backup.json> <saída>` (fora do repositório, porque tem dados reais). As cenas ficam em `tool/screens/plan.json`; uma tela nova no canvas também entra lá.
  - Uma página por área (PersonalDex, Caçadas, Espécimes, Ajustes, Compartilhar), cada tela com as variações lado a lado: normal, escuro, inglês, vazio e, nas longas, a tela inteira.
  - Uma página "Fluxos" no fim, com os quatro fluxos principais.
- **Prints do README** (#251): `tool/screens/showcase.sh` gera um arquivo de vitrine com dados inventados (pelo `frontend/tool/showcase`, sobre o catálogo de `catalog.version`), captura as cenas `readme-*` e põe em `docs/screenshots/` os cartões recortados e a imagem de abertura (`showcase_images.py`). Sem dado real, as imagens ficam no repositório; refazer quando uma tela do README mudar.
  - Os mocks novos partem dele, e ele é atualizado no fechamento de cada versão.

| Versão | Status | Plano |
| --- | --- | --- |
| v2.27.2 | lançado em 2026-11-27 (a Pokébola do sprite que não carregou também aparece nas casas registradas), confirmado no iPhone | [v2.27.2.md](v2.27.2.md) |
| v2.27.1 | lançado em 2026-11-27 (sprites do app nativo que falharam sem internet tentam de novo; Pokébola enquanto carregam), confirmado no iPhone | [v2.27.1.md](v2.27.1.md) |
| v2.27.0 | lançado em 2026-11-27 (app nativo: o catálogo guardado no aparelho para abrir sem internet, o Compartilhar do card, os links externos e o pré-carregamento das boxes vizinhas mais rápido); compartilhar e links confirmados no iPhone | [v2.27.0.md](v2.27.0.md) |
| v2.26.0 | lançado em 2026-11-27 (os sprites guardados no aparelho, no app nativo), aguardando o teste no iPhone | [v2.26.0.md](v2.26.0.md) |
| v2.25.1 | lançado em 2026-11-23 (a abertura do app nativo nas cores do app, sem a tela branca), aguardando o teste no iPhone | [v2.25.1.md](v2.25.1.md) |
| v2.25.0 | lançado em 2026-11-22 (o `.ipa` do app nativo em cada release e o Dropbox no nativo, colando o código do login), aguardando o teste no iPhone | [v2.25.0.md](v2.25.0.md) |
| v2.24.0 | lançado em 2026-11-20 (o formulário de espécime: gênero da forma com ♂/♀, busca no celular, efeito da natureza e o idioma do save; schema 8), já no Flutter 3.50.1 e com a v2.23.0 dentro, aguardando o teste no iPhone | [v2.24.0.md](v2.24.0.md) |
| v2.23.0 | betas 1 a 3 (Flutter 3.50 e Dart 3.14: `material_ui`, Wasm no Safari e SafeArea); sem release final própria: saiu dentro da v2.24.0, já no 3.50.1 (2026-11-20) | [v2.23.0.md](v2.23.0.md) |
| v2.22.0 | lançado em 2026-11-10 (lista de espécimes mais rápida, gênero validado, slots vazios fora do arquivo, limpeza das exclusões e ações do cartão de caçada alinhadas; schema 7), aguardando o teste no iPhone | [v2.22.0.md](v2.22.0.md) |
| v2.21.1 | patch lançado em 2026-11-02 (a restauração dos dados à prova de conflito no sync, com o Ivy Cudgel e o jogo padrão da aba Golpes), aguardando o teste no iPhone | [v2.21.1.md](v2.21.1.md) |
| v2.21.0 | lançado em 2026-11-01 (comparar o shiny com o normal nas caçadas), aguardando o teste no iPhone | [v2.21.0.md](v2.21.0.md) |
| v2.20.0 | lançado em 2026-10-31 (team builder com o Z-A e a sinergia do time, itens seguráveis no catálogo e filtros da busca de golpes; catálogo `catalog-2026.10.31`), teste no iPhone encerrado em 2026-11-01 | [v2.20.0.md](v2.20.0.md) |
| v2.19.0 | lançado em 2026-10-30 (métodos de evolução, golpes da forma e busca de golpes; catálogo `catalog-2026.10.30`, com os golpes num arquivo à parte), teste no iPhone encerrado em 2026-11-01 | [v2.19.0.md](v2.19.0.md) |
| v2.18.0 | lançado e testado no iPhone em 2026-10-25 (saves: contagem do dex depois de mudar um lock, Meus saves sem repetição, o Pokémon GO como jogo e o alfa pela marca de origem), com o patch v2.18.1 em 2026-10-26 (a edição em lote diz quantos ficam sem alfa), testado no iPhone em 2026-10-29 | [v2.18.0.md](v2.18.0.md) |
| v2.17.0 | lançado em 2026-10-25 (natureza neutra, sem shiny alfa, símbolos como ícones, Shiny Charm no save e escolha do tema), com o patch v2.17.1 (shiny locks duplicados no sync) | [v2.17.0.md](v2.17.0.md) |
| v2.16.0 | lançado e testado em 2026-10-24 (natureza, shiny locked, card com nome longo e geração da forma) | [v2.16.0.md](v2.16.0.md) |
| v2.15.0 | lançado em 2026-10-22 (Caçadas) | [v2.15.0.md](v2.15.0.md) |
| v2.14.0 | lançado em 2026-10-20 (filtro do que fecha no HOME) | [v2.14.0.md](v2.14.0.md) |
| v2.13.0 | lançado em 2026-10-20 (dex pré-moldados, dex desatualizado e menu do ⋯; catálogo `catalog-2026.10.20`, com o padrão em 1.283 formas). O topo grafite foi testado nas betas 1 a 4 e desfeito | [v2.13.0.md](v2.13.0.md) |
| v2.12.0 | lançado em 2026-10-15 (visual e compartilhamento), com os patches v2.12.1 a v2.12.7 (o último em 2026-10-16) | [v2.12.0.md](v2.12.0.md) |
| v2.11.0 | lançado em 2026-10-14 (internacionalização) | [v2.11.0.md](v2.11.0.md) |
| v2.10.0 | lançado em 2026-10-13 | [v2.10.0.md](v2.10.0.md) |
| v2.9.0 | lançado em 2026-10-13 | [v2.9.0.md](v2.9.0.md) |
| v2.8.0 | lançado em 2026-10-13 | [v2.8.0.md](v2.8.0.md) |
| v2.7.0 | lançado em 2026-10-11 | [v2.7.0.md](v2.7.0.md) |
| v2.6.0 | lançado em 2026-10-09 | [v2.6.0.md](v2.6.0.md) |
| v2.5.0 | lançado em 2026-10-09 | [v2.5.0.md](v2.5.0.md) |
