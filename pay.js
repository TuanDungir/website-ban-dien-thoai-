/* Trang thanh toán QR: mã có hiệu lực 5 phút, hết hạn thì làm mới được. */

const PAY_TTL_MS = 5 * 60 * 1000;
let payOrder = null;
let payTimer = null;
let payExpiresAt = 0;

function payInit() {
  const code = new URLSearchParams(location.search).get('code');
  payOrder = code ? tgddGetOrder(code) : null;
  if (!payOrder) {
    document.getElementById('payBody').innerHTML = '<div class="sheet" style="text-align:center;padding:40px 20px">' +
      '<h2 style="font-size:18px;margin:0 0 8px">Không tìm thấy đơn hàng</h2>' +
      '<p style="color:var(--muted);font-size:14px;margin:0 0 18px">Đơn có thể đã bị xoá hoặc bạn chưa đăng nhập.</p>' +
      '<a class="btn-block" style="display:inline-block;max-width:240px;text-align:center" href="index.html">Về trang chủ</a></div>';
    return;
  }
  if (payOrder.status !== 'Chờ thanh toán') {
    location.replace('order.html?code=' + encodeURIComponent(payOrder.id));
    return;
  }
  startCountdown();
  renderPay();
}

function startCountdown() {
  payExpiresAt = Date.now() + PAY_TTL_MS;
  clearInterval(payTimer);
  payTimer = setInterval(tickCountdown, 250);
}

function payRemaining() {
  return Math.max(0, payExpiresAt - Date.now());
}

function tickCountdown() {
  const ms = payRemaining();
  const expired = ms <= 0;
  const box = document.getElementById('qrExp');
  if (box) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    box.innerHTML = 'Hết hạn sau: <b>' + String(m).padStart(2, '0') + '</b> : <b>' +
      String(s).padStart(2, '0') + '</b>';
    box.classList.toggle('warn', ms < 60000);
  }
  if (expired && !document.getElementById('qrExpired')) {
    clearInterval(payTimer);
    renderExpired();
  }
}

function payAmount() {
  if (payOrder.payMethod === 'deposit') return payOrder.payAmount || Math.round(payOrder.total / 2);
  return payOrder.total;
}

function renderPay() {
  const amount = payAmount();
  const isDeposit = payOrder.payMethod === 'deposit';
  const addr = payOrder.address;

  document.getElementById('payBody').innerHTML =
    '<div class="pay-head">' +
    '<h1>Đơn hàng chờ thanh toán</h1>' +
    '<p>' + (isDeposit ? 'Bạn cần đặt cọc trước 50% để cửa hàng xử lý đơn.' :
      'Bạn có thể thanh toán ngay hoặc thanh toán khi nhận hàng.') + '</p>' +
    '</div>' +

    '<div class="qr-card">' +
    '<p class="lead"><b>Quét mã QR</b> để chuyển khoản</p>' +
    '<div class="qr-frame"><img src="images/qr-transfer.svg" alt="Mã QR chuyển khoản" width="280" height="280"></div>' +
    '<div class="qr-exp" id="qrExp"></div>' +
    '<p class="qr-warn">⚠ Chỉ có giá trị thanh toán 1 lần</p>' +
    '<div class="qr-amt">' + tgddMoney(amount) + '</div>' +
    (isDeposit ? '<p class="qr-warn" style="color:var(--muted)">Cọc 50% · còn lại ' +
      tgddMoney(payOrder.total - amount) + ' trả khi nhận hàng</p>' : '') +
    '<div class="qr-actions">' +
    '<button class="btn-block btn-outline" style="max-width:220px" onclick="payRefresh()">↻ Làm mới mã QR</button>' +
    '<button class="btn-block" style="max-width:220px" onclick="payConfirm()">Tôi đã chuyển khoản</button>' +
    '</div></div>' +
    '<div class="pay-alt">Hoặc chọn hình thức thanh toán khác' +
    '<div class="pay-logos"><span>MoMo</span><span>VNPAY</span><span>ZaloPay</span>' +
    '<span>SmartPay</span><span>Napas</span><span>Thẻ quốc tế</span></div>' +
    '<button class="pay-more" style="margin-top:10px" onclick="paySwitchMethod()">' +
    'Đổi phương thức thanh toán ⌄</button></div>' +

    '<div class="notice"><b>⚠ Lưu ý</b>' +
    'Để tránh mất tiền vào tay kẻ mạo danh Shipper, bạn TUYỆT ĐỐI:' +
    '<ul><li><b>KHÔNG</b> chuyển khoản cho người lạ khi chưa nhận hàng;</li>' +
    '<li><b>KHÔNG</b> nhấn bất kì đường dẫn (link) lạ Shipper gửi.</li></ul></div>' +

    '<div class="sheet" style="margin-top:16px">' +
    '<div class="sheet-head"><h2>Thông tin đơn ' + tgddEsc(payOrder.id) + '</h2>' +
    '<a href="order.html?code=' + encodeURIComponent(payOrder.id) + '" style="color:var(--blue);font-size:13px;font-weight:700">Xem chi tiết ›</a></div>' +
    (addr ? '<div class="sum-row"><span>Người nhận</span><span>' + tgddEsc(addr.name) + ' · ' + tgddEsc(addr.phone) + '</span></div>' +
      '<div class="sum-row"><span>Giao đến</span><span style="text-align:right;max-width:62%">' + tgddEsc(tgddAddrFull(addr)) + '</span></div>' : '') +
    '<div class="sum-row"><span>Tổng thanh toán</span><span><b>' + tgddMoney(payOrder.total) + '</b></span></div>' +
    '</div>';

  startCountdownTick();
}

