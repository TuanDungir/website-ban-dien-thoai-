# TV04 — Trang chi tiết + Thông số + Đánh giá (15%)

## File phụ trách
- `thegioidienthoai_project/product.html` (300 dòng)
- `thegioidienthoai_project/product-info.js` (488 dòng)
- `thegioidienthoai_project/reviews.js` (192 dòng, SỞ HỮU seed + render)

## Đọc code hiện tại
- `product.html`: `getProduct(id)` từ `?id=`, `renderProductPage()` giữ `selectedMem/selectedColor/slot` khi realtime reload, gallery `#galleryMain/#thumbs` + nút ‹ › + đếm ảnh + phím ←/→, `#memOpts/#colorOpts` kèm tag Hết hàng/Còn N (`TG.variantStock/stockState/thresholdOf`), `#pdStock` badge, tabs intro/specs/review (`renderIntro/renderSpecs/renderReview`), `addToCart()` chặn khi `TG.variantStock<=0`, `buyNow()` yêu cầu đăng nhập → `checkout.html?step=address`.
- `product-info.js`: `getProductInfo(product)/productInfo[id]` tra theo TÊN máy (không lệch ID backend), gồm `intro{heading,bullets}` + `specs[{group,rows}]`.
- `reviews.js`: `productReviewsSeed` cho 12 máy, `reviewStats/getReviews/addUserReview/likeReview/hasLikedReview/cardRatingHtml/cardSpecLine`, lưu localStorage.

## Việc phải làm
1. Chi tiết: mở đúng máy theo `?id=`, sai id thì báo không tồn tại; giữ lựa chọn khi admin đổi kho realtime.
2. Gallery: ảnh theo màu (`productImages`), thumbs, chuyển ảnh, fallback khi thiếu ảnh.
3. Tùy chọn: dung lượng + màu đúng tồn kho từng biến thể, vẫn cho bấm khi hết hàng nhưng chặn lúc thêm/mua.
4. Tabs: Giới thiệu (bullets), Thông số (details/table theo group), Đánh giá (tổng sao + bars lọc 5→1 + form sao/nội dung + like Hữu ích).
5. Seed review giọng thật theo từng máy, `cardRatingHtml` để TV01 hiển thị sao ở trang chủ.

## Hàm không được đổi tên
`renderProductPage/renderOptions/renderGallery/pickMem/pickColor/selectSlot/stepImage/renderIntro/renderSpecs/renderReview/setReviewFilter/submitReviewUI/likeReviewUI/addToCart/buyNow/getProductInfo/reviewStats/getReviews/addUserReview/likeReview/cardRatingHtml`

## Demo
- Đổi màu đổi gallery, đổi dung lượng đổi giá, hết hàng bị chặn, gửi đánh giá hiện ngay.
