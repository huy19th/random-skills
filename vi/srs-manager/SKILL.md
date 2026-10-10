---
name: srs-manager
description: >
  Khởi tạo và quản lý Software Requirements Specification (SRS) trong repo theo chuẩn cá nhân của user —
  bao gồm cấu trúc thư mục docs/srs/, quy ước Requirement ID (REQ-MODULE-NUMBER), traceability matrix,
  và annotation trong code. PHẢI dùng skill này khi (1) khởi tạo dự án mới hoặc user yêu cầu "setup SRS",
  "init SRS", "tạo cấu trúc requirement"; (2) user muốn thêm một requirement hoặc tính năng mới vào SRS;
  (3) sau khi implement xong một feature và cần cập nhật trạng thái requirement cùng traceability matrix;
  (4) user hỏi "REQ-XXX ở đâu", "tính năng này implement ở file nào", "requirement này test ở đâu".
  Dùng skill này ngay cả khi user không nhắc chữ "SRS" nhưng mô tả công việc liên quan đến requirement,
  đặc tả tính năng, hay truy vết code-tới-yêu-cầu.
---

# SRS Manager

Skill này chuẩn hóa cách quản lý SRS trong mọi repo của user: cấu trúc file, quy ước ID, và cách giữ đồng bộ giữa requirement ↔ code ↔ test.

## Quy ước cốt lõi (áp dụng cho mọi dự án, không hỏi lại trừ khi user muốn đổi)

- **Requirement ID**: `REQ-{MODULE}-{NUMBER}` — ví dụ `REQ-AUTH-003`, `REQ-PAY-001`. `{MODULE}` viết hoa, ngắn gọn (AUTH, PAY, NOTI...), map 1-1 với 1 file trong `docs/srs/`.
- **Số thứ tự**: 3 chữ số, tăng dần trong từng module, không tái sử dụng số đã xoá (để tránh nhầm lẫn khi tra cứu lịch sử).
- **Trạng thái requirement**: `Draft → Approved → In Progress → Implemented → Tested`. Không có bước "Done" chung chung — dùng đúng 1 trong 5 trạng thái này.
- **Feature Tracker**: mục `## Feature Tracker` trong `00-overview.md` là checklist toàn bộ tính năng, nhóm theo khu vực, mỗi dòng kết thúc bằng Req ID (`* [ ] Zoom & pan — REQ-VIEW-003`). Dòng chưa có Req ID chỉ là ý tưởng. Chỉ tick khi requirement đó đã `Implemented` hoặc `Tested` ở cả file module lẫn traceability matrix — tracker là bản tóm tắt, không phải source of truth.

## Cấu trúc thư mục chuẩn

```
docs/
└── srs/
    ├── 00-overview.md              # mục tiêu sản phẩm, feature tracker, out-of-scope, danh sách module
    ├── 01-{module}.md              # 1 file / module, ví dụ 01-auth.md, 02-payment.md
    ├── nfr.md                      # non-functional requirements (perf, security, scalability)
    └── traceability-matrix.md      # bảng tổng: Req ID -> file/method/test/status
```

Đừng tạo 1 file/folder riêng cho từng Req ID — chỉ tách file riêng khi 1 requirement quá phức tạp (nhiều luồng, cần diagram riêng), lúc đó mới đổi `01-auth.md` thành folder `01-auth/` với `_index.md` + file riêng.

## Workflow 1 — Init SRS cho dự án mới

Trigger: user yêu cầu setup/init SRS cho 1 dự án (mới hoặc đã có sẵn code nhưng chưa có SRS).

Các bước:
1. Kiểm tra xem `docs/srs/` đã tồn tại chưa (`view` thư mục gốc dự án). Nếu đã có, hỏi user muốn merge hay ghi đè, đừng tự ý xoá.
2. Copy các template trong `templates/` vào `docs/srs/` của dự án, đổi tên phù hợp:
   - `templates/00-overview.md` → `docs/srs/00-overview.md`
   - `templates/traceability-matrix.md` → `docs/srs/traceability-matrix.md`
   - `templates/nfr.md` → `docs/srs/nfr.md`
