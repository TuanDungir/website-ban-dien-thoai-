/* Xác thực + phiên đăng nhập demo (lưu trong localStorage của trình duyệt).
   Lưu ý: đây là demo cho đồ án, KHÔNG dùng cho hệ thống thật. */
const TGDD_USERS_KEY = 'tgdd_users';
const TGDD_SESSION_KEY = 'tgdd_session';

function tgddUsers() {
  try { return JSON.parse(localStorage.getItem(TGDD_USERS_KEY) || '[]'); }
  catch (e) { return []; }
}
function tgddSaveUsers(list) {
  try { localStorage.setItem(TGDD_USERS_KEY, JSON.stringify(list)); }
  catch (e) { showToast('Trình duyệt đang chặn lưu dữ liệu — không thể lưu tài khoản.'); }
}
/* Băm đơn giản để không lưu mật khẩu dạng thô — chỉ phù hợp cho demo. */
function tgddHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
function tgddFindUser(id) {
  const key = String(id || '').trim().toLowerCase();
  if (!key) return null;
  return tgddUsers().find(u => u.phone === key || (u.email || '').toLowerCase() === key) || null;
}
function tgddCurrentUser() {
  let id = null;
  try { id = localStorage.getItem(TGDD_SESSION_KEY); } catch (e) { return null; }
  if (!id) return null;
  return tgddUsers().find(u => u.id === id) || null;
}
function tgddLogin(user) {
  try { localStorage.setItem(TGDD_SESSION_KEY, user.id); } catch (e) {}
  tgddRenderHeader();
  return user;
}
function tgddLogout() {
  try { localStorage.removeItem(TGDD_SESSION_KEY); } catch (e) {}
  tgddRenderHeader();
}

/* Cập nhật nút đăng nhập ở header: đã đăng nhập thì hiện tên + vào trang tài khoản */
function tgddRenderHeader() {
  const btn = document.getElementById('authBtn');
  if (!btn) return;
  const user = tgddCurrentUser();
  if (user) {
    const first = user.name.trim().split(/\s+/).pop();
    btn.textContent = '♙ ' + first;
    btn.title = 'Vào trang tài khoản';
    btn.onclick = () => { location.href = 'account.html'; };
  } else {
    btn.textContent = '♙ Đăng nhập';
    btn.title = '';
    /* Trang không có form đăng nhập (vd. trang chi tiết) thì quay về trang chủ */
    btn.onclick = () => {
      if (document.getElementById('authModal')) openModal('authModal');
      else location.href = 'index.html?login=1';
    };
  }
}

/* ---------- Hộp thoại đồng ý xử lý dữ liệu cá nhân ---------- */
let tgddPendingRegister = null;

function tgddOpenConsent(pending) {
  tgddPendingRegister = pending;
  document.getElementById('consentRequired').checked = false;
  document.getElementById('consentMarketing').checked = false;
  document.getElementById('consentCare').checked = false;
  document.getElementById('consentAnalytics').checked = false;
  document.getElementById('consentAll').checked = false;
  tgddSyncConsent();
  openModal('consentModal');
  const body = document.querySelector('#consentModal .consent-body');
  if (body) body.scrollTop = 0;
}

/* Nút "Xác nhận" chỉ bấm được khi đã tick mục bắt buộc */
function tgddSyncConsent() {
  const optional = ['consentMarketing', 'consentCare', 'consentAnalytics'].map(id => document.getElementById(id));
  document.getElementById('consentAll').checked = optional.every(el => el.checked);
  document.getElementById('consentConfirm').disabled = !document.getElementById('consentRequired').checked;
}

function tgddToggleConsentAll(box) {
  ['consentMarketing', 'consentCare', 'consentAnalytics'].forEach(id => {
    document.getElementById(id).checked = box.checked;
  });
  tgddSyncConsent();
}

