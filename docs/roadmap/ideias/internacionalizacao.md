# Internacionalização da interface

Hoje o app é só em português. A proposta é que a interface tenha **en-US** como padrão e **pt-BR** com suporte completo, para facilitar o uso por quem não fala português. Documentação, issues e PRs continuam em pt-BR até surgir demanda de contribuição de terceiros. Só o README ganha uma versão em inglês, para quem quer instalar o app, e entra depois, à parte.

## Issues
| Repositório | Issue | O quê |
| --- | --- | --- |
| backend | [#105](https://github.com/nunesvictor/ishinydex-backend/issues/105) | Rótulos do catálogo nos dois idiomas |
| frontend | [#178](https://github.com/nunesvictor/ishinydex-frontend/issues/178) | Interface do app e shell web |
| ishinydex | [#101](https://github.com/nunesvictor/ishinydex/issues/101) | Política de privacidade em inglês |
| ishinydex | [#102](https://github.com/nunesvictor/ishinydex/issues/102) | README em inglês (depois, à parte) |

## O que existe hoje
- O app já usa `flutter_localizations` e `intl`, mas com `Locale('pt', 'BR')` fixo em `app.dart`. São uns 500 textos em mais de 55 arquivos de `lib/`.
- O catálogo publica rótulos em português:
  - `choices`: tipos, gêneros, idiomas e gerações;
  - nomes das pokédex (`POKEDEX_LABELS`);
  - legendas de encontros especiais e de shiny locks.
- Nomes de Pokémon, naturezas e pokébolas já vêm em inglês, da PokéAPI.
- O backend já tem gettext com `locale/pt_BR`.

## Plano
1. **Catálogo (backend#105).** Cada rótulo passa a sair nos dois idiomas (`labels: {en, pt-BR}`), pelo gettext. O `label` atual continua, para o app antigo, e o `schemaVersion` continua 1, porque a mudança é aditiva.
2. **Infraestrutura no app (frontend#178, 1º PR):**
   - `flutter gen-l10n` com `app_en.arb` (modelo) e `app_pt.arb`;
   - o idioma segue o do aparelho: português vira pt-BR, qualquer outro vira en-US;
   - opção de idioma em Ajustes, guardada como o formato de data;
   - helper de teste que fixa pt-BR, para não reescrever os `find.text` existentes.
3. **Migração, uma feature por PR** ("Parte de #178"):
   - cada texto fixo passa a usar `AppLocalizations.of(context)`;
   - os textos fora de widgets (validações do `fake_backend.dart`, `Save.restriction`, rótulos em modelos) viram códigos ou mensagens com parâmetros, traduzidos na tela;
   - cada tela ganha um teste em en-US.
4. **Shell web:** o splash, o aviso de demora (#176) e a descrição do `manifest.json` escolhem o idioma por `navigator.language`.
5. **Privacidade (#101):** a versão em inglês, com links entre as duas.

## Quando for planejar
- É uma versão minor dedicada, sem misturar com outras features grandes, como o registro de caçadas.
- O custo é grande pelo volume de textos, mas cada PR é mecânico. A parte que exige decisão é a dos textos fora de widgets.
- O arquivo de dados não muda: a preferência de idioma é só do aparelho, como o formato de data.
