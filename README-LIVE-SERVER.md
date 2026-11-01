# Chạy Pet Phết bằng VS Code Live Server

## Chuẩn bị lần đầu

Source hiện tại dùng React + TypeScript + Vite. Live Server không biên dịch trực tiếp file `.tsx`, vì vậy cần tạo bản website tĩnh một lần trước khi mở bằng Live Server.

1. Giải nén toàn bộ ZIP.
2. Cài Node.js LTS nếu máy chưa có Node.js và npm.
3. Đảm bảo máy có Internet để tải các thư viện lần đầu.
4. Nhấp đúp `BUILD-LIVE-SERVER.bat` trong thư mục `pet_phet_rebuild`. File này sẽ chạy `npm install` và `npm run build:live-server`.
5. Khi cửa sổ báo `HOAN TAT`, mở VS Code → **File → Open Folder...** → chọn riêng thư mục `pet_phet_rebuild/live-server`.
6. Cài extension **Live Server** của Ritwick Dey nếu chưa có.
7. Mở `index.html` trong thư mục `live-server`, nhấp chuột phải và chọn **Open with Live Server**.
8. Website sẽ mở tại địa chỉ dạng `http://127.0.0.1:5500`.

**Quan trọng:** Phải mở riêng thư mục `live-server` làm workspace root để các đường dẫn `/assets/...` trỏ đúng tài nguyên. Không mở file `src/main.tsx` hoặc `pet_phet_rebuild/index.html` của source bằng Live Server vì đây là mã React/TypeScript chưa biên dịch.

## Khi bạn chỉnh sửa source và muốn cập nhật bản Live Server

Mở Terminal tại thư mục `pet_phet_rebuild` (thư mục chứa `package.json`) và chạy:

```bash
npm install
npm run build:live-server
```

Sau khi build xong, mở lại thư mục `live-server` bằng Live Server. Nếu bạn chỉ chỉnh HTML/CSS/JS trong thư mục `live-server` thì Live Server sẽ tự cập nhật; nếu chỉnh React/TypeScript trong `src`, cần build lại.

## Để gửi website cho người khác

- Sau khi build thành công, có thể gửi riêng thư mục `live-server` (nén ZIP). Người nhận giải nén, mở riêng thư mục đó trong VS Code và chạy Live Server; họ không cần cài Node.js nếu chỉ xem bản đã build.
- Live Server chủ yếu phục vụ trên máy người chạy. Muốn người khác truy cập qua Internet bằng một đường link công khai, cần đưa nội dung thư mục `live-server` lên dịch vụ hosting tĩnh (ví dụ Netlify, Cloudflare Pages hoặc GitHub Pages).
- Bản hiện tại là prototype frontend: dữ liệu lưu trong `localStorage` của từng trình duyệt, không tự đồng bộ giữa người dùng hoặc máy tính. Đăng nhập demo và phân quyền giao diện không thay thế xác thực/phân quyền ở backend. Khi triển khai thật cần API + database + RBAC phía máy chủ.

## Tài khoản demo

| Khu vực đăng nhập | Email | Ghi chú |
|---|---|---|
| Khách hàng demo | `khachhang@petphet.vn` | Mật khẩu: `petphet123` |
| Quản trị viên | Do chủ hệ thống cấp riêng | Không đăng ký công khai, không hiển thị thông tin đăng nhập trong giao diện |

Chọn đúng tab Khách hàng hoặc Quản trị viên ở cửa sổ đăng nhập. Đăng ký mới chỉ tạo tài khoản Khách hàng. Tài khoản Khách hàng không thể tự nâng quyền để mở màn hình Admin. Source demo có dữ liệu thử nghiệm dành cho người phát triển; không phát hành nguyên cấu hình tài khoản demo khi vận hành thật. Phân quyền thực tế phải được kiểm tra ở backend, không thể bảo vệ chỉ bằng giao diện hoặc mã JavaScript phía trình duyệt.
