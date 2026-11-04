/* Lớp nghiệp vụ DÙNG CHUNG cho cả Client và Admin.
   Đây là nơi duy nhất thay đổi dữ liệu: REST API và Socket.IO đều gọi vào đây,
   nên hai phân hệ luôn nhìn thấy cùng một trạng thái.

   Mô hình sản phẩm:
     products           = dòng máy (iPhone 17 Pro Max)
     product_variants   = biến thể bán được (256GB / Đen) — có giá + tồn riêng
   Mọi thao tác kho (trừ/cộng) đều tác động lên VARIANT, không phải product. */

const { tx, all, get, run, nowIso } = require('./db');
const { ApiError } = require('./middleware');
const { hashPassword, verifyPassword } = require('./auth');
const bus = require('./events');

const ORDER_STATUSES = ['pending', 'approved', 'shipping', 'delivered', 'rejected'];

const STATUS_LABELS = {
  pending: 'Chờ duyệt',
  approved: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  rejected: 'Đã huỷ'
};

const TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['shipping', 'rejected'],
  shipping: ['delivered'],
  delivered: [],
  rejected: []
};

/* ------------------------------ Chuẩn hoá ------------------------------ */

function toVariant(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    memory: row.memory,
    color: row.color,
    price: row.price,
    salePrice: row.sale_price,
    stock: row.stock,
    image: row.image,
    status: row.status,
    sortOrder: row.sort_order
  };
}

/* Một sản phẩm trả về kèm toàn bộ biến thể + tổng tồn kho.
   Client dùng mảng variants để dựng bộ chọn dung lượng / màu. */
function toProduct(row, variants) {
  if (!row) return null;
  let specs = {};
  try { specs = JSON.parse(row.specs || '{}'); } catch (_) { specs = {}; }

  const list = (variants || []).map(toVariant);
  const active = list.filter((v) => v.status === 'active');
  const totalStock = active.reduce((s, v) => s + v.stock, 0);

  /* Giá hiển thị: thấp nhất trong các biến thể đang bán */
  const cheapest = active.reduce(
    (min, v) => (min == null || v.salePrice < min ? v.salePrice : min), null);
  const highest = active.reduce((max, v) => (v.price > max ? v.price : max), 0);

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    categoryId: row.category_id,
    categoryName: row.category_name || null,
    image: row.image,
    specs,
    status: row.status,
    /* Tổng hợp cho danh sách / thẻ sản phẩm */
    price: highest || 0,
    salePrice: cheapest != null ? cheapest : 0,
    stock: totalStock,
    /* Dữ liệu đầy đủ cho trang chi tiết + admin */
    variants: list,
    memories: [...new Set(list.map((v) => v.memory))],
    colors: [...new Set(list.map((v) => v.color).filter(Boolean))],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    orderCount: row.order_count != null ? row.order_count : 0,
    totalSpent: row.total_spent != null ? row.total_spent : 0
  };
}

function toOrder(row, items) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    customerName: row.customer_name || null,
    customerPhone: row.customer_phone || null,
    customerEmail: row.customer_email || null,
    receiverName: row.receiver_name || '',
    receiverPhone: row.receiver_phone || '',
    shippingAddress: row.shipping_address || '',
    paymentMethod: row.payment_method || 'cod',
    totalAmount: row.total_amount,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] || row.status,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items || []
  };
}

/* ------------------------------ Tiện ích ------------------------------ */

function str(value, field, { max = 500, required = true } = {}) {
  const v = value == null ? '' : String(value).trim();
  if (required && !v) throw new ApiError(400, `Thiếu thông tin: ${field}.`, 'validation');
  if (v.length > max) throw new ApiError(400, `${field} quá dài (tối đa ${max} ký tự).`, 'validation');
  return v;
}

function int(value, field, { min = 0, max = Number.MAX_SAFE_INTEGER, required = true } = {}) {
  if (value === '' || value == null) {
    if (required) throw new ApiError(400, `Thiếu thông tin: ${field}.`, 'validation');
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) throw new ApiError(400, `${field} phải là số nguyên.`, 'validation');
  if (n < min || n > max) throw new ApiError(400, `${field} phải trong khoảng ${min}–${max}.`, 'validation');
  return n;
}

