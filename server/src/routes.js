/* REST API dùng chung cho Client và Admin.
   Cùng một endpoint phục vụ cả hai — chỉ khác middleware phân quyền. */

const express = require('express');
const svc = require('./services');
const { ApiError, requireUser, requireAdmin } = require('./middleware');

const router = express.Router();

/* Mọi thao tác ghi đều bọc try/catch qua express 4 sync handler:
   lỗi ApiError sẽ được error middleware ở index.js xử lý. */

/* ------------------------------ Metadata ------------------------------ */
router.get('/meta/statuses', (_req, res) => {
  res.json({
    statuses: svc.ORDER_STATUSES.map((key) => ({ key, label: svc.STATUS_LABELS[key] })),
    transitions: svc.TRANSITIONS
  });
});

/* ------------------------------ Sản phẩm (public) ------------------------------ */
/* GET /api/products?q=&brand=  — website khách đọc danh sách đang bán */
router.get('/products', (req, res) => {
  res.json({
    data: svc.listProducts({
      q: req.query.q || '',
      brand: req.query.brand || ''
    })
  });
});

router.get('/products/:id', (req, res) => {
  res.json({ data: svc.getProduct(req.params.id) });
});

/* ------------------------------ Tài khoản khách ------------------------------ */
router.post('/auth/register', (req, res) => {
  const user = svc.registerUser(req.body || {});
  const token = require('./auth').signToken({ sub: user.id, kind: 'user' });
  res.status(201).json({ data: { user, token } });
});

router.post('/auth/login', (req, res) => {
  const { user } = svc.loginUser(req.body || {});
  const token = require('./auth').signToken({ sub: user.id, kind: 'user' });
  res.json({ data: { user, token } });
});

/* GET /api/me — thông tin tài khoản đang đăng nhập (khôi phục phiên) */
router.get('/me', requireUser, (req, res) => {
  res.json({ data: svc.getUser(req.user.id) });
});

/* PUT /api/me — khách cập nhật họ tên / địa chỉ giao hàng mặc định.
   Địa chỉ này hiển thị trong trang Quản lý khách hàng của Admin. */
router.put('/me', requireUser, (req, res) => {
  res.json({ data: svc.updateProfile(req.user.id, req.body || {}) });
});

/* ------------------------------ Đăng nhập quản trị ------------------------------ */
router.post('/admin/login', (req, res) => {
  const { admin } = svc.loginAdmin(req.body || {});
  const token = require('./auth').signToken({ sub: admin.id, kind: 'admin', role: admin.role });
  res.json({ data: { admin, token } });
});

/* ------------------------------ Khách hàng (admin) ------------------------------ */
router.get('/admin/customers', requireAdmin(['superadmin', 'orders']), (req, res) => {
  res.json({
    data: svc.listUsers({ q: req.query.q || '', status: req.query.status || '' })
  });
});

router.get('/admin/customers/:id', requireAdmin(['superadmin', 'orders']), (req, res) => {
  res.json({ data: svc.getUser(req.params.id) });
});

/* PUT /api/admin/customers/:id/status  body: { status: 'active' | 'locked' } */
router.put('/admin/customers/:id/status', requireAdmin(['superadmin']), (req, res) => {
  res.json({ data: svc.setUserStatus(req.params.id, (req.body || {}).status) });
});

/* ------------------------------ Sản phẩm (admin CRUD) ------------------------------ */
router.get('/admin/products', requireAdmin(['superadmin', 'catalog']), (req, res) => {
  res.json({
    data: svc.listProducts({
      q: req.query.q || '',
      brand: req.query.brand || '',
      status: req.query.status || '',
      includeHidden: true
    })
  });
});

router.post('/admin/products', requireAdmin(['superadmin', 'catalog']), (req, res) => {
  res.status(201).json({ data: svc.createProduct(req.body || {}) });
});

router.put('/admin/products/:id', requireAdmin(['superadmin', 'catalog']), (req, res) => {
  res.json({ data: svc.updateProduct(req.params.id, req.body || {}) });
});

/* Sửa nhanh giá / tồn kho của MỘT biến thể (dung lượng + màu) */
router.put('/admin/variants/:id', requireAdmin(['superadmin', 'catalog']), (req, res) => {
  res.json({ data: svc.updateVariant(req.params.id, req.body || {}) });
});

router.delete('/admin/products/:id', requireAdmin(['superadmin', 'catalog']), (req, res) => {
  res.json({ data: svc.deleteProduct(req.params.id) });
});

/* ------------------------------ Danh mục ------------------------------ */
router.get('/categories', (_req, res) => {
  res.json({ data: require('./db').all('SELECT id, name, slug FROM categories ORDER BY name') });
});

/* ------------------------------ Đơn hàng ------------------------------ */
/* POST /api/orders — khách đặt hàng; trừ kho + tạo đơn trong 1 transaction */
router.post('/orders', requireUser, (req, res) => {
  const body = req.body || {};
  const order = svc.createOrder(req.user.id, {
    items: body.items,
    note: body.note,
    /* Thông tin giao hàng do khách chọn ở bước thanh toán */
    receiver: body.receiver,
    shipping: body.shipping,
    payment: body.payment
  });
  res.status(201).json({ data: order });
});

/* GET /api/orders — lịch sử đơn của chính khách đang đăng nhập */
router.get('/orders', requireUser, (req, res) => {
  res.json({ data: svc.listOrders({ userId: req.user.id }) });
});

router.get('/orders/:id', requireUser, (req, res) => {
  const order = svc.getOrder(req.params.id);
  if (order.userId !== req.user.id) throw new ApiError(403, 'Bạn không có quyền xem đơn này.', 'forbidden');
  res.json({ data: order });
});

/* GET /api/admin/orders?status=pending — hàng đợi của Admin */
router.get('/admin/orders', requireAdmin(['superadmin', 'orders']), (req, res) => {
  res.json({
    data: svc.listOrders({
      status: req.query.status || '',
      q: req.query.q || '',
      limit: Math.min(Number(req.query.limit) || 200, 500)
    })
  });
});

router.get('/admin/orders/:id', requireAdmin(['superadmin', 'orders']), (req, res) => {
  res.json({ data: svc.getOrder(req.params.id) });
});

/* PUT /api/admin/orders/:id/status  body: { status, note }
   Duyệt: approved | Từ chối: rejected (tự hoàn kho) */
router.put('/admin/orders/:id/status', requireAdmin(['superadmin', 'orders']), (req, res) => {
  const body = req.body || {};
  const order = svc.updateOrderStatus(req.params.id, body.status, {
    changedBy: `admin:${req.admin.id}`,
    note: body.note
  });
  res.json({ data: order });
});

module.exports = router;
