# Pet Phết – UI refinement update

## Các cập nhật giao diện

- Cửa sổ đăng nhập/đăng ký dùng ảnh mascot theo chế độ `contain`, tránh crop ảnh ở panel bên trái.
- Panel biểu mẫu đăng nhập/đăng ký có vùng cuộn riêng trên desktop; ở màn hình nhỏ, toàn bộ modal có thể cuộn dọc.
- Bấm ra ngoài modal dịch vụ hoặc nhấn `Esc` để đóng; thẻ dịch vụ mở chi tiết khi bấm bất kỳ vùng nào trên thẻ. Nút Đặt lịch vẫn là thao tác riêng.
- Điều chỉnh chiều rộng và cỡ chữ banner trang chủ để hạn chế rơi chữ.
- Logo Pet Phết được dùng trong header, footer và auth panel.
- Footer có lớp nền sáng bán trong suốt giúp tăng độ tương phản; bỏ các chấm palette màu.
- Chatbot dùng hình Cún Phết đeo headset và mở rộng bộ FAQ theo dịch vụ, bảng giá, cân nặng, giờ làm việc, đặt/đổi/hủy lịch, QR/COD, hồ sơ, đánh giá, Pet Point, vaccine, triệt sản và chăm sóc cơ bản.
- Toast thành công/thất bại chỉ còn nội dung văn bản và nút đóng, không còn panel ảnh minh họa.

## Chạy xem trước

```bash
npm install
npm run dev
```

Mở URL Vite in trong Terminal (thường là `http://localhost:3000/`).

## Build cho GitHub Pages

```bash
npm run build:github
```

Bản build được tạo trong `dist/`.

## Ghi chú chatbot

Chatbot hiện là trợ lý FAQ chạy ở trình duyệt, sử dụng nhận diện ý định/cụm từ và dữ liệu dịch vụ cục bộ. Chatbot không gọi mô hình AI bên ngoài và không thay thế tư vấn của bác sĩ thú y. Muốn hội thoại tự do kiểu AI cần tích hợp API qua backend an toàn.

## Trạng thái kiểm tra

- Đã kiểm tra cú pháp TS/TSX bằng TypeScript transpilation.
- Đã kiểm tra đường dẫn import tương đối trong `src/`.
- Đã kiểm tra các tham chiếu `ASSETS` và sự tồn tại của 17 asset thương hiệu.
- Chưa xác nhận full Vite production build trong môi trường tạo gói này vì bước cài npm dependencies bị timeout. Trên máy phát triển, chạy `npm install` rồi `npm run dev` để kiểm tra giao diện thực tế.
