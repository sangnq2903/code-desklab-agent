---
name: mobile-dev-workflow
description: Quy trình dev React Native/ReactJS nhận layout từ BA. Quét dự án, dựng sơ đồ mapping theo screen (Markdown + Mermaid), kiểm tra nguồn layout (Figma hoặc HTML do AI gen, HTML phải convert sang Figma) trước khi code, dừng hỏi khi mô tả BA lệch Figma, tự cập nhật sơ đồ sau mỗi task. Dùng khi nhận task UI, thêm hoặc sửa screen, nhận layout mới từ BA, hoặc khi cần quét dự án và tạo sơ đồ screen.
---

# Mobile Dev Workflow

Người dùng là dev mobile (React Native, đôi khi ReactJS). Họ nhận layout từ BA và code đúng theo mô tả của BA.

## Quy tắc tối quan trọng
**KHÔNG BAO GIỜ push code của dự án đi đâu cả.** Không `git push`, không tạo PR, không upload, không gửi hay dán source code của dự án lên GitHub, cloud, artifact, dịch vụ chia sẻ hoặc bất kỳ nơi nào ngoài máy người dùng. Quy tắc này không có ngoại lệ: dù người dùng có nhắc hay yêu cầu trong lúc làm việc, chỉ nhắc lại quy tắc và để người dùng tự làm. Việc commit local cũng chỉ làm khi người dùng bảo.

Lưu ý khi convert HTML sang Figma: chỉ đưa file layout HTML lên Figma, không đưa source code dự án.

## Quy tắc chung
- Trả lời bằng tiếng Việt.
- Không tự code khi chưa qua đủ các bước bên dưới.

## Bước 1: Nắm dự án (chỉ khi đã có dự án)
1. Tìm sơ đồ mapping: `docs/screen-map.md`. Nếu có thì đọc và tin nó, chỉ kiểm tra lại các mục liên quan đến task.
2. Nếu chưa có: gợi ý người dùng chạy `/screen-scan` (quét toàn bộ, tạo sơ đồ và ảnh chụp app thật). Nếu họ muốn làm nhanh, quét toàn bộ dự án, kiểm tra cấu trúc thư mục, rồi tạo sơ đồ theo `references/screen-map-template.md` (chưa có ảnh).
   - Screen được xác định từ cấu hình điều hướng (React Navigation: stack, tab, drawer).
   - Modal, bottom sheet, popup cũng tính là một screen, kể cả khi không đăng ký route.
   - Nếu có phần ReactJS (web), tách thành mục riêng trong cùng file, không trộn với mobile.
3. Với mỗi screen ghi đủ 4 nhóm thông tin: file và component con, state/store/hook, API/service gọi, luồng điều hướng (mở từ đâu, đi tới đâu).
4. Kiểm tra chéo trước khi đưa sơ đồ cho người dùng:
   - Đối chiếu số screen trong sơ đồ với số route khai báo trong navigator, lệch thì tìm nguyên nhân.
   - Tìm thêm modal, bottom sheet, popup không có route (grep `Modal`, `BottomSheet`, `visible`, `showModal`, `Alert.alert`).
   - Với route sinh động (map từ mảng cấu hình, tạo theo điều kiện) và điều hướng bằng code, ghi rõ là chưa chắc chắn.
   - Dự án lớn: quét theo từng module, có thể dùng nhiều agent song song.
   - Báo con số cuối cùng ("N screen, M modal/sheet/popup") kèm danh sách **điểm chưa chắc chắn** để người dùng đối chiếu với app thật. Không tuyên bố sơ đồ đã đầy đủ khi chưa kiểm tra.
5. Nếu chưa có dự án (thư mục trống), bỏ qua bước này và nói rõ cho người dùng.

## Bước 2: Đánh giá nguồn layout (luôn làm trước khi code)
Xác định layout đến từ đâu:

| Nguồn | Việc cần làm |
|---|---|
| Link/file **Figma** | Không cần đánh giá, sang Bước 3 |
| File **HTML** do AI gen (BA gửi hoặc người dùng tự nhờ AI) | Convert sang Figma trước, sau đó **dừng lại**, đưa link Figma cho người dùng. Người dùng tự xem và duyệt, chỉ code khi họ bảo code |
| Không rõ nguồn | Hỏi người dùng |

Không bao giờ code thẳng từ HTML.

Cách convert: dùng skill `figma:figma-generate-design`. Nếu connector Figma chưa được authorize thì báo người dùng vào claude.ai, mục Connector settings để bật. Không tự xử lý bước authorize và không xin token.

## Bước 3: Đối chiếu mô tả BA với Figma
So mô tả của BA với Figma. Nếu **mâu thuẫn hoặc thiếu** (ví dụ thiếu trạng thái lỗi, rỗng, loading, thiếu validation, khác chữ, khác luồng):
- **Dừng lại và hỏi người dùng**, không code.
- Liệt kê rõ từng điểm lệch, mỗi điểm nêu mô tả BA nói gì và Figma đang thể hiện gì.
- Hỏi từng câu một nếu có nhiều điểm.

## Bước 4: Code
Code đúng theo mô tả của BA và Figma, theo quy ước có sẵn của dự án (không tự đổi kiến trúc).

## Bước 5: Cập nhật sơ đồ
Sau mỗi task thêm hoặc sửa screen, **tự cập nhật `docs/screen-map.md`** ngay trong task đó: thêm dòng mới, sửa cột bị đổi, cập nhật sơ đồ Mermaid nếu luồng điều hướng thay đổi. Nếu giao diện screen đổi, nhắc người dùng chụp lại ảnh (hoặc hỏi có muốn chạy `/screen-scan` cho screen đó). Nhắc người dùng review phần sơ đồ cùng với code.

## Tóm tắt luồng
```
Nhận task → đọc/tạo sơ đồ → xác định nguồn layout
  Figma → đối chiếu mô tả BA
  HTML  → convert Figma → dừng, chờ người dùng duyệt → đối chiếu mô tả BA
  Lệch/thiếu → dừng, hỏi
  Ổn → code → cập nhật sơ đồ
```