function tgddConfirmConsent() {
  if (!document.getElementById('consentRequired').checked) {
    showToast('Vui lòng đồng ý điều khoản bắt buộc để tiếp tục.');
    return;
  }
  if (!tgddPendingRegister) return;
  const consent = {
    required: true,
    marketing: document.getElementById('consentMarketing').checked,
    care: document.getElementById('consentCare').checked,
    analytics: document.getElementById('consentAnalytics').checked,
    agreedAt: new Date().toISOString()
  };
  const list = tgddUsers();
  const user = Object.assign({}, tgddPendingRegister, {
    id: 'u' + Date.now(),
    password: tgddHash(tgddPendingRegister.password),
    consent,
    vouchers: [],
    orders: [],
    addresses: [],
    points: 0,
    createdAt: new Date().toISOString()
  });
  list.push(user);
  tgddSaveUsers(list);
  tgddPendingRegister = null;
  closeModal('consentModal');
  tgddLogin(user);
  showToast('Tạo tài khoản thành công. Đang mở trang tài khoản…');
  setTimeout(() => { location.href = 'account.html'; }, 700);
}

/* ---------- Đăng ký / đăng nhập dùng chung ---------- */
function tgddRegister() {
  const n = document.getElementById('regName').value.trim();
  const ph = document.getElementById('regPhone').value.trim().replace(/\s/g, '');
  const em = document.getElementById('regEmail').value.trim();
  const pw = document.getElementById('regPw').value;
  const pw2 = document.getElementById('regPw2').value;
  const ok = document.getElementById('regTerms').checked;

  if (!n || !ph || !em || !pw) return showToast('Vui lòng nhập đầy đủ thông tin đăng ký.');
  if (!/^0\d{9}$/.test(ph)) return showToast('Số điện thoại phải gồm 10 số và bắt đầu bằng 0.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return showToast('Email không hợp lệ.');
  if (pw.length < 6) return showToast('Mật khẩu phải có ít nhất 6 ký tự.');
  if (pw !== pw2) return showToast('Mật khẩu nhập lại không khớp.');
  if (!ok) return showToast('Vui lòng đồng ý với điều khoản sử dụng.');
  if (tgddUsers().some(u => u.phone === ph)) return showToast('Số điện thoại này đã được đăng ký.');
  if (tgddUsers().some(u => u.email.toLowerCase() === em.toLowerCase())) return showToast('Email này đã được đăng ký.');

  closeModal('authModal');
  tgddOpenConsent({ name: n, phone: ph, email: em, password: pw, gender: 'Anh' });
}

function tgddLoginSubmit() {
  const id = document.getElementById('loginId').value.trim();
  const pw = document.getElementById('loginPw').value;
  if (!id || !pw) return showToast('Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu.');
  const user = tgddFindUser(id);
  if (!user) return showToast('Tài khoản không tồn tại. Hãy đăng ký trước.');
  if (user.password !== tgddHash(pw)) return showToast('Mật khẩu không đúng. Vui lòng thử lại.');
  closeModal('authModal');
  tgddLogin(user);
  showToast('Đăng nhập thành công. Đang mở trang tài khoản…');
  setTimeout(() => { location.href = 'account.html'; }, 700);
}

/* Đơn hàng demo: ghi lại khi bấm "Mua ngay" ở trang chi tiết */
function tgddAddOrder(order) {
  const user = tgddCurrentUser();
  if (!user) return false;
  const list = tgddUsers();
  const target = list.find(u => u.id === user.id);
  if (!target) return false;
  target.orders = target.orders || [];
  target.orders.unshift(Object.assign({
    id: 'DH' + Date.now(),
    date: new Date().toISOString(),
    status: 'Đang tiếp nhận',
    qty: 1
  }, order));
  tgddSaveUsers(list);
  return true;
}

/* ---------- Quên mật khẩu: xác thực OTP rồi đặt mật khẩu mới ----------
   Mật khẩu được lưu dạng băm nên KHÔNG thể hiện lại mật khẩu cũ.
   Luồng: nhập email/SĐT → nhận OTP → nhập OTP → đặt mật khẩu mới → đăng nhập.
   Mã OTP hết hiệu lực sau 5 phút và chỉ dùng được một lần. */
const TGDD_RESET_TTL_MS = 5 * 60 * 1000;
const TGDD_RESET_MAX_TRIES = 5;

let tgddResetState = null;   /* { userId, code, expiresAt, tries } */
let tgddResetTimer = null;

function tgddForgotOpen() {
  const box = document.getElementById('forgotBox');
  if (!box) return;
  /* Điền sẵn tài khoản đang gõ dở ở ô đăng nhập */
  const typed = (document.getElementById('loginId') || {}).value || '';
  tgddForgotReset(typed.trim());
  box.style.display = 'block';
  const focus = document.getElementById('fpId');
  if (focus) focus.focus();
}

function tgddForgotClose() {
  const box = document.getElementById('forgotBox');
  if (box) box.style.display = 'none';
  tgddResetState = null;
  clearInterval(tgddResetTimer);
  tgddForgotReset();
}

/* Đưa form về bước 1 và xoá thông báo lỗi */
function tgddForgotReset(typed) {
  const set = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };
  set('fpStep1', el => { el.style.display = 'block'; });
  set('fpStep2', el => { el.style.display = 'none'; });
  set('fpErr1', el => { el.textContent = ''; el.style.display = 'none'; });
  set('fpErr2', el => { el.textContent = ''; el.style.display = 'none'; });
  set('fpOtp', el => { el.value = ''; });
  set('fpPw', el => { el.value = ''; });
  set('fpPw2', el => { el.value = ''; });
  set('fpOtpDemo', el => { el.textContent = '------'; });
  if (typed !== undefined) set('fpId', el => { el.value = typed; });
}

