# Pet Phết – Pet First

Website chăm sóc thú cưng được tái cấu trúc từ nền nghiệp vụ của bản Google AI Studio và thiết kế lại theo bộ nhận diện Pet Phết. Giao diện sử dụng tông kem, nâu, cam, vàng và teal; font Nunito, Be Vietnam Pro và Quicksand; mascot và hình nền thương hiệu được đặt trong `public/assets/brand/`.

## 1. Công nghệ

- React + TypeScript + Vite
- Tailwind CSS 4 và Lucide icons
- Dữ liệu demo lưu trong `localStorage` qua `src/services/store.ts`
- Bộ quy tắc đặt lịch và tính giá ở `src/utils/bookingEngine.ts`
- SQL tham khảo ở `database/` để triển khai backend riêng

## 2. Chạy website

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```bash
npm install
npm run dev
```

Mở địa chỉ được Vite hiển thị (mặc định `http://localhost:3000`). Trang đầu tiên luôn là website công khai; chỉ sau khi đăng nhập, hệ thống mới mở cổng Khách hàng hoặc Admin theo đúng vai trò tài khoản. Tạo bản build bằng:

```bash
npm run build
# đầu ra tĩnh để dùng Open with Live Server nằm trong live-server/
npm run preview
# chạy kiểm thử quy tắc giá, coupon và sức chứa
npm test
```

## 3. Tài khoản demo

| Vai trò | Email | Mật khẩu demo |
|---|---|---|
| Khách hàng | `khachhang@petphet.vn` | `petphet123` |
| Admin | `admin@petphet.vn` | `petphet123` |

Đăng ký tài khoản mới chỉ tạo tài khoản Khách hàng. Để vào Admin, phải chọn tab Quản trị viên và đăng nhập bằng tài khoản Admin hợp lệ. Không có nút tự chuyển vai trò ở khu vực Khách hàng. Dữ liệu demo được lưu cục bộ trong localStorage, nên không tự đồng bộ giữa các máy hoặc trình duyệt.

## 4. Chức năng đã tích hợp

### Khách hàng

- Trang chủ, xem danh mục và chi tiết dịch vụ; tìm kiếm, lọc danh mục, xem giá và đánh giá.
- Đăng ký, đăng nhập demo, quên mật khẩu OTP demo, chỉnh sửa hồ sơ và cài đặt thông báo.
- Quản lý nhiều hồ sơ thú cưng; xem lịch sử các dịch vụ đã hoàn thành của từng bé.
- Đặt lịch theo dịch vụ, thú cưng, ngày, giờ, cân nặng, mã giảm giá, ghi chú và COD/QR.
- Kiểm tra ngày/giờ hợp lệ, giờ mở cửa, thời lượng dịch vụ, loài thú cưng và sức chứa xuyên suốt các khung giờ liên tiếp.
- Xem lịch sử, đổi/hủy lịch theo trạng thái; gửi yêu cầu đối chiếu QR.
- Đánh giá sau khi đơn hoàn thành; sửa/xóa đánh giá; cộng 1.000 Pet Point khi tạo đánh giá hợp lệ và điều chỉnh lại điểm khi xóa.

### Admin

- Quản lý dịch vụ, danh mục, giá và mã giảm giá.
- Cấu hình lịch làm việc, giờ mở/đóng cửa và sức chứa.
- Tìm kiếm, lọc và xử lý booking; cập nhật tiến trình phục vụ theo trạng thái hợp lệ.
- Đối chiếu yêu cầu chuyển khoản QR; xem đánh giá, khách hàng, hồ sơ thú cưng và thống kê demo.

## 5. Quy tắc nghiệp vụ quan trọng

- Giá dịch vụ spa được tính theo cân nặng và lưu ảnh chụp cân nặng tại thời điểm đặt; khách xác nhận cân nặng mới nhất khi đặt.
- Không thể đặt lịch cho hồ sơ không thuộc tài khoản, thú cưng không đúng loài, dịch vụ ngừng cung cấp, ngày đã qua hoặc ngoài giờ hoạt động.
- Dịch vụ dài cần đủ chỗ trên toàn bộ các khung giờ liên tiếp.
- Đơn QR có thời hạn giữ chỗ 15 phút. Đơn chưa thanh toán/chưa được đối chiếu sẽ tự hủy khi ứng dụng đang hoạt động và giải phóng chỗ.
- Admin chỉ xác nhận booking QR sau khi đối chiếu giao dịch thành công. Khi Admin hoàn thành dịch vụ COD, khoản thu COD được ghi nhận đã thanh toán; đơn QR đã gửi yêu cầu đối chiếu/đã trả tiền không thể bị hủy trực tiếp khi chưa xử lý giao dịch.
- Chỉ booking hoàn thành mới được đánh giá; khách chỉ thao tác với booking/đánh giá thuộc tài khoản của mình.

