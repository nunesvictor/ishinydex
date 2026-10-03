#!/usr/bin/env python3
"""Cria uma release do iShinyDex: a mesma tag nos três repositórios e a
release do GitHub neste (ver "Versões e releases" no CONTRIBUTING.md).

    tool/release.py v1.1.0 --dry-run   # confere tudo e mostra as notas
    tool/release.py v1.1.0             # cria as tags, faz o push e a release

A tag de cada submodule vai no commit que este repositório aponta na `main`
(o mesmo que o deploy usa), e só se esse commit estiver na `main` do
submodule. As notas juntam os PRs dos três repositórios desde a release
anterior, agrupados pelo prefixo do título (feat, fix...).

Roda na máquina, e não no CI: o token do CI de um repositório não cria tags
nos outros dois. Usa só o `git` e o `gh` (autenticado).
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OWNER = "nunesvictor"
# (pasta, repositório no GitHub, título da seção nas notas)
REPOS = [
    (".", "ishinydex", "Repositório principal"),
    ("backend", "ishinydex-backend", "Backend"),
    ("frontend", "ishinydex-frontend", "Frontend"),
]
SEMVER = re.compile(
    r"^v(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)"
    r"(?:-(?P<pre>[0-9A-Za-z.-]+))?$"
)
CATEGORIES = [
    ("feat", "Novidades"),
    ("fix", "Correções"),
    ("perf", "Desempenho"),
    ("docs", "Documentação"),
]
OTHER = "Manutenção"
PR_LINE = re.compile(r"^\* (?P<type>[a-z]+)(?:\([^)]*\))?!?:")
# Credencial do `gh` no push: o `git push` puro pede senha (ver CLAUDE.md).
GIT_PUSH = ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"]


def run(*args: str, cwd: Path = ROOT) -> str:
    return subprocess.run(
        args, cwd=cwd, check=True, capture_output=True, text=True
    ).stdout.strip()


def fail(message: str) -> None:
    sys.exit(f"erro: {message}")


def version_key(tag: str) -> tuple:
    """Ordem SemVer: o pré-release vem antes da versão final."""
    m = SEMVER.match(tag)
    assert m
    pre = m["pre"]
    pre_key = (
        (1,)
        if pre is None
        else (0, *((0, int(p)) if p.isdigit() else (1, p) for p in pre.split(".")))
    )
    return (int(m["major"]), int(m["minor"]), int(m["patch"]), pre_key)


def previous_tag(new: str) -> str | None:
    """Release anterior: para uma versão final, a última final (as notas
    cobrem todos os pré-releases); para um pré-release, a última tag."""
    tags = [t for t in run("git", "tag", "--list", "v*").split() if SEMVER.match(t)]
    final = SEMVER.match(new)["pre"] is None  # type: ignore[index]
    older = [
        t
        for t in tags
        if version_key(t) < version_key(new)
        and (not final or SEMVER.match(t)["pre"] is None)  # type: ignore[index]
    ]
    return max(older, key=version_key) if older else None


def commits() -> dict[str, str]:
    """Commit de cada repositório: a `main` deste e, nos submodules, o que
    ela aponta."""
    run("git", "fetch", "--quiet", "--tags", "origin")
    if run("git", "status", "--porcelain", "--untracked-files=no"):
        fail("há mudanças não commitadas neste repositório")
    head = run("git", "rev-parse", "HEAD")
    if head != run("git", "rev-parse", "origin/main"):
        fail("o HEAD não é a origin/main: faça checkout da main atualizada")
    result = {".": head}
    for path, repo, _ in REPOS[1:]:
        sha = run("git", "rev-parse", f"HEAD:{path}")
        sub = ROOT / path
        run("git", "fetch", "--quiet", "--tags", "origin", cwd=sub)
        merged = subprocess.run(
            ["git", "merge-base", "--is-ancestor", sha, "origin/main"], cwd=sub
        )
        if merged.returncode != 0:
            fail(f"{repo}: o commit {sha[:7]} não está na main")
        result[path] = sha
    return result


def check_free(tag: str) -> None:
    for path, repo, _ in REPOS:
        if run("git", "ls-remote", "--tags", "origin", f"refs/tags/{tag}", cwd=ROOT / path):
            fail(f"{repo}: a tag {tag} já existe")


def notes(tag: str, previous: str | None, shas: dict[str, str]) -> str:
    """Notas da release: os PRs de cada repositório, por categoria."""
    sections = []
    for path, repo, title in REPOS:
        args = [
            "gh", "api", f"repos/{OWNER}/{repo}/releases/generate-notes",
            "-f", f"tag_name={tag}", "-f", f"target_commitish={shas[path]}",
            "--jq", ".body",
        ]  # fmt: skip
        if previous:
            args += ["-f", f"previous_tag_name={previous}"]
        body = run(*args)
        groups: dict[str, list[str]] = {}
        for line in body.splitlines():
            if not line.startswith("* ") or "made their first contribution" in line:
                continue
            m = PR_LINE.match(line)
            kind = dict(CATEGORIES).get(m["type"] if m else "", OTHER)
            groups.setdefault(kind, []).append(line)
        if not groups:
            continue
        lines = [f"## {title}"]
        for kind in [label for _, label in CATEGORIES] + [OTHER]:
            if kind in groups:
                lines += ["", f"### {kind}", *groups[kind]]
        if previous:
            url = f"https://github.com/{OWNER}/{repo}/compare/{previous}...{tag}"
            lines += ["", f"Todas as mudanças: {url}"]
        sections.append("\n".join(lines))
    return "\n\n".join(sections) or "Sem PRs desde a release anterior."


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("tag", help="ex.: v1.1.0 ou v2.0.0-alpha.1")
    parser.add_argument("--dry-run", action="store_true", help="não cria nada")
    args = parser.parse_args()
    tag: str = args.tag
    if not SEMVER.match(tag):
        fail(f"{tag} não é SemVer com 'v' (ex.: v1.1.0, v2.0.0-alpha.1)")

    shas = commits()
    check_free(tag)
    previous = previous_tag(tag)
    body = notes(tag, previous, shas)
    prerelease = SEMVER.match(tag)["pre"] is not None  # type: ignore[index]

    print(f"Release {tag}{' (pré-release)' if prerelease else ''}")
    print(f"Anterior: {previous or '(nenhuma)'}")
    for path, repo, _ in REPOS:
        print(f"  {repo}: {shas[path][:7]}")
    print("\n" + body + "\n")
    if args.dry_run:
        print("--dry-run: nada foi criado.")
        return

    name = run("git", "config", "user.name")
    email = run("git", "config", "user.email")
    for path, repo, _ in REPOS:
        cwd = ROOT / path
        run(
            "git", "-c", f"user.name={name}", "-c", f"user.email={email}",
            "tag", "-a", tag, "-m", f"iShinyDex {tag}", shas[path], cwd=cwd,
        )  # fmt: skip
        run("git", *GIT_PUSH, "push", "--quiet", "origin", tag, cwd=cwd)
        print(f"tag {tag} criada em {repo}")

    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as f:
        f.write(body)
    release = ["gh", "release", "create", tag, "--verify-tag", "--title", tag]
    release += ["--notes-file", f.name]
    if prerelease:
        release.append("--prerelease")
    print(run(*release))


if __name__ == "__main__":
    main()
