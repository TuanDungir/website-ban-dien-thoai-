# Website bán điện thoại

Yêu cầu Node.js >= 22.5. Tại thư mục dự án, chạy:

```powershell
cd server
npm.cmd install
npm.cmd run seed
npm.cmd start
```

- Website: http://localhost:4000/index.html
- Quản trị kết nối backend: http://localhost:4000/admin-pro.html
- Admin backend: `ADMIN01` / `Admin@123456`.
- Khách hàng demo: `an@example.com` / `123456`.
- `admin-login.html` và `admin.html` là bản quản trị demo dùng localStorage, có thông tin đăng nhập riêng ngay trên trang.

`npm.cmd run seed` tạo tài khoản mẫu và nhập 13 sản phẩm cùng các biến thể từ `data.js`. Chạy lại không ghi đè giá hoặc tồn kho đã chỉnh. SQLite nằm tại `server/data/thegioidienthoai.db`.

Chạy kiểm tra tại thư mục `server` bằng `npm.cmd test`.

Các trang tài khoản, chi tiết, giỏ hàng, đơn hàng và thanh toán hiện được đặt ở thư mục gốc để khớp đường dẫn của website. Thư mục `Bố Hải_Auth` và `shopping-cart` được giữ lại làm bản nguồn tham khảo; sửa chức năng đang dùng tại các file gốc.

Xem [kết quả đối chiếu và giới hạn](INTEGRATION.md). Thanh toán và OTP vẫn là chức năng demo. Các ZIP không chứa ảnh sản phẩm gốc; website dùng ảnh chờ khi ảnh bị thiếu.
