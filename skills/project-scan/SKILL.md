---
name: project-scan
description: Quét cấu trúc dự án React Native/ReactJS và ghi kết quả vào docs/project-structure.md (cây thư mục, công nghệ đang dùng, quy ước, điểm bất thường). Dùng khi nhận dự án mới, khi cần hiểu kiến trúc trước khi làm, hoặc khi cấu trúc dự án thay đổi. Không chụp ảnh, không quét screen chi tiết (việc của /screen-scan).
---

# Project Scan: quét cấu trúc dự án

Mục tiêu: có một file `docs/project-structure.md` để mọi người (và các agent) hiểu nhanh dự án tổ chức thế nào, dùng công nghệ gì, quy ước ra sao.

## Quy tắc tối quan trọng
**KHÔNG BAO GIỜ push code của dự án đi đâu cả.** Không `git push`, không tạo PR, không upload, không gửi source ra ngoài máy. Không có ngoại lệ. Skill này chỉ đọc dự án và chỉ ghi duy nhất file `docs/project-structure.md`.

## Quy trình
1. **Xác định gốc dự án.** Thư mục trống hoặc không có `package.json`: báo người dùng, dừng. Nhiều app trong một repo (monorepo): liệt kê từng app.
2. **Đọc cấu hình:** `package.json` (phiên bản React Native/React, dependencies), `tsconfig`/`jsconfig` (path alias), `babel.config`, `metro.config`, `app.json`/`app.config`, cấu hình ESLint/Prettier/Jest, file env mẫu (chỉ đọc tên biến, **không chép giá trị bí mật**).
3. **Cây thư mục:** liệt kê 3 cấp, bỏ qua `node_modules`, `ios/Pods`, `android/build`, `.git`, thư mục build. Ghi vai trò từng thư mục chính.
4. **Nhận diện kiến trúc:** theo tính năng (feature-based) hay theo tầng (screens/components/services); chỗ đặt navigation, store, API, hooks, theme, i18n, assets.
5. **Nhận diện công nghệ:** navigation (React Navigation / Expo Router), state (Redux, Zustand, MobX, Context, React Query), API client, UI library, styling, form, i18n, test, module native, CI.
6. **Quy ước:** cách đặt tên file/component/hook, cách import (alias), cách viết style, cách khai báo type.
7. **Điểm bất thường:** thư mục lộn xộn, code trùng lặp, screen nằm sai chỗ, thư viện trùng chức năng, dependency lỗi thời rõ ràng, file quá lớn. Chỉ ghi khi có bằng chứng (dẫn đường dẫn), không phán đoán chung chung.
8. **Ghi kết quả** vào `docs/project-structure.md` theo khung dưới. Nếu file đã có thì cập nhật, giữ phần người dùng đã sửa tay, ghi rõ mục nào đã đổi.

## Khung `docs/project-structure.md`
````markdown
# Cấu trúc dự án

> Cập nhật lần cuối: <YYYY-MM-DD> · Gốc: <đường dẫn> · Loại: app đơn / monorepo

## 1. Tổng quan
- Nền tảng: React Native <phiên bản> (+ ReactJS nếu có), TypeScript/JavaScript
- Kiến trúc: feature-based | layer-based | khác (mô tả 1-2 câu)

## 2. Cây thư mục chính
| Thư mục | Vai trò | Ghi chú |
|---|---|---|
| `src/screens` | Các màn hình | ... |

## 3. Công nghệ đang dùng
| Mảng | Thư viện | Phiên bản | Đặt ở đâu |
|---|---|---|---|
| Navigation | React Navigation | ... | `src/navigation` |
| State | ... | ... | ... |
| API | ... | ... | ... |

## 4. Quy ước
- Đặt tên: ...
- Import/alias: ...
- Style: ...

## 5. Điểm bất thường (có bằng chứng)
- `<đường dẫn>`: mô tả

## 6. Chưa chắc chắn
- Những điểm chưa xác định được và lý do
````

## Báo cáo cuối
Tóm tắt: kiến trúc, công nghệ chính, số điểm bất thường, các điểm chưa chắc chắn. Gợi ý bước tiếp theo: `/screen-scan` để lập sơ đồ screen và chụp ảnh.
