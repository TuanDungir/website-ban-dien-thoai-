/* =====================================================================
   Ghi đè lớp lưu trữ demo bằng REST API thật.
   Nạp SAU auth.js và shop.js, TRƯỚC các script nghiệp vụ của từng trang.

   Cùng tên hàm với bản localStorage cũ nên toàn bộ giao diện hiện có
   (checkout.js, account.js, order.js, pay.js…) không phải sửa.
   Nếu backend không chạy -> rơi về hành vi demo cũ.
   ===================================================================== */
(function () {
  'use strict';

  /* Giữ tham chiếu hàm cũ để dự phòng khi offline */
  const fallback = {
    login: window.tgddLoginSubmit,
    register: window.tgddRegister
  };

  const ready = () => window.TG && TG.online;

  /* ------------------------------ Đăng ký ------------------------------ */
  window.tgddRegister = async function () {
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

    if (!ready()) {
      return fallback.register ? fallback.register() : showToast('Máy chủ chưa sẵn sàng.');
    }

    try {
      const user = await TG.register({ fullName: n, email: em, phone: ph, password: pw });
      closeModal('authModal');
      showToast('Tạo tài khoản thành công. Đang mở trang tài khoản…');
      setTimeout(() => { location.href = 'account.html'; }, 700);
      return user;
    } catch (e) {
      showToast(e.message);
    }
  };

  /* ------------------------------ Đăng nhập ------------------------------ */
  window.tgddLoginSubmit = async function () {
    const id = document.getElementById('loginId').value.trim();
    const pw = document.getElementById('loginPw').value;
    if (!id || !pw) return showToast('Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu.');

    if (!ready()) {
      return fallback.login ? fallback.login() : showToast('Máy chủ chưa sẵn sàng.');
    }

    try {
      await TG.login(id, pw);
      closeModal('authModal');
      showToast('Đăng nhập thành công. Đang mở trang tài khoản…');
      setTimeout(() => { location.href = 'account.html'; }, 700);
    } catch (e) {
      showToast(e.message);
    }
  };

  /* ------------------------------ Phiên đăng nhập ------------------------------ */
  window.tgddCurrentUser = function () {
    return (window.TG && TG.user) ? TG.user : null;
  };

  window.tgddLogout = function () {
    if (window.TG) TG.logout();
    tgddRenderHeader();
  };

  /* ------------------------------ Đặt hàng ------------------------------ */
  /* checkout.js gọi tgddCreateOrder(...) với object cũ; ta chuyển sang API
     và trả về mã đơn để trang điều hướng như trước. */
  window.tgddCreateOrder = async function (legacyOrder) {
    if (!ready() || !TG.user) return null;

    /* Mỗi dòng giỏ hàng ứng với một biến thể (dung lượng + màu) cụ thể.
       Ưu tiên variantId đã lưu; nếu chưa có thì tra theo tên máy + dung lượng. */
    const lines = legacyOrder.itemLines || [];
    const items = [];
    for (const l of lines) {
      const qty = Number(l.qty) || 1;
      let variantId = Number(l.variantId) || 0;

      if (!variantId && window.TG && TG.findVariant) {
        /* line.name có dạng "iPhone 17 Pro Max", l.mem là dung lượng */
        const list = TG.productList ? TG.productList() : [];
        const p = list.find((x) => x.name === l.name || x.id === Number(l.productId));
        if (p) {
          const v = TG.findVariant(p.id, l.memory || l.mem, l.color);
          if (v) variantId = v.id;
        }
      }
      if (variantId) items.push({ variantId, quantity: qty });
    }

    if (!items.length) {
      showToast('Giỏ hàng không hợp lệ.');
      return null;
    }

    /* Thông tin giao hàng chốt lúc đặt: hiển thị lại được trên trang đơn và
       trong trang quản lý đơn hàng của Admin. */
    const addr = legacyOrder.address || {};
    const addressText = addr.full
      || [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');

    try {
      const order = await TG.createOrder(items, {
        receiver: { name: addr.name || '', phone: addr.phone || '', address: addressText },
        shipping: legacyOrder.ship || 'standard',
        payment: legacyOrder.payMethod || 'cod',
        note: legacyOrder.note || ''
      });
      return order.code;
    } catch (e) {
      showToast(e.message);
      return null;
    }
  };

  /* ------------------------------ Sổ địa chỉ ------------------------------ */
  /* Khi đăng nhập qua API, danh sách user nằm trên máy chủ chứ không còn trong
     localStorage. Ghi đè lớp địa chỉ để lưu vào phiên hiện tại, đồng thời đẩy
     địa chỉ mặc định lên CSDL (Admin nhìn thấy trong trang Khách hàng). */
  window.tgddUserUpdate = function (fn) {
    const user = window.tgddCurrentUser();
    if (!user) return false;
    fn(user);
    return true;
  };

  window.tgddAddresses = function () {
    const user = window.tgddCurrentUser();
    return (user && user.addresses) ? user.addresses : [];
  };

  window.tgddAddressSave = function (addr) {
    const user = window.tgddCurrentUser();
    if (!user) return null;
    const id = addr.id || ('ad' + Date.now() + Math.floor(Math.random() * 1000));
    user.addresses = user.addresses || [];
    const idx = user.addresses.findIndex((a) => a.id === id);
    const record = Object.assign({}, addr, { id });
    if (idx >= 0) user.addresses[idx] = record;
    else user.addresses.push(record);

    if (record.default || user.addresses.length === 1) {
      user.addresses.forEach((a) => { a.default = a.id === id; });
    }

    /* Lưu lại phiên để không mất khi chuyển trang */
    if (window.TG) {
      try { localStorage.setItem('tgdd_api_user', JSON.stringify(user)); } catch (_) {}

      /* Đẩy địa chỉ mặc định lên CSDL */
      const def = user.addresses.find((a) => a.default);
      if (def && TG.online) {
        const text = [def.street, def.ward, def.province].filter(Boolean).join(', ');
        TG.api('/me', { method: 'PUT', body: { address: text } })
          .then((fresh) => { if (fresh) user.address = fresh.address; })
          .catch(() => { /* lỗi đồng bộ địa chỉ không chặn đặt hàng */ });
      }
    }
    return id;
  };

  window.tgddAddressDelete = function (id) {
    const user = window.tgddCurrentUser();
    if (!user) return;
    const wasDefault = (user.addresses || []).some((a) => a.id === id && a.default);
    user.addresses = (user.addresses || []).filter((a) => a.id !== id);
    if (wasDefault && user.addresses.length) user.addresses[0].default = true;
    if (window.TG) {
      try { localStorage.setItem('tgdd_api_user', JSON.stringify(user)); } catch (_) {}
    }
  };

  /* ------------------------------ Lịch sử đơn ------------------------------ */
  /* Trang order.html?code=... đọc một đơn cụ thể */
  window.tgddGetOrder = function (code) {
    if (!code) return null;
    const list = (window.TG && TG.orders) || [];
    return list.find((o) => o.code === code || o.id === code) || null;
  };

  window.tgddUpdateOrder = function (code, patch) {
    const list = (window.TG && TG.orders) || [];
    const o = list.find((x) => x.code === code);
    if (o) Object.assign(o, patch);
  };
  window.tgddOrders = function () {
    return (window.TG && TG.orders) ? TG.orders : [];
  };

  /* Trang tài khoản / chi tiết đơn dùng danh sách này */
  if (window.TG) {
    TG.onOrders((payload) => {
      if (Array.isArray(payload)) {
        TG.orders = payload;
      } else if (payload && payload.code) {
        TG.orders = TG.orders || [];
        const i = TG.orders.findIndex((o) => o.code === payload.code);
        if (i >= 0) TG.orders[i] = payload; else TG.orders.unshift(payload);
      }
      /* Vẽ lại danh sách đơn của khách, giữ nguyên tab đang mở */
      const box = document.getElementById('acctMain');
      if (box && typeof window.renderOrders === 'function' && typeof window.activeUser === 'function') {
        const user = window.activeUser();
        if (user) {
          try {
            user.orders = TG.orders;
            box.innerHTML = window.renderOrders(user);
          } catch (_) { /* trang khác không có renderOrders */ }
        }
      }
    });
  }
})();
