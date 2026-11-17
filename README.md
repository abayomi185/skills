# skills

My [Agent Skills](https://agentskills.io/specification). Each skill is a folder under `skills/` with a `SKILL.md` and any scripts or references it needs.

## Install

List the skills:

```sh
npx skills add abayomi185/skills --list
```

Install one or more:

```sh
npx skills add abayomi185/skills --skill uv-ruff
```

Or copy a folder from `skills/` into `~/.claude/skills/` or `~/.agents/skills/`.

## Layout

```text
skills/<name>/
├── SKILL.md      frontmatter: name, description
├── scripts/      optional helpers
├── references/   optional detail loaded on demand
└── assets/       optional templates
```

The folder name matches the `name` field in `SKILL.md`.

## License

MIT, except vendored skills, which keep their upstream license in their folder.
