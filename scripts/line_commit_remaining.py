#!/usr/bin/env python3
"""Line-by-line commits from pre-saved snapshots, then push to ecoverify_app."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(r"C:\Users\rauna\OneDrive\Desktop\ecoverify_app")
SNAP = Path(r"C:\Users\rauna\AppData\Local\Temp\ecoverify_line_snapshots")

FILES = [
    "frontend/src/components/data/productData.jsx",
    "frontend/src/lib/ai.js",
    "frontend/vite.config.js",
    "frontend/package.json",
    "frontend/package-lock.json",
    "backend/.env.example",
    "package.json",
    "scripts/commit-line-by-line.py",
    "backend/src/catalog.js",
    "backend/src/server.js",
    "backend/src/routes/scan.js",
    "backend/src/services/vision.js",
    "frontend/src/lib/vision/labels.js",
    "frontend/src/lib/vision/localClassifier.js",
    "backend/package-lock.json",
]


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        args,
        cwd=ROOT,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
    )


def prefix(path: str) -> str:
    if "productData" in path:
        return "feat(data)"
    if "ai.js" in path or "vision" in path:
        return "feat(ai)"
    if "package" in path or "vite" in path:
        return "chore(deps)"
    if path.startswith("backend/"):
        return "feat(api)"
    return "chore(file)"


def commit_lines(rel: str, text: str) -> int:
    # split keeping whether file ended with newline
    ends_nl = text.endswith("\n") or text.endswith("\r\n")
    norm = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = norm.split("\n")
    # if ends with newline, last split item is empty — keep it as "full lines"
    if ends_nl and lines and lines[-1] == "":
        lines = lines[:-1]
        total = len(lines)
        def body(n: int) -> str:
            return "\n".join(lines[:n]) + ("\n" if n > 0 else "")
    else:
        total = len(lines)
        def body(n: int) -> str:
            return "\n".join(lines[:n])

    if total == 0:
        total = 1
        lines = [""]

    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(["git", "reset", "HEAD", "--", rel])

    commits = 0
    pfx = prefix(rel)
    for i in range(1, total + 1):
        chunk = body(i)
        dest.write_bytes(chunk.encode("utf-8"))
        run(["git", "add", "--", rel])
        staged = run(["git", "diff", "--cached", "--name-only"]).stdout.strip()
        if not staged:
            continue
        msg = f"{pfx}: L{i:04d}/{total:04d}"
        r = run(["git", "commit", "-m", msg])
        if r.returncode == 0:
            commits += 1
            if commits % 50 == 0:
                print(f"  {rel} {i}/{total} (+{commits})", flush=True)

    # ensure exact snapshot content
    dest.write_bytes(text.encode("utf-8") if isinstance(text, str) else text)
    # rewrite with original bytes from snap file
    return commits


def main() -> None:
    total = 0
    for rel in FILES:
        key = rel.replace("/", "__").replace("\\", "__")
        snap_path = SNAP / key
        if not snap_path.exists():
            print(f"MISSING SNAP {rel}", flush=True)
            continue
        raw = snap_path.read_bytes()
        # try utf-8
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            text = raw.decode("utf-8", errors="replace")

        print(f"=== {rel} ({text.count(chr(10))+1} approx lines) ===", flush=True)
        # write exact bytes at end
        dest = ROOT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)

        ends_nl = text.endswith("\n")
        norm = text.replace("\r\n", "\n").replace("\r", "\n")
        parts = norm.split("\n")
        if ends_nl and parts and parts[-1] == "":
            parts = parts[:-1]

        total_lines = max(len(parts), 1)
        run(["git", "reset", "HEAD", "--", rel])
        pfx = prefix(rel)
        file_commits = 0

        for i in range(1, total_lines + 1):
            chunk = "\n".join(parts[:i])
            if i < total_lines or ends_nl:
                chunk += "\n"
            dest.write_bytes(chunk.encode("utf-8"))
            run(["git", "add", "--", rel])
            staged = run(["git", "diff", "--cached", "--name-only"]).stdout.strip()
            if not staged:
                continue
            msg = f"{pfx}: L{i:04d}/{total_lines:04d}"
            r = run(["git", "commit", "-m", msg])
            if r.returncode == 0:
                file_commits += 1
                total += 1
                if file_commits % 50 == 0:
                    print(f"  {rel} {i}/{total_lines}", flush=True)

        # exact restore from snap bytes
        dest.write_bytes(raw)
        run(["git", "add", "--", rel])
        if run(["git", "diff", "--cached", "--name-only"]).stdout.strip():
            run(["git", "commit", "-m", f"{pfx}: finalize {rel}"])
            total += 1
        print(f"OK {rel}: {file_commits} commits", flush=True)

    print(f"TOTAL NEW: {total}", flush=True)
    print("PUSH ecoverify_app main:master", flush=True)
    r = run(["git", "push", "ecoverify_app", "main:master"])
    print(r.stdout)
    print(r.stderr)
    print("exit", r.returncode, flush=True)
    if r.returncode != 0:
        sys.exit(r.returncode)


if __name__ == "__main__":
    main()
