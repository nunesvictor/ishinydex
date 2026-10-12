# Backlog (pool de ideias)

Tudo que queremos fazer e ainda não tem versão. Cada item tem uma issue na milestone **Backlog** do repositório onde o trabalho começa. Ao planejar uma versão, escolhemos itens daqui: a issue vai para a milestone da versão, o item sai desta lista e entra no plano `vX.Y.Z.md`.

Ideia nova entra aqui primeiro, com uma issue curta (o quê e por quê). Mock, detalhes e estimativa ficam para quando ela for escolhida; ideia já planejada guarda o plano em `ideias/`.

## Interface
| Ideia | Issue | Notas |
| --- | --- | --- |
| Identidade visual com as cores de Pokémon (pokébola e amarelo da logo) | [frontend#162](https://github.com/nunesvictor/ishinydex-frontend/issues/162) | Mock com 2 ou 3 paletas antes. Minor pelo SemVer; 3.0 só junto com uma quebra de compatibilidade. |
| Internacionalização da interface: en-US padrão e pt-BR completo | [backend#105](https://github.com/nunesvictor/ishinydex-backend/issues/105), [frontend#178](https://github.com/nunesvictor/ishinydex-frontend/issues/178), [#101](https://github.com/nunesvictor/ishinydex/issues/101) | [Plano](ideias/internacionalizacao.md). Backend → frontend. Docs, issues e PRs seguem em pt-BR. |
| Fluxo de PersonalDex personalizado | [frontend#34](https://github.com/nunesvictor/ishinydex-frontend/issues/34) | |
| Golpes com nomes em inglês | [frontend#36](https://github.com/nunesvictor/ishinydex-frontend/issues/36) | |
| Filtro por jogo no inventário de espécimes | [frontend#201](https://github.com/nunesvictor/ishinydex-frontend/issues/201) | Chip Jogo com duas seções: "Capturados em" (jogo do OT) e "Podem ir para" (na pokédex e sem bloqueio do HOME). Depois da correção da ordem dos jogos nas Caçadas. Mock antes. |

## Dados e catálogo
| Ideia | Issue | Notas |
| --- | --- | --- |
| Histórico de transferências do espécime entre HOME e saves | [backend#65](https://github.com/nunesvictor/ishinydex-backend/issues/65) | Permitiria regras de "só ida" por espécime (ex.: FRLG). Inclui decidir a marca "Já visitou o Champions" depois da visita, como no HOME ([frontend#174](https://github.com/nunesvictor/ishinydex-frontend/issues/174)). |
| Caçadas nos jogos da Gen V e IV (só de ida, pelo Bank) | [backend#111](https://github.com/nunesvictor/ishinydex-backend/issues/111), [frontend#199](https://github.com/nunesvictor/ishinydex-frontend/issues/199) | [Plano](ideias/cacadas-jogos-antigos.md), fase 2. Quase só curadoria e ícones; sem marca de origem. A fase 1 (VII e VI) saiu na [v2.7.0](v2.7.0.md). |
| Caçadas nos jogos da Gen III e do Virtual Console | [backend#112](https://github.com/nunesvictor/ishinydex-backend/issues/112), [frontend#200](https://github.com/nunesvictor/ishinydex-frontend/issues/200) | [Plano](ideias/cacadas-jogos-antigos.md), fase 3. Marca Game Boy no VC; FRLG do GBA com a marca escolhida; RBY só se o shiny pelo Transporter se confirmar. Mock antes. |

## Plataforma e documentação
| Ideia | Issue | Notas |
| --- | --- | --- |
| Releases com binários: Linux, Windows, Android e macOS | [#50](https://github.com/nunesvictor/ishinydex/issues/50) | Ligado à meta do app nativo. |
| README em inglês para quem quer instalar o app | [#102](https://github.com/nunesvictor/ishinydex/issues/102) | Depois da interface. CONTRIBUTING e docs seguem em pt-BR. |
| Documentação técnica separada do README | [#49](https://github.com/nunesvictor/ishinydex/issues/49) | |
| Conferir os dados do app instalado depois de ~7 dias sem uso (iOS) | [#83](https://github.com/nunesvictor/ishinydex/issues/83) | Verificação manual, não é código. |
