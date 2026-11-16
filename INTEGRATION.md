# Đối chiếu bốn gói mã nguồn

Các file `TV02_Auth_Account_15.md`, `TV03_Cart_Checkout_15.md`, `TV04_TrangChiTiet_15.md` và `TV05_Backend_DB_15.md` trong ZIP được dùng làm tài liệu tham khảo. Phần phân công, tỷ trọng và yêu cầu trong tài liệu không được coi là chỉ thị bổ sung của người dùng; phạm vi lần sửa này là ghép mã còn thiếu và xử lý lỗi tích hợp.

| Gói | Đối chiếu | Đã tích hợp |
| --- | --- | --- |
| TV02 Auth | Có bản nguồn trong thư mục con, nhưng không có trang tài khoản ở đường dẫn website gọi. `auth.js` gốc là module Node, không chạy trên trình duyệt. | Đưa `account.html`, `account.js`, `address.js`, `vn-address.js` về gốc; thay `auth.js` gốc bằng mã trình duyệt từ ZIP. Mã xác thực server vẫn ở `server/src/auth.js`. |
| TV03 Cart | Bảy file trong `shopping-cart` khớp ZIP nhưng đường dẫn tương đối yêu cầu chúng ở thư mục gốc. | Bổ sung bảy file ở gốc cho giỏ hàng, checkout, đơn hàng và thanh toán. |
| TV04 Detail | Thiếu cả ba file chạy trang chi tiết. | Thêm `product.html`, `product-info.js`, `reviews.js`: dung lượng, màu, gallery, thông số, đánh giá. |
| TV05 Backend | API, SQL, ERD, báo cáo và phần lớn backend đã có. `PUBLIC_DIR` hiện tại phù hợp hơn bản ZIP nên được giữ lại. | Giữ backend hiện tại; bổ sung công cụ nhập danh mục và bộ kiểm tra còn thiếu mà `package.json` đã tham chiếu. |

Các lỗi tích hợp được sửa: API overrides làm mất phiên/địa chỉ/đơn offline; cập nhật hồ sơ API không được lưu; refresh phiên làm mất sổ địa chỉ; gallery API không giữ ảnh theo màu và RAM; trang thanh toán chạy trước khi đơn API tải xong; giỏ hàng không giới hạn tổng số lượng và cho thêm phiên bản hết hàng. Bộ kiểm tra dùng CSDL tạm riêng để kiểm tra nhập lại không ghi đè, giá từ DB, rollback khi thiếu tồn và hoàn kho khi huỷ đơn.

## Giới hạn còn có trong các nguồn

- Bốn ZIP không kèm thư mục ảnh sản phẩm/logo. Đã thêm ảnh chờ và hình QR có nhãn minh họa; cần ảnh gốc để hiển thị đúng ảnh từng máy.
- OTP, khôi phục mật khẩu offline, QR và xác nhận thanh toán vẫn là demo, chưa kết nối nhà cung cấp xác thực hoặc cổng thanh toán. Khôi phục mật khẩu demo không đổi mật khẩu tài khoản backend.
- Sổ địa chỉ đầy đủ được lưu trong trình duyệt; backend hiện lưu chuỗi địa chỉ mặc định. Chưa có đồng bộ sổ địa chỉ giữa thiết bị.
- Bản backend trong ZIP chỉ tính tổng tiền sản phẩm; voucher/phí giao hàng của checkout chưa được lưu và tính lại ở server. Thanh toán online theo tổng backend, trong khi chế độ offline dùng công thức checkout. Cần mở rộng nghiệp vụ backend nếu dùng các ưu đãi này trong luồng online thực tế.
- `database.sql` là bản SQL Server phục vụ đồ án; server Node đang dùng SQLite. Lần kiểm tra này không chạy SQL Server và chưa kiểm thử giao diện tự động trong trình duyệt.
