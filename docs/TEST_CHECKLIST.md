# Checklist kiểm thử nghiệp vụ

## Khách hàng

- [ ] Đăng ký với email và số điện thoại mới; thử đăng ký trùng email/số điện thoại.
- [ ] Đăng nhập bằng email hoặc số điện thoại; đăng nhập sai mật khẩu.
- [ ] Quên mật khẩu: OTP demo `123456`, đổi mật khẩu và đăng nhập lại.
- [ ] Cập nhật họ tên/số điện thoại; thử số điện thoại đã tồn tại.
- [ ] Thêm, sửa và ẩn hồ sơ thú cưng; thử ẩn hồ sơ đang có booking hoạt động.
- [ ] Tìm kiếm dịch vụ, lọc danh mục/giá, mở chi tiết và xem bảng giá theo cân nặng.
- [ ] Đặt lịch đúng loài, sai loài, sai cân nặng, mã coupon hợp lệ/không hợp lệ.
- [ ] Đặt lịch vào ngày quá khứ, ngày nghỉ, ngoài giờ hoặc không đủ sức chứa.
- [ ] Kiểm thử dịch vụ 60–90 phút để bảo đảm sức chứa được xét trên mọi slot liên tiếp.
- [ ] Hủy/đổi lịch trước và sau khi trạng thái booking thay đổi.
- [ ] QR: gửi thông báo chuyển khoản, Admin đối chiếu thành công/thất bại, đơn hết 15 phút.
- [ ] COD: booking chờ Admin xác nhận, chuyển sang đang phục vụ và hoàn thành.
- [ ] Chỉ đánh giá booking hoàn thành; sửa/xóa đánh giá; kiểm tra Pet Point tăng/giảm đúng 1.000.

## Admin

- [ ] Quản lý danh mục, thêm/sửa dịch vụ, giá và dịch vụ tính theo cân nặng.
- [ ] Cấu hình giờ làm, ngày nghỉ, slot duration và sức chứa.
- [ ] Lọc booking theo trạng thái, tìm theo mã/khách hàng, xác nhận/từ chối và cập nhật phục vụ.
- [ ] Không thể xác nhận booking QR khi chưa đối chiếu thanh toán thành công.
- [ ] Đối chiếu giao dịch QR pending_reconcile; xác thực thông báo cập nhật về khách.
- [ ] Xem danh sách khách hàng/thú cưng, đánh giá và gửi phản hồi.

## Đã kiểm thử tự động trong môi trường phát triển

- `bookingEngine.test.ts`: 6 kiểm thử cho chuyển đổi thời gian, giao nhau, sức chứa liên tục, giá theo cân nặng, coupon và quy tắc Pet Point.
- Smoke test StoreService: tạo booking QR, chặn xác nhận khi chưa thanh toán, đối chiếu thành công, kiểm tra sức chứa 1 chỗ, cập nhật trạng thái phục vụ, thưởng/thu hồi Pet Point, và tự hủy QR hết hạn.

Lưu ý: do môi trường dựng file hiện tại không cài được package dependencies, chưa thể thực hiện `vite build`/`tsc --noEmit` trên toàn dự án. Các file TypeScript/TSX đã được transpile kiểm tra cú pháp và đường dẫn import tương đối đã được rà soát.
