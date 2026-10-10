# {Tên dự án} — SRS Overview

**Last updated:** {YYYY-MM-DD}
**Owner:** {@owner}

## Mục tiêu sản phẩm

{Mô tả ngắn 2-4 câu: sản phẩm giải quyết vấn đề gì, cho ai}

## Feature Tracker

Chỉ tick khi requirement đã ở trạng thái `Implemented` hoặc `Tested` trong file module **và** trong
traceability matrix. Tính năng chưa có Req ID chỉ là ý tưởng, chưa phải cam kết — viết requirement trước
rồi mới code.

### {Nhóm tính năng, vd Xác thực}
* [x] {Tính năng đã implement} — `REQ-{MODULE}-001`
* [ ] {Tính năng đã đặc tả nhưng chưa làm} — `REQ-{MODULE}-002`
  * [ ] {Tính năng con có requirement riêng} — `REQ-{MODULE}-003`
* [ ] {Ý tưởng chưa có requirement — chưa có Req ID}

### Chất lượng — xem [`nfr.md`](./nfr.md)
* [ ] {Mục tiêu phi chức năng, vd accessibility, i18n, offline}

## Ngoài phạm vi (Out of Scope)

- {những gì cố tình không làm, để tránh scope creep}

## Danh sách module

| Module | File | Prefix ID | Trạng thái |
|---|---|---|---|
| {Auth} | `01-auth.md` | `REQ-AUTH-*` | active |
| {Payment} | `02-payment.md` | `REQ-PAY-*` | planned |

Module `planned` chưa có file — tạo file từ module template khi viết requirement đầu tiên của module đó.

## Liên kết

- Traceability matrix: [`traceability-matrix.md`](./traceability-matrix.md)
- Non-functional requirements: [`nfr.md`](./nfr.md)