/* ------------------------------ Khách hàng ------------------------------ */

function listUsers({ q = '', status = '' } = {}) {
  const params = [];
  let where = '1=1';
  if (q) {
    where += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (status) { where += ' AND u.status = ?'; params.push(status); }

  return all(
    `SELECT u.*,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
            (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o
              WHERE o.user_id = u.id AND o.status <> 'rejected') AS total_spent
       FROM users u WHERE ${where}
      ORDER BY u.created_at DESC`,
    ...params
  ).map(toUser);
}

function getUser(id) {
  const row = get(
    `SELECT u.*,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
            (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o
              WHERE o.user_id = u.id AND o.status <> 'rejected') AS total_spent
       FROM users u WHERE u.id = ?`, id
  );
  if (!row) throw new ApiError(404, 'Không tìm thấy khách hàng.', 'not_found');
  return toUser(row);
}

function updateProfile(userId, body) {
  const fields = {};
  if (body.fullName !== undefined) fields.full_name = str(body.fullName, 'Họ tên', { max: 120 });
  if (body.address !== undefined) fields.address = str(body.address, 'Địa chỉ', { max: 300, required: false });
  if (body.email !== undefined) {
    const email = str(body.email, 'Email', { max: 160 }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Email không hợp lệ.', 'validation');
    if (get('SELECT id FROM users WHERE email = ? AND id <> ?', email, userId)) {
      throw new ApiError(409, 'Email này đã được dùng cho tài khoản khác.', 'duplicate');
    }
    fields.email = email;
  }

  const keys = Object.keys(fields);
  if (keys.length) {
    run(
      `UPDATE users SET ${keys.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
      ...keys.map((k) => fields[k]), nowIso(), userId
    );
  }
  const user = getUser(userId);
  bus.emitToRole('customers', 'user:updated', user);
  return user;
}

function setUserStatus(id, status) {
  if (!['active', 'locked'].includes(status)) {
    throw new ApiError(400, "Trạng thái phải là 'active' hoặc 'locked'.", 'validation');
  }
  if (!get('SELECT id FROM users WHERE id = ?', id)) {
    throw new ApiError(404, 'Không tìm thấy khách hàng.', 'not_found');
  }
  run('UPDATE users SET status = ?, updated_at = ? WHERE id = ?', status, nowIso(), id);
  const updated = getUser(id);
  bus.emitToRoom(`user:${id}`, 'user:status', { id: Number(id), status });
  bus.emitToRole('customers', 'user:updated', updated);
  return updated;
}
/* ------------------------------ Sản phẩm ------------------------------ */

function variantsOf(productId) {
  return all('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order, id', productId);
}

function listProducts({ q = '', brand = '', status = '', includeHidden = false } = {}) {
  const params = [];
  let where = '1=1';
  if (!includeHidden) where += " AND p.status = 'active'";
  else if (status) { where += ' AND p.status = ?'; params.push(status); }
  if (q) {
    where += ' AND (p.name LIKE ? OR p.brand LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like);
  }
  if (brand) { where += ' AND p.brand = ?'; params.push(brand); }

  const rows = all(
    `SELECT p.*, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
      WHERE ${where}
      ORDER BY p.updated_at DESC, p.id DESC`,
    ...params
  );

  /* Lấy biến thể của tất cả sản phẩm trong MỘT truy vấn (tránh N+1) */
  const byProduct = new Map();
  for (const v of all('SELECT * FROM product_variants ORDER BY sort_order, id')) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id).push(v);
  }
  return rows.map((r) => toProduct(r, byProduct.get(r.id) || []));
}

function getProduct(id) {
  const row = get(
    `SELECT p.*, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?`, id
  );
  if (!row) throw new ApiError(404, 'Không tìm thấy sản phẩm.', 'not_found');
  return toProduct(row, variantsOf(id));
}

/**
 * Tạo sản phẩm kèm danh sách biến thể.
 * body.variants = [{ memory, color, price, salePrice, stock, image? }, ...]
 * Nếu không truyền variants, tạo một biến thể mặc định để sản phẩm bán được ngay.
 */
function createProduct(body) {
  const name = str(body.name, 'Tên sản phẩm', { max: 200 });
  const brand = str(body.brand, 'Thương hiệu', { max: 80 });
  const categoryId = int(body.categoryId, 'Danh mục', { min: 1 });
  if (!get('SELECT id FROM categories WHERE id = ?', categoryId)) {
    throw new ApiError(400, 'Danh mục không tồn tại.', 'validation');
  }

  const image = str(body.image, 'Hình ảnh', { max: 500, required: false });
  const specs = body.specs == null ? '{}' : (typeof body.specs === 'string'
    ? body.specs : JSON.stringify(body.specs));
  try { JSON.parse(specs); } catch (_) {
    throw new ApiError(400, 'Thông số kỹ thuật phải là JSON hợp lệ.', 'validation');
  }

  const rawVariants = Array.isArray(body.variants) && body.variants.length
    ? body.variants
    : [{
        memory: body.memory || 'Tiêu chuẩn',
        color: body.color || '',
        price: body.price,
        salePrice: body.salePrice,
        stock: body.stock
      }];

  const variants = rawVariants.map((v, i) => {
    const price = int(v.price, `Giá bán biến thể ${i + 1}`, { min: 0 });
    const salePrice = v.salePrice == null || v.salePrice === ''
      ? price : int(v.salePrice, `Giá khuyến mãi biến thể ${i + 1}`, { min: 0 });
    if (salePrice > price) {
      throw new ApiError(400, `Biến thể ${i + 1}: giá khuyến mãi không được lớn hơn giá bán.`, 'validation');
    }
    return {
      memory: str(v.memory, `Dung lượng biến thể ${i + 1}`, { max: 40 }),
      color: str(v.color, `Màu biến thể ${i + 1}`, { max: 60, required: false }),
      price,
      sale_price: salePrice,
      stock: int(v.stock, `Tồn kho biến thể ${i + 1}`, { min: 0 }),
      image: str(v.image, `Ảnh biến thể ${i + 1}`, { max: 500, required: false })
    };
  });

  const now = nowIso();
  const created = tx(() => {
    const res = run(
      `INSERT INTO products (name, brand, category_id, image, specs, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
      name, brand, categoryId, image, specs, now, now
    );
    const id = Number(res.lastInsertRowid);
    for (const v of variants) {
      run(
        `INSERT INTO product_variants (product_id, memory, color, price, sale_price, stock, image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        id, v.memory, v.color, v.price, v.sale_price, v.stock, v.image
      );
    }
    return id;
  });

  const product = getProduct(created);
  bus.emitToAll('product:created', product);
  return product;
}

/**
 * Sửa sản phẩm. Có thể gửi kèm `variants` để thay toàn bộ biến thể;
 * biến thể đã nằm trong đơn hàng thì giữ lại (không xoá lịch sử).
 */
function updateProduct(id, body) {
  const current = getProduct(id);
  const fields = {};

  if (body.name !== undefined) fields.name = str(body.name, 'Tên sản phẩm', { max: 200 });
  if (body.brand !== undefined) fields.brand = str(body.brand, 'Thương hiệu', { max: 80 });
  if (body.categoryId !== undefined) {
    const cid = int(body.categoryId, 'Danh mục', { min: 1 });
    if (!get('SELECT id FROM categories WHERE id = ?', cid)) {
      throw new ApiError(400, 'Danh mục không tồn tại.', 'validation');
    }
    fields.category_id = cid;
  }
  if (body.image !== undefined) fields.image = str(body.image, 'Hình ảnh', { max: 500, required: false });
  if (body.specs !== undefined) {
    const specs = typeof body.specs === 'string' ? body.specs : JSON.stringify(body.specs);
    try { JSON.parse(specs); } catch (_) {
      throw new ApiError(400, 'Thông số kỹ thuật phải là JSON hợp lệ.', 'validation');
    }
    fields.specs = specs;
  }
  if (body.status !== undefined) {
    if (!['active', 'hidden'].includes(body.status)) {
      throw new ApiError(400, "Trạng thái phải là 'active' hoặc 'hidden'.", 'validation');
    }
    fields.status = body.status;
  }

  tx(() => {
    const keys = Object.keys(fields);
    if (keys.length) {
      run(
        `UPDATE products SET ${keys.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
        ...keys.map((k) => fields[k]), nowIso(), id
      );
    }

    /* Cập nhật biến thể nếu client gửi lên */
    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (v.id) {
          /* Biến thể đã có: sửa tại chỗ */
          const price = v.price !== undefined ? int(v.price, 'Giá bán', { min: 0 }) : null;
          const salePrice = v.salePrice !== undefined ? int(v.salePrice, 'Giá khuyến mãi', { min: 0 }) : null;
          const cur = get('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', v.id, id);
          if (!cur) throw new ApiError(404, `Biến thể #${v.id} không thuộc sản phẩm này.`, 'not_found');

          const nextPrice = price != null ? price : cur.price;
          const nextSale = salePrice != null ? salePrice : cur.sale_price;
          if (nextSale > nextPrice) {
            throw new ApiError(400, 'Giá khuyến mãi không được lớn hơn giá bán.', 'validation');
          }

          run(
            `UPDATE product_variants
                SET memory = COALESCE(?, memory), color = COALESCE(?, color),
                    price = ?, sale_price = ?, stock = COALESCE(?, stock),
                    image = COALESCE(?, image), status = COALESCE(?, status)
              WHERE id = ?`,
            v.memory == null ? null : String(v.memory).slice(0, 40),
            v.color == null ? null : String(v.color).slice(0, 60),
            nextPrice, nextSale,
            v.stock == null ? null : int(v.stock, 'Tồn kho', { min: 0 }),
            v.image == null ? null : String(v.image).slice(0, 500),
            v.status == null ? null : String(v.status),
            v.id
          );
        } else {
          /* Biến thể mới thêm vào sản phẩm đã có */
          const price = int(v.price, 'Giá bán', { min: 0 });
          const salePrice = v.salePrice == null || v.salePrice === ''
            ? price : int(v.salePrice, 'Giá khuyến mãi', { min: 0 });
          if (salePrice > price) {
            throw new ApiError(400, 'Giá khuyến mãi không được lớn hơn giá bán.', 'validation');
          }
          run(
            `INSERT INTO product_variants (product_id, memory, color, price, sale_price, stock, image, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
            id,
            str(v.memory, 'Dung lượng', { max: 40 }),
            str(v.color, 'Màu', { max: 60, required: false }),
            price, salePrice, int(v.stock, 'Tồn kho', { min: 0 }),
            str(v.image, 'Ảnh', { max: 500, required: false })
          );
        }
      }
    }
  });

  const updated = getProduct(id);
  bus.emitToAll('product:updated', updated);
  return updated;
}

function deleteProduct(id) {
  const product = getProduct(id);
  const used = get(
    'SELECT COUNT(*) AS n FROM order_items WHERE product_id = ?', id
  ).n;

  /* Đã bán rồi -> chỉ ẩn, giữ lịch sử đơn hàng */
  if (used > 0) {
    run("UPDATE products SET status = 'hidden', updated_at = ? WHERE id = ?", nowIso(), id);
    bus.emitToAll('product:deleted', { id: Number(id), softDeleted: true });
    return { id: Number(id), softDeleted: true, product };
  }

  tx(() => {
    run('DELETE FROM product_variants WHERE product_id = ?', id);
    run('DELETE FROM products WHERE id = ?', id);
  });
  bus.emitToAll('product:deleted', { id: Number(id), softDeleted: false });
  return { id: Number(id), softDeleted: false, product };
}

/* Sửa nhanh giá/tồn của MỘT biến thể (dùng ở bảng quản lý kho) */
function updateVariant(variantId, body) {
  const cur = get('SELECT * FROM product_variants WHERE id = ?', variantId);
  if (!cur) throw new ApiError(404, 'Không tìm thấy biến thể.', 'not_found');

  const price = body.price !== undefined ? int(body.price, 'Giá bán', { min: 0 }) : cur.price;
  const salePrice = body.salePrice !== undefined
    ? int(body.salePrice, 'Giá khuyến mãi', { min: 0 }) : cur.sale_price;
  if (salePrice > price) {
    throw new ApiError(400, 'Giá khuyến mãi không được lớn hơn giá bán.', 'validation');
  }
  const stock = body.stock !== undefined ? int(body.stock, 'Tồn kho', { min: 0 }) : cur.stock;

  run(
    'UPDATE product_variants SET price = ?, sale_price = ?, stock = ? WHERE id = ?',
    price, salePrice, stock, variantId
  );

  const product = getProduct(cur.product_id);
  bus.emitToAll('product:updated', product);
  return product;
}
/* ------------------------------ Đơn hàng ------------------------------ */

function orderItems(orderId) {
  return all(
    `SELECT id, variant_id, product_id, product_name, memory, color, unit_price, quantity
       FROM order_items WHERE order_id = ? ORDER BY id`,
    orderId
  ).map((r) => ({
    id: r.id,
    variantId: r.variant_id,
    productId: r.product_id,
    productName: r.product_name,
    memory: r.memory,
    color: r.color,
    unitPrice: r.unit_price,
    quantity: r.quantity,
    lineTotal: r.unit_price * r.quantity
  }));
}

function getOrder(orderId) {
  const row = get(
    `SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email
       FROM orders o JOIN users u ON u.id = o.user_id
      WHERE o.id = ?`, orderId
  );
  if (!row) throw new ApiError(404, 'Không tìm thấy đơn hàng.', 'not_found');
  return toOrder(row, orderItems(orderId));
}

function listOrders({ status = '', userId = null, q = '', limit = 200 } = {}) {
  const params = [];
  let where = '1=1';
  if (status) { where += ' AND o.status = ?'; params.push(status); }
  if (userId) { where += ' AND o.user_id = ?'; params.push(userId); }
  if (q) {
    where += ' AND (o.code LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return all(
    `SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email
       FROM orders o JOIN users u ON u.id = o.user_id
      WHERE ${where}
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT ?`,
    ...params, Number(limit)
  ).map((r) => toOrder(r, orderItems(r.id)));
}

function nextOrderCode() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `DH-${stamp}-`;
  const row = get('SELECT code FROM orders WHERE code LIKE ? ORDER BY code DESC LIMIT 1', `${prefix}%`);
  const n = row ? Number(row.code.slice(prefix.length)) + 1 : 1;
  return prefix + String(n).padStart(4, '0');
}

/**
 * Tạo đơn hàng — TOÀN BỘ trong một transaction:
 *   1. kiểm tra tồn kho TỪNG BIẾN THỂ
 *   2. trừ kho bằng UPDATE có điều kiện stock >= qty (chống bán vượt tồn)
 *   3. tạo orders + order_items
 * Giá LUÔN đọc lại từ DB theo variant, không tin giá client gửi lên.
 */
function createOrder(userId, body) {
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (!rawItems.length) throw new ApiError(400, 'Đơn hàng phải có ít nhất một sản phẩm.', 'validation');
  if (rawItems.length > 50) throw new ApiError(400, 'Một đơn tối đa 50 dòng sản phẩm.', 'validation');

  /* Gộp dòng trùng biến thể để không trừ kho hai lần cho cùng một SKU */
  const merged = new Map();
  for (const it of rawItems) {
    const variantId = int(it.variantId, 'Mã biến thể', { min: 1 });
    const quantity = int(it.quantity, 'Số lượng', { min: 1, max: 99 });
    merged.set(variantId, (merged.get(variantId) || 0) + quantity);
  }

  const note = body.note == null ? '' : String(body.note).slice(0, 500);
  const receiver = body.receiver || {};
  const receiverName = receiver.name == null ? '' : String(receiver.name).slice(0, 120);
  const receiverPhone = receiver.phone == null ? '' : String(receiver.phone).slice(0, 20);
  const shippingAddress = receiver.address == null ? '' : String(receiver.address).slice(0, 300);
  const paymentMethod = ['cod', 'deposit', 'bank', 'momo', 'vnpay', 'zalopay', 'card', 'store']
    .includes(body.payment) ? body.payment : 'cod';

  const result = tx(() => {
    const lines = [];
    let total = 0;

    for (const [variantId, quantity] of merged) {
      const v = get(
        `SELECT v.id, v.product_id, v.memory, v.color, v.sale_price, v.stock, v.status,
                p.name AS product_name, p.status AS product_status
           FROM product_variants v JOIN products p ON p.id = v.product_id
          WHERE v.id = ?`, variantId
      );
      if (!v) throw new ApiError(400, `Biến thể #${variantId} không tồn tại.`, 'validation');
      if (v.status !== 'active' || v.product_status !== 'active') {
        throw new ApiError(409, `"${v.product_name}" đã ngừng bán.`, 'out_of_stock');
      }

      const label = `${v.product_name} ${v.memory}${v.color ? ' ' + v.color : ''}`;

      /* Trừ kho có điều kiện trên đúng biến thể */
      const upd = run(
        'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
        quantity, variantId, quantity
      );
      if (upd.changes !== 1) {
        throw new ApiError(409, `"${label}" chỉ còn ${v.stock} máy, không đủ ${quantity}.`, 'out_of_stock');
      }

      const unitPrice = v.sale_price;
      total += unitPrice * quantity;
      lines.push({
        variantId,
        productId: v.product_id,
        name: v.product_name,
        memory: v.memory,
        color: v.color,
        unitPrice,
        quantity
      });
    }

    const now = nowIso();
    const code = nextOrderCode();
    const ins = run(
      `INSERT INTO orders (code, user_id, total_amount, status, note,
                           receiver_name, receiver_phone, shipping_address, payment_method,
                           created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      code, userId, total, note, receiverName, receiverPhone, shippingAddress, paymentMethod, now, now
    );
    const orderId = Number(ins.lastInsertRowid);

    for (const l of lines) {
      run(
        `INSERT INTO order_items (order_id, variant_id, product_id, product_name, memory, color, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        orderId, l.variantId, l.productId, l.name, l.memory, l.color, l.unitPrice, l.quantity
      );
    }

    run(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
       VALUES (?, NULL, 'pending', ?)`,
      orderId, `user:${userId}`
    );

    return { orderId, lines };
  });

  const order = getOrder(result.orderId);
  bus.emitToRole('orders', 'order:created', order);
  bus.emitToRole('dashboard', 'order:created', order);

  /* Đẩy tồn kho mới của từng biến thể xuống website */
  const touched = new Set(result.lines.map((l) => l.productId));
  for (const pid of touched) {
    const fresh = getProduct(pid);
    if (fresh) bus.emitToAll('product:updated', fresh);
  }
  return order;
}

/**
 * Admin đổi trạng thái đơn.
 * - Chỉ cho phép chuyển theo TRANSITIONS.
 * - Chuyển sang 'rejected' -> HOÀN KHO đúng một lần (cờ stock_returned).
 */
function updateOrderStatus(orderId, status, { changedBy = 'admin', note } = {}) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `Trạng thái không hợp lệ. Chỉ nhận: ${ORDER_STATUSES.join(', ')}.`, 'validation');
  }

  const updated = tx(() => {
    const row = get('SELECT * FROM orders WHERE id = ?', orderId);
    if (!row) throw new ApiError(404, 'Không tìm thấy đơn hàng.', 'not_found');
    if (row.status === status) return { row, unchanged: true };

    const allowed = TRANSITIONS[row.status] || [];
    if (!allowed.includes(status)) {
      throw new ApiError(409,
        `Không thể chuyển từ "${STATUS_LABELS[row.status]}" sang "${STATUS_LABELS[status]}".`,
        'invalid_transition');
    }

    let restored = false;
    if (status === 'rejected' && row.stock_returned === 0) {
      const items = all('SELECT variant_id, quantity FROM order_items WHERE order_id = ?', orderId);
      for (const it of items) {
        run('UPDATE product_variants SET stock = stock + ? WHERE id = ?', it.quantity, it.variant_id);
      }
      restored = true;
    }

    run(
      `UPDATE orders SET status = ?, note = COALESCE(?, note), stock_returned = ?, updated_at = ? WHERE id = ?`,
      status, note == null ? null : String(note).slice(0, 500),
      restored ? 1 : row.stock_returned, nowIso(), orderId
    );
    run(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
       VALUES (?, ?, ?, ?)`,
      orderId, row.status, status, changedBy
    );
    return { row, unchanged: false, restored };
  });

  const order = getOrder(orderId);

  if (!updated.unchanged) {
    bus.emitToRole('orders', 'order:updated', order);
    bus.emitToRole('dashboard', 'order:updated', order);
    bus.emitToRoom(`user:${order.userId}`, 'order:updated', order);

    if (updated.restored) {
      const touched = new Set(order.items.map((i) => i.productId));
      for (const pid of touched) {
        const fresh = getProduct(pid);
        if (fresh) bus.emitToAll('product:updated', fresh);
      }
    }
  }
  return order;
}
/* ------------------------------ Đăng ký / đăng nhập ------------------------------ */

function registerUser(body) {
  const fullName = str(body.fullName, 'Họ tên', { max: 120 });
  const email = str(body.email, 'Email', { max: 160 }).toLowerCase();
  const phone = str(body.phone, 'Số điện thoại', { max: 20 }).replace(/\s/g, '');
  const password = str(body.password, 'Mật khẩu', { max: 200 });
  const address = str(body.address, 'Địa chỉ', { max: 300, required: false });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Email không hợp lệ.', 'validation');
  if (!/^0\d{9}$/.test(phone)) throw new ApiError(400, 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0.', 'validation');
  if (password.length < 6) throw new ApiError(400, 'Mật khẩu phải có ít nhất 6 ký tự.', 'validation');

  if (get('SELECT id FROM users WHERE email = ?', email)) {
    throw new ApiError(409, 'Email này đã được đăng ký.', 'duplicate');
  }
  if (get('SELECT id FROM users WHERE phone = ?', phone)) {
    throw new ApiError(409, 'Số điện thoại này đã được đăng ký.', 'duplicate');
  }

  const now = nowIso();
  const res = run(
    `INSERT INTO users (full_name, email, phone, password_hash, address, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
    fullName, email, phone, hashPassword(password), address, now, now
  );
  const user = getUser(Number(res.lastInsertRowid));
  bus.emitToRole('customers', 'user:created', user);
  bus.emitToRole('dashboard', 'user:created', user);
  return user;
}

function loginUser(body) {
  const login = str(body.email, 'Email / số điện thoại', { max: 160 });
  const password = str(body.password, 'Mật khẩu', { max: 200 });

  const row = get('SELECT * FROM users WHERE email = ? OR phone = ?', login.toLowerCase(), login);
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new ApiError(401, 'Email/số điện thoại hoặc mật khẩu không đúng.', 'invalid_credentials');
  }
  if (row.status === 'locked') {
    throw new ApiError(403, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.', 'locked');
  }
  return { user: getUser(row.id) };
}

function loginAdmin(body) {
  const login = str(body.email, 'Email / mã nhân viên', { max: 160 });
  const password = str(body.password, 'Mật khẩu', { max: 200 });

  const row = get('SELECT * FROM admins WHERE email = ? OR staff_id = ?',
    login.toLowerCase(), login.toUpperCase());
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new ApiError(401, 'Tài khoản hoặc mật khẩu quản trị không đúng.', 'invalid_credentials');
  }
  if (row.status !== 'active') {
    throw new ApiError(403, 'Tài khoản quản trị đã bị khóa.', 'locked');
  }
  return {
    admin: {
      id: row.id,
      staffId: row.staff_id,
      fullName: row.full_name,
      email: row.email,
      role: row.role
    }
  };
}

module.exports = {
  ORDER_STATUSES,
  STATUS_LABELS,
  TRANSITIONS,
  toProduct,
  toUser,
  toOrder,
  listUsers,
  getUser,
  updateProfile,
  setUserStatus,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariant,
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  registerUser,
  loginUser,
  loginAdmin
};
