#!/usr/bin/env python3
"""Commit changed files one line at a time for max commit count, then push to GitHub."""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(r"C:\Users\rauna\OneDrive\Desktop\ecoverify_app")

# Never commit secrets / junk
SKIP_EXACT = {
    "backend/.env",
    "frontend/.bak_src_index.css",
    "frontend/.bak_src_pages_Home.jsx",
}
SKIP_PREFIXES = (
    "backend/node_modules/",
    "frontend/node_modules/",
    "frontend/public/video/",  # large binaries; skip unless user asks
)

# Files already handled (or being handled) by a concurrent run — skip if clean
PRIORITY = [
    "frontend/src/index.css",
    "frontend/src/components/home/QuickScan.jsx",
    "frontend/src/components/data/productData.jsx",
    "frontend/src/lib/ai.js",
    "frontend/vite.config.js",
    "frontend/package.json",
    "frontend/package-lock.json",
    "backend/.env.example",
    "package.json",
]


def run(args: list[str], check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(
        args,
        cwd=ROOT,
        check=check,
        text=True,
        capture_output=True,
    )


def git_out(args: list[str]) -> str:
    return run(["git", *args], check=False).stdout.strip()


def should_skip(rel: str) -> bool:
    rel = rel.replace("\\", "/")
    if rel in SKIP_EXACT:
        return True
    return any(rel.startswith(p) for p in SKIP_PREFIXES)


def changed_files() -> list[str]:
    out = git_out(["status", "--porcelain", "-u"])
    files: list[str] = []
    for line in out.splitlines():
        if not line.strip():
            continue
        # XY PATH or XY ORIG -> PATH
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        path = path.strip('"')
        if should_skip(path):
            continue
        files.append(path.replace("\\", "/"))
    # unique preserve order, priority first
    seen = set()
    ordered: list[str] = []
    for p in PRIORITY + files:
        if p not in seen and p in files:
            seen.add(p)
            ordered.append(p)
    for p in files:
        if p not in seen:
            seen.add(p)
            ordered.append(p)
    return ordered


def prefix_for(path: str) -> str:
    name = Path(path).name
    if path.endswith(".css"):
        return "style(css)"
    if "Home.jsx" in path:
        return "feat(home)"
    if "QuickScan" in path:
        return "feat(scan)"
    if "productData" in path:
        return "feat(data)"
    if "ai.js" in path or "vision" in path:
        return "feat(ai)"
    if "vite.config" in path or "package" in path:
        return "chore(deps)"
    if path.startswith("backend/"):
        return "feat(api)"
    return f"chore({name[:12]})"


def commit_file_line_by_line(rel: str) -> int:
    path = ROOT / rel
    if not path.exists():
        # deletion: single commit
        run(["git", "add", "-A", "--", rel], check=False)
        staged = git_out(["diff", "--cached", "--name-only"])
        if not staged:
            return 0
        msg = f"{prefix_for(rel)}: remove {rel}"
        r = run(["git", "commit", "-m", msg], check=False)
        return 1 if r.returncode == 0 else 0

    # Unstage so we rebuild line by line from working tree
    run(["git", "reset", "HEAD", "--", rel], check=False)

    # Get HEAD version (empty if new file)
    head = run(["git", "show", f"HEAD:{rel}"], check=False)
    head_text = head.stdout if head.returncode == 0 else ""
    work_text = path.read_text(encoding="utf-8", errors="replace")

    # Normalize newlines for splitting, keep final write as work_text lines
    work_lines = work_text.splitlines(keepends=True)
    if not work_lines and work_text == "":
        # empty file
        path.write_text("", encoding="utf-8")
        run(["git", "add", "--", rel])
        r = run(["git", "commit", "-m", f"{prefix_for(rel)}: L0001/0001 empty"], check=False)
        return 1 if r.returncode == 0 else 0

    total = len(work_lines)
    # Start from empty / truncate then add line by line
    # If file is new, start empty; if modified, replace content progressively

    commits = 0
    # Write growing prefix
    for i in range(1, total + 1):
        chunk = "".join(work_lines[:i])
        path.write_text(chunk, encoding="utf-8", newline="")
        # On Windows Path.write_text may use \n; ensure content matches intent
        run(["git", "add", "--", rel])
        staged = git_out(["diff", "--cached", "--name-only"])
        if not staged:
            continue
        msg = f"{prefix_for(rel)}: L{i:04d}/{total:04d}"
        r = run(["git", "commit", "-m", msg], check=False)
        if r.returncode == 0:
            commits += 1
            if commits % 25 == 0:
                print(f"  … {rel} {i}/{total}", flush=True)
        else:
            # nothing to commit (identical) — continue
            pass

    # Ensure final file is exact working content
    path.write_text(work_text, encoding="utf-8", newline="")
    run(["git", "add", "--", rel], check=False)
    if git_out(["diff", "--cached", "--name-only"]):
        run(["git", "commit", "-m", f"{prefix_for(rel)}: finalize {total} lines"], check=False)
        commits += 1

    print(f"OK {rel}: {commits} commits", flush=True)
    return commits


def push_all() -> None:
    # Prefer ecoverify_app tracking remote, also origin
    remotes = []
    for remote, branch in (
        ("ecoverify_app", "main:master"),
        ("ecoverify_app", "main:main"),
        ("origin", "main:main"),
        ("origin", "main:master"),
    ):
        remotes.append((remote, branch))

    for remote, refspec in remotes:
        print(f"PUSH {remote} {refspec} …", flush=True)
        r = run(["git", "push", remote, refspec], check=False)
        print(r.stdout)
        print(r.stderr)
        if r.returncode == 0:
            print(f"PUSH OK: {remote} {refspec}", flush=True)
            return
    print("PUSH: all remotes failed — check auth", flush=True)
    sys.exit(1)


def wait_for_other_committer(timeout_s: int = 3600) -> None:
    """Wait if another commit-line-by-line.py is running."""
    import os

    my_pid = os.getpid()
    start = time.time()
    while time.time() - start < timeout_s:
        try:
            out = subprocess.check_output(
                ["wmic", "process", "where", "name='python.exe'", "get", "processid,commandline"],
                text=True,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            break
        others = [
            line
            for line in out.splitlines()
            if "commit-line-by-line" in line and str(my_pid) not in line
        ]
        if not others:
            return
        print("Waiting for other commit-line-by-line.py …", flush=True)
        time.sleep(8)
    print("Wait timed out; continuing", flush=True)


def main() -> None:
    os_chdir = os_chdir_helper()
    wait_for_other_committer()

    # Snapshot intended final contents before we rewrite files line-by-line
    files = changed_files()
    # Also include untracked backend/src (safe) without node_modules/.env
    for p in sorted((ROOT / "backend" / "src").rglob("*") if (ROOT / "backend" / "src").exists() else []):
        if p.is_file():
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            if not should_skip(rel) and rel not in files:
                files.append(rel)
    for p in sorted((ROOT / "frontend" / "src" / "lib" / "vision").rglob("*") if (ROOT / "frontend" / "src" / "lib" / "vision").exists() else []):
        if p.is_file():
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            if not should_skip(rel) and rel not in files:
                files.append(rel)

    # Save finals
    finals: dict[str, str | None] = {}
    for rel in files:
        fp = ROOT / rel
        if fp.exists() and fp.is_file():
            finals[rel] = fp.read_text(encoding="utf-8", errors="replace")
        else:
            finals[rel] = None

    print(f"Files to line-commit: {len(files)}", flush=True)
    total_commits = 0
    for rel in files:
        # Restore final content first (in case concurrent run left partial)
        if finals[rel] is not None:
            (ROOT / rel).write_text(finals[rel], encoding="utf-8", newline="")
        print(f"=== {rel} ===", flush=True)
        total_commits += commit_file_line_by_line(rel)

    print(f"TOTAL local commits this run: {total_commits}", flush=True)
    push_all()
    print("DONE", flush=True)


def os_chdir_helper():
    import os

    os.chdir(ROOT)
    return True


if __name__ == "__main__":
    main()
