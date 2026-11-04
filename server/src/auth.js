/* Băm mật khẩu bằng scrypt của Node (không cần thư viện ngoài) và ký token.
   Lưu ý: token ở đây là bản rút gọn của JWT (HMAC-SHA256) để đồ án không phụ
   thuộc package ngoài; cấu trúc header.payload.signature giữ nguyên chuẩn JWT. */
const crypto = require('node:crypto');
const config = require('./config');

const SCRYPT_KEYLEN = 64;

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(plain), salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(plain, stored) {
  if (typeof stored !== 'string') return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(String(plain), salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

/* ---------- Token ---------- */
const b64url = (buf) => Buffer.from(buf).toString('base64url');
const fromB64url = (str) => Buffer.from(str, 'base64url').toString('utf8');

function signToken(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + config.TOKEN_TTL_MS
  }));
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', config.JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

/** Trả về payload nếu token hợp lệ và chưa hết hạn, ngược lại null. */
function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', config.JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
