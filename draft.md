### Cách ghi chép lại kiến thức một cách hiệu quả

Mục tiêu: AI agent đọc tài liệu nguồn → viết ra 1 file HTML tóm tắt kiến thức. Người đọc lướt nhanh ở mức tổng quan, chỉ đào sâu khi cần (progressive disclosure), và luôn kiểm chứng được từng ý với nguồn.

## 1. Các tầng thông tin

Mỗi ý kiến thức có tối đa 4 tầng, càng sâu càng chi tiết:

| Tầng | Nội dung | Hiển thị ở Compact | Hiển thị ở Detailed |
|---|---|---|---|
| L0 | TL;DR của cả tài liệu: 1–3 câu | Luôn hiện | Luôn hiện |
| L1 | Bullet ý chính, ngắn, chứa keyword | Luôn hiện | Luôn hiện |
| L2 | Giải thích chi tiết, ví dụ | Ẩn, click bullet để expand | Expand sẵn |
| L3 | Trích dẫn nguyên văn từ nguồn | Ẩn, click link nguồn để xem | Hiện dưới dạng link nguồn |

## 2. View modes

* Hai mode là **cùng một nội dung**, chỉ khác cách hiển thị. Đổi mode bằng nút bấm (hoặc phím tắt), không sinh 2 file.
* **Compact**
  * Hiển thị L0 + L1 dưới dạng bullet và keyword.
  * Bullet có L2 thì có dấu ▸; click để expand/collapse.
  * Keyword:
    * Hover (hoặc focus bằng bàn phím): hiện tooltip định nghĩa ngắn.
    * Click: nhảy đến mục giải thích chi tiết trong phần Thuật ngữ.
    * Trên màn hình cảm ứng (không có hover): tap lần 1 hiện tooltip, trong tooltip có link "Xem chi tiết" để nhảy.
* **Detailed**
  * Hiển thị bullet đã được expand toàn bộ (L0 + L1 + L2).
  * Định nghĩa keyword vẫn ở tooltip, để không làm đoạn văn bị dài ra.
* Mode đang chọn và trạng thái expand được lưu vào `localStorage`, mở lại file vẫn giữ nguyên.

## 3. Thuật ngữ (glossary)

* Có 2 nơi định nghĩa thuật ngữ:
  * **Glossary chung** (`knowledge/glossary/`): thuật ngữ dùng ở nhiều chủ đề. Mọi chủ đề đều link đến được.
  * **Glossary của chủ đề**: phần Thuật ngữ ở cuối file, chứa thuật ngữ chỉ dùng trong chủ đề đó.
  * Thuật ngữ chung có màu khác thuật ngữ của chủ đề, và tooltip ghi "Thuật ngữ chung".
* Mỗi keyword được định nghĩa **một lần duy nhất**, gồm:
  * Định nghĩa ngắn (1 câu): dùng cho tooltip.
  * Giải thích chi tiết: là nơi click keyword nhảy đến.
  * Link nguồn.
* Trong bullet, keyword chỉ tham chiếu đến id của thuật ngữ. Tooltip lấy nội dung từ glossary bằng JS, agent không phải viết lại định nghĩa ở mỗi chỗ dùng.
* Keyword được link đến glossary của chủ đề mình hoặc glossary chung. Không link đến glossary của chủ đề khác.
* Thuật ngữ đang ở glossary của một chủ đề, khi chủ đề thứ 2 cũng cần → chuyển sang glossary chung.

## 4. Nguồn

* Mỗi bullet L1 phải có ít nhất 1 link nguồn. Không có nguồn → đánh dấu `[Suy luận]` (ý agent tự rút ra, không có trong nguồn).
* Lưu bản sao nguồn ở máy: `knowledge/sources/<tên-nguồn>.html`, dùng chung cho mọi chủ đề, để một nguồn chỉ lưu một lần. Lý do: trang web có thể đổi nội dung hoặc biến mất, và cho phép đọc offline.
* Link nguồn trỏ đến **đúng đoạn văn**, không chỉ đến đầu trang:
  * Khi lưu bản sao, agent bọc đoạn văn được trích dẫn bằng `<mark id="q-3">…</mark>`.
  * Link nguồn có dạng `../sources/abc.html#q-3`. Mở ra là cuộn đến và tô sáng đúng đoạn đó.
  * Không dùng text fragment (`#:~:text=`) vì hỗ trợ trên `file://` không ổn định giữa các trình duyệt.
