const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { testFrontend } = require('./frontend');

async function main() {
  await testFrontend();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'phone-shop-test-'));
  process.env.DB_FILE = path.join(temp, 'test.db');
  const { importCatalog } = require('../tools/import-catalog');
  const { db, all, get, run } = require('../src/db');
  const svc = require('../src/services');
  try {
    require('../src/seed');
    assert.equal(importCatalog(), 13);
    const variant = get('SELECT * FROM product_variants ORDER BY id LIMIT 1');
    run('UPDATE product_variants SET stock = 3 WHERE id = ?', variant.id);
    assert.equal(importCatalog(), 0);
    assert.equal(get('SELECT stock FROM product_variants WHERE id = ?', variant.id).stock, 3);
    const { user } = svc.loginUser({ email: 'an@example.com', password: '123456' });
    const countBefore = get('SELECT COUNT(*) AS n FROM orders').n;
    const second = get('SELECT id FROM product_variants WHERE id <> ? LIMIT 1', variant.id);
    assert.throws(() => svc.createOrder(user.id, { items: [
      { variantId: second.id, quantity: 1 }, { variantId: variant.id, quantity: 4 }
    ] }), /chỉ còn/);
    assert.equal(get('SELECT COUNT(*) AS n FROM orders').n, countBefore);
    assert.equal(get('SELECT stock FROM product_variants WHERE id = ?', second.id).stock, 10);
    const order = svc.createOrder(user.id, { items: [{ variantId: variant.id, quantity: 2, price: 1 }] });
    assert.equal(order.totalAmount, variant.sale_price * 2, 'Server reads prices from the database');
    assert.equal(get('SELECT stock FROM product_variants WHERE id = ?', variant.id).stock, 1);
    svc.updateOrderStatus(order.id, 'rejected');
    assert.equal(get('SELECT stock FROM product_variants WHERE id = ?', variant.id).stock, 3);
    svc.updateOrderStatus(order.id, 'rejected');
    assert.equal(get('SELECT stock FROM product_variants WHERE id = ?', variant.id).stock, 3);
    assert.throws(() => run('UPDATE product_variants SET price = -1 WHERE id = ?', variant.id), /CHECK/);
    assert.throws(() => run('UPDATE product_variants SET product_id = 999999 WHERE id = ?', variant.id), /FOREIGN KEY/);
    assert.ok(all('SELECT * FROM products').length === 13);
    await testHttp();
    console.log('Backend: import, price authority, rollback, inventory restoration, constraints, auth and HTTP pages passed.');
  } finally { db.close(); fs.rmSync(temp, { recursive: true, force: true }); }
}

async function testHttp() {
  const net = require('node:net');
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, [path.resolve(__dirname, '../src/index.js')], {
    env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
  });
  let logs = '';
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  const exited = new Promise(resolve => child.once('exit', resolve));
  const base = `http://127.0.0.1:${port}`;
  try {
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { response = await fetch(base + '/api/products'); if (response.ok) break; } catch (_) {}
      if (child.exitCode !== null) throw new Error(logs);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.ok(response?.ok, logs || 'Server did not become ready');
    assert.equal((await response.json()).data.length, 13);
    for (const page of ['index.html', 'account.html', 'product.html?id=1', 'checkout.html', 'order.html', 'pay.html', 'auth.js']) {
      const result = await fetch(base + '/' + page);
      assert.equal(result.status, 200, page);
      if (page === 'auth.js') assert.ok(!(await result.text()).includes("require('node:crypto')"));
    }
    const login = await fetch(base + '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'an@example.com', password: '123456' })
    });
    assert.equal(login.status, 200);
    const { token } = (await login.json()).data;
    const denied = await fetch(base + '/api/admin/products', { headers: { Authorization: 'Bearer ' + token } });
    assert.ok([401, 403].includes(denied.status), 'Customer tokens cannot access admin APIs');
  } finally { child.kill(); await exited; }
}

main().catch(err => { console.error(err); process.exitCode = 1; });
