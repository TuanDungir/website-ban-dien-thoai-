/* Bus sự kiện: tách nghiệp vụ khỏi Socket.IO để services.js không phụ thuộc
   vào tầng realtime. io được "cắm" vào lúc khởi động server. */

let io = null;

/* Room theo vai trò admin: dashboard, orders, products, customers */
const roleRoom = (role) => `admin:${role}`;
const userRoom = (userId) => `user:${userId}`;

function attach(serverIo) {
  io = serverIo;
}

/** Gửi tới MỌI kết nối (website khách + admin) */
function emitToAll(event, payload) {
  if (io) io.emit(event, payload);
}

/** Gửi tới các phiên admin có quyền tương ứng */
function emitToRole(role, event, payload) {
  if (io) io.to(roleRoom(role)).emit(event, payload);
}

/** Gửi tới một khách hàng cụ thể (mọi tab/thiết bị của họ) */
function emitToRoom(room, event, payload) {
  if (io) io.to(room).emit(event, payload);
}

module.exports = { attach, emitToAll, emitToRole, emitToRoom, roleRoom, userRoom };
