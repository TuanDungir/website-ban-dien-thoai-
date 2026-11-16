const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');

function browser(store = new Map()) {
  const context = vm.createContext({
    console, URLSearchParams, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    location: { search: '', href: '' },
    localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    document: { addEventListener() {}, querySelectorAll: () => [], getElementById: () => null },
    addEventListener() {},
    fetch: async () => { throw new Error('Offline'); }
  });
  context.window = context;
  for (const file of ['data.js', 'auth.js', 'shop.js', 'api-client.js', 'api-overrides.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return context;
}

async function testFrontend() {
  const store = new Map();
  const page = browser(store);
  page.tgddSaveUsers([{ id: 'local-1', name: 'Demo', addresses: [], orders: [] }]);
  page.tgddLogin(page.tgddUsers()[0]);
  assert.equal(page.tgddCurrentUser().id, 'local-1', 'API overrides preserve offline login');
  page.tgddAddressSave({ id: 'a', name: 'A', default: true });
  page.tgddAddressSave({ id: 'b', name: 'B', default: true });
  assert.equal(page.tgddAddresses().filter(a => a.default).length, 1);
  const code = await page.tgddCreateOrder({ total: 500000, itemLines: [] });
  assert.ok(code);
  assert.equal(page.tgddGetOrder(code).total, 500000);
  const line = { productId: 1, mem: '256GB', color: 'Black' };
  page.tgddCartAdd(line, 70);
  page.tgddCartAdd(line, 70);
  assert.equal(page.tgddCartCount(), 99);
  page.tgddCartClear();
  page.TG.productList = () => [{ id: 1 }];
  page.TG.variantStock = () => 0;
  assert.equal(page.tgddCartAdd(line, 1), null);
  assert.equal(page.tgddCartCount(), 0);
  page.TG.rememberUser({ id: 9, fullName: 'API user', addresses: [{ id: 'saved', default: true }] });
  page.TG.rememberUser({ id: 9, fullName: 'Updated API user' });
  assert.equal(page.TG.user.addresses[0].id, 'saved', 'Session refresh preserves the address book');
  page.localStorage.setItem('tgdd_api_token', 'demo-token');
  const reloaded = browser(store);
  assert.equal(reloaded.tgddCurrentUser().name, 'Updated API user');
  assert.equal(reloaded.tgddAddresses()[0].id, 'saved');
  assert.equal(reloaded.TG.toLegacyOrder({ code: 'DEPOSIT', totalAmount: 1000000, paymentMethod: 'deposit' }).payAmount, 500000);
  reloaded.tgddLogout();
  assert.equal(reloaded.tgddCurrentUser(), null);

  // Verify that the merged pages reference files present at their deployed paths.
  for (const name of ['index', 'account', 'product', 'checkout', 'order', 'pay', 'admin-login', 'admin', 'admin-pro']) {
    const html = fs.readFileSync(path.join(root, name + '.html'), 'utf8');
    const scripts = [];
    for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
      if (/^(?:https?:|\/socket\.io\/)/.test(match[1])) continue;
      assert.ok(fs.existsSync(path.join(root, match[1])), `${name}.html: missing ${match[1]}`);
    }
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
      new vm.Script(match[1], { filename: name + '.html' });
      const src = match[0].match(/src="([^"]+)"/);
      scripts.push(src ? fs.existsSync(path.join(root, src[1])) ? fs.readFileSync(path.join(root, src[1]), 'utf8') : '' : match[1]);
    }
    new vm.Script(scripts.join('\n;\n'), { filename: name + '.html (combined)' });
  }
  console.log('Frontend: offline session, cart, addresses, orders, API cache and page dependencies passed.');
}

if (require.main === module) testFrontend().catch(err => { console.error(err); process.exitCode = 1; });
module.exports = { testFrontend };
