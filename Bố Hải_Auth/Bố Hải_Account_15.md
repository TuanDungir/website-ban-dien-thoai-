# Bố Hải — Xác thực + Tài khoản + Địa chỉ (15%)

## File phụ trách
- `thegioidienthoai_project/auth.js` (358 dòng)
- `thegioidienthoai_project/account.html` (166 dòng)
- `thegioidienthoai_project/account.js` (297 dòng)
- `thegioidienthoai_project/address.js` (278 dòng)
- `thegioidienthoai_project/vn-address.js` (65KB: tỉnh/huyện/xã)

## Đọc code hiện tại
- `auth.js`: `TGDD_USERS_KEY='tgdd_users'`, `TGDD_SESSION_KEY='tgdd_session'`, `tgddUsers/SaveUsers`, `tgddHash` (FNV demo), `tgddFindUser` theo phone hoặc email lower-case, `tgddCurrentUser/Login/Logout`, `tgddRenderHeader` (nếu có `#authModal` thì mở modal, không thì về `index.html?login=1`), consent `tgddOpenConsent/SyncConsent/ToggleConsentAll/ConfirmConsent` (bắt buộc tick required mới enable nút), `switchAuth/submitLogin/submitRegister/tgddForgot*` OTP demo 6 số, `pwStrength/togglePw`.
- `account.js`: tabs `orders/vouchers/profile`, `ORDER_STATUSES=['Tất cả','Chờ duyệt','Đã xác nhận','Đang giao','Đã giao','Đã huỷ']`, `filteredOrders` ưu tiên `TG.orders` khi online, lọc khoảng ngày mặc định 1 năm, `qrSvg` VIP, `renderSide`.
- `address.js` + `vn-address.js`: địa chỉ lưu trong `user.addresses`, `tgddAddressSave/Delete/DefaultAddress/AddressText`, chỉ 1 default.

## Việc phải làm
1. Đăng ký: validate họ tên/SĐT/email/mật khẩu >=6 ký tự + nhập lại khớp + tick điều khoản → mở consent → tạo user `{id:'u'+Date.now(), password:tgddHash, consent, vouchers:[], orders:[], addresses:[], points:0}`.
2. Đăng nhập: tìm theo email hoặc SĐT, so hash, `tgddLogin` set session, render header hiện tên; sai thì toast lỗi.
3. Quên mật khẩu: 2 bước nhập ID → gửi OTP demo hiện ở `#fpOtpDemo`, đếm ngược 05:00 → nhập OTP + mật khẩu mới → hash lại.
4. Trang tài khoản: guard chưa đăng nhập thì đá về `index.html?login=1`; tabs đơn/voucher/profile; lọc đơn theo trạng thái + khoảng ngày; đổi tên/SĐT/email; quản lý địa chỉ VN 3 cấp.
5. Khi online (`api-client.js`): chuyển register/login/me sang `POST /api/auth/*`, `GET/PUT /api/me` qua `TG.api`, giữ fallback offline localStorage.

## Hàm không được đổi tên
`tgddUsers/tgddSaveUsers/tgddHash/tgddFindUser/tgddCurrentUser/tgddLogin/tgddLogout/tgddRenderHeader/tgddOpenConsent/tgddSyncConsent/tgddConfirmConsent/tgddUserUpdate/tgddAddresses/tgddAddressSave/tgddAddressDelete/activeUser/filteredOrders`

## Demo
- Đăng ký → tick consent → tạo tài khoản; đăng nhập sai → báo lỗi; quên MK bằng OTP demo; thêm/sửa/xóa địa chỉ, chỉ 1 mặc định.
