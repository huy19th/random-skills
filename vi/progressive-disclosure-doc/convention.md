# Convention: cách viết bản tóm tắt

## 1. Các tầng thông tin

Mỗi ý kiến thức có tối đa 4 tầng, càng sâu càng chi tiết:

| Tầng | Nội dung | Viết ở đâu | Compact | Detailed |
|---|---|---|---|---|
| L0 | TL;DR của cả chủ đề: 1–3 câu | `<section class="tldr">` | Hiện | Hiện |
| L1 | Ý chính, ngắn, chứa keyword | `<summary>` hoặc `<li>` | Hiện | Hiện |
| L2 | Giải thích chi tiết, ví dụ, hệ quả | `<div class="detail">` | Click để mở | Mở sẵn |
| L3 | Trích dẫn nguyên văn từ nguồn | `<mark id="q-…">` trong bản lưu nguồn | Hover `[n]` | Hover `[n]` |

* Người đọc chỉ đọc L0 + L1 phải nắm được toàn bộ chủ đề ở mức tổng quan.
* L2 chỉ để trả lời "tại sao", "ví dụ", "hệ quả", "ngoại lệ". Không lặp lại L1 bằng câu dài hơn.
* L1 không có gì để giải thích thêm → viết `<li>` thường, không bọc `<details>`.

## 2. Văn phong

* Viết bằng tiếng Việt. Thuật ngữ kỹ thuật giữ nguyên tiếng Anh khi đó là cách gọi phổ biến (`cache`, `request`, `freshness lifetime`).
* Mỗi bullet một ý. L1 dài tối đa khoảng 25 từ.
* Mỗi L1 đọc riêng vẫn hiểu: không dùng "nó", "điều này" trỏ về bullet trước.
* Viết thẳng vào kiến thức, không kể lại nguồn.
* Dùng con số, ví dụ cụ thể thay cho từ chung chung.
* Tên header, directive, lệnh, đoạn code → bọc `<code>`.

| ❌ Sai | ✅ Đúng |
|---|---|
| Bài viết nói rằng `no-cache` không có nghĩa là không cache. | `no-cache` **không** có nghĩa là không cache: response vẫn được lưu, nhưng phải validate trước mỗi lần dùng. |
| Nó sẽ hết hạn sau một khoảng thời gian. | `max-age=N`: response trở thành stale sau N giây. |
| Cache có thể tự ước lượng thời hạn theo một tỷ lệ nào đó. | Khi server không ghi thời hạn, cache có thể tự ước lượng, thường bằng 10% khoảng thời gian kể từ `Last-Modified`. |

## 3. Nhóm ý và thứ tự

* Mỗi `<section>` là một nhóm ý, có `<h2>`. Nên có 3–7 nhóm; mỗi nhóm 2–8 bullet L1.
* Thứ tự nhóm: khái niệm nền tảng → cơ chế → cách dùng / cấu hình → lưu ý, lỗi thường gặp.
* Thứ tự bullet trong nhóm: ý quan trọng nhất lên đầu.

## 4. Keyword và thuật ngữ

* Chỉ đặt keyword cho thuật ngữ người đọc có thể chưa biết, hoặc có nghĩa riêng trong chủ đề. Không đặt cho từ thông dụng.
* Link keyword ở lần xuất hiện đầu tiên trong TL;DR và lần đầu tiên trong mỗi `<section>`. Các lần sau viết chữ thường, không link.
* Định nghĩa ở đâu:
  * Thuật ngữ chỉ dùng trong chủ đề này → glossary của chủ đề: `href="#term-<id>"`.
  * Thuật ngữ dùng ở từ 2 chủ đề trở lên → glossary chung: `href="../glossary/index.html#term-<id>"`.
  * Không link đến glossary của chủ đề khác.
  * Thuật ngữ đang ở glossary của chủ đề A, chủ đề B cũng cần → chuyển định nghĩa sang glossary chung, sửa link trong A.
  * Trước khi định nghĩa thuật ngữ mới, kiểm tra glossary chung đã có chưa.
* `<p class="short">`: đúng 1 câu, không lặp lại tên thuật ngữ ở đầu câu.
* Phần giải thích chi tiết: điều mà định nghĩa ngắn chưa nói, ví dụ, phân biệt với thuật ngữ dễ nhầm.

| ❌ Sai | ✅ Đúng |
|---|---|
| `<p class="short">Fresh là trạng thái fresh của response.</p>` | `<p class="short">Response còn hạn: được dùng ngay mà không cần hỏi lại origin server.</p>` |

## 5. Nguồn và trích dẫn

* Mỗi L1 và mỗi thuật ngữ phải có ít nhất 1 link nguồn `<a class="src" …></a>`, hoặc nhãn `<span class="inference">Suy luận</span>`. Build báo lỗi nếu thiếu.
* L2 có ý lấy từ nguồn thì cũng gắn link nguồn; ý tự rút ra thì gắn nhãn Suy luận.
* Đoạn trích (L3):
  * Nguyên văn, copy từ bản lưu nguồn. Không dịch, không sửa chữ, không nối 2 đoạn rời nhau.
  * Ngắn: 1–2 câu, đủ để chứng minh ý. Không trích cả đoạn dài.
  * Nằm trong một đoạn văn, không vắt qua định dạng (in đậm, link).
  * Không tìm được đoạn trích chứng minh ý → ý đó là Suy luận, hoặc bỏ.
* id đoạn trích: `q-1`, `q-2`… tăng dần trong từng file nguồn. Không đánh lại id đã có, vì các chủ đề khác có thể đang link đến.
* Nhãn Suy luận dùng cho: ý tự rút ra từ nhiều ý trong nguồn, kiến thức chung không có trong nguồn, ví dụ tự đặt ra.
* Các nguồn mâu thuẫn nhau → ghi cả hai ý kèm nguồn, và thêm vào Câu hỏi mở.

## 6. Câu hỏi mở

* Ghi: điểm nguồn chưa trả lời mà người đọc có thể thắc mắc; mâu thuẫn giữa các nguồn; phần nằm ngoài phạm vi nguồn hiện tại.
* Không ghi câu hỏi mà nguồn đã trả lời.

## 7. Đặt tên

| Đối tượng | Quy tắc | Ví dụ |
|---|---|---|
| Thư mục chủ đề | kebab-case, chữ thường, không dấu | `http-caching` |
| File nguồn | kebab-case, ngắn, nhận ra được nguồn | `rfc9111.html`, `mdn-http-caching.html`, `youtube-dQw4w9WgXcQ.html` |
| id thuật ngữ | `term-` + kebab-case của thuật ngữ, không dấu | `term-freshness-lifetime` |
| id đoạn trích | `q-` + số | `q-12` |
