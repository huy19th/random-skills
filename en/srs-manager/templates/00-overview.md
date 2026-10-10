# {Project Name} — SRS Overview

**Last updated:** {YYYY-MM-DD}
**Owner:** {@owner}

## Product Goal

{Short 2-4 sentence description: what problem the product solves, and for whom}

## Feature Tracker

Tick a box only when the requirement reaches `Implemented` or `Tested` in its module file **and** in the
traceability matrix. A feature with no Req ID yet is an idea, not a commitment — write the requirement
first, then code.

### {Feature area, e.g. Authentication}
* [x] {Feature already implemented} — `REQ-{MODULE}-001`
* [ ] {Feature specified but not done yet} — `REQ-{MODULE}-002`
  * [ ] {Sub-feature with its own requirement} — `REQ-{MODULE}-003`
* [ ] {Idea with no requirement yet — no Req ID}

### Quality — see [`nfr.md`](./nfr.md)
* [ ] {Non-functional goal, e.g. accessibility, i18n, offline}

## Out of Scope

- {things deliberately not being done, to avoid scope creep}

## Module list

| Module | File | Prefix ID | State |
|---|---|---|---|
| {Auth} | `01-auth.md` | `REQ-AUTH-*` | active |
| {Payment} | `02-payment.md` | `REQ-PAY-*` | planned |

Planned modules have no file yet — create it from the module template when the first requirement in that
module is written.

## Links

- Traceability matrix: [`traceability-matrix.md`](./traceability-matrix.md)
- Non-functional requirements: [`nfr.md`](./nfr.md)
