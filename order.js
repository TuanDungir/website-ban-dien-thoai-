/* Trang chi tiết đơn hàng: mã đơn, người nhận, giao hàng, thanh toán. */

/* Các mốc trạng thái hiển thị trên thanh tiến trình.
   Nhãn phải khớp với statusLabel mà API trả về để bước hiện tại được tô sáng. */
const ORDER_FLOW = ['Chờ duyệt', 'Đã xác nhận', 'Đang giao', 'Đã giao'];

function orderFmtDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' ' + pad(d.getDate()) + '/' +
    pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

function orderMethodLabel(id) {
  const m = (typeof PAY_METHODS !== 'undefined' ? PAY_METHODS : []).find((x) => x.id === id);
  const map = { cod: 'Thanh toán khi nhận hàng (COD)', deposit: 'Đặt cọc 50% chuyển khoản', bank: 'Chuyển khoản ngân hàng' };
  return map[id] || (m ? m.label : id || '—');
}

function orderShipLabel(id) {
  const map = { standard: 'Giao tiêu chuẩn', fast: 'Giao siêu nhanh', store: 'Nhận tại siêu thị' };
  return map[id] || 'Giao tiêu chuẩn';
}

function renderOrderPage() {
  const code = new URLSearchParams(location.search).get('code');
  const box = document.getElementById('orderBody');

  /* Đơn có thể chưa kịp nạp từ API (vừa đặt xong) -> hiện trạng thái chờ rồi vẽ lại */
  const o = code ? tgddGetOrder(code) : null;
  if (!o && window.TG && TG.online) {
    box.innerHTML = '<div class="sheet" style="text-align:center;padding:40px 20px">' +
      '<p style="color:var(--muted);font-size:14px;margin:0">Đang tải đơn hàng…</p></div>';
    return;
  }

  if (!o) {
    box.innerHTML = '<div class="sheet" style="text-align:center;padding:40px 20px">' +
      '<h2 style="font-size:18px;margin:0 0 8px">Không tìm thấy đơn hàng</h2>' +
      '<p style="color:var(--muted);font-size:14px;margin:0 0 18px">Đơn có thể đã bị xoá hoặc bạn chưa đăng nhập đúng tài khoản.</p>' +
      '<a class="btn-block" style="display:inline-block;max-width:240px;text-align:center" href="account.html">Xem đơn hàng của tôi</a></div>';
    return;
  }

  const addr = o.address || {};
  const stepIdx = Math.max(0, ORDER_FLOW.indexOf(o.status));
  const isRejected = o.status === 'Đã huỷ';
  const isWaiting = !isRejected && o.status === 'Chờ duyệt';
  const lines = o.itemLines && o.itemLines.length ? o.itemLines : [];

  const itemsHtml = lines.map((l) => {
    const p = getProduct(l.productId) || {};
    const img = (p.colorImages && l.color && p.colorImages[l.color] && p.colorImages[l.color][0]) || p.img || '';
    return '<div class="cart-row" style="grid-template-columns:64px minmax(0,1fr) auto">' +
      '<div class="thumb-sm" style="width:64px;height:64px"><img src="' + img + '" alt=""></div>' +
      '<div style="min-width:0"><div class="pname">' + tgddEsc(l.name) + '</div>' +
      '<div class="pvar">' + tgddEsc(l.mem) + (l.color ? ' · ' + tgddEsc(l.color) : '') + '</div></div>' +
      '<div style="text-align:right"><div style="font-size:13px;color:var(--muted)">SL: ' + l.qty + '</div>' +
      '<div class="pprice" style="margin-top:4px">' + tgddMoney(l.price * l.qty) + '</div></div></div>';
  }).join('');

  box.innerHTML =
    '<div class="order-hero">' +
    '<h1>' + (isRejected ? 'Đơn hàng đã huỷ' : isWaiting ? 'Đặt hàng thành công' : 'Đơn hàng của bạn') + '</h1>' +
    '<div class="code">Mã đơn hàng: <b>#' + tgddEsc(o.id) + '</b></div>' +
    '<div class="amt">' + tgddMoney(o.total) + '</div>' +
    '<div class="timeline">' + (isRejected
      ? '<span class="on"><i></i>Đã huỷ</span>'
      : ORDER_FLOW.map((s, i) => '<span class="' + (i <= stepIdx ? 'on' : '') + '"><i></i>' + s + '</span>').join('')) + '</div>' +
    '<a class="btn-block" style="display:block;max-width:320px;margin:16px auto 0;text-align:center" href="account.html">Quản lý đơn hàng</a>' +
    '</div>' +

    '<div class="sheet"><div class="sheet-head"><h2>Thông tin đơn hàng</h2>' +
    '<span class="hint">' + orderFmtDate(o.date) + '</span></div>' +
    '<div class="sum-row"><span>Mã đơn hàng</span><span><b>#' + tgddEsc(o.id) + '</b></span></div>' +
    '<div class="sum-row"><span>Trạng thái</span><span class="status-pill">' + tgddEsc(o.status) + '</span></div>' +
    '<div class="sum-row"><span>Người nhận</span><span>' + tgddEsc(addr.name || '—') + ' · ' + tgddEsc(addr.phone || '—') + '</span></div>' +
    '<div class="sum-row"><span>Giao đến</span><span style="text-align:right;max-width:64%">' + tgddEsc(tgddAddrFull(addr) || '—') + '</span></div>' +
    (addr.lat ? '<div class="sum-row"><span>Vị trí ghim</span><span>' + addr.lat.toFixed(5) + ', ' + addr.lon.toFixed(5) + '</span></div>' : '') +
    '<div class="sum-row"><span>Đơn vị vận chuyển</span><span>' + orderShipLabel(o.ship) + '</span></div>' +
    '<div class="sum-row"><span>Phương thức thanh toán</span><span>' + orderMethodLabel(o.payMethod) + '</span></div>' +
    '</div>' +

    '<div class="sheet"><div class="sheet-head"><h2>Chi tiết giao hàng</h2></div>' +
    (itemsHtml || '<p style="font-size:14px;color:var(--muted);margin:0">' + tgddEsc(o.items || '') + '</p>') +
    '<div style="margin-top:14px;padding:14px;border:1px dashed var(--line);border-radius:10px;color:var(--muted);font-size:13px;text-align:center">' +
    '🎁 Quà tặng kèm đơn hàng sẽ được cập nhật sau.</div>' +
    '</div>' +

    '<div class="sheet"><div class="sheet-head"><h2>Chi tiết thanh toán</h2></div>' +
    '<div class="sum-row"><span>Tổng tiền hàng</span><span>' + tgddMoney(o.subtotal || o.total) + '</span></div>' +
    (o.discount ? '<div class="sum-row disc"><span>Mã giảm giá ' + tgddEsc(o.voucher || '') + '</span><span>−' +
      tgddMoney(o.discount) + '</span></div>' : '') +
    '<div class="sum-row"><span>Phí giao hàng</span><span>' +
      (o.shippingFee ? tgddMoney(o.shippingFee) : 'Miễn phí') + '</span></div>' +
    '<div class="sum-row total"><span>Tổng thanh toán</span><span class="v">' + tgddMoney(o.total) + '</span></div>' +
    (o.payMethod === 'deposit'
      ? '<div class="sum-row"><span>Đã cọc 50%</span><span>' + tgddMoney(o.payAmount) + '</span></div>' +
        '<div class="sum-row"><span>Còn lại khi nhận hàng</span><span>' + tgddMoney(o.total - o.payAmount) + '</span></div>'
      : '') +
    '</div>' +

    '<div class="sheet" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
    '<a class="btn-block btn-ghost" style="max-width:220px;text-align:center;display:inline-block" href="index.html">Tiếp tục mua sắm</a>' +
    '<a class="btn-block btn-outline" style="max-width:220px;text-align:center;display:inline-block" href="account.html">Quản lý đơn hàng</a>' +
    '</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  tgddRenderHeader();
  tgddRenderCartCount();
  renderOrderPage();
  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = 'index.html?q=' + encodeURIComponent(document.getElementById('searchInput').value);
  });
});
