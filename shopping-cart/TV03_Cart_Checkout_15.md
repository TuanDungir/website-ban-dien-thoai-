# TV03 — Giỏ hàng + Checkout + Đơn hàng + Thanh toán (15%)

## File phụ trách
- `thegioidienthoai_project/shop.js` (150 dòng)
- `thegioidienthoai_project/checkout.html` (57 dòng)
- `thegioidienthoai_project/checkout.js` (429 dòng)
- `thegioidienthoai_project/order.html` (55 dòng)
- `thegioidienthoai_project/order.js` (103 dòng)
- `thegioidienthoai_project/pay.html` (55 dòng)
- `thegioidienthoai_project/pay.js` (145 dòng)

## Đọc code hiện tại
- `shop.js`: `TGDD_CART_KEY='tgdd_cart'`, lineId = `productId|mem|color`, `tgddCart/CartAdd/CartSetQty(max 1-99)/CartRemove/CartClear/CartCount/RenderCartCount`, đơn `tgddNewOrderCode` dạng `001CD+date+random`, `tgddCreateOrder/GetOrder/UpdateOrder`, `tgddAutoSyncAdmin` đồng bộ sang admin mỗi lần load.
- `checkout.js`: `CO_STEPS=['address','cart','pay']`, `VOUCHERS={WELCOME50:50k/250k, TGDD200:200k/5tr, FREESHIP}`, `SHIPPING={standard:0đ, fast:19k, store:0đ}`, `PAY_METHODS` 9 cách (cod/deposit 50%/bank/momo/vnpay/zalopay/smartpay/card/staff), `coSubtotal/ShippingFee/Discount/Total/PayAmount`, `?step=` address→cart→pay.
- `order.js`/`pay.js`: trang tra cứu + thanh toán theo mã đơn.

## Việc phải làm
1. Giỏ: cộng dồn theo lineId, sửa số lượng 1-99, xóa dòng, badge `[data-cart-count]` luôn đúng, chặn thêm khi hết hàng (`TG.memoryStock/variantStock<=0`).
2. Checkout 3 bước: (a) chọn địa chỉ mặc định, (b) tick chọn dòng giỏ + voucher + ship, (c) chọn 1 trong 9 phương thức, deposit tính 50%. Tính lại tổng ở client đúng công thức `max(0, subtotal-discount+ship)`.
3. Đặt hàng: yêu cầu đăng nhập, tạo mã đơn, lưu snapshot `{productId,variantId,name,mem,color,price,qty}`, clear dòng đã mua, chuyển sang `order.html`/`pay.html`.
4. Thanh toán demo: hiển thị mã QR minh họa + số tiền (cod/deposit), cập nhật trạng thái đơn.
5. Khi online: chuyển tạo đơn sang `POST /api/orders` qua `TG.api`, giá lấy từ backend, giữ fallback offline.

## Hàm không được đổi tên
`tgddCart/tgddCartAdd/tgddCartLineId/tgddCartSetQty/tgddCartRemove/tgddCartClear/tgddCartCount/tgddRenderCartCount/tgddNewOrderCode/tgddCreateOrder/tgddGetOrder/coSubtotal/coDiscount/coShippingFee/coTotal`

## Demo (TC09, TC10)
- Áp WELCOME50 cho đơn 250k, FREESHIP miễn ship; đơn thiếu tồn → rollback, không tạo đơn.
