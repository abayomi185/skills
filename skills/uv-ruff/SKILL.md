---
name: uv-ruff
description: Run ruff linting and/or formatting via uv on the current Python project. Use when the user asks to lint, format, fix, or check code style with ruff, or invokes /uv-ruff.
---

# uv-ruff

Run ruff via `uv run ruff` on the current project.

## Commands

**Check for lint issues:**
```bash
uv run ruff check .
```

**Auto-fix lint issues:**
```bash
uv run ruff check --fix .
```

**Check formatting (without changing files):**
```bash
uv run ruff format --check .
```

**Apply formatting:**
```bash
uv run ruff format .
```

## Workflow

1. Run `uv run ruff check .` and show output
2. If issues found, ask whether to auto-fix (or fix immediately if user said "fix")
3. Run `uv run ruff format .` to format
4. Report what was changed

If the user only asked for one of lint or format, only run that command.

If `--fix` is passed or the user says "fix", run `uv run ruff check --fix .` then `uv run ruff format .` without asking.
