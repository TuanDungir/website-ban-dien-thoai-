/* Middleware xác thực + phân quyền.
   Nguyên tắc: phân quyền kiểm tra ở BACKEND, không chỉ ẩn nút trên giao diện. */
const { verifyToken } = require('./auth');
const { get } = require('./db');

class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || 'error';
  }
}

/** Lấy token từ header Authorization: Bearer <token> */
function readToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

/** Bắt buộc đăng nhập; gắn req.user = { id, kind: 'user' } vào request. */
function requireUser(req, _res, next) {
  const payload = verifyToken(readToken(req));
  if (!payload || payload.kind !== 'user') return next(new ApiError(401, 'Vui lòng đăng nhập.', 'unauthorized'));
  const user = get('SELECT id, status FROM users WHERE id = ?', payload.sub);
  if (!user) return next(new ApiError(401, 'Tài khoản không tồn tại.', 'unauthorized'));
  if (user.status === 'locked') return next(new ApiError(403, 'Tài khoản của bạn đã bị khóa.', 'locked'));
  req.user = { id: user.id, kind: 'user' };
  next();
}

/**
 * Bắt buộc là admin.
 * roles: mảng quyền được phép, bỏ trống = mọi admin đang hoạt động.
 */
function requireAdmin(roles) {
  return (req, _res, next) => {
    const payload = verifyToken(readToken(req));
    if (!payload || payload.kind !== 'admin') return next(new ApiError(401, 'Vui lòng đăng nhập quản trị.', 'unauthorized'));
    const admin = get('SELECT id, role, status FROM admins WHERE id = ?', payload.sub);
    if (!admin) return next(new ApiError(401, 'Tài khoản quản trị không tồn tại.', 'unauthorized'));
    if (admin.status !== 'active') return next(new ApiError(403, 'Tài khoản quản trị đã bị khóa.', 'locked'));
    if (roles && roles.length && !roles.includes(admin.role)) {
      return next(new ApiError(403, 'Vai trò của bạn không có quyền thực hiện thao tác này.', 'forbidden'));
    }
    req.admin = { id: admin.id, role: admin.role };
    next();
  };
}

/** Bọc handler async để lỗi được chuyển cho error middleware. */
const wrap = (fn) => (req, res, next) => {
  try {
    const out = fn(req, res, next);
    if (out && typeof out.catch === 'function') out.catch(next);
  } catch (err) {
    next(err);
  }
};

module.exports = { ApiError, requireUser, requireAdmin, wrap };
