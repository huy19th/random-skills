---
name: progressive-disclosure-doc
description: Tóm tắt kiến thức từ nguồn (trang web, PDF, video, file) thành tài liệu HTML đọc theo kiểu progressive disclosure — TL;DR và bullet ý chính hiện sẵn, click để xem chi tiết, hover keyword để xem định nghĩa, hover [n] để xem nguyên văn đoạn trích, click để mở bản lưu nguồn đúng đoạn đó. Dùng skill này khi user muốn "tóm tắt", "ghi chép", "note lại", "học" một bài viết, tài liệu, PDF, video, hoặc muốn thêm nguồn mới vào một chủ đề đã tóm tắt — kể cả khi user không nhắc tên skill.
---

# progressive-disclosure-doc

Đọc nguồn và viết bản tóm tắt kiến thức bằng tiếng Việt vào thư mục `knowledge/`. Người đọc lướt nhanh ở mức tổng quan, chỉ đào sâu khi cần, và kiểm chứng được từng ý với nguồn.

## Tài liệu tham chiếu của skill

**Đọc trước khi viết.** SKILL.md chỉ mô tả *quy trình*.

| File | Quy định | Ưu tiên khi mâu thuẫn |
|---|---|---|
| [convention.md](convention.md) | **Cách viết**: các tầng thông tin, văn phong, keyword, nguồn và trích dẫn, đặt tên | 1 |
| [templates/](templates/) | **Hình dạng** file agent viết: `content.html` (chủ đề), `glossary.html` (glossary chung) | 2 |

Các file agent **không** sửa khi tạo tài liệu:
* [assets/](assets/): CSS, JS, khung trang, khung bản lưu nguồn. Build ghép chúng vào từng file.
* [scripts/](scripts/): lưu nguồn, đánh dấu đoạn trích, build.

## Nguyên tắc

1. **Nguồn là sự thật.** Mỗi ý phải chỉ ra được đoạn nguyên văn trong nguồn. Ý tự rút ra → gắn nhãn Suy luận.
2. **Lưu nguồn trước, viết sau.** Bản lưu ở `knowledge/sources/` là thứ được trích dẫn, không phải trang online.
3. **Không bịa đoạn trích.** Đoạn trích phải copy từ bản lưu. `mark-quotes.mjs` báo không tìm thấy → sửa đoạn trích, không sửa bản lưu.
4. **Agent chỉ viết nội dung.** Chỉ viết `content.html` bằng bộ tag trong template. Không viết CSS/JS, không sửa `index.html` (file do build sinh).
5. **Build phải sạch.** Chỉ báo xong khi `build.mjs` exit 0.

## Đầu vào cần xác định

Hỏi user (chỉ những gì chưa rõ):
- **Nguồn:** URL, file PDF, video, file local. Có thể nhiều nguồn.
- **Thư mục knowledge:** mặc định `knowledge/` ở thư mục hiện tại. Nếu đã có thư mục `knowledge/` thì dùng luôn.
- **Chủ đề:** mặc định, nếu đã có chủ đề cùng nội dung thì **cập nhật chủ đề đó**; nếu không thì tạo chủ đề mới. User nói cụ thể (tạo mới, hoặc cập nhật chủ đề nào) thì làm theo user.

## Cấu trúc thư mục

```
knowledge/
  index.html              # build sinh: danh sách chủ đề, có ô tìm kiếm
  glossary/
    content.html          # agent viết: thuật ngữ chung
    index.html            # build sinh
  <chủ-đề>/
    content.html          # agent viết
    index.html            # build sinh: file để đọc
  sources/
    <tên-nguồn>.html      # bản lưu nguồn, có <mark id="q-…">
```

Trong các lệnh dưới đây, `<skill>` là thư mục chứa file SKILL.md này. File tạm (trang tải về, phụ đề, quotes.json) để ở thư mục tạm, không để trong `knowledge/`.

## Quy trình tạo chủ đề mới

### Bước 1 — Lưu nguồn

Với mỗi nguồn, tạo `knowledge/sources/<tên-nguồn>.html` bằng `make-source.mjs`. Đặt tên file theo convention.md mục 7. Nguồn đã có trong `sources/` thì dùng lại, không lưu lần 2.

| Loại nguồn | Cách lấy nội dung | Lệnh |
|---|---|---|
| Trang web | Tải HTML thô: `curl -sL <url> -o page.html`. Không dùng công cụ trả về bản tóm tắt của trang, vì cần nguyên văn. | `--page page.html` |
| Trang web render bằng JS (curl không có nội dung) | Lấy nội dung chính qua trình duyệt, ghi ra file HTML sạch | `--html body.html` |
| PDF | `pdftotext -layout file.pdf out.txt` (poppler). Không có poppler → dùng thư viện PDF sẵn có (ví dụ PyMuPDF), nối các trang bằng ký tự `\f`. PDF scan (không có text) → báo user cần OCR. | `--text out.txt` |
| Video | Lấy phụ đề: `yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "en.*,vi.*" --sub-format vtt -o sub <url>`. Ưu tiên phụ đề do người viết hơn phụ đề tự động. Không có phụ đề → chuyển giọng nói thành văn bản (ví dụ Whisper, xuất VTT) nếu có công cụ; không có thì báo user. | `--vtt sub.vtt` |
| File văn bản, Markdown | Dùng trực tiếp | `--text file.md` |

```bash
node <skill>/scripts/make-source.mjs --out knowledge/sources/<tên-nguồn>.html \
  --title "<tiêu đề nguồn>" --url "<URL gốc hoặc đường dẫn file>" --lang <ngôn ngữ nguồn> --page page.html
```

