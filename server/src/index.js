/* Khởi động HTTP + Socket.IO.
   Chạy:  npm install  ->  npm start
   Mở:    http://localhost:4000            (website khách)
          http://localhost:4000/admin-login.html   (quản trị) */

const path = require('node:path');
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const config = require('./config');
const bus = require('./events');
const routes = require('./routes');
const { verifyToken } = require('./auth');
const { ApiError } = require('./middleware');
const { all } = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

/* Log request ngắn gọn để dễ demo luồng đồng bộ trên lớp */
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', routes);

/* Website hiện tại được phục vụ luôn từ cùng origin -> không vướng CORS */
app.use(express.static(config.PUBLIC_DIR, { extensions: ['html'] }));

/* 404 cho API, còn lại trả index.html */
app.use('/api', (_req, res) => res.status(404).json({ error: { code: 'not_found', message: 'API không tồn tại.' } }));

/* Error middleware: mọi ApiError -> JSON thống nhất */
app.use((err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'bad_json', message: 'Body JSON không hợp lệ.' } });
  }
  console.error('[UNHANDLED]', err);
  res.status(500).json({ error: { code: 'server_error', message: 'Lỗi máy chủ.' } });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
bus.attach(io);

/* ------------------------------ Socket.IO ------------------------------ */
/* Xác thực bằng cùng token với REST. Không có token => chỉ nhận sự kiện public. */
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  const payload = token ? verifyToken(token) : null;
  socket.data.auth = payload || null;
  next();
});

io.on('connection', (socket) => {
  const auth = socket.data.auth;
  const rooms = [];

  /* Website khách: mọi kết nối đều vào room 'public' để nhận thay đổi sản phẩm */
  rooms.push('public');

  if (auth && auth.kind === 'user') {
    rooms.push(bus.userRoom(auth.sub));
  }

  if (auth && auth.kind === 'admin') {
    /* Admin vào room theo quyền: dashboard, orders, products, customers */
    const perms = {
      superadmin: ['dashboard', 'orders', 'products', 'customers'],
      orders: ['dashboard', 'orders', 'customers'],
      catalog: ['dashboard', 'products']
    }[auth.role] || ['dashboard'];
    perms.forEach((p) => rooms.push(bus.roleRoom(p)));
  }

  rooms.forEach((r) => socket.join(r));
  socket.emit('connected', { rooms, kind: auth ? auth.kind : 'guest' });

  socket.on('disconnect', () => { /* Socket.IO tự dọn room */ });
});

/* ------------------------------ Khởi động ------------------------------ */
server.listen(config.PORT, () => {
  console.log('');
  console.log('  ✔ Server đồng bộ đã chạy');
  console.log(`  → Website khách : http://localhost:${config.PORT}/index.html`);
  console.log(`  → Quản trị      : http://localhost:${config.PORT}/admin-login.html`);
  console.log(`  → API           : http://localhost:${config.PORT}/api/products`);
  console.log(`  → CSDL          : ${config.DB_FILE}`);
  console.log('');
});
