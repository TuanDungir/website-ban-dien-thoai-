/* =====================================================================
   LỚP ĐỒNG BỘ CLIENT <-> BACKEND
   Nạp SAU data.js / auth.js / shop.js ở các trang phía khách.

   Vai trò:
   - Thay thế danh sách sản phẩm tĩnh (data.js) bằng dữ liệu CSDL.
   - Đăng ký / đăng nhập / đặt hàng / lịch sử đơn đi qua REST API.
   - Nhận cập nhật realtime qua Socket.IO: admin đổi giá, tồn kho,
     duyệt hay huỷ đơn thì trang khách tự cập nhật, không cần F5.

   Nguyên tắc an toàn: nếu backend không chạy, trang vẫn hiển thị bằng
   dữ liệu tĩnh cũ (chế độ demo offline) — không bị trắng trang.
   ===================================================================== */
(function () {
  'use strict';

  const API = '/api';
  const USER_TOKEN_KEY = 'tgdd_api_token';
  const USER_DATA_KEY = 'tgdd_api_user';

  const TG = {
    online: false,
    user: null,
    socket: null,
    /* Hàng đợi render: trang gọi TG.onProducts để tự vẽ lại */
    productListeners: [],
    orderListeners: []
  };
  window.TG = TG;

  /* ------------------------------ Tiện ích ------------------------------ */
  const token = () => {
    try { return localStorage.getItem(USER_TOKEN_KEY) || ''; } catch (_) { return ''; }
  };

  async function api(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token()) headers.Authorization = 'Bearer ' + token();
    const res = await fetch(API + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    let json = {};
    try { json = await res.json(); } catch (_) { json = {}; }
    if (!res.ok) {
      const err = new Error((json.error && json.error.message) || 'Lỗi kết nối máy chủ.');
      err.status = res.status;
      err.code = json.error && json.error.code;
      throw err;
    }
    return json.data;
  }
  TG.api = api;

  /* ------------------------------ Sản phẩm ------------------------------ */

  /* Chuyển sản phẩm từ API sang đúng cấu trúc mà data.js đang dùng,
     để toàn bộ giao diện cũ (priceFor, productImages, render…) chạy nguyên.

     API trả `variants` (mỗi biến thể = dung lượng + màu, có giá và tồn riêng).
     Ta dựng lại đúng các trường cũ:
       memory        : danh sách dung lượng
       colors        : danh sách màu
       memoryPrices  : giá theo dung lượng (lấy từ biến thể rẻ nhất của dung lượng đó)
       colorImages   : ảnh theo màu
       variantMap    : tra cứu nhanh (dung lượng|màu) -> biến thể, để đặt hàng */
  function toLegacyProduct(p) {
    const specs = p.specs || {};
    const variants = p.variants || [];

    const memoryPrices = {};
    const memoryOld = {};
    const colorImages = {};
    const variantMap = {};

    /* Duyệt theo thứ tự biến thể từ API (đã sắp theo sort_order) để
       memory[0] luôn là dung lượng mặc định — đúng như data.js gốc. */
    for (const v of variants) {
      variantMap[v.memory + '|' + v.color] = v;
      if (memoryPrices[v.memory] == null) {
        memoryPrices[v.memory] = v.salePrice;
        memoryOld[v.memory] = v.price;
      }
      if (v.color) {
        colorImages[v.color] = colorImages[v.color] || [];
        if (v.image && colorImages[v.color].indexOf(v.image) < 0) {
          colorImages[v.color].push(v.image);
        }
      }
    }

    /* Dung lượng / màu theo đúng thứ tự xuất hiện trong biến thể */
    const memories = [];
    const colors = [];
    for (const v of variants) {
      if (!memories.includes(v.memory)) memories.push(v.memory);
      if (v.color && !colors.includes(v.color)) colors.push(v.color);
    }

    const firstMemory = memories[0] || 'Tiêu chuẩn';

    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: memoryPrices[firstMemory] != null ? memoryPrices[firstMemory] : p.salePrice,
      old: memoryOld[firstMemory] != null ? memoryOld[firstMemory] : p.price,
      memory: memories,
      colors,
      memoryPrices,
      memoryOld,
      colorImages,
      variantMap,
      /* Tồn kho theo từng biến thể để giao diện cảnh báo hết hàng */
      stockByVariant: variants.reduce((m, v) => { m[v.id] = v.stock; return m; }, {}),
      /* Tổng tồn theo từng dung lượng (cộng gộp mọi màu) — dùng cho thẻ sản phẩm */
      stockByMemory: variants.reduce((m, v) => {
        m[v.memory] = (m[v.memory] || 0) + (Number(v.stock) || 0);
        return m;
      }, {}),
      gift: specs.gift || 'Quà tặng theo chương trình',
      rating: specs.rating || 4.8,
      sold: specs.sold || '0',
      img: p.image || 'images/ip17-den-1.jpg',
      stock: p.stock,
      specs,
      featured: p.id
    };
  }
  TG.toLegacyProduct = toLegacyProduct;

  /* Tìm biến thể ứng với lựa chọn của khách; trả về biến thể đầu tiên
     cùng dung lượng nếu màu không khớp. */
  TG.findVariant = function (productId, memory, color) {
    const p = productList().find((x) => x.id === productId);
    if (!p || !p.variantMap) return null;
    const exact = p.variantMap[memory + '|' + (color || '')];
    if (exact) return exact;
    const sameMem = Object.values(p.variantMap).filter((v) => v.memory === memory);
    return sameMem[0] || Object.values(p.variantMap)[0] || null;
  };

  /* ------------------------------ Tồn kho (đồng bộ với Admin) ------------------------------
     Admin quản lý tồn theo từng biến thể (dung lượng × màu).
     Web hiển thị đúng số admin chỉnh:
       - hết hàng (0)   -> vẫn cho bấm chọn nhưng báo "Hết hàng"
       - sắp hết (<=5)  -> báo "Sắp hết"
       - còn hàng (>5)  -> báo "Còn hàng"
     Ngưỡng 5 khớp với trang quản trị (admin-pro.js). */
  /* Ngưỡng cảnh báo mặc định. Bản admin cũ (localStorage) cho phép đổi
     ngưỡng riêng từng máy (p.threshold) — khi có thì ưu tiên dùng nó. */
  TG.LOW_STOCK_AT = 5;
  TG.thresholdOf = function (product) {
    const t = product && product.threshold != null ? Number(product.threshold) : NaN;
    return Number.isFinite(t) && t >= 0 ? t : TG.LOW_STOCK_AT;
  };

  /* Tồn của đúng 1 biến thể (dung lượng + màu). Trả về null khi không rõ (dữ liệu tĩnh cũ). */
  TG.variantStock = function (product, memory, color) {
    if (!product) return null;
    if (product.variantMap) {
      const exact = product.variantMap[memory + '|' + (color || '')];
      if (exact) return Number(exact.stock) || 0;
      return null;
    }
    if (product.stockByVariant && color !== undefined) return null;
    if (product.stock && typeof product.stock === 'object' && product.stock[memory] != null) {
      return Number(product.stock[memory]) || 0;
    }
    if (typeof product.stock === 'number') return product.stock;
    return null;
  };

  /* Tổng tồn của 1 dung lượng (cộng gộp mọi màu) — dùng cho thẻ sản phẩm ở trang chủ. */
  TG.memoryStock = function (product, memory) {
    if (!product) return null;
    if (product.stockByMemory && product.stockByMemory[memory] != null) {
      return Number(product.stockByMemory[memory]) || 0;
    }
    if (product.variantMap) {
      const same = Object.values(product.variantMap).filter((v) => v.memory === memory);
      if (!same.length) return null;
      return same.reduce((s, v) => s + (Number(v.stock) || 0), 0);
    }
    if (product.stock && typeof product.stock === 'object' && product.stock[memory] != null) {
      return Number(product.stock[memory]) || 0;
    }
    if (typeof product.stock === 'number') return product.stock;
    return null;
  };

  TG.totalStock = function (product) {
    if (!product) return null;
    if (typeof product.stock === 'number') return product.stock;
    if (product.variantMap) {
      return Object.values(product.variantMap).reduce((s, v) => s + (Number(v.stock) || 0), 0);
    }
    return null;
  };

  /* Trạng thái kho theo số lượng: out / low / in — cùng ngưỡng với admin.
     threshold: ngưỡng "sắp hết" của từng máy (mặc định 5). */
  TG.stockState = function (qty, threshold) {
    if (qty == null) return null;
    const at = (threshold != null && isFinite(Number(threshold)) && Number(threshold) >= 0)
      ? Number(threshold) : TG.LOW_STOCK_AT;
    if (qty <= 0) return { key: 'out', label: 'Hết hàng' };
    if (qty <= at) return { key: 'low', label: 'Sắp hết hàng' };
    return { key: 'in', label: 'Còn hàng' };
  };

  /* Câu hiển thị đầy đủ kèm số máy, ví dụ: "Còn hàng · 12 máy", "Sắp hết hàng · Còn 3 máy". */
  TG.stockText = function (qty, threshold) {
    const st = TG.stockState(qty, threshold);
    if (!st) return '';
    if (st.key === 'out') return 'Hết hàng';
    if (st.key === 'low') return 'Sắp hết hàng · Còn ' + qty + ' máy';
    return 'Còn hàng · ' + qty + ' máy';
  };

  /* Badge HTML dùng chung cho trang chủ + trang chi tiết. */
  TG.stockBadge = function (product, memory, color) {
    const qty = (color ? TG.variantStock(product, memory, color) : TG.memoryStock(product, memory));
    const th = TG.thresholdOf(product);
    const st = TG.stockState(qty, th);
    if (!st) return '';
    return '<div class="stock-badge ' + st.key + '">' + TG.stockText(qty, th) + '</div>';
  };

  /* Đồng bộ kho admin bản offline (admin.html dùng localStorage 'tgdd_admin_catalog').
     Web (data.js tĩnh) không có tồn kho nên phải chép giá/kho/ngưỡng/active từ
     catalog admin sang danh sách products đang hiển thị. Gọi sau mỗi lần nạp
     sản phẩm và khi localStorage đổi (admin vừa chỉnh ở tab khác). */
  TG.applyLocalAdminStock = function () {
    let catalog = null;
    try { catalog = JSON.parse(localStorage.getItem('tgdd_admin_catalog') || 'null'); }
    catch (_) { catalog = null; }
    if (!Array.isArray(catalog) || !catalog.length) return false;
    let changed = false;
    const list = productList();
    catalog.forEach((c) => {
      const p = list.find((x) => x.id === Number(c.id));
      if (!p) return;
      if (c.memory && Array.isArray(c.memory) && c.memory.length) p.memory = c.memory.slice();
      if (c.prices && typeof c.prices === 'object') {
        p.memoryPrices = Object.assign({}, c.prices);
        const first = p.memory[0];
        if (first && p.memoryPrices[first] != null) p.price = p.memoryPrices[first];
      }
      if (c.stock && typeof c.stock === 'object') p.stock = Object.assign({}, c.stock);
      if (c.threshold != null) p.threshold = Number(c.threshold);
      if (c.active !== undefined) p.active = !!c.active;
      changed = true;
    });
    if (changed) TG.productListeners.forEach((fn) => { try { fn(list); } catch (_) {} });
    return changed;
  };

  /* data.js khai báo `const products` nên nó KHÔNG tự gắn vào window.
     Hàm này trả về mảng sản phẩm đang dùng, bất kể khai báo kiểu gì. */
  function productList() {
    if (typeof products !== 'undefined' && Array.isArray(products)) return products;
    if (Array.isArray(window.products)) return window.products;
    return [];
  }
  TG.productList = productList;

  /* Nạp danh sách sản phẩm từ CSDL rồi ghi đè biến `products` toàn cục. */
  async function loadProducts() {
    try {
      const list = await api('/products', { auth: false });
      const legacy = list.map(toLegacyProduct);
      TG.online = true;

      const target = productList();
      if (target.length) target.length = 0;
      legacy.forEach((p) => target.push(p));
      /* Đồng thời gắn lên window để code mới truy cập được */
      if (!Array.isArray(window.products)) window.products = target;

      TG.productListeners.forEach((fn) => { try { fn(legacy); } catch (_) {} });
      return legacy;
    } catch (e) {
      console.info('[TG] Chưa kết nối được backend, dùng dữ liệu demo tĩnh.', e.message);
      /* Offline (mở file trực tiếp): lấy kho admin cũ (localStorage) đắp lên data.js tĩnh */
      try { TG.applyLocalAdminStock(); } catch (_) {}
      return null;
    }
  }
  TG.loadProducts = loadProducts;

  TG.onProducts = (fn) => {
    TG.productListeners.push(fn);
    if (TG.online) { try { fn(productList()); } catch (_) {} }
  };

  /* Trang chi tiết (product.html) dựng nội dung NGAY khi script chạy, lúc đó
     danh sách sản phẩm từ API chưa về. Sau khi nạp xong phải gọi lại hàm vẽ
     của trang để hiện đúng máy — nếu không sẽ hiện dữ liệu tĩnh cũ. */
  TG.onProducts(function () {
    const q = (window.TG && TG.reloadProductPage) ? TG.reloadProductPage : null;
    if (typeof q === 'function') { try { q(); } catch (_) {} }
  });
  /* ------------------------------ Tài khoản ------------------------------ */
  /* Giao diện cũ đọc user.name / user.phone / user.email; API trả fullName.
     Chuẩn hoá về một dạng để không phải sửa auth.js, account.js… */
  function normalizeUser(u) {
    if (!u) return null;
    return Object.assign({}, u, {
      name: u.fullName || u.name || '',
      points: u.points || 0,
      addresses: u.addresses || [],
      orders: TG.orders || [],
      consent: u.consent || {}
    });
  }
  TG.normalizeUser = normalizeUser;

  function rememberUser(user) {
    TG.user = normalizeUser(user);
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (_) {}
  }

  TG.currentUser = () => TG.user;

  async function register(payload) {
    const data = await api('/auth/register', { method: 'POST', body: payload, auth: false });
    try { localStorage.setItem(USER_TOKEN_KEY, data.token); } catch (_) {}
    rememberUser(data.user);
    connectSocket();
    return data.user;
  }
  TG.register = register;

  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    try { localStorage.setItem(USER_TOKEN_KEY, data.token); } catch (_) {}
    rememberUser(data.user);
    connectSocket();
    return data.user;
  }
  TG.login = login;

  function logout() {
    try {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (_) {}
    TG.user = null;
    if (TG.socket) { TG.socket.disconnect(); TG.socket = null; }
  }
  TG.logout = logout;

  /* Khôi phục phiên: hỏi lại server để biết tài khoản còn hoạt động không
     (admin có thể đã khoá trong lúc khách đang mở trang). */
  async function restoreSession() {
    if (!token()) return null;
    try {
      const [me, orders] = await Promise.all([
        api('/me'),
        api('/orders')
      ]);
      TG.online = true;
      rememberUser(me);
      TG.orders = orders.map(toLegacyOrder);
      TG.user.orders = TG.orders;
      connectSocket();
      TG.orderListeners.forEach((fn) => { try { fn(TG.orders); } catch (_) {} });
      return TG.user;
    } catch (e) {
      if (e.status === 401 || e.status === 403) {
        logout();
        return null;
      }
      return TG.user;
    }
  }
  TG.restoreSession = restoreSession;

  /* ------------------------------ Đơn hàng ------------------------------ */
  async function createOrder(items, extra) {
    const order = await api('/orders', {
      method: 'POST',
      body: Object.assign({
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity
        }))
      }, extra || {})
    });
    return order;
  }
  TG.createOrder = createOrder;

  const fetchOrders = () => api('/orders');
  TG.fetchOrders = fetchOrders;

  TG.onOrders = (fn) => {
    TG.orderListeners.push(fn);
  };

  /* ------------------------------ Realtime ------------------------------ */
  function connectSocket() {
    if (!window.io || TG.socket) return;
    /* Khách CHƯA đăng nhập vẫn phải kết nối: họ cần thấy giá mới, tồn kho
       và sản phẩm vừa thêm. Server đưa khách vãng lai vào room 'public'
       và chỉ gửi sự kiện công khai (product:*), không gửi dữ liệu đơn hàng. */
    const socket = io(token() ? { auth: { token: token() } } : {});
    TG.socket = socket;

    socket.on('product:stock', ({ id, stock, variantMap, stockByMemory, threshold }) => {
      const p = productList().find((x) => x.id === id);
      if (p) {
        p.stock = stock;
        if (variantMap) { p.variantMap = variantMap; }
        if (stockByMemory) { p.stockByMemory = stockByMemory; }
        if (threshold != null) { p.threshold = Number(threshold); }
        /* Cập nhật tồn từng biến thể khi server chỉ gửi stock tổng */
        if (typeof stock === 'object' && stock && !variantMap && p.stock && typeof p.stock === 'object') {
          p.stock = Object.assign({}, p.stock, stock);
        }
        TG.productListeners.forEach((fn) => { try { fn(productList()); } catch (_) {} });
      }
    });

    socket.on('product:updated', (fresh) => {
      const list = productList();
      const i = list.findIndex((x) => x.id === fresh.id);
      const mapped = toLegacyProduct(fresh);
      if (i >= 0) list[i] = Object.assign({}, list[i], mapped);
      else if (fresh.status === 'active') list.unshift(mapped);
      TG.productListeners.forEach((fn) => { try { fn(list); } catch (_) {} });
    });

    socket.on('product:created', (fresh) => {
      const list = productList();
      if (!list.some((x) => x.id === fresh.id)) list.unshift(toLegacyProduct(fresh));
      TG.productListeners.forEach((fn) => { try { fn(list); } catch (_) {} });
    });

    socket.on('product:deleted', ({ id }) => {
      const list = productList();
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list.splice(i, 1);
      TG.productListeners.forEach((fn) => { try { fn(list); } catch (_) {} });
    });

    /* Admin đổi trạng thái đơn -> lịch sử đơn của khách cập nhật ngay */
    socket.on('order:updated', (order) => {
      const legacy = toLegacyOrder(order);
      TG.orders = TG.orders || [];
      const i = TG.orders.findIndex((o) => o.code === legacy.code);
      if (i >= 0) TG.orders[i] = legacy; else TG.orders.unshift(legacy);
      TG.orderListeners.forEach((fn) => { try { fn(legacy); } catch (_) {} });
      if (window.showToast) showToast(`Đơn ${legacy.code}: ${legacy.status}`);
    });

    /* Admin khoá tài khoản -> đăng xuất ngay khỏi mọi tab */
    socket.on('user:status', ({ status }) => {
      if (status === 'locked') {
        logout();
        if (window.showToast) showToast('Tài khoản của bạn đã bị khoá.');
        setTimeout(() => { location.href = 'index.html'; }, 1500);
      }
    });
  }
  TG.connectSocket = connectSocket;

  /* ------------------------------ Chuyển đổi đơn hàng ------------------------------ */
  /* API trả JSON có cấu trúc riêng; giao diện cũ đọc { id, date, status, total,
     items, qty, address }. Hàm này bắc cầu để không phải sửa account.js/order.js. */
  function toLegacyOrder(o) {
    return {
      id: o.code,
      code: o.code,
      apiId: o.id,
      date: o.createdAt,
      status: o.statusLabel || o.status,
      statusKey: o.status,
      total: o.totalAmount,
      subtotal: o.totalAmount,
      discount: 0,
      shippingFee: 0,
      qty: (o.items || []).reduce((s, i) => s + i.quantity, 0),
      items: (o.items || []).map((i) => i.productName + ' ×' + i.quantity).join('; '),
      itemLines: (o.items || []).map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.productName,
        mem: i.memory || '',
        color: i.color || '',
        price: i.unitPrice,
        qty: i.quantity
      })),
      /* Thông tin giao hàng đã chốt khi đặt */
      payMethod: o.paymentMethod || 'cod',
      address: (o.shippingAddress || o.receiverName)
        ? {
            name: o.receiverName,
            phone: o.receiverPhone,
            full: o.shippingAddress,
            street: o.shippingAddress,
            province: ''
          }
        : null
    };
  }
  TG.toLegacyOrder = toLegacyOrder;

  /* ------------------------------ Khởi động ------------------------------ */
  /* Khôi phục phiên ĐỒNG BỘ ngay khi script chạy, để các trang như account.js
     đọc được người dùng ở lần render đầu tiên (nếu chờ DOMContentLoaded thì
     account.js đã kịp chuyển hướng về trang đăng nhập). */
  (function hydrate() {
    if (!token()) return;
    try {
      const cached = JSON.parse(localStorage.getItem(USER_DATA_KEY) || 'null');
      if (cached) TG.user = normalizeUser(cached);
    } catch (_) {}
  })();

  /* Nạp sản phẩm + xác thực lại phiên khi DOM sẵn sàng, rồi vẽ lại trang. */
  document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    /* Offline (mở file trực tiếp, không có backend): đắp kho admin cũ lên
       ngay sau lần vẽ đầu tiên để web hiện đúng số admin vừa chỉnh. */
    if (!TG.online) { try { TG.applyLocalAdminStock(); } catch (_) {} }
    await restoreSession();
    /* Kết nối realtime cho MỌI khách (kể cả chưa đăng nhập) để nhận được
       thay đổi giá / tồn kho / sản phẩm từ admin. */
    connectSocket();
    if (typeof window.render === 'function') {
      try { window.render(); } catch (_) {}
    }
    /* Trang chi tiết đơn: vẽ lại sau khi danh sách đơn đã nạp từ API */
    if (typeof window.renderOrderPage === 'function') {
      try { window.renderOrderPage(); } catch (_) {}
    }
  });

  /* Admin chỉnh kho ở tab khác (bản offline localStorage) hoặc vừa đổi ngưỡng:
     web tự đắp lại kho và vẽ lại, không cần F5. */
  window.addEventListener('storage', (e) => {
    if (e && e.key === 'tgdd_admin_catalog') {
      try { TG.applyLocalAdminStock(); } catch (_) {}
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !TG.online) {
      try { TG.applyLocalAdminStock(); } catch (_) {}
    }
  });
})();