* `--text`: mỗi ký tự `\f` là một ngắt trang → anchor `#page-<số>`.
* `--vtt`: mỗi đoạn ~30 giây có mốc thời gian, link về video gốc đúng thời điểm.
* Sau khi lưu, đọc lại bản lưu: nội dung chính phải đầy đủ, không lẫn menu, quảng cáo. `--page` lấy thiếu hoặc lẫn rác → tự trích nội dung chính ra file và dùng `--html`.

### Bước 2 — Đọc nguồn và lên dàn ý

* Đọc toàn bộ bản lưu.
* Viết TL;DR (L0) trước. Viết không được → chưa hiểu nguồn, đọc lại.
* Chia nhóm ý (`<section>`) và bullet L1 theo convention.md mục 3.
* Ghi lại các thuật ngữ cần định nghĩa. Mở `knowledge/glossary/content.html` (nếu có) xem thuật ngữ nào đã có trong glossary chung.

### Bước 3 — Chọn và đánh dấu đoạn trích

* Với mỗi L1, thuật ngữ, và ý L2 lấy từ nguồn: chọn đoạn nguyên văn chứng minh ý đó (convention.md mục 5).
* Ghi ra file `quotes.json`, id nối tiếp các id `q-…` đã có trong file nguồn:

  ```json
  { "q-1": "đoạn nguyên văn", "q-2": "đoạn nguyên văn" }
  ```

* Chạy:

  ```bash
  node <skill>/scripts/mark-quotes.mjs knowledge/sources/<tên-nguồn>.html quotes.json
  ```

* Đoạn nào không tìm thấy → copy lại chính xác từ bản lưu và chạy lại. Vẫn không có trong nguồn → ý đó là Suy luận, hoặc bỏ.

### Bước 4 — Viết content.html

* Copy [templates/content.html](templates/content.html) thành `knowledge/<chủ-đề>/content.html`.
* Thay hết các `{{...}}`, xóa comment HTML, bỏ các mục không có nội dung (Câu hỏi mở, Thuật ngữ).
* `data-created` và `data-updated`: ngày hôm nay.
* Mục Nguồn: liệt kê mọi nguồn được link trong file.

### Bước 5 — Thuật ngữ

* Thuật ngữ của chủ đề → mục Thuật ngữ trong `content.html`.
* Thuật ngữ đã có trong glossary chung → link đến đó, không định nghĩa lại.
* Thuật ngữ chủ đề khác cũng đang định nghĩa → chuyển sang glossary chung theo convention.md mục 4. Chưa có `knowledge/glossary/content.html` → tạo từ [templates/glossary.html](templates/glossary.html).

### Bước 6 — Build và kiểm tra

```bash
node <skill>/scripts/build.mjs knowledge
```

* Build sinh `index.html` cho mỗi thư mục có `content.html`, và `knowledge/index.html`.
* Build kiểm tra và exit 1 khi có:
  * link nguồn trỏ đến file không tồn tại, hoặc đoạn trích `#q-…` không có
  * nguồn được link nhưng chưa có trong mục Nguồn
  * keyword trỏ đến thuật ngữ chưa định nghĩa
  * bullet L1 hoặc thuật ngữ không có nguồn và không có nhãn Suy luận
  * id trùng
* Sửa `content.html` rồi build lại đến khi exit 0.

### Bước 7 — Báo cáo

Báo user:
* Đường dẫn file để mở: `knowledge/<chủ-đề>/index.html`.
* Số nguồn đã dùng; nguồn nào không lưu được và lý do.
* Các ý gắn nhãn Suy luận.
* Câu hỏi mở.

## Cập nhật chủ đề đã có

Khi có nguồn mới về một chủ đề đã có:

1. Lưu nguồn mới (Bước 1), đánh dấu đoạn trích (Bước 3).
2. Sửa `content.html` của chủ đề:
   * Ý mới: thêm vào đúng nhóm ý theo heading, không dồn xuống cuối file. Không có nhóm phù hợp → thêm `<section>` mới.
   * Ý trùng với ý đã có: không viết lại, chỉ thêm link nguồn mới vào bullet đó.
   * Nguồn mới làm rõ hơn ý đã có: bổ sung vào L2.
   * Nguồn mới mâu thuẫn với ý đã có: giữ cả hai ý kèm nguồn, ghi vào Câu hỏi mở.
   * Nguồn mới trả lời một Câu hỏi mở: đưa câu trả lời vào đúng nhóm ý, xóa câu hỏi.
   * TL;DR: viết lại nếu nguồn mới làm thay đổi ý tổng quan.
   * Thêm nguồn vào cuối mục Nguồn (giữ nguyên số `[n]` của các nguồn cũ). Cập nhật `data-updated`.
3. Build (Bước 6) và báo cáo (Bước 7), nói rõ những ý đã thêm hoặc sửa.

## Xử lý feedback

Khi user review bản tóm tắt và góp ý, xác định góp ý thuộc loại nào rồi sửa đúng chỗ:

| Loại feedback | Sửa ở đâu |
|---|---|
| Cách viết: văn phong, độ dài, chọn keyword, cách trích dẫn | `convention.md`: thêm quy tắc, và thêm cặp sai/đúng của user nguyên văn vào bảng ❌ Sai / ✅ Đúng của mục liên quan |
| Hình dạng file: thứ tự mục, tag | `templates/` |
| Giao diện, cách tương tác | `assets/` |
| Sai ở một bản tóm tắt cụ thể | Chỉ sửa `content.html` của chủ đề đó, rồi build lại |