/* Hết 5 phút thì huỷ interval để không đếm tiếp; renderPay() tạo lại mã mới */
function startCountdownTick() {
  payExpiresAt = Date.now() + PAY_TTL_MS;
  clearInterval(payTimer);
  payTimer = setInterval(tickCountdown, 250);
  tickCountdown();
}

function renderExpired() {
  const frame = document.querySelector('.qr-frame');
  const exp = document.getElementById('qrExp');
  if (!frame) return;
  frame.innerHTML = '<div class="qr-expired" id="qrExpired">' +
    '<div style="font-size:34px;line-height:1">⏱</div>' +
    '<p style="margin:10px 0 6px"><b>Mã QR đã hết hiệu lực</b></p>' +
    '<p style="margin:0;font-size:13px">Mã chỉ có giá trị 5 phút. Nhấn "Làm mới mã QR" để tạo mã mới và tiếp tục thanh toán.</p>' +
    '</div>';
  if (exp) exp.innerHTML = 'Mã đã hết hạn';
  const btn = document.querySelector('.qr-actions .btn-outline');
  if (btn) btn.classList.add('btn-primary-glow');
}

function payRefresh() {
  renderPay();
  showToast('Đã tạo mã QR mới, có hiệu lực trong 5 phút.');
}

/* Xác nhận đã chuyển khoản → ghi nhận thanh toán và sang trang đơn hàng */
function payConfirm() {
  if (payRemaining() <= 0) {
    showToast('Mã QR đã hết hạn. Vui lòng làm mới mã rồi thanh toán lại.');
    return;
  }
  tgddUpdateOrder(payOrder.id, {
    status: 'Đang tiếp nhận',
    paid: true,
    paidAt: new Date().toISOString()
  });
  /* Đẩy đơn sang hàng chờ duyệt của admin */
  try {
    if (typeof adSyncOrderFromCustomer === 'function') adSyncOrderFromCustomer(payOrder.id);
  } catch (e) { /* không chặn việc xác nhận thanh toán */ }
  showToast('Đã ghi nhận thanh toán. Cửa hàng sẽ kiểm tra và xử lý đơn.');
  setTimeout(() => { location.href = 'order.html?code=' + encodeURIComponent(payOrder.id); }, 900);
}

function paySwitchMethod() {
  location.href = 'checkout.html?step=pay';
}

document.addEventListener('DOMContentLoaded', () => {
  tgddRenderHeader();
  tgddRenderCartCount();
  payInit();
  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = 'index.html?q=' + encodeURIComponent(document.getElementById('searchInput').value);
  });
});
