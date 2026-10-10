---
name: srs-manager
description: >
  Initialize and manage a Software Requirements Specification (SRS) inside a repo following the user's
  personal standard — including the docs/srs/ folder structure, the Requirement ID convention
  (REQ-MODULE-NUMBER), a traceability matrix, and in-code annotations. MUST use this skill when
  (1) initializing a new project or the user asks to "set up SRS", "init SRS", "create a requirements
  structure"; (2) the user wants to add a new requirement or feature to the SRS; (3) after a feature has
  been implemented and the requirement's status plus the traceability matrix need updating;
  (4) the user asks "where is REQ-XXX", "which file implements this feature", "where is this requirement
  tested". Use this skill even when the user doesn't say "SRS" but describes work related to requirements,
  feature specs, or code-to-requirement traceability.
---

# SRS Manager

This skill standardizes how SRS is managed across all of the user's repos: file structure, ID convention,
and how to keep requirement ↔ code ↔ test in sync.

## Core conventions (apply to every project, don't ask again unless the user wants to change them)

- **Requirement ID**: `REQ-{MODULE}-{NUMBER}` — e.g. `REQ-AUTH-003`, `REQ-PAY-001`. `{MODULE}` is uppercase,
  short (AUTH, PAY, NOTI...), and maps 1-1 to one file under `docs/srs/`.
- **Numbering**: 3 digits, increasing within each module, never reuse a deleted number (to avoid confusion
  when looking up history).
- **Requirement status**: `Draft → Approved → In Progress → Implemented → Tested`. There is no generic
  "Done" — always use exactly one of these 5 statuses.
- **Feature Tracker**: the `## Feature Tracker` section of `00-overview.md` is a checklist of every
  feature, grouped by area, each item ending with its Req ID (`* [ ] Zoom & pan — REQ-VIEW-003`).
  An item without a Req ID is only an idea. A box is ticked only when that requirement is `Implemented` or
  `Tested` in both the module file and the traceability matrix — the tracker is a summary view, never the
  source of truth.

## Standard folder structure

```
docs/
└── srs/
    ├── 00-overview.md              # product goals, feature tracker, out-of-scope, module list
    ├── 01-{module}.md              # one file per module, e.g. 01-auth.md, 02-payment.md
    ├── nfr.md                      # non-functional requirements (perf, security, scalability)
    └── traceability-matrix.md      # master table: Req ID -> file/method/test/status
```

Don't create a separate file or folder per Req ID — only split out a dedicated file when a single
requirement is genuinely complex (many flows, needs its own diagram); in that case turn `01-auth.md` into
a folder `01-auth/` with `_index.md` plus individual files.

## Workflow 1 — Init SRS for a new project

Trigger: the user asks to set up/init SRS for a project (new, or existing code without an SRS yet).

Steps:
1. Check whether `docs/srs/` already exists (`view` the project root). If it does, ask the user whether to
   merge or overwrite — never delete on your own.
2. Copy the templates in `templates/` into the project's `docs/srs/`, renaming as needed:
   - `templates/00-overview.md` → `docs/srs/00-overview.md`
   - `templates/traceability-matrix.md` → `docs/srs/traceability-matrix.md`
   - `templates/nfr.md` → `docs/srs/nfr.md`
3. Ask the user which modules the project has (e.g. auth, payment, notification). Create
   `01-{module}.md`, `02-{module}.md`... from `templates/module-template.md`, numbered by the priority the
   user gives.
4. Insert the snippet from `templates/agents-md-snippet.md` into the project's root `AGENTS.md` or
   `CLAUDE.md` (create the file if it doesn't exist). This teaches that project's own Claude Code instance
   to follow the SRS conventions going forward without needing to reload this skill every time.
5. Fill in `00-overview.md` based on the product description the user provides — ask if information is
   missing, never invent it. List the features the user mentions in the Feature Tracker as unticked items
   grouped by area, without Req IDs until their requirements are written. If the project already has
   implemented code, tick only the items whose requirements you have recorded as `Implemented`/`Tested`.
6. Report the structure you created to the user. Don't pre-fill requirements the user hasn't provided —
   leave them empty, using `examples/01-auth-example.md` as a reference shape only.

## Workflow 2 — Add a new requirement

Trigger: the user describes a new feature/requirement that needs to be specified.

1. Identify the module → identify the file `docs/srs/0X-{module}.md`. If the module doesn't exist yet,
   create a new file from `templates/module-template.md` and add it to the overview's module list if one
   exists.
2. Determine the next ID number within that module (read the file, find the highest existing ID, +1).
3. Write the requirement in the standard format (see template): user story (As a/I want/So that),
   Acceptance Criteria as a checklist, initial Status of `Draft`.
4. Add a corresponding row to `traceability-matrix.md` with Status `Draft`, leaving the
   File/Method/Test columns empty.
5. Link the requirement in the Feature Tracker of `00-overview.md`: if an item for this feature already
   exists without a Req ID, append the ID to it; otherwise add a new unticked item under the right area.
   When one feature is split into several requirements, nest the sub-requirements under the parent item.
6. Don't move the status to `Approved` yourself — that's the user's call.

## Workflow 3 — After a feature is implemented

Trigger: the user reports a requirement is done, or Claude Code itself just finished implementing a
REQ-ID during a coding session.

1. Update the matching entry in `docs/srs/0X-{module}.md`: fill in/update the three fields `Status`,
   `Implementation` (file path + function/method name), `Tests` (test file path).
2. Update the corresponding row in `traceability-matrix.md` — keep both places in sync, don't update only
   one.
3. If tests pass, set Status = `Tested`. If code is done but no tests exist yet, set `Implemented`.
4. Tick the matching item in the Feature Tracker of `00-overview.md` and bump its `Last updated` date.
   Tick a parent item only once all of its nested items are ticked.
5. Remind the user (don't do it yourself) to commit with a message like
   `feat({module}): implement REQ-{MODULE}-{NUMBER} <short description>` to preserve traceability through
   git log.
6. Encourage adding an annotation in the code right where it's implemented:
   ```
   /**
    * @requirement REQ-AUTH-003
    * @see docs/srs/01-auth.md
    */
   ```

## Workflow 4 — Lookup (where is REQ-XXX / where is this feature implemented)

1. Open `docs/srs/traceability-matrix.md` first — this is the source of truth for quick answers.
2. If the matrix hasn't been kept up to date (missing File/Method columns), search the code for the
   `@requirement REQ-XXX` annotation instead, then update the matrix while you're at it (don't let it drift
   further).
3. Answer the user with the specific file path, not a vague "somewhere in the auth module".

## Notes when applying this skill

- Don't create a separate file/folder per Req ID unless truly necessary (see folder structure section).
- Always keep two places in sync: the module SRS file (detail) and traceability-matrix.md (overview) —
  a mismatch between the two is a bug to fix as soon as you notice it. The Feature Tracker follows them:
  if a ticked item disagrees with the matrix, the matrix wins and the tracker is corrected.
- When unsure which module a requirement belongs to, ask the user instead of guessing and creating a
  duplicate module.
