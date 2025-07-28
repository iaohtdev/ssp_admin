# 🎯 Dự án: Ét O Ét – Dashboard Quản Lý Câu Hỏi & Trò Chơi

## 🧩 Mô tả dự án

Ét O Ét là một ứng dụng trò chơi tiệc tùng (party game) hiện đại, nơi người dùng có thể lựa chọn nhiều trò chơi khác nhau như Truth or Dare hay Vòng Quay Định Mệnh để khuấy động không khí buổi tụ tập.

Dashboard này dùng để:

- Quản lý các **trò chơi** (games)
- Quản lý các **danh mục** (categories) tương ứng với từng trò chơi
- Tạo và cập nhật **gói nội dung** (packs)
- Thêm, sửa, xoá các **câu hỏi, thử thách, hình phạt** (questions)
- Quản lý trạng thái hiển thị, mức độ phổ biến (like/dislike)

## 🧱 Cấu trúc hệ thống

### 1. `games`

- Chứa thông tin về các trò chơi chính (ví dụ: Truth or Dare, Vòng Quay Định Mệnh)
- Là bảng gốc liên kết đến categories, packs, questions

### 2. `categories`

- Danh mục con tương ứng với logic trò chơi
- Mỗi trò chơi có hệ thống danh mục riêng biệt
  - Truth or Dare: Sự Thật, Thử Thách, Hình Phạt
  - Vòng Quay: 8 danh mục như Đáp Thật, Làm Hoặc Nhục, Uống Ngay, v.v.

### 3. `packs`

- Gói nội dung chứa câu hỏi/thử thách, phân theo chủ đề: Bạn bè, 18+, Công sở,...
- Có thể là miễn phí hoặc premium (sau này gắn với tính năng thanh toán)

### 4. `questions`

- Câu hỏi/thử thách/hình phạt đều được lưu tại đây
- Liên kết đến `categories` và `packs`
- Có metadata: like, dislike, is_favorite, is_active...

---

## 📊 Quy tắc vận hành

- Câu hỏi sẽ thuộc 1 `pack`, 1 `category`, và gián tiếp thuộc `game`
- Một `category` chỉ thuộc 1 game
- `questions` có thể là "truth", "dare", hoặc "penalty" — nhưng không cần bảng riêng, chỉ cần phân biệt qua `category_id`
- Hệ thống phân quyền (user, auth...) sẽ triển khai sau giai đoạn đầu (tạm chưa cần login)

---

## 💡 Phát triển tương lai

- Tích hợp chức năng **quản lý user** để hỗ trợ thanh toán, lưu câu hỏi yêu thích
- Thêm khả năng **upload câu hỏi** từ cộng đồng
- Bảng `ads_config` để cấu hình quảng cáo (AdMob/Meta)
- Bảng `reports` nếu muốn cho phép người dùng báo cáo câu hỏi phản cảm

---

## 📎 Các bảng chính

- `games`: id, name, slug, description, is_active
- `categories`: id, game_id, name, slug, icon, color, is_active
- `packs`: id, game_id, name, slug, is_premium, is_active
- `questions`: id, pack_id, category_id, content, is_active, like_count, dislike_count, is_favorite

---

## ✅ Ghi chú triển khai

- Tên game và category phải `unique`
- `slug` dùng để chuẩn hóa đường dẫn/api
- Tận dụng subquery khi insert nếu cần logic linh hoạt
- UUID được tự động sinh – không nên hardcode

---
