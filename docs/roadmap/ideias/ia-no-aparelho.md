# Assistente de time com IA no aparelho (spike)

Issue: [frontend#418](https://github.com/nunesvictor/ishinydex-frontend/issues/418). Protótipo: [frontend#419](https://github.com/nunesvictor/ishinydex-frontend/pull/419), em rascunho e **sem merge**. Spike de 2026-11-22. **Ideia descartada no mesmo dia** (ver o fim da nota); fica só como registro. A meta do app nativo segue em [ishinydex#50](https://github.com/nunesvictor/ishinydex/issues/50).

## O que foi testado
Um modelo de linguagem roda no aparelho e conversa sobre o time:
- **Modelo:** Gemma 4 E2B, licença Apache 2.0.
- **Pacote:** [`flutter_edge_ai`](https://pub.dev/packages/flutter_edge_ai) + `flutter_edge_ai_litertlm`, ambos MIT.
- **Como o modelo usa o app:** não faz contas. Ele chama quatro ferramentas em Dart, que rodam a sinergia do #374: `analisar_time`, `sugerir_formas`, `sugerir_golpes` e `simular_troca`. Depois só explica o resultado.

Tudo ficou atrás de `--dart-define=AI_SPIKE=true`. Foram testados dois caminhos:
- **PWA:** `@litert-lm/core`, com WebGPU + WASM.
- **App nativo no iPhone:** o `.ipa` sem assinatura do workflow iOS, com os *entitlements* de memória gravados pelo `ldid`, instalado pelo iloader com Apple ID grátis.

## Números

| | iPhone, nativo | iPhone, Safari (PWA) | PC, Brave (web, GPU NVIDIA) |
|---|---|---|---|
| Download | 2,6 GB em 284 s | 2,0 GB, "demorou" | 2,0 GB em 101 s |
| Primeira carga | 19,5 s | não terminou: o chat não liberou | 1,7 a 3,8 s |
| Cargas seguintes | 0,6 a 1,1 s | — | 1,7 s |
| Resposta | 1º token em 1,4 a 3,8 s; total de 3,9 a 8,2 s | — | total de 1,4 a 2,1 s |

- **Memória:** no nativo, o modelo carregou sem o app fechar, com a assinatura grátis.
- **Persistência:** o modelo sobreviveu à atualização do app instalada por cima.
- **Sem rede:** em modo avião, com o app fechado antes, o modelo carregou em 1,1 s e respondeu "Como está meu time?" (1º token em 3,8 s, total de 8,3 s). Depois do download, o assistente não depende de internet.
- **Chromium mais antigo:** no do Playwright (Chromium 129), a carga falhou com `subgroupMinSize` indefinido, um recurso novo do WebGPU que ele não tem.

## Qualidade das respostas
- **Sem a análise no contexto, o modelo não chamou a ferramenta.** Na web e no iPhone, ele pediu ao usuário a lista do time. Com a análise já nas instruções, passou a usar os números certos.
- **A chamada das ferramentas oscila:**
  - "Como está meu time?" chamou `analisar_time` na web.
  - "O que eu troco para melhorar a nota?" chamou `sugerir_formas` na web, mas no iPhone devolveu uma pergunta.
  - "sugira formas" chamou a ferramenta no iPhone.
  - Ele nunca chamou `simular_troca` sozinho, embora as instruções pedissem.
- **Os números saem certos, mas o sentido dos campos sai errado.** Com a resposta de `sugerir_formas` na mão, o modelo acertou os Pokémon, os pontos e os tipos, mas:
  - escreveu "se você tiver" para os três, que estavam marcados "(você tem)";
  - chamou de ganho de **ataque** o ganho na **nota**;
  - disse que o Pokémon "resiste", quando era o **time** que fechava a fraqueza.
- **Formato:** a resposta vem em Markdown, e a tela mostrou os asteriscos crus. Também escapou um termo em inglês ("Lack of Offense").

## Decisão
1. **Não entra no PWA.** No Safari do iPhone, o modelo baixou, mas o chat não liberou. São 2 GB de download para um recurso opcional, o WASM tem teto de 4 GB e o suporte web do pacote ainda é *early preview*. O usuário também achou que não vale no PWA.
2. **No app nativo, roda:** carrega em cerca de 1 s depois da primeira vez e responde em poucos segundos, até sem rede.
3. **Mesmo assim, descartada (usuário, 2026-11-22):** acrescentou pouco em funcionalidade para um download de 2,6 GB. As respostas repetem o que a tela de sinergia já mostra com as contas do app, e com menos precisão. Não há issue no backlog; reabrir só se surgir um uso que as telas não resolvem.
4. **Se um dia voltar, o desenho muda:**
   - **Perguntas comuns:** os botões de "Como está meu time?", "O que eu troco?" e "Que golpes?" rodam as ferramentas no app, sem esperar o modelo decidir.
   - **O que o modelo recebe:** frases prontas ("a nota sobe 28; fecha a fraqueza do time a Electric; você tem"), e não JSON para interpretar. Ele só costura o texto.
   - **Pergunta livre:** só ela deixa o modelo escolher a ferramenta. O pior caso é uma resposta genérica, nunca um número inventado.
   - **Formato:** renderizar o Markdown, ou pedir texto simples, e reforçar o pt-BR nas instruções.
   - **Abertura e memória:** a tela abre já carregando quando o modelo está no aparelho. Uma política de memória decide quanto tempo o modelo fica carregado depois de sair do assistente, porque ocupa uns 2 GB de RAM.

## O app nativo no iPhone (aprendido no caminho)
- **Fluidez:** o usuário achou "simplesmente incomparável" com a do PWA.
- **Instalação:** pelo iloader no Linux, com o `usbmuxd`. O importador de fotos do GNOME (`gvfsd-gphoto2`) segura o iPhone no USB e precisa ser encerrado antes.
- **SideStore:** o login dentro do app está quebrado desde 2026-11-21. A Apple responde HTTP 401 ("PTM/TK endpoint"), e o mesmo erro aparece em outras ferramentas; ver [SideStore#1755](https://github.com/SideStore/SideStore/issues/1755). Enquanto isso, a instalação e a renovação de 7 dias passam pelo iloader no PC.
- **Sync:** o Dropbox não funciona no nativo. O build não recebe a `DROPBOX_APP_KEY`, e o login do Dropbox só sabe voltar para uma página web. Os dados foram por Exportar e Importar.
- **Próximo passo, se o nativo seguir:** conta de desenvolvedor + TestFlight, para atualizar junto com cada tag do PWA, que continua sempre primeiro.
