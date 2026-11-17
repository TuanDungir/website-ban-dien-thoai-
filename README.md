
# 📱 WEBSITE BÁN ĐIỆN THOẠI

**Dự án phát triển website thương mại điện tử chuyên kinh doanh điện thoại di động**, cho phép người dùng xem danh sách sản phẩm, tìm hiểu thông tin chi tiết, quản lý tài khoản và giỏ hàng. Dự án được xây dựng theo mô hình làm việc nhóm, sử dụng GitHub để quản lý mã nguồn, theo dõi tiến độ và tích hợp các chức năng.

🔗 **Repository:** https://github.com/TuanDungir/website-ban-dien-thoai-

---

## 📑 MỤC LỤC

- [1. Giới thiệu dự án](#1-giới-thiệu-dự-án)
- [2. Mục tiêu](#2-mục-tiêu)
- [3. Chức năng chính](#3-chức-năng-chính)
- [4. Công nghệ sử dụng](#4-công-nghệ-sử-dụng)
- [5. Cấu trúc dự án](#5-cấu-trúc-dự-án)
- [6. Phân công nhiệm vụ 5 thành viên](#6-phân-công-nhiệm-vụ-5-thành-viên)
- [7. Quy trình phối hợp và tích hợp code](#7-quy-trình-phối-hợp-và-tích-hợp-code)
- [8. Hướng dẫn cài đặt và chạy dự án](#8-hướng-dẫn-cài-đặt-và-chạy-dự-án)
- [9. Kiểm thử](#9-kiểm-thử)
- [10. Hướng phát triển](#10-hướng-phát-triển)

---

## 1. Giới thiệu dự án

Website bán điện thoại là dự án xây dựng một hệ thống bán hàng trực tuyến, tập trung vào trải nghiệm người dùng khi tìm kiếm, xem thông tin và lựa chọn điện thoại.

Hệ thống được chia thành các phần chức năng chính:

- **Frontend:** Giao diện trang chủ, danh sách sản phẩm và các thành phần giao diện chung.
- **Authentication (Auth):** Xử lý đăng nhập, đăng ký, đăng xuất và trạng thái tài khoản.
- **Shopping Cart:** Quản lý sản phẩm được thêm vào giỏ hàng và số lượng sản phẩm.
- **Backend:** Xử lý yêu cầu từ giao diện, nghiệp vụ và kết nối cơ sở dữ liệu.
- **Product Detail:** Hiển thị thông tin, hình ảnh, thông số kỹ thuật và giá sản phẩm.
- **Admin:** Giao diện quản trị, hỗ trợ quản lý sản phẩm và các chức năng quản trị thuộc phạm vi dự án.

Dự án được phát triển theo từng module để các thành viên có thể làm việc độc lập, đồng thời dễ dàng kiểm thử, sửa lỗi và tích hợp thành một hệ thống hoàn chỉnh.

## 2. Mục tiêu

- Xây dựng giao diện website bán điện thoại trực quan, dễ sử dụng.
- Tổ chức mã nguồn theo từng chức năng để thuận tiện bảo trì.
- Xây dựng và kết nối các module frontend, authentication, giỏ hàng, chi tiết sản phẩm và quản trị.
- Quản lý dữ liệu sản phẩm và các thông tin liên quan.
- Áp dụng Git và GitHub trong quy trình phát triển phần mềm nhóm.
- Rèn luyện kỹ năng lập trình, phân chia công việc, review code, kiểm thử và tích hợp hệ thống.

## 3. Chức năng chính

### 3.1. Giao diện trang chủ

- Hiển thị danh sách điện thoại.
- Hiển thị hình ảnh, tên sản phẩm và giá bán.
- Tổ chức các khu vực giới thiệu và điều hướng sản phẩm.
- Cho phép người dùng truy cập trang chi tiết sản phẩm.
- Hiển thị các thành phần giao diện dùng chung.

### 3.2. Quản lý tài khoản — Authentication

- Đăng ký tài khoản.
- Đăng nhập và đăng xuất.
- Kiểm tra dữ liệu đầu vào.
- Quản lý trạng thái đăng nhập.
- Kiểm soát quyền truy cập các chức năng yêu cầu xác thực.

*Các chức năng cần được kiểm tra theo mức độ hoàn thiện thực tế của module Auth.*

### 3.3. Giỏ hàng — Shopping Cart

- Thêm sản phẩm vào giỏ hàng.
- Hiển thị danh sách sản phẩm đã chọn.
- Cập nhật số lượng sản phẩm.
- Xóa sản phẩm khỏi giỏ hàng.
- Tính tổng tiền dự kiến.
- Kiểm tra số lượng và tình trạng hàng trước khi tiếp tục mua hàng.

### 3.4. Trang chi tiết sản phẩm — Product Detail

- Hiển thị thông tin chi tiết của điện thoại.
- Hiển thị hình ảnh và thông số kỹ thuật.
- Hiển thị giá bán và các tùy chọn sản phẩm nếu được hỗ trợ.
- Cho phép chọn sản phẩm và thêm vào giỏ hàng.
- Kiểm tra tình trạng hàng trước khi thêm sản phẩm.

### 3.5. Backend và cơ sở dữ liệu

- Tiếp nhận và xử lý yêu cầu từ frontend.
- Xây dựng các API phục vụ nghiệp vụ.
- Quản lý dữ liệu sản phẩm và các dữ liệu liên quan.
- Thực hiện truy vấn cơ sở dữ liệu.
- Kiểm tra dữ liệu đầu vào và xử lý lỗi.
- Cung cấp dữ liệu thống nhất cho các module frontend và Admin.

### 3.6. Quản trị hệ thống — Admin

- Cung cấp giao diện đăng nhập quản trị.
- Hiển thị khu vực quản trị dành cho người có quyền phù hợp.
- Quản lý danh sách sản phẩm.
- Hỗ trợ thêm, sửa và xóa sản phẩm theo phạm vi đã triển khai.
- Hiển thị dữ liệu quản trị lấy từ backend nếu đã được kết nối.
- Kiểm tra tính nhất quán giữa dữ liệu sản phẩm trong Admin và website bán hàng.

**Phân công:** TV1 phụ trách giao diện và luồng thao tác Admin; TV4 phụ trách API, nghiệp vụ và cơ sở dữ liệu phía server.

Các chức năng trên là phạm vi dự kiến; nhóm cần xác nhận chức năng nào đã hoàn thành trước khi báo cáo tiến độ.

## 4. Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| HTML5 | Xây dựng cấu trúc trang web |
| CSS3 | Thiết kế giao diện và bố cục |
| JavaScript | Xử lý tương tác phía frontend |
| Backend | Xử lý nghiệp vụ và cung cấp API |
| SQL | Khai báo cấu trúc và thao tác với dữ liệu |
| Git | Quản lý lịch sử thay đổi mã nguồn |
| GitHub | Lưu trữ repository, quản lý Issues và Pull Requests |
| Visual Studio Code | Môi trường phát triển |

**Lưu ý:** Công nghệ backend, hệ quản trị cơ sở dữ liệu và các thư viện cụ thể cần được xác nhận từ mã nguồn và cấu hình thực tế của dự án trước khi bổ sung tên công nghệ chính xác.

## 5. Cấu trúc dự án

Một số tệp và thư mục hiện có trong repository:

```text
website-ban-dien-thoai-/
├── Bố Hải_Auth/        # Module xác thực tài khoản
├── server/             # Khu vực mã nguồn phía server
├── shopping-cart/      # Module giỏ hàng
├── index.html          # Giao diện trang chủ
├── styles.css          # CSS giao diện chung
├── auth.js             # Xử lý liên quan đến xác thực
├── api-client.js       # Thành phần hỗ trợ gọi API
├── api-overrides.js    # Các phần ghi đè/hỗ trợ API
├── config.js           # Cấu hình ứng dụng
├── data.js             # Dữ liệu phía ứng dụng
├── db.js               # Thành phần liên quan đến database
├── database.sql        # Cấu trúc hoặc dữ liệu SQL
├── erd.mmd             # Sơ đồ thực thể - liên kết
├── admin.html          # Giao diện quản trị
├── admin.js            # Logic giao diện quản trị
├── admin.css           # CSS giao diện quản trị
├── admin-login.html    # Giao diện đăng nhập quản trị
├── admin-pro.html      # Giao diện quản trị mở rộng
├── admin-pro.js        # Logic quản trị mở rộng
├── admin-data.js       # Dữ liệu hỗ trợ quản trị
├── admin-views.js      # Thành phần hiển thị quản trị
├── README.md           # Tài liệu giới thiệu dự án
└── Details Page.md     # Tài liệu về trang chi tiết sản phẩm
```

*Cấu trúc trên liệt kê các thành phần tiêu biểu. Nhóm cần kiểm tra lại cấu trúc thư mục thực tế trước khi sử dụng làm tài liệu kỹ thuật chính thức.*

## 6. Phân công nhiệm vụ 5 thành viên

Nhóm gồm 5 thành viên. Mỗi thành viên chịu trách nhiệm chính cho một phạm vi công việc, đồng thời phối hợp với các thành viên khác để tích hợp toàn bộ hệ thống.

### 6.1. Thành viên 1 — Trưởng nhóm, Frontend, Admin và tích hợp hệ thống

**Vai trò:** Điều phối dự án, phát triển giao diện chính, phụ trách chức năng quản trị và tích hợp các module của toàn bộ website.

**A. Quản lý nhóm và dự án**

- Lập kế hoạch phát triển và phân chia nhiệm vụ cho các thành viên.
- Theo dõi tiến độ, hỗ trợ giải quyết các vấn đề phát sinh.
- Quản lý repository GitHub, nhánh phát triển và Pull Request.
- Review code và phối hợp xử lý xung đột khi merge.
- Tổng hợp tài liệu, cập nhật README và chuẩn bị bản demo.

**B. Phát triển Frontend**

- Xây dựng và hoàn thiện giao diện trang chủ trong `index.html`.
- Phụ trách bố cục và CSS chung trong `styles.css`.
- Phát triển thanh điều hướng, khu vực hiển thị sản phẩm và các thành phần giao diện dùng chung.
- Đảm bảo giao diện nhất quán giữa trang chủ, trang chi tiết, giỏ hàng và các khu vực khác.
- Phối hợp với TV2, TV3 và TV5 để tích hợp giao diện của từng module.
- Phối hợp với TV4 để kết nối dữ liệu từ backend.

**C. Phát triển Admin**

- Phụ trách giao diện quản trị trong `admin.html`, `admin-login.html` và `admin-pro.html`.
- Phát triển hoặc hoàn thiện logic giao diện trong `admin.js`, `admin-pro.js` và các tệp hỗ trợ liên quan.
- Xây dựng giao diện danh sách sản phẩm trong khu vực quản trị.
- Triển khai giao diện và luồng thao tác thêm, sửa, xóa sản phẩm theo phạm vi dự án.
- Xử lý thông báo khi thao tác thành công hoặc thất bại.
- Phối hợp với TV4 để kết nối API và cơ sở dữ liệu.
- Kiểm tra tính nhất quán giữa thông tin sản phẩm trong Admin và website bán hàng.
- Kiểm tra giao diện đăng nhập quản trị và phối hợp bảo vệ các chức năng yêu cầu quyền quản trị.

**D. Tích hợp và kiểm thử hệ thống**

- Tích hợp module Auth do TV2 phát triển.
- Tích hợp module Shopping Cart do TV3 phát triển.
- Phối hợp với TV4 để tích hợp backend và database.
- Tích hợp trang Product Detail do TV5 phát triển.
- Kiểm tra luồng hoạt động tổng thể từ trang chủ đến chi tiết sản phẩm, giỏ hàng và Admin.
- Xử lý các lỗi giao diện và lỗi phát sinh giữa các module.
- Review code trước khi hợp nhất vào nhánh chính.

**Sản phẩm bàn giao:**

- Giao diện trang chủ và các thành phần frontend chung.
- Giao diện Admin và các thao tác quản trị phía frontend.
- Chức năng quản trị được kết nối với backend theo phạm vi triển khai.
- Các module được tích hợp và kiểm thử.
- README và tài liệu hướng dẫn sử dụng, chạy dự án.

### 6.2. Thành viên 2 — Authentication (Auth)

**Vai trò:** Phụ trách chức năng tài khoản và xác thực người dùng.

**Nhiệm vụ cụ thể:**

- Phát triển giao diện đăng ký, đăng nhập và đăng xuất.
- Kiểm tra dữ liệu biểu mẫu và hiển thị thông báo lỗi phù hợp.
- Xử lý trạng thái đăng nhập và thông tin người dùng.
- Phối hợp với TV4 để tích hợp API xác thực.
- Thống nhất cách quản lý phiên đăng nhập và thông tin xác thực.
- Xử lý các trường hợp người dùng chưa đăng nhập nhưng truy cập chức năng yêu cầu xác thực.
- Kiểm thử đăng nhập thành công, sai mật khẩu, dữ liệu thiếu và đăng xuất.
- Bàn giao hướng dẫn tích hợp module Auth cho TV1.

**Sản phẩm bàn giao:**

- Module Auth theo phạm vi đã thống nhất.
- Giao diện và logic xác thực phía frontend.
- Danh sách API hoặc hàm cần backend hỗ trợ.
- Tài liệu tích hợp và kết quả kiểm thử.

### 6.3. Thành viên 3 — Shopping Cart (Giỏ hàng)

**Vai trò:** Phụ trách quản lý sản phẩm mà người dùng đã lựa chọn.

**Nhiệm vụ cụ thể:**

- Xây dựng và hoàn thiện giao diện giỏ hàng.
- Xử lý thêm sản phẩm vào giỏ hàng.
- Cập nhật số lượng và xóa sản phẩm.
- Tính tổng tiền dự kiến dựa trên giá và số lượng.
- Hiển thị thông tin sản phẩm, giá bán và số lượng.
- Kiểm tra trường hợp giỏ hàng trống hoặc số lượng không hợp lệ.
- Phối hợp với TV5 để nhận dữ liệu sản phẩm từ trang chi tiết.
- Phối hợp với TV4 nếu giỏ hàng cần lưu trữ hoặc đồng bộ phía server.
- Phối hợp với TV2 khi giỏ hàng cần gắn với tài khoản người dùng.
- Kiểm thử các thao tác thêm, sửa số lượng, xóa và tính tổng tiền.

**Sản phẩm bàn giao:**

- Module giỏ hàng theo phạm vi đã thống nhất.
- Các hàm hoặc API giao tiếp với trang chi tiết sản phẩm.
- Kết quả kiểm thử nghiệp vụ giỏ hàng.

### 6.4. Thành viên 4 — Backend và Database

**Vai trò:** Phụ trách xử lý nghiệp vụ phía server, API và cơ sở dữ liệu.

**Nhiệm vụ cụ thể:**

- Khảo sát và hoàn thiện cấu trúc thư mục `server/`.
- Xác định điểm khởi chạy server và cấu hình môi trường.
- Xây dựng hoặc hoàn thiện các API cần thiết cho dự án.
- Quản lý kết nối cơ sở dữ liệu và xử lý truy vấn.
- Hoàn thiện cấu trúc bảng, quan hệ dữ liệu và dữ liệu mẫu khi cần.
- Hỗ trợ API đăng ký, đăng nhập và xác thực theo thỏa thuận với TV2.
- Cung cấp dữ liệu sản phẩm cho trang chủ và trang chi tiết.
- Hỗ trợ API cho giỏ hàng nếu hệ thống sử dụng backend để quản lý giỏ hàng.
- Cung cấp API phục vụ chức năng quản trị sản phẩm cho TV1.
- Kiểm tra dữ liệu đầu vào, xử lý lỗi và trả về kết quả nhất quán.
- Thống nhất định dạng JSON, tên trường dữ liệu và mã trạng thái với các thành viên.
- Kiểm thử API và viết hướng dẫn cấu hình, chạy backend.

**Sản phẩm bàn giao:**

- Backend chạy được theo hướng dẫn đã thống nhất.
- Cơ sở dữ liệu và dữ liệu mẫu cần thiết.
- Các API phục vụ Auth, Cart, Detail và Admin theo phạm vi dự án.
- Tài liệu cấu hình, danh sách API và kết quả kiểm thử.

### 6.5. Thành viên 5 — Product Detail (Chi tiết sản phẩm)

**Vai trò:** Phụ trách trang chi tiết và các tương tác liên quan đến từng sản phẩm.

**Nhiệm vụ cụ thể:**

- Xây dựng và hoàn thiện trang chi tiết điện thoại.
- Hiển thị tên, hình ảnh, giá và mô tả sản phẩm.
- Hiển thị thông số kỹ thuật và các thông tin bổ sung.
- Xử lý việc mở đúng sản phẩm theo mã định danh trên URL.
- Xử lý các tùy chọn như màu sắc, dung lượng nếu dữ liệu hỗ trợ.
- Hiển thị trạng thái còn hàng hoặc hết hàng theo dữ liệu hợp lệ.
- Xử lý thao tác thêm sản phẩm vào giỏ hàng theo giao diện tích hợp với TV3.
- Phối hợp với TV4 để nhận dữ liệu sản phẩm từ backend.
- Kiểm thử trường hợp mã sản phẩm không hợp lệ, thiếu dữ liệu hoặc hết hàng.

**Sản phẩm bàn giao:**

- Trang chi tiết sản phẩm theo phạm vi đã thống nhất.
- Logic hiển thị và lựa chọn sản phẩm.
- Giao diện kết nối với giỏ hàng.
- Kết quả kiểm thử trang chi tiết.

### 6.6. Bảng tổng hợp phân công

| Thành viên | Vai trò chính | Phạm vi công việc |
|---|---|---|
| **TV1** | Leader + Frontend + Admin | Trang chủ, CSS chung, giao diện quản trị, quản lý sản phẩm phía Admin, tích hợp và review code |
| **TV2** | Authentication | Đăng ký, đăng nhập, đăng xuất, trạng thái tài khoản và phối hợp xác thực |
| **TV3** | Shopping Cart | Thêm, xóa, cập nhật số lượng, tính tổng tiền và xử lý giỏ hàng |
| **TV4** | Backend + Database | API, nghiệp vụ, cơ sở dữ liệu, hỗ trợ API cho Auth, Cart, Detail và Admin |
| **TV5** | Product Detail | Thông tin sản phẩm, thông số, tùy chọn và tương tác mua hàng |

### 6.7. Nguyên tắc phối hợp giữa các thành viên

- Mỗi thành viên chịu trách nhiệm chính về module đã được phân công.
- TV1 phụ trách giao diện và luồng thao tác Admin; TV4 phụ trách API, nghiệp vụ và dữ liệu phía server.
- TV2 và TV4 thống nhất cơ chế xác thực trước khi tích hợp đăng nhập.
- TV3 và TV5 thống nhất cấu trúc dữ liệu sản phẩm khi thêm vào giỏ hàng.
- Các thành viên phải kiểm thử module riêng trước khi tạo Pull Request.
- TV1 thực hiện review và điều phối tích hợp, nhưng không thay thế trách nhiệm kiểm thử của từng thành viên.

## 7. Quy trình phối hợp và tích hợp code

Để tránh việc các thành viên sửa trùng tệp hoặc làm hỏng chức năng của nhau, nhóm thống nhất quy trình sau.

### 7.1. Phân chia phạm vi code

- **TV1:** `index.html`, `styles.css`, các thành phần giao diện chung và các tệp Admin.
- **TV2:** Module Auth và các tệp liên quan đến xác thực.
- **TV3:** Thư mục `shopping-cart/` và các thành phần giỏ hàng.
- **TV4:** Thư mục `server/`, API, database và các tệp xử lý nghiệp vụ phía server.
- **TV5:** Trang chi tiết sản phẩm và các thành phần liên quan.

Các tệp dùng chung như `api-client.js`, `config.js`, `db.js` hoặc `auth.js` cần được phân định quyền chỉnh sửa cụ thể theo cấu trúc code thực tế. Không tự ý sửa các tệp dùng chung nếu chưa thống nhất với người phụ trách.

### 7.2. Quy trình Git và GitHub

1. Nhận nhiệm vụ và xác định tiêu chí hoàn thành.
2. Tạo nhánh riêng cho công việc.
3. Viết code và tự kiểm thử trên nhánh đó.
4. Commit với thông điệp rõ ràng.
5. Push nhánh lên GitHub.
6. Tạo Pull Request để đề xuất tích hợp vào nhánh chính.
7. TV1 hoặc người được phân công review code.
8. Sửa các lỗi được góp ý và kiểm tra lại.
9. Merge sau khi các điều kiện tích hợp đã được đáp ứng.

Ví dụ tên nhánh:

```text
feature/homepage-admin
feature/auth
feature/shopping-cart
feature/backend-api
feature/product-detail
```

Ví dụ commit:

```text
feat: implement homepage and admin interface
feat: implement login and registration
feat: add shopping cart quantity update
feat: create product detail page
feat: implement product management API
fix: handle invalid product id
docs: update project README
```

### 7.3. Thống nhất giao tiếp giữa các module

Trước khi tích hợp, các thành viên cần thống nhất:

- Tên trường dữ liệu sản phẩm, ví dụ `id`, `name`, `price`, `image`.
- Định dạng dữ liệu mà API trả về.
- Cách xác định sản phẩm được chọn từ trang chi tiết.
- Cách gọi hàm thêm sản phẩm vào giỏ hàng.
- Cách xác định trạng thái đăng nhập.
- Cách kiểm tra quyền quản trị.
- Cách xử lý lỗi khi API không phản hồi hoặc dữ liệu không hợp lệ.

Đối với Admin, backend phải kiểm tra quyền quản trị cho những API thay đổi dữ liệu. Không chỉ ẩn giao diện quản trị ở frontend để bảo vệ hệ thống.

## 8. Hướng dẫn cài đặt và chạy dự án

### 8.1. Yêu cầu môi trường

- Git.
- Visual Studio Code hoặc trình soạn thảo tương đương.
- Trình duyệt web hiện đại.
- Môi trường chạy backend phù hợp với mã nguồn.
- Hệ quản trị cơ sở dữ liệu tương ứng với cấu hình dự án, nếu cần.

### 8.2. Tải mã nguồn

Mở Terminal hoặc CMD:

```bash
git clone https://github.com/TuanDungir/website-ban-dien-thoai-.git
cd website-ban-dien-thoai-
```

### 8.3. Cài đặt và cấu hình

1. Mở thư mục dự án bằng VS Code.
2. Kiểm tra thư mục `server/` để xác định ngôn ngữ, điểm khởi chạy và hướng dẫn cài dependency.
3. Kiểm tra `config.js` và các tệp cấu hình để xác định những biến môi trường cần thiết.
4. Kiểm tra `database.sql` và `db.js` để xác định hệ quản trị cơ sở dữ liệu và cách khởi tạo dữ liệu.
5. Cài đặt dependency theo cấu hình thực tế của backend.
6. Thiết lập thông tin kết nối database theo môi trường local.

### 8.4. Khởi chạy ứng dụng

**Frontend:** Mở `index.html` bằng trình duyệt hoặc sử dụng Live Server trong VS Code nếu phù hợp với cấu trúc ứng dụng.

**Backend:** Khởi chạy bằng lệnh được xác định từ tệp cấu hình và điểm vào thực tế bên trong `server/`.

**Database:** Tạo cơ sở dữ liệu và nạp dữ liệu theo hướng dẫn tương ứng với hệ quản trị được dự án sử dụng.

> Lưu ý: Cần xác định chính xác lệnh khởi chạy, dependency và cấu hình database từ mã nguồn trước khi hoàn thiện hướng dẫn chính thức.

## 9. Kiểm thử

Nhóm cần kiểm tra cả chức năng riêng lẻ và luồng hoạt động tổng thể.

| Module | Nội dung kiểm thử | Người phụ trách chính |
|---|---|---|
| Trang chủ | Giao diện, danh sách sản phẩm, điều hướng | TV1 |
| Admin | Đăng nhập quản trị, quản lý sản phẩm, kiểm tra quyền | TV1 + TV4 |
| Auth | Đăng ký, đăng nhập, dữ liệu sai, đăng xuất | TV2 + TV4 |
| Cart | Thêm, xóa, sửa số lượng, tính tổng tiền | TV3 |
| Backend | API, dữ liệu trả về, xử lý lỗi, database | TV4 |
| Detail | Mã sản phẩm, thông tin, tùy chọn, trạng thái hàng | TV5 |
| Tích hợp | Từ trang chủ đến chi tiết, giỏ hàng và quản trị | TV1 + toàn nhóm |

### Luồng kiểm thử tích hợp đề xuất

1. Mở trang chủ và chọn một điện thoại.
2. Truy cập trang chi tiết và kiểm tra thông tin sản phẩm.
3. Chọn tùy chọn sản phẩm nếu có.
4. Thêm sản phẩm vào giỏ hàng.
5. Cập nhật số lượng và kiểm tra tổng tiền.
6. Thử các trường hợp sản phẩm không hợp lệ hoặc hết hàng.
7. Kiểm tra các chức năng yêu cầu đăng nhập.
8. Đăng nhập bằng tài khoản quản trị hợp lệ.
9. Thử xem, thêm, sửa và xóa sản phẩm trong Admin.
10. Kiểm tra dữ liệu thay đổi có được cập nhật chính xác trên website hay không.
11. Thử truy cập API quản trị bằng tài khoản không có quyền quản trị để kiểm tra cơ chế bảo vệ.

Chỉ đánh dấu chức năng hoàn thành sau khi đã kiểm thử và xác nhận kết quả.

## 10. Hướng phát triển

- Hoàn thiện và đồng bộ giao diện trên các kích thước màn hình.
- Hoàn thiện quy trình đăng ký, đăng nhập và quản lý phiên người dùng.
- Đồng bộ giỏ hàng với backend nếu phạm vi hệ thống yêu cầu.
- Hoàn thiện quản lý sản phẩm và tồn kho.
- Bổ sung tìm kiếm, lọc và sắp xếp sản phẩm.
- Hoàn thiện quy trình đặt hàng và thanh toán nếu thuộc yêu cầu đồ án.
- Bổ sung kiểm thử tự động và kiểm tra chất lượng code.
- Hoàn thiện tài liệu API, sơ đồ cơ sở dữ liệu và hướng dẫn triển khai.

---

## 👥 Thành viên dự án

| STT | Họ và tên | Vai trò |
|---|---|---|
| 1 | Dương Tuấn Dũng | Trưởng nhóm, Frontend, Admin và tích hợp |
| 2 | Mạc Đức Hải | Authentication |
| 3 | Hà Văn Dương | Shopping Cart |
| 4 | Nguyễn Duy Anh | Backend và Database |
| 5 | Đỗ Văn Cường | Product Detail |

*Thay các phần trong ngoặc vuông bằng thông tin thực tế của nhóm.*

---

**Repository:** https://github.com/TuanDungir/website-ban-dien-thoai-

**Mục đích:** Phục vụ học tập, thực hành phát triển website và làm việc nhóm bằng GitHub.
