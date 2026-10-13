# Backlog (pool de ideias)

Tudo que queremos fazer e ainda não tem versão. Cada item tem uma issue na milestone **Backlog** do repositório onde o trabalho começa. Ao planejar uma versão, escolhemos itens daqui: a issue vai para a milestone da versão, o item sai desta lista e entra no plano `vX.Y.Z.md`.

Ideia nova entra aqui primeiro, com uma issue curta (o quê e por quê). Mock, detalhes e estimativa ficam para quando ela for escolhida; ideia já planejada guarda o plano em `ideias/`.

## Interface
| Ideia | Issue | Notas |
| --- | --- | --- |
| Identidade visual com as cores de Pokémon (pokébola e amarelo da logo) | [frontend#162](https://github.com/nunesvictor/ishinydex-frontend/issues/162) | Mock com 2 ou 3 paletas antes. Minor pelo SemVer; 3.0 só junto com uma quebra de compatibilidade. |
| Cores das versões nos destaques de jogo | [frontend#203](https://github.com/nunesvictor/ishinydex-frontend/issues/203) | Começa pela etiqueta "exclusivo Scarlet", que sai com cor neutra na v2.7.2. Cor por versão nos dois temas, com contraste conferido; junto com a identidade visual (#162). Mock antes. |
| Internacionalização da interface: en-US padrão e pt-BR completo | [backend#105](https://github.com/nunesvictor/ishinydex-backend/issues/105), [frontend#178](https://github.com/nunesvictor/ishinydex-frontend/issues/178), [#101](https://github.com/nunesvictor/ishinydex/issues/101) | [Plano](ideias/internacionalizacao.md). Backend → frontend. Docs, issues e PRs seguem em pt-BR. |
| Fluxo de PersonalDex personalizado | [frontend#34](https://github.com/nunesvictor/ishinydex-frontend/issues/34) | |
| Golpes com nomes em inglês | [frontend#36](https://github.com/nunesvictor/ishinydex-frontend/issues/36) | |
| Idioma preferido no cadastro do dex | [frontend#210](https://github.com/nunesvictor/ishinydex-frontend/issues/210) | Filtrar o idioma fora do dex (novo motivo nas Caçadas) e preencher o idioma no cadastro. Campo novo nos dados: decidir sobre o schema antes. Mock antes. |

## Dados e catálogo
| Ideia | Issue | Notas |
| --- | --- | --- |
| Gerenciar arquivos de save (Virtual Console e backups do Checkpoint) | [frontend#225](https://github.com/nunesvictor/ishinydex-frontend/issues/225) | [Análise de viabilidade](ideias/arquivos-de-save.md): ≈ 2,5× a v2.9.0 em fases; decidir identidade do espécime e licença antes. Ler (só leitura, no aparelho) a party e as boxes dos arquivos de save, para conferir espécimes e preencher o "Encontrei!". Vale para jogos que não chegam ao HOME: saves e caçadas não dependem disso. |
| Histórico de transferências do espécime entre HOME e saves | [backend#65](https://github.com/nunesvictor/ishinydex-backend/issues/65) | Permitiria regras de "só ida" por espécime (ex.: FRLG). Inclui decidir a marca "Já visitou o Champions" depois da visita, como no HOME ([frontend#174](https://github.com/nunesvictor/ishinydex-frontend/issues/174)). |

## Plataforma e documentação
| Ideia | Issue | Notas |
| --- | --- | --- |
| Releases com binários: Linux, Windows, Android e macOS | [#50](https://github.com/nunesvictor/ishinydex/issues/50) | Ligado à meta do app nativo. |
| README em inglês para quem quer instalar o app | [#102](https://github.com/nunesvictor/ishinydex/issues/102) | Depois da interface. CONTRIBUTING e docs seguem em pt-BR. |
| Documentação técnica separada do README | [#49](https://github.com/nunesvictor/ishinydex/issues/49) | |
| Conferir os dados do app instalado depois de ~7 dias sem uso (iOS) | [#83](https://github.com/nunesvictor/ishinydex/issues/83) | Verificação manual, não é código. |
