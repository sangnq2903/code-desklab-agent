---
name: html-to-figma
description: Chuyển file HTML design (mobile UI nhiều màn) thành các frame Figma qua Talk to Figma MCP rồi nối prototype flow bằng plugin Flow Wirer. Dùng khi người dùng gửi/đề cập file HTML design và muốn vẽ vào Figma, "html sang figma", "đưa UI lên Figma", "nối prototype flow". Tài khoản Figma Free.
---

# HTML → Figma (Talk to Figma MCP + Flow Wirer)

Người dùng gửi 1 file/thư mục HTML. Mục tiêu: mỗi màn hình = 1 frame Figma 390x844, layer đặt tên theo id/class HTML, kèm `flow.json` để plugin Flow Wirer nối prototype. Tài khoản Free: KHÔNG dùng REST/Dev Mode/Figma MCP chính thức — chỉ Talk to Figma.

Trả lời bằng tiếng Việt. Chỉ dừng hỏi ở các bước **[CẦN TÔI]**.

## Bước 0 — Kiểm tra hạ tầng (idempotent, chỉ làm phần thiếu)
1. `export PATH="$HOME/.bun/bin:$PATH"`; `bun --version`. Thiếu → `curl -fsSL https://bun.sh/install | bash`.
2. `~/talk-to-figma` chưa có → `git clone https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp.git ~/talk-to-figma && cd ~/talk-to-figma && bun install`; có rồi → `git pull`.
3. MCP: các tool `mcp__TalkToFigma__*` có trong session không? Không có → kiểm tra `claude mcp list` (binary có thể không trong PATH: tìm `~/Library/Application Support/Claude/claude-code/*/claude.app/Contents/MacOS/claude`). Chưa đăng ký → `claude mcp add TalkToFigma -s user -- bunx cursor-talk-to-figma-mcp@latest`. Đã đăng ký nhưng tool chưa hiện → bảo người dùng thoát và mở lại phiên.
4. Relay: `lsof -nP -iTCP:3055 -sTCP:LISTEN`. Không listen → chạy `~/talk-to-figma/start.sh` (nếu thiếu script: `nohup bun socket > ~/talk-to-figma/socket.log 2>&1 &` trong ~/talk-to-figma). Port bị tiến trình lạ chiếm → báo người dùng.
5. Plugin Flow Wirer (manifest.json, code.js, ui.html) nằm ở thư mục `flow-wirer/` của repo sangnq-skills: `~/.claude/plugins/marketplaces/sangnq-skills/flow-wirer/` (hoặc `./flow-wirer/` nếu đang ở repo). Dùng đường dẫn nào tồn tại; gọi là `<FLOW_WIRER>` bên dưới.

## Bước 1 — [CẦN TÔI] Kết nối Figma
Hướng dẫn ngắn: Figma desktop → Plugins → Development → Import plugin from manifest:
- `~/talk-to-figma/src/cursor_mcp_plugin/manifest.json`
- `<FLOW_WIRER>/manifest.json` (đưa đường dẫn tuyệt đối thật cho người dùng)
Mở 1 file Figma, chạy plugin **Talk to Figma**, gửi channel ID. Chờ → `join_channel` → `get_document_info` xác nhận.

## Bước 2 — Phân tích HTML, [CẦN TÔI] duyệt
Đọc toàn bộ HTML/CSS/JS. Nếu không thấy file HTML, hỏi đường dẫn. Liệt kê: số màn hình (kể cả màn ẩn/hiện bằng JS: `.screen`, `[hidden]`, `display:none`, section, tab, modal), tên từng màn, các nút chuyển màn (onclick/href/addEventListener/router). Chờ người dùng OK.

## Bước 3 — Vẽ
- Mỗi màn 1 frame 390x844, xếp ngang cách nhau 100px, tên frame = id/section HTML (ví dụ `screen-home`).
- **Không để các màn hình đè lên nhau.** Trước khi vẽ, đọc các frame top-level đang có trên page (`get_document_info`/`get_node_info`) rồi đặt màn mới ở x = mép phải frame ngoài cùng + 100, cùng y; nếu page trống thì màn i đặt ở x = i × (390 + 100). Không đặt tọa độ trùng vùng của frame khác. Sau khi vẽ xong mỗi màn và trước khi kết thúc, kiểm tra lại vị trí/kích thước mọi frame: không cặp nào giao nhau, khoảng cách ≥ 100px; nếu đè thì dời frame vừa vẽ (không dời/xoá frame cũ của người dùng).
- flex/grid → auto-layout; giữ đúng màu, font-size, font-weight, padding, gap, radius theo CSS. Font thiếu → Inter và ghi chú lại.
- **Tên layer = id/class HTML** (btn-login, tab-profile…) — bắt buộc, vì flow nối theo tên. Tên layer trong 1 frame phải duy nhất cho các phần tử có link.
- **Icon: không bao giờ để trống.** Icon trong HTML (inline `<svg>`, icon font, emoji, `<img>` không tải được) phải có mặt trong Figma: inline SVG → dựng lại vector đúng path nếu tool hỗ trợ; icon font/ảnh thiếu → tự vẽ bản tương đương từ shape/path (24x24, stroke 2px, nhất quán), đặt tên `icon-<tên>`. Không để ô rỗng hay khối màu trơn; ghi các icon xấp xỉ vào danh sách ở Bước 5.
- Vẽ từng màn một; xong mỗi màn gọi `get_node_info` kiểm tra rồi mới sang màn tiếp.
- Lỗi socket/timeout → thử lại (tối đa 3 lần). Lỗi "Must join a channel" → báo người dùng, không tự đoán channel.

## Bước 4 — Xuất flow.json
**Nếu HTML đã có luồng chuyển màn thì flow.json phải bám y chang HTML**: mỗi `onclick`/`href="#..."`/`addEventListener`/router/hàm `showScreen(...)`/`history.back()` → đúng 1 link tương ứng (nút nào, đích nào, `BACK` cho quay lại). Không thêm link tự nghĩ ra, không bỏ link nào có trong HTML, không đổi đích, `start` = màn hiển thị đầu tiên trong HTML. Link nào không suy ra chắc chắn (đích động, phụ thuộc điều kiện/dữ liệu) thì không đoán: bỏ ra khỏi flow.json và liệt kê ở Bước 5. Nếu người dùng đã duyệt danh sách nút chuyển màn ở Bước 2, flow.json phải khớp đúng danh sách đó.
Phân tích onclick/href/JS chuyển màn, ghi `./flow.json` cạnh file HTML:
```json
{ "start": "<FrameName>", "links": { "<FrameName>/<layerName>": "<FrameĐích>" | "BACK" } }
```
Tên frame/layer phải khớp chính xác với Figma (đối chiếu bằng `get_node_info`/`scan_text_nodes` nếu cần).

## Bước 5 — Kết thúc
In ra:
1. Nội dung `flow.json` (để dán vào plugin Flow Wirer → chọn transition → "Nối flow").
2. Danh sách chỗ chưa chuyển chính xác: font, ảnh, hiệu ứng CSS (shadow/blur/gradient phức tạp, animation), logic JS (state, điều kiện, dữ liệu động).
3. Nhắc: Share → can view; Present ▶ → Share prototype.