function tgddForgotErr(step, msg) {
  const el = document.getElementById('fpErr' + step);
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

/* Bước 1: kiểm tra tài khoản tồn tại rồi sinh OTP */
function tgddForgotSendOtp() {
  const id = (document.getElementById('fpId').value || '').trim();
  tgddForgotErr(1, '');
  if (!id) return tgddForgotErr(1, 'Vui lòng nhập email hoặc số điện thoại đã đăng ký.');

  const user = tgddFindUser(id);
  if (!user) {
    return tgddForgotErr(1, 'Không tìm thấy tài khoản với email/số điện thoại này.');
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  tgddResetState = {
    userId: user.id,
    code,
    expiresAt: Date.now() + TGDD_RESET_TTL_MS,
    tries: 0
  };

  /* Che bớt thông tin: gửi tới email dạng du****@gmail.com */
  const masked = tgddMaskContact(user);
  document.getElementById('fpStep1').style.display = 'none';
  document.getElementById('fpStep2').style.display = 'block';
  document.getElementById('fpSentTo').textContent = masked;
  document.getElementById('fpOtpDemo').textContent = code;
  document.getElementById('fpOtp').value = '';
  document.getElementById('fpOtp').focus();

  tgddStartResetTimer();
  showToast('Đã gửi mã xác thực. Mã có hiệu lực 5 phút.');
}

function tgddMaskContact(user) {
  const email = user.email || '';
  const at = email.indexOf('@');
  if (at > 1) return email.slice(0, 2) + '****' + email.slice(at);
  const phone = user.phone || '';
  if (phone.length >= 7) return phone.slice(0, 3) + '****' + phone.slice(-3);
  return email || phone || '—';
}

/* Đếm ngược 5 phút; hết hạn thì khoá nút xác thực và cho gửi lại */
function tgddStartResetTimer() {
  clearInterval(tgddResetTimer);
  const tick = () => {
    const el = document.getElementById('fpCountdown');
    if (!el || !tgddResetState) return;
    const left = Math.max(0, tgddResetState.expiresAt - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    el.classList.toggle('expired', left === 0);
    if (left === 0) {
      clearInterval(tgddResetTimer);
      const btn = document.getElementById('fpConfirmBtn');
      if (btn) btn.disabled = true;
    }
  };
  tick();
  tgddResetTimer = setInterval(tick, 1000);
}

/* Bước 2: kiểm tra OTP + mật khẩu mới rồi ghi đè mật khẩu */
function tgddForgotConfirm() {
  tgddForgotErr(2, '');
  if (!tgddResetState) return tgddForgotErr(2, 'Phiên khôi phục đã hết. Vui lòng gửi lại mã.');

  if (Date.now() > tgddResetState.expiresAt) {
    return tgddForgotErr(2, 'Mã xác thực đã hết hiệu lực. Nhấn "Gửi lại mã" để nhận mã mới.');
  }

  const otp = (document.getElementById('fpOtp').value || '').trim();
  if (!/^\d{6}$/.test(otp)) return tgddForgotErr(2, 'Mã xác thực gồm 6 chữ số.');

  if (otp !== tgddResetState.code) {
    tgddResetState.tries++;
    const left = TGDD_RESET_MAX_TRIES - tgddResetState.tries;
    if (left <= 0) {
      tgddResetState = null;
      clearInterval(tgddResetTimer);
      return tgddForgotErr(2, 'Nhập sai mã quá 5 lần. Vui lòng gửi lại mã mới.');
    }
    return tgddForgotErr(2, 'Mã xác thực không đúng. Còn ' + left + ' lần thử.');
  }

  const pw = document.getElementById('fpPw').value;
  const pw2 = document.getElementById('fpPw2').value;
  if (!pw) return tgddForgotErr(2, 'Vui lòng nhập mật khẩu mới.');
  if (pw.length < 6) return tgddForgotErr(2, 'Mật khẩu phải có ít nhất 6 ký tự.');
  if (pw !== pw2) return tgddForgotErr(2, 'Mật khẩu nhập lại không khớp.');

  const list = tgddUsers();
  const target = list.find(u => u.id === tgddResetState.userId);
  if (!target) {
    tgddResetState = null;
    return tgddForgotErr(2, 'Tài khoản không còn tồn tại.');
  }
  if (target.password === tgddHash(pw)) {
    return tgddForgotErr(2, 'Mật khẩu mới phải khác mật khẩu hiện tại.');
  }

  target.password = tgddHash(pw);
  target.passwordChangedAt = new Date().toISOString();
  tgddSaveUsers(list);

  tgddResetState = null;
  clearInterval(tgddResetTimer);

  /* Điền sẵn tài khoản ở form đăng nhập và đóng khối khôi phục */
  const idField = document.getElementById('loginId');
  if (idField) idField.value = target.phone || target.email;
  const pwField = document.getElementById('loginPw');
  if (pwField) pwField.value = '';
  tgddForgotClose();

  showToast('Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.');
  const pwFocus = document.getElementById('loginPw');
  if (pwFocus) pwFocus.focus();
}

/* ---------- Tiện ích giao diện dùng chung cho mọi trang ---------- */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2600);
}
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
function switchAuth(tab) {
  document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const login = document.getElementById('paneLogin');
  const reg = document.getElementById('paneRegister');
  if (login) login.classList.toggle('active', tab === 'login');
  if (reg) reg.classList.toggle('active', tab === 'register');
  /* Đóng khối quên mật khẩu khi chuyển tab */
  if (typeof tgddForgotClose === 'function') tgddForgotClose();
}
function togglePw(id, btn) {
  const i = document.getElementById(id);
  i.type = i.type === 'password' ? 'text' : 'password';
  btn.textContent = i.type === 'password' ? '👁' : '🙈';
}
function pwStrength(v) {
  const bar = document.getElementById('pwBar');
  if (!bar) return;
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  bar.style.width = ['0%', '20%', '40%', '60%', '80%', '100%'][s];
  bar.style.background = ['#d92332', '#d92332', '#f5a000', '#f5a000', '#12b76a', '#12b76a'][s];
}

document.addEventListener('DOMContentLoaded', tgddRenderHeader);
