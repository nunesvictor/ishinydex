# Fluxo de trabalho

O código da aplicação vive em
[ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend) e
[ishinydex-frontend](https://github.com/nunesvictor/ishinydex-frontend), cada
um com o seu fluxo (ver o `CONTRIBUTING.md` de cada). Este repositório só
**junta os dois**: submodules, `docker-compose.yml`, `.env.example` e CI da
stack completa.

1. **Issue** descrevendo a mudança (em pt-BR).
2. **Branch** `<número>-<resumo>`, a partir da `main` atualizada.
3. **Pull request** com `Closes #<número>`. O CI sobe a stack completa
   (`docker compose`) e confere o app, a API e o admin.
4. **Revisão e squash merge** pelo dono do repositório. A branch é apagada
   sozinha.

## Atualizar os submodules

O Dependabot abre os PRs toda semana. Para fazer à mão:

```sh
git submodule update --remote backend frontend
git commit -am "chore(deps): atualizar submodules"
```

Quando um PR daqui depende de mudanças nos outros repositórios, mergeie
primeiro os PRs de lá e só então atualize o submodule aqui.
