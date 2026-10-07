#!/usr/bin/env python3
"""Liga e desliga o GitGuardian como check obrigatório nos três repositórios.

    tool/gitguardian.py status
    tool/gitguardian.py suspend --motivo "lentidão do serviço"
    tool/gitguardian.py resume

O GitGuardian é um app do GitHub: roda a cada push, sempre, e nenhuma
configuração daqui o impede. O que este script controla é se o check dele é
obrigatório na proteção da `main`, o que faz os PRs esperarem por ele.
Suspenso, o check continua aparecendo nos PRs, mas não bloqueia o merge.

O padrão é ativo. Suspender é sempre escolha do usuário, e fica registrado
na variável `GITGUARDIAN` de cada repositório (Settings → Variables):
`ativo` ou `suspenso em <data> por escolha do usuário: <motivo>`. Enquanto
estiver suspenso, a CI dos três repositórios avisa em cada execução.

Roda na máquina, com o `gh` autenticado como administrador dos repositórios.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import date

OWNER = "nunesvictor"
REPOS = ["ishinydex", "ishinydex-frontend", "ishinydex-backend"]
CHECK = "GitGuardian Security Checks"
VARIABLE = "GITGUARDIAN"
ACTIVE = "ativo"


def gh(*args: str) -> str:
    return subprocess.run(
        ["gh", *args], check=True, capture_output=True, text=True
    ).stdout.strip()


def required_checks(repo: str) -> tuple[bool, list[str]]:
    data = json.loads(
        gh("api", f"repos/{OWNER}/{repo}/branches/main/protection/required_status_checks")
    )
    return data["strict"], data["contexts"]


def set_required_checks(repo: str, strict: bool, contexts: list[str]) -> None:
    gh(
        "api",
        "-X",
        "PATCH",
        f"repos/{OWNER}/{repo}/branches/main/protection/required_status_checks",
        "-F",
        f"strict={str(strict).lower()}",
        *[arg for context in contexts for arg in ("-f", f"contexts[]={context}")],
    )


def state(repo: str) -> str:
    """O valor da variável; sem ela, o padrão (ativo)."""
    # Pela API: nem toda versão do `gh` tem `variable get`.
    try:
        return gh(
            "api", f"repos/{OWNER}/{repo}/actions/variables/{VARIABLE}", "-q", ".value"
        )
    except subprocess.CalledProcessError:
        return ACTIVE


def set_state(repo: str, value: str) -> None:
    gh("variable", "set", VARIABLE, "--repo", f"{OWNER}/{repo}", "--body", value)


def status() -> None:
    for repo in REPOS:
        _, contexts = required_checks(repo)
        required = "obrigatório" if CHECK in contexts else "não obrigatório"
        print(f"{repo}: {required} · {VARIABLE}={state(repo)}")


def suspend(reason: str) -> None:
    value = f"suspenso em {date.today():%Y-%m-%d} por escolha do usuário: {reason}"
    for repo in REPOS:
        strict, contexts = required_checks(repo)
        if CHECK in contexts:
            set_required_checks(repo, strict, [c for c in contexts if c != CHECK])
        set_state(repo, value)
        print(f"{repo}: {CHECK} não é mais obrigatório")
    print(f"{VARIABLE}={value}")


def resume() -> None:
    for repo in REPOS:
        strict, contexts = required_checks(repo)
        if CHECK not in contexts:
            set_required_checks(repo, strict, [*contexts, CHECK])
        set_state(repo, ACTIVE)
        print(f"{repo}: {CHECK} obrigatório de novo")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("status", help="mostra o estado nos três repositórios")
    suspend_parser = commands.add_parser(
        "suspend", help="deixa de exigir o check (escolha do usuário)"
    )
    suspend_parser.add_argument("--motivo", required=True)
    commands.add_parser("resume", help="volta a exigir o check (o padrão)")
    args = parser.parse_args()
    try:
        match args.command:
            case "status":
                status()
            case "suspend":
                suspend(args.motivo)
            case "resume":
                resume()
    except subprocess.CalledProcessError as error:
        sys.exit(f"erro: {' '.join(error.cmd)}\n{error.stderr}")


if __name__ == "__main__":
    main()
