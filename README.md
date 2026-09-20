# mobile-dev-workflow

Plugin Claude Code cho dev React Native nhận layout từ BA. Gồm 3 skill và 4 agent.

## Cài đặt (sau khi push repo lên GitHub)

Dùng được trong Claude Code CLI và extension Claude Code cho VS Code. Trong khung chat gõ:

```
/plugin marketplace add <github-user>/<repo>
/plugin install mobile-dev-workflow@sangnq-skills
```

Sau khi cài, khởi động lại session (hoặc chạy `/reload-plugins` nếu có) để nạp skill và agent.

## Sử dụng

| Lệnh | Việc |
|---|---|
| `/mobile-dev-workflow` | Quy trình nhận layout: quét dự án, sơ đồ screen, kiểm tra Figma/HTML, code |
| `/screen-scan` | Chạy lần đầu sau khi cài: quét toàn bộ screen, tạo `docs/screen-map.md` và ảnh chụp app thật trên iOS Simulator (`docs/screens/`) |
| `/squad <yêu cầu hoặc bug>` | Chạy biệt đội Planner → Coder → Tester → Reviewer |

**Lần đầu dùng:** mở app trên iOS Simulator, tự đăng nhập bằng tài khoản test, rồi chạy `/screen-scan`. Claude sẽ không nhập mật khẩu và không bấm các nút có tác dụng phụ (xoá, thanh toán, gửi thật).

Ví dụ:

```
/squad Thêm màn hình đổi mật khẩu theo Figma <link>, mô tả BA: ...
/squad Fix bug: bấm back ở màn Checkout bị crash
```

## Biệt đội

```
Yêu cầu → PLANNER → [bạn duyệt kế hoạch] → CODER → TESTER → REVIEWER → báo cáo (không push)
          Tester FAIL / Reviewer CẦN SỬA → quay lại CODER (tối đa 3 vòng)
```

| Vai | Quyền | Việc |
|---|---|---|
| Planner | chỉ đọc | Phân tích, kiểm tra layout, lập kế hoạch |
| Coder | đọc + sửa code | Hiện thực kế hoạch đã duyệt |
| Tester | đọc + chỉ sửa file test | Tìm lỗi, chạy test/lint |
| Reviewer | chỉ đọc | Chốt chặn theo 5 trục |

## Cấu trúc

```
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
agents/planner.md, coder.md, tester.md, reviewer.md
skills/mobile-dev-workflow/SKILL.md
skills/mobile-dev-workflow/references/screen-map-template.md
skills/screen-scan/SKILL.md
skills/squad/SKILL.md
```

## Quy tắc quan trọng
- KHÔNG BAO GIỜ push code dự án đi đâu. Quy tắc nằm trong mọi agent và skill.
- Convert HTML sang Figma cần bật connector Figma trong claude.ai, mục Connector settings.
