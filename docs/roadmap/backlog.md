# Backlog (pool de ideias)

Tudo que queremos fazer e ainda não tem versão. Cada item tem uma issue na milestone **Backlog** do repositório onde o trabalho começa. Ao planejar uma versão, escolhemos itens daqui: a issue vai para a milestone da versão, o item sai desta lista e entra no plano `vX.Y.Z.md`.

Ideia nova entra aqui primeiro, com uma issue curta (o quê e por quê). Mock, detalhes e estimativa ficam para quando ela for escolhida; ideia já planejada guarda o plano em `ideias/`.

## Interface
| Ideia | Issue | Notas |
| --- | --- | --- |
| Dex 100% personalizado (temáticos: gatos, lendários, um tipo…) | [frontend#248](https://github.com/nunesvictor/ishinydex-frontend/issues/248) | **Depois da v2.13.0 (#34, pré-moldados).** Começar vazio, filtros na criação (categoria, tipo, geração) e "Editar formas" num dex existente. Decidir no mock o que acontece com as boxes ao inserir ou remover no meio, e com o espécime de uma forma removida (volta ao inventário). Mock antes. |
| Escolher o tema: claro, escuro ou o do aparelho | [frontend#273](https://github.com/nunesvictor/ishinydex-frontend/issues/273) | Ajustes → Aparência, como o Idioma: Automático (padrão), Claro ou Escuro, só deste aparelho. O `index.html` lê a escolha no boot (fundo, splash e theme-color). Combina com os temas #244/#245: a mesma tela, depois com a paleta. Mock antes. |
| Topo do app com cor fixa nos dois temas | [frontend#290](https://github.com/nunesvictor/ishinydex-frontend/issues/290) | A barra de status do iPhone não troca de cor com o app aberto (bug do WebKit; três contornos falharam, o último na #286). Com o topo numa cor só, grafite a recomendação, o bug não aparece. A cor do topo entra na paleta, o que serve à #245. Mock antes (grafite × vermelho) e pré-release no iPhone. |
| Tema Pokébola (paleta A) | [frontend#244](https://github.com/nunesvictor/ishinydex-frontend/issues/244) | **Depois de #162** (identidade C como padrão na v2.12.0, com a paleta como dado). Vermelho como cor principal e amarelo nos destaques. Escolha de tema em Ajustes → Preferências, só deste aparelho (como o idioma); o theme-color acompanha no boot. Mock pronto no canvas. |
| Tema Logo (paleta B) | [frontend#245](https://github.com/nunesvictor/ishinydex-frontend/issues/245) | **Depois de #162.** Azul e amarelo da logo, barra superior amarela (pede cor própria da barra na paleta). Mesma escolha de tema da #244; quem sair primeiro leva a tela. Mock pronto no canvas. |
| Golpes com nomes em inglês | [frontend#36](https://github.com/nunesvictor/ishinydex-frontend/issues/36) | Pré-requisito do team builder (#231): golpes e aprendizado por forma e grupo de versões no catálogo (backend primeiro), mostrados na ficha da forma. |
| Team builder compatível com o jogo | [frontend#231](https://github.com/nunesvictor/ishinydex-frontend/issues/231) | **Depois de #36.** Times de até 6 válidos no jogo escolhido: formas, golpes, habilidade, natureza, EVs/IVs, item e Tera onde houver. Membro pode apontar para um espécime. Exporta no formato do Showdown. Registro novo `teams` (o schema sobe). Mock antes. |
| Idioma preferido no cadastro do dex | [frontend#210](https://github.com/nunesvictor/ishinydex-frontend/issues/210) | Filtrar o idioma fora do dex (novo motivo nas Caçadas) e preencher o idioma no cadastro. Campo novo nos dados: decidir sobre o schema antes. Mock antes. |

## Dados e catálogo
| Ideia | Issue | Notas |
| --- | --- | --- |
| PersonalDex com diferenças de gênero (Living Form) | [backend#120](https://github.com/nunesvictor/ishinydex-backend/issues/120) → [frontend#247](https://github.com/nunesvictor/ishinydex-frontend/issues/247) | **Depois da v2.13.0 (#34).** A quarta chave da planilha de referência: um slot por gênero nas espécies com diferença visual. O catálogo passa a exportar `has_gender_differences` (o backend entra primeiro), e o slot ganha gênero, com schema novo do arquivo. Mock antes. |
| Gerenciar arquivos de save (Virtual Console e backups do Checkpoint) | [frontend#225](https://github.com/nunesvictor/ishinydex-frontend/issues/225) | [Análise de viabilidade](ideias/arquivos-de-save.md): ≈ 2,5× a v2.9.0 em fases; decidir identidade do espécime e licença antes. Ler (só leitura, no aparelho) a party e as boxes dos arquivos de save, para conferir espécimes e preencher o "Encontrei!". Vale para jogos que não chegam ao HOME: saves e caçadas não dependem disso. |
| Histórico de transferências do espécime entre HOME e saves | [backend#65](https://github.com/nunesvictor/ishinydex-backend/issues/65) | Permitiria regras de "só ida" por espécime (ex.: FRLG). Inclui decidir a marca "Já visitou o Champions" depois da visita, como no HOME ([frontend#174](https://github.com/nunesvictor/ishinydex-frontend/issues/174)). |

## Plataforma e documentação
| Ideia | Issue | Notas |
| --- | --- | --- |
| Recarregar logo depois de uma versão nova abre a anterior no PC | [frontend#291](https://github.com/nunesvictor/ishinydex-frontend/issues/291) | O `networkFirst` do `sw.js` usa o cache HTTP de 10 min do Pages para o `flutter_bootstrap.js`. Correção de uma linha: `cache: 'no-cache'`. Bom para sair junto do próximo patch. |
| Releases com binários: Linux, Windows, Android e macOS | [#50](https://github.com/nunesvictor/ishinydex/issues/50) | Ligado à meta do app nativo. |
| Documentação técnica separada do README | [#49](https://github.com/nunesvictor/ishinydex/issues/49) | |
| Conferir os dados do app instalado depois de ~7 dias sem uso (iOS) | [#83](https://github.com/nunesvictor/ishinydex/issues/83) | Verificação manual, não é código. |
