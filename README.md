# skills

My [Agent Skills](https://agentskills.io/specification). Each skill is a folder under `skills/` with a `SKILL.md` and any scripts or references it needs.

## Skills

| Skill | Use it to |
| --- | --- |
| [animated-system-diagram](skills/animated-system-diagram/) | Build an animated, ByteByteGo-style page that walks through request flows or compares designs |
| [design-proposal](skills/design-proposal/) | Write a short, diagram-led design proposal or decision doc |
| [explain-diff-html](skills/explain-diff-html/) | Explain a diff, branch or PR as a rich HTML page |
| [jira-ticket](skills/jira-ticket/) | Write concise Jira tickets with acceptance criteria and a test plan, linked to the PR |
| [uv-ruff](skills/uv-ruff/) | Lint and format a Python project with ruff via uv |

### Vendored

Not written by me. Copied from other repos at a pinned commit. Each folder keeps the upstream license, and each `SKILL.md` records the author and source commit in its `license` and `metadata` frontmatter.

| Skill | Author | Upstream | Changes |
| --- | --- | --- | --- |
| [unslop](skills/unslop/) | Lauren Tan | [cursor/plugins@2f87c85](https://github.com/cursor/plugins/tree/2f87c854fe3e2fcda44ca86b46ede35aad3c46b7/pstack/skills/unslop) (MIT) | Attribution frontmatter only |
| [socratic-tutor](skills/socratic-tutor/) | Jane Street | [janestreet/agent_skills@7c6715c](https://github.com/janestreet/agent_skills/tree/7c6715c29548a3b39d4a9545c698ee4fd17a7213/socratic-tutor) (MIT) | Attribution frontmatter only |

Other skills I use, installed straight from upstream:

- [mattpocock/skills](https://github.com/mattpocock/skills): caveman, codebase-design, domain-modeling, grill-me, grill-with-docs, grilling, improve-codebase-architecture, writing-great-skills
- [github/awesome-copilot](https://github.com/github/awesome-copilot): git-commit

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