* Link nguồn hiện kèm URL gốc, để vẫn mở được bản online.
* Mọi loại nguồn đều được lưu thành HTML, để dùng chung một cách link `#q-…`:
  * **Trang web**: lưu nội dung chính (bỏ menu, quảng cáo, footer).
  * **PDF**: convert sang HTML, giữ heading, danh sách, bảng. Mỗi trang PDF có một anchor `#page-<số>`, để link nguồn vẫn ghi được số trang gốc.
  * **Video**: trích xuất nội dung (phụ đề có sẵn, hoặc chuyển giọng nói thành văn bản) rồi convert sang HTML.
    * Mỗi đoạn có mốc thời gian, ví dụ `[12:34]`.
    * Mốc thời gian là link đến video gốc tại đúng thời điểm đó (ví dụ `?t=754` với YouTube).
    * Link nguồn trong bản tóm tắt hiện kèm mốc thời gian.
* Tác dụng phụ quan trọng: bắt agent trích nguyên văn giúp phát hiện ý bị bịa (hallucination). Ý nào không tìm được đoạn trích tương ứng thì không được ghi như sự thật.

## 5. Cách agent tạo file

* Agent **không** viết CSS/JS. Agent chỉ viết nội dung bằng một bộ tag HTML cố định:
  * `<details><summary>ý L1</summary>giải thích L2</details>`: bullet có thể expand (native HTML, không cần JS).
  * `<a class="term" href="#term-xyz">keyword</a>`: tham chiếu thuật ngữ.
  * `<a class="src" href="../sources/abc.html#q-3"></a>`: link nguồn. Build tự điền số `[n]` theo thứ tự trong mục Nguồn.
* Agent viết `content.html`; script build sinh `index.html`: ghép nội dung với CSS/JS dùng chung (inline vào file) → ra 1 file HTML tự chứa, mở được bằng double-click.
* Build chép định nghĩa ngắn của thuật ngữ và nguyên văn đoạn trích vào file (thuộc tính `data-*`). Lý do: trang mở bằng `file://` không đọc được file khác bằng JS, nên tooltip không tự lấy nội dung từ glossary chung hay từ bản lưu nguồn được.
* Lý do:
  * Agent tốn ít token hơn, ít lỗi hơn.
  * Giao diện đồng nhất giữa các file.
  * Sửa giao diện một lần, build lại là mọi file đều được cập nhật.
* Một script kiểm tra (giống `check-links.mjs` của code2srs) báo lỗi khi:
  * Link nguồn hoặc anchor `#q-…` không tồn tại.
  * Keyword tham chiếu đến thuật ngữ chưa định nghĩa.
  * Bullet L1 không có nguồn và không có đánh dấu `[Suy luận]`.

## 6. Cấu trúc thư mục

```
knowledge/
  index.html              # build sinh: danh sách các chủ đề, có ô tìm kiếm
  glossary/
    content.html          # agent viết: thuật ngữ chung
    index.html            # build sinh
  <chủ-đề>/
    content.html          # agent viết
    index.html            # build sinh: file tóm tắt để đọc
  sources/
    <tên-nguồn>.html      # bản sao nguồn, đã gắn <mark id="q-…">
```

## 7. Cấu trúc một file tóm tắt

1. Header: tiêu đề, ngày tạo/cập nhật, danh sách nguồn, nút đổi mode.
2. TL;DR (L0).
3. Các mục kiến thức (L1 + L2), chia theo heading.
4. Câu hỏi mở: những điểm nguồn chưa trả lời hoặc các nguồn mâu thuẫn nhau.
5. Thuật ngữ.
6. Nguồn: danh sách đầy đủ, kèm URL gốc và ngày lưu.

## 8. Khi có nguồn mới về cùng chủ đề

* Mặc định: cập nhật file cũ. Nếu người dùng nói cụ thể (tạo file mới, hoặc cập nhật file nào) thì làm theo người dùng.
* Khi cập nhật file cũ:
  * Lưu nguồn mới vào `sources/` như các nguồn khác.
  * Ý mới: thêm vào đúng mục theo heading, không dồn xuống cuối file.
  * Ý trùng với ý đã có: không viết lại, chỉ thêm link nguồn mới vào bullet đó.
  * Nguồn mới mâu thuẫn với ý đã có: giữ cả hai, ghi vào mục Câu hỏi mở.
  * TL;DR: viết lại nếu nguồn mới làm thay đổi ý tổng quan.
  * Cập nhật ngày cập nhật và danh sách nguồn ở header.
