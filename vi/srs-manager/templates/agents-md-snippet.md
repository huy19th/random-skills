## Quy ước SRS của dự án này

- SRS nằm ở `docs/srs/`, chia theo module: `01-{module}.md`, `02-{module}.md`...
- Requirement ID: `REQ-{MODULE}-{NUMBER}` (vd `REQ-AUTH-003`), 3 chữ số, tăng dần.
- Trạng thái: `Draft → Approved → In Progress → Implemented → Tested`.
- **Trước khi implement 1 feature**: đọc file SRS module tương ứng trong `docs/srs/`. Nếu chưa có requirement, tạo Draft trước khi code (hỏi user nếu thiếu thông tin).
- **Sau khi implement xong**: cập nhật field `Status` / `Implementation` / `Tests` trong file SRS module VÀ dòng tương ứng trong `docs/srs/traceability-matrix.md`. Không được chỉ update 1 trong 2 nơi. Sau đó tick dòng tương ứng trong Feature Tracker của `docs/srs/00-overview.md`.
- **Feature Tracker** (`docs/srs/00-overview.md`): mỗi tính năng là 1 dòng checklist kết thúc bằng Req ID. Chỉ tick khi requirement đã `Implemented` hoặc `Tested`; dòng chưa có Req ID là ý tưởng — viết requirement trước.
- Commit message nên chứa Req ID: `feat({module}): implement REQ-{MODULE}-{NUMBER} <mô tả>`.
- Annotation trong code tại nơi implement:
  ```
  /**
   * @requirement REQ-{MODULE}-{NUMBER}
   * @see docs/srs/0X-{module}.md
   */
  ```