## 6. Cấu trúc thư mục

```text
src/
  components/
    admin/       # Cổng quản trị và màn hình quản lý
    auth/        # Đăng nhập, đăng ký, khôi phục mật khẩu
    booking/     # Luồng đặt lịch, thanh toán
    common/      # Thành phần dùng chung
    customer/    # Trang khách hàng, hồ sơ thú cưng, lịch sử, đánh giá
    layout/      # Điều hướng và bố cục
  constants/     # Tài nguyên và hằng số thương hiệu
  services/      # StoreService – lớp dữ liệu demo
  types/         # Kiểu dữ liệu TypeScript
  utils/         # Quy tắc giá, coupon, lịch và sức chứa
public/assets/brand/  # Mascot, banner, nền và bảng tham chiếu thương hiệu
database/             # SQL schema, seed và chính sách mẫu
docs/                 # Kiến trúc và ghi chú triển khai
```

## 7. Giới hạn của bản hiện tại – cần hoàn thiện trước khi triển khai thật

Đây là **bản prototype chạy trên trình duyệt**, không phải backend production. Các thao tác dữ liệu nghiệp vụ dùng localStorage; SQL trong `database/` là nền thiết kế để triển khai DB, website hiện chưa kết nối DB hay API máy chủ.

- Xác thực hiện tại là mô phỏng: tài khoản demo dùng mật khẩu mặc định `petphet123`; mật khẩu người đăng ký được băm SHA-256 ở phía trình duyệt. Không dùng cách này làm bảo mật production. Cần thay bằng Supabase Auth hoặc backend có hash mật khẩu chuẩn như Argon2/bcrypt, session/cookie an toàn và phân quyền phía server.
- OTP quên mật khẩu hiện là mã demo `123456`; chưa gửi email thật. Đăng nhập Google/Gmail đã được loại khỏi giao diện.
- QR chuyển khoản đang dùng thông tin ngân hàng minh họa (MB Bank, số tài khoản `0909123456888`, chủ tài khoản `PET PHET VIETNAM`) và ảnh QR tạo bằng dịch vụ QR bên ngoài. **Phải thay bằng tài khoản của đơn vị vận hành và cổng VietQR/payment chính thức**; không dùng để nhận tiền thật. Admin đối chiếu thủ công trong prototype.
- Tự hủy đơn QR chỉ được thực thi khi website đang mở hoặc khi các hàm đọc/xử lý booking được gọi; môi trường production cần cron/job phía server để hết hạn chính xác kể cả khi khách đóng trình duyệt.
- Giao diện hiện tách vai trò sau đăng nhập nhưng đây vẫn là prototype frontend. Không thể xem kiểm tra vai trò ở trình duyệt là bảo mật production; phải xác thực và phân quyền lại ở backend trước khi công khai.
- Chatbot là trợ lý FAQ demo dựa trên nội dung cục bộ, chưa kết nối AI/API thật.
- Các ảnh dịch vụ mẫu có đường dẫn ảnh trực tuyến. Cần thay bằng ảnh có bản quyền/ảnh thực tế được phép sử dụng.
- Cần hoàn thiện kiểm thử tích hợp, kiểm tra bảo mật, RLS theo từng bảng và cấu hình sao lưu trước khi vận hành thực tế.

## 8. Chạy bằng VS Code Live Server

Xem hướng dẫn chi tiết trong `README-LIVE-SERVER.md`. Sau `npm install`, chạy `npm run build:live-server`; thư mục `live-server/` sẽ chứa website đã biên dịch để mở bằng Live Server. Mở riêng thư mục `live-server` làm workspace root trong VS Code trước khi chọn **Open with Live Server**.

## 9. Reset dữ liệu demo

Xóa dữ liệu trang web trong DevTools → Application → Local Storage, rồi tải lại trang để nạp dữ liệu mẫu ban đầu.


## 10. Deploy lên GitHub Pages

Xem `README-GITHUB-PAGES.md`. Dự án đã dùng `base: './'` và đường dẫn tài nguyên theo `import.meta.env.BASE_URL`, tương thích với URL GitHub Pages dạng `/TEN-REPOSITORY/`. Workflow `.github/workflows/deploy.yml` tự cài dependencies, kiểm tra TypeScript, build vào `dist/` và deploy mỗi khi push lên nhánh `main`. Trong repository GitHub, vào **Settings → Pages → Source → GitHub Actions** để bật deploy.
