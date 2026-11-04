-- =====================================================================
--  THEGIOIDIENTHOAI — Lược đồ CSDL dùng chung cho Client + Admin
--  Dialect: SQLite (chạy ngay bằng node:sqlite, không cần cài đặt gì)
--  Phần "Chuyển sang MySQL / SQL Server" trong HUONG_DAN_DONG_BO.md
--  liệt kê các thay đổi cú pháp khi nộp kèm báo cáo.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- 1. USERS — khách hàng đăng ký từ website bán hàng
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name      TEXT    NOT NULL,
  email          TEXT    NOT NULL UNIQUE,
  phone          TEXT    NOT NULL UNIQUE,
  password_hash  TEXT    NOT NULL,              -- scrypt$<salt>$<hash>
  address        TEXT    NOT NULL DEFAULT '',
  status         TEXT    NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'locked')),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_status     ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ---------------------------------------------------------------------
-- 2. ADMINS — tài khoản quản trị (tách riêng khỏi khách hàng)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id       TEXT    NOT NULL UNIQUE,
  full_name      TEXT    NOT NULL,
  email          TEXT    NOT NULL UNIQUE,
  password_hash  TEXT    NOT NULL,
  role           TEXT    NOT NULL DEFAULT 'superadmin'
                 CHECK (role IN ('superadmin', 'catalog', 'orders')),
  status         TEXT    NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'locked')),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
-- ---------------------------------------------------------------------
-- 3. CATEGORIES — danh mục (điện thoại, phụ kiện…)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  slug       TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- 4. PRODUCTS — một dòng máy
--    Giá và tồn kho KHÔNG nằm ở đây mà ở product_variants (theo dung
--    lượng + màu), vì mỗi phiên bản có giá và số lượng riêng.
--    specs: thông số kỹ thuật dạng JSON (màn hình, chip, pin…)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  brand         TEXT    NOT NULL,
  category_id   INTEGER NOT NULL,
  image         TEXT    NOT NULL DEFAULT '',
  specs         TEXT    NOT NULL DEFAULT '{}',
  status        TEXT    NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'hidden')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_products_brand  ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_cat    ON products(category_id);

-- ---------------------------------------------------------------------
-- 4b. PRODUCT_VARIANTS — biến thể theo dung lượng + màu
--     Mỗi dòng là một SKU bán được: có giá riêng và tồn kho riêng.
--     UNIQUE(product_id, memory, color) chặn tạo trùng biến thể.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL,
  memory      TEXT    NOT NULL,
  color       TEXT    NOT NULL DEFAULT '',
  price       INTEGER NOT NULL CHECK (price >= 0),
  sale_price  INTEGER NOT NULL CHECK (sale_price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image       TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'hidden')),
  /* Thứ tự hiển thị: giữ đúng thứ tự dung lượng/màu như dữ liệu gốc
     (256GB trước 512GB, không phải sắp theo chữ cái). */
  sort_order  INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT fk_variants_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT uq_variants_sku
    UNIQUE (product_id, memory, color),
  CONSTRAINT ck_variants_sale_le_price
    CHECK (sale_price <= price)
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
-- ---------------------------------------------------------------------
-- 5. ORDERS — đơn hàng do khách tạo từ website
--    Trạng thái dùng CHUNG cho cả hai phân hệ (Client chỉ hiển thị):
--      pending   : Chờ duyệt   (đơn vừa đặt, kho đã bị trừ)
--      approved  : Đã xác nhận (admin duyệt)
--      shipping  : Đang giao
--      delivered : Đã giao
--      rejected  : Đã huỷ      (admin từ chối -> hoàn kho)
--    stock_returned: cờ chống hoàn kho 2 lần khi huỷ.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  code            TEXT    NOT NULL UNIQUE,
  user_id         INTEGER NOT NULL,
  total_amount    INTEGER NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status          TEXT    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'shipping', 'delivered', 'rejected')),
  note            TEXT    NOT NULL DEFAULT '',
  /* Thông tin giao hàng chốt tại thời điểm đặt (snapshot) */
  receiver_name   TEXT    NOT NULL DEFAULT '',
  receiver_phone  TEXT    NOT NULL DEFAULT '',
  shipping_address TEXT   NOT NULL DEFAULT '',
  payment_method  TEXT    NOT NULL DEFAULT 'cod',
  stock_returned  INTEGER NOT NULL DEFAULT 0 CHECK (stock_returned IN (0, 1)),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- ---------------------------------------------------------------------
-- 6. ORDER_ITEMS — chi tiết đơn
--    product_name / unit_price là snapshot tại thời điểm mua: sau này
--    admin đổi tên hay đổi giá thì lịch sử đơn hàng không bị thay đổi.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL,
  variant_id    INTEGER NOT NULL,
  product_id    INTEGER NOT NULL,
  product_name  TEXT    NOT NULL,
  memory        TEXT    NOT NULL DEFAULT '',
  color         TEXT    NOT NULL DEFAULT '',
  unit_price    INTEGER NOT NULL CHECK (unit_price >= 0),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),

  CONSTRAINT fk_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_items_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_items_variant ON order_items(variant_id);

-- ---------------------------------------------------------------------
-- 7. ORDER_STATUS_HISTORY — nhật ký đổi trạng thái (truy vết)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL,
  from_status TEXT,
  to_status   TEXT    NOT NULL,
  changed_by  TEXT    NOT NULL DEFAULT 'system',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),

  CONSTRAINT fk_history_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);
