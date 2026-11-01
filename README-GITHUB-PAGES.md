# Deploy Pet Phết lên GitHub Pages

Bản này đã được cấu hình để chạy ở URL dạng `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/` (GitHub Pages Project Site). Vite dùng `base: './'` và đường dẫn ảnh thương hiệu được tạo từ `import.meta.env.BASE_URL`, tránh lỗi mất CSS/JS/ảnh khi website không nằm ở domain root.

## 1. Đưa source lên GitHub

1. Tạo repository mới trên GitHub, ví dụ `pet-phet`.
2. Giải nén ZIP.
3. Mở thư mục `pet_phet_rebuild` và đưa **toàn bộ nội dung bên trong thư mục này** lên root của repository. Không tạo thêm một tầng `pet_phet_rebuild/pet_phet_rebuild`.
4. Đảm bảo repository có các mục: `.github/workflows/deploy.yml`, `package.json`, `index.html`, `src/`, `public/`. `package-lock.json` được npm tự tạo khi cài dependency và có thể commit thêm để khóa phiên bản thư viện.
5. Commit và push lên nhánh `main`. Nếu GitHub Desktop không hiện thư mục `.github`, bật hiển thị file ẩn hoặc dùng Git CLI để bảo đảm workflow được đưa lên repository.

Có thể dùng GitHub Desktop hoặc lệnh Git trong Terminal:

```bash
git init
git add .
git commit -m "Deploy Pet Phet website"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/TEN-REPOSITORY.git
git push -u origin main
```

Thay `TEN-TAI-KHOAN` và `TEN-REPOSITORY` bằng thông tin repository của bạn. Nếu repo đã được khởi tạo Git, bỏ qua `git init` và cấu hình remote tương ứng.

## 2. Bật GitHub Pages

1. Mở repository trên GitHub.
2. Vào **Settings → Pages**.
3. Ở mục **Build and deployment → Source**, chọn **GitHub Actions**.
4. Vào tab **Actions**, mở workflow `Deploy Pet Phet to GitHub Pages` để xem tiến trình.
5. Khi cả job `build` và `deploy` thành công, website sẽ xuất hiện tại:

```text
https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/
```

Mỗi lần push commit mới lên `main`, GitHub Actions sẽ tự build và deploy lại.

## 3. Build và xem thử trên máy

Yêu cầu Node.js 22 trở lên:

```bash
npm install
npm run build
```

Đầu ra GitHub Pages nằm trong `dist/`. Có thể xem thử bằng:

```bash
npm run preview
```

Nếu vẫn muốn dùng VS Code Live Server, tạo bản build riêng:

```bash
npm run build:live-server
```

Sau đó mở riêng thư mục `live-server` làm workspace root và mở `index.html` bằng Live Server.

## 4. Khắc phục lỗi build thường gặp

- Repository không bắt buộc phải chứa `package-lock.json` với workflow này; GitHub Actions dùng `npm install` để cài thư viện và tự tạo lockfile trong runner.
- `package.json` có `allowScripts.esbuild = true` để cho phép script cài binary của esbuild chạy trong môi trường CI mới có chính sách chặn install scripts. Đây là dependency build tool đã được khai báo rõ; không bật toàn bộ install scripts cho mọi package.
- Nếu đổi tên branch mặc định khỏi `main`, sửa `branches: [main]` trong `.github/workflows/deploy.yml` cho đúng tên branch.

## 5. Các giới hạn cần biết

- Đây là bản frontend demo, dữ liệu nghiệp vụ đang lưu trong `localStorage`, không đồng bộ giữa các thiết bị/người dùng.
- GitHub Pages chỉ host file tĩnh; không chạy trực tiếp Node/Express, SQL Server hay API backend. Muốn dùng chung dữ liệu và bảo vệ quyền Admin thật cần triển khai backend/database riêng.
- Tài khoản đăng nhập demo trong source chỉ phục vụ trình diễn. Không dùng mật khẩu demo hoặc lưu thông tin nhạy cảm trên website công khai.
- QR và OTP hiện là mô phỏng, chưa nối ngân hàng hoặc dịch vụ gửi email thật.