3. Hỏi user: dự án có những module nào (vd auth, payment, notification)? Tạo `01-{module}.md`, `02-{module}.md`... từ `templates/module-template.md`, đặt số thứ tự theo độ ưu tiên user nêu.
4. Chèn đoạn hướng dẫn trong `templates/agents-md-snippet.md` vào file `AGENTS.md` hoặc `CLAUDE.md` ở root dự án (tạo file này nếu chưa có). Đoạn này dạy chính Claude Code của dự án đó tự tuân theo quy ước SRS mà không cần load lại skill này mỗi lần.
5. Điền `00-overview.md` dựa trên mô tả sản phẩm user cung cấp — hỏi nếu thiếu thông tin, đừng bịa. Liệt kê các tính năng user nêu vào Feature Tracker dưới dạng dòng chưa tick, nhóm theo khu vực, chưa gắn Req ID cho đến khi requirement được viết. Nếu dự án đã có code, chỉ tick những dòng mà requirement đã được ghi nhận là `Implemented`/`Tested`.
6. Báo cho user cấu trúc đã tạo, không tự ý điền sẵn requirement nếu user chưa cung cấp — để trống với 1-2 ví dụ mẫu (xem `examples/01-auth-example.md`) làm khuôn.

## Workflow 2 — Thêm requirement mới

Trigger: user mô tả 1 tính năng/yêu cầu mới cần đặc tả.

1. Xác định module → xác định file `docs/srs/0X-{module}.md`. Nếu module chưa tồn tại, tạo file mới theo `templates/module-template.md` và thêm dòng vào README/overview nếu có mục lục module.
2. Xác định số ID tiếp theo trong module đó (đọc file, tìm ID lớn nhất hiện có, +1).
3. Viết requirement theo format chuẩn (xem template) gồm: user story (As a/I want/So that), Acceptance Criteria dạng checklist, Status ban đầu là `Draft`.
4. Thêm 1 dòng tương ứng vào `traceability-matrix.md` với Status `Draft`, các cột File/Method/Test để trống.
5. Gắn requirement vào Feature Tracker trong `00-overview.md`: nếu đã có dòng cho tính năng này nhưng chưa có Req ID, thêm ID vào cuối dòng; nếu chưa có, thêm 1 dòng mới chưa tick vào đúng nhóm. Khi 1 tính năng được tách thành nhiều requirement, lồng các requirement con dưới dòng cha.
6. Không tự chuyển status sang `Approved` — đó là quyết định của user.

## Workflow 3 — Sau khi implement xong 1 feature

Trigger: user báo đã code xong 1 requirement, hoặc tự Claude Code vừa hoàn thành implement 1 REQ-ID trong quá trình coding.

1. Cập nhật trong `docs/srs/0X-{module}.md`, tại đúng mục Req ID: thêm/sửa 3 field `Status`, `Implementation` (đường dẫn file + tên hàm/method), `Tests` (đường dẫn file test).
2. Cập nhật dòng tương ứng trong `traceability-matrix.md` — đồng bộ cả 2 nơi, không chỉ update 1 chỗ.
3. Nếu có test pass, set Status = `Tested`. Nếu code xong nhưng chưa có test, set `Implemented`.
4. Tick dòng tương ứng trong Feature Tracker của `00-overview.md` và cập nhật ngày `Last updated`. Chỉ tick dòng cha khi tất cả dòng con đã được tick.
5. Nhắc user (không tự làm thay) nên commit với message dạng `feat({module}): implement REQ-{MODULE}-{NUMBER} <mô tả ngắn>` để giữ traceability qua git log.
6. Khuyến khích thêm annotation trong code ngay tại hàm implement:
   ```
   /**
    * @requirement REQ-AUTH-003
    * @see docs/srs/01-auth.md
    */
   ```

## Workflow 4 — Tra cứu (REQ-XXX ở đâu / tính năng này implement ở đâu)

1. Mở `docs/srs/traceability-matrix.md` trước tiên — đây là source of truth để trả lời nhanh.
2. Nếu matrix chưa được cập nhật (thiếu cột File/Method), search trong code theo annotation `@requirement REQ-XXX` để tìm, rồi tiện thể cập nhật lại matrix luôn (đừng để lệch thêm).
3. Trả lời user kèm đường dẫn file cụ thể, không chỉ nói chung chung "trong module auth".

## Lưu ý khi áp dụng

- Không tạo file/folder riêng cho từng Req ID trừ khi thực sự cần (xem phần cấu trúc thư mục).
- Luôn đồng bộ 2 nơi: file SRS module (chi tiết) và traceability-matrix.md (tổng quan) — lệch 1 trong 2 là lỗi cần sửa ngay khi phát hiện. Feature Tracker đi theo 2 nơi này: nếu dòng đã tick không khớp với matrix, matrix đúng và sửa lại tracker.
- Khi không chắc requirement thuộc module nào, hỏi user thay vì tự đoán và tạo nhầm module mới.
