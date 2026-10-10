# Claude Skills

A collection of [Claude skills](https://docs.claude.com/en/docs/claude-code/skills) for Claude Code.

## Skills

| Skill | Language | Description |
|---|---|---|
| [code2srs](en/code2srs/SKILL.md) | EN | Reverse-engineer an SRS from the source code of a web app, in English: screens, business flows, cron jobs, glossary, database |
| [code2srs](vi/code2srs/SKILL.md) | VI | Same as above, generating the SRS in Vietnamese |
| [srs-manager](en/srs-manager/SKILL.md) | EN | Initialize and manage an SRS in `docs/srs/`: `REQ-{MODULE}-{NUMBER}` IDs, requirement statuses, traceability matrix, in-code annotations |
| [srs-manager](vi/srs-manager/SKILL.md) | VI | Same as above, in Vietnamese |

## Installation

Pick **one** language version (`en/` or `vi/`) of the skill you need and copy it into Claude Code's skills folder:

* For all projects: `~/.claude/skills/<skill-name>/`
* For a single project: `<project>/.claude/skills/<skill-name>/`

Example with `code2srs`:

```bash
# English version
cp -r en/code2srs ~/.claude/skills/code2srs
# or the Vietnamese version
cp -r vi/code2srs ~/.claude/skills/code2srs
```

## Repo structure

```
en/            # skills written in English
  <skill-name>/
    SKILL.md   # the skill's entry point
    ...        # supporting files: convention, templates, scripts...
vi/            # skills written in Vietnamese
  <skill-name>/ # same name as the en/ version, if any
CLAUDE.md      # guidance for Claude Code when editing this repo
README.md
```

## Adding a new skill

1. Create the folder `<language>/<skill-name>/` with a `SKILL.md` (frontmatter containing `name` and `description`).
2. Keep the skill folder self-contained: do not reference files outside it.
3. Add a row to the [Skills](#skills) table.
