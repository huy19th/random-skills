## SRS conventions for this project

- SRS lives in `docs/srs/`, split by module: `01-{module}.md`, `02-{module}.md`...
- Requirement ID: `REQ-{MODULE}-{NUMBER}` (e.g. `REQ-AUTH-003`), 3 digits, increasing.
- Status: `Draft → Approved → In Progress → Implemented → Tested`.
- **Before implementing a feature**: read the corresponding module SRS file under `docs/srs/`. If the
  requirement doesn't exist yet, create a Draft first before coding (ask the user if information is
  missing).
- **After implementing**: update the `Status` / `Implementation` / `Tests` fields in the module SRS file
  AND the matching row in `docs/srs/traceability-matrix.md`. Never update only one of the two. Then tick
  the matching item in the Feature Tracker of `docs/srs/00-overview.md`.
- **Feature Tracker** (`docs/srs/00-overview.md`): every feature is a checklist item ending with its Req
  ID. Tick only when the requirement is `Implemented` or `Tested`; an item with no Req ID is an idea —
  write the requirement first.
- Commit messages should include the Req ID: `feat({module}): implement REQ-{MODULE}-{NUMBER} <description>`.
- In-code annotation at the point of implementation:
  ```
  /**
   * @requirement REQ-{MODULE}-{NUMBER}
   * @see docs/srs/0X-{module}.md
   */
  ```
