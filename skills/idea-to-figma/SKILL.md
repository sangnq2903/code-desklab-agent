---
name: idea-to-figma
description: Từ mô tả bằng lời của người dùng (app/màn hình/luồng) tự thiết kế UI mobile trực tiếp trên Figma qua Talk to Figma MCP, rồi nối prototype flow bằng plugin Flow Wirer. Dùng khi người dùng nói "thiết kế app ... trên Figma", "vẽ giúp màn hình ...", "tạo design từ mô tả", "design trên figma luôn". Không có file HTML sẵn (nếu có HTML thì dùng html-to-figma). Tài khoản Figma Free.
---

# Mô tả → Design trên Figma (Talk to Figma MCP + Flow Wirer)

Người dùng mô tả ý tưởng; bạn tự quyết định layout/màu/chữ và vẽ thẳng vào Figma. Không có Figma MCP chính thức/Dev Mode (tài khoản Free) — chỉ dùng Talk to Figma. Trả lời tiếng Việt. Chỉ dừng hỏi ở các bước **[CẦN TÔI]**.

## Bước 0 — Hạ tầng và kết nối
Làm đúng như skill `html-to-figma` (Bước 0 + Bước 1): kiểm tra Bun, `~/talk-to-figma`, MCP `TalkToFigma`, relay port 3055 (`~/talk-to-figma/start.sh`), import 2 plugin (Talk to Figma + Flow Wirer ở `flow-wirer/` của repo sangnq-skills), **[CẦN TÔI]** gửi channel ID → `join_channel` → `get_document_info`. Chỉ bổ sung phần thiếu. Tool `mcp__TalkToFigma__*` chưa có → bảo người dùng mở lại phiên.

## Bước 1 — Chốt brief, [CẦN TÔI] duyệt
Không hỏi dồn. Chỉ hỏi những gì thực sự thiếu (tối đa 3 câu, mỗi câu kèm gợi ý mặc định): loại app, đối tượng, phong cách/màu chủ đạo, số màn.
Nếu cần cảm hứng phong cách/màu/font → dùng skill `ui-ux-pro-max`.
Sau đó đưa bản đề xuất ngắn và chờ OK:
- Design tokens: bảng màu (primary, secondary, background, surface, text, muted, danger), font (mặc định Inter), cỡ chữ (title 24/700, heading 18/600, body 15/400, caption 12/400), spacing 4/8/12/16/24, radius (8/12/16), nút cao 48.
- Danh sách màn (tên frame kebab-case, vd `screen-home`), mục đích và các phần tử chính từng màn.
- Luồng bấm: nút nào → màn nào.

## Bước 2 — Vẽ
- Mỗi màn 1 frame 390x844, xếp ngang cách 100px, đặt tên theo danh sách đã duyệt. Đầu tiên tạo 1 frame nháp để thử tokens; ổn thì mới nhân ra các màn.
- **Không để các màn hình đè lên nhau.** Trước khi vẽ, đọc các frame top-level đang có trên page (`get_document_info`/`get_node_info`) rồi đặt màn mới ở x = mép phải frame ngoài cùng + 100, cùng y; nếu page trống thì màn i đặt ở x = i × (390 + 100). Không đặt tọa độ trùng vùng của frame khác. Sau khi vẽ xong mỗi màn và trước khi kết thúc, kiểm tra lại vị trí/kích thước mọi frame: không cặp nào giao nhau, khoảng cách ≥ 100px; nếu đè thì dời frame vừa vẽ (không dời/xoá frame cũ của người dùng).
- Dùng auto-layout dọc/ngang, padding 16–24, gap theo tokens; safe area: chừa 47px trên (status bar), 34px dưới (home indicator). Tab bar/nav bar nhất quán giữa các màn.
- Chất lượng: một hành động chính mỗi màn, tương phản chữ/nền ≥ 4.5:1, vùng chạm ≥ 44px, chữ không dưới 12px, không dùng emoji làm icon, nội dung mẫu thật (tên, số, giá) thay vì "Lorem ipsum".
- **Tên layer bắt buộc có nghĩa** cho mọi phần tử tương tác: `btn-login`, `tab-profile`, `card-product-1`… (duy nhất trong frame) — dùng để nối flow.
- Vẽ từng màn; xong mỗi màn gọi `get_node_info` kiểm tra (kích thước, text không bị cắt, tên layer) rồi mới sang màn sau. Lỗi socket/timeout thử lại tối đa 3 lần; "Must join a channel" → báo người dùng.
- **Icon: không bao giờ để trống.** Phần tử nào cần icon mà chưa có sẵn thì tự tạo: dựng vector từ shape/path (vd home = tam giác + hình chữ nhật, search = ellipse + line, back = chevron bằng line/`create_vector` nếu tool hỗ trợ), kích thước 24x24, stroke 2px, cùng một bộ nét/màu nhất quán, gom thành frame/component đặt tên `icon-<tên>`. Không dùng ô vuông rỗng, khối màu trơn hay để chỗ trống; icon quá phức tạp thì vẽ bản đơn giản hoá rồi ghi vào danh sách xấp xỉ ở Bước 4.
- Ảnh/avatar: dùng khối màu placeholder có tên `img-...`, không tự tải ảnh.

## Bước 3 — Xuất flow.json
Từ luồng đã duyệt, ghi `./flow.json`:
```json
{ "start": "<FrameName>", "links": { "<FrameName>/<layerName>": "<FrameĐích>" | "BACK" } }
```
Tên phải khớp chính xác với Figma (đối chiếu qua `get_node_info`).

## Bước 4 — Kết thúc
In ra:
1. Tóm tắt design: tokens đã dùng, danh sách frame.
2. Nội dung `flow.json` để dán vào plugin Flow Wirer (chọn transition → "Nối flow").
3. Những chỗ là placeholder/xấp xỉ (icon, ảnh, font thay thế).
4. Nhắc: Share → can view; Present ▶ → Share prototype. Hỏi có muốn chỉnh màn nào không; chỉnh xong thì cập nhật flow.json nếu tên đổi.
