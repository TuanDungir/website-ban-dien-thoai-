/* Import the existing storefront catalog without replacing admin edits. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { db, tx, get, run, nowIso } = require('../src/db');

function importCatalog() {
  const context = vm.createContext({});
  const source = fs.readFileSync(path.resolve(__dirname, '../../data.js'), 'utf8');
  vm.runInContext(source + '\n;globalThis.catalog = products;', context, { timeout: 5000 });
  const catalog = context.catalog;
  if (!Array.isArray(catalog) || !catalog.length) throw new Error('Catalog is empty.');
  let inserted = 0;
  tx(() => {
    const now = nowIso();
    run("INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)", 'Điện thoại', 'dien-thoai');
    const category = get('SELECT id FROM categories WHERE slug = ?', 'dien-thoai');
    for (const p of catalog) {
      // Preserve IDs used in detail URLs, reviews and carts. Never overwrite a collision.
      const existing = get('SELECT id, name FROM products WHERE id = ? OR name = ?', p.id, p.name);
      if (existing) {
        if (existing.id !== p.id || existing.name !== p.name) {
          throw new Error(`Catalog ID/name collision: ${p.id} (${p.name}).`);
        }
        continue;
      }
      const specs = JSON.stringify({
        gift: p.gift, rating: p.rating, sold: p.sold, featured: p.featured,
        colorImages: p.colorImages, extraImages: p.extraImages, memoryRam: p.memoryRam
      });
      run(`INSERT INTO products (id, name, brand, category_id, image, specs, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      p.id, p.name, p.brand, category.id, p.img || '', specs, now, now);
      let sortOrder = 0;
      for (const memory of p.memory) {
        for (const color of p.colors || [p.color || '']) {
          const salePrice = p.memoryPrices?.[memory] ?? p.price;
          const price = Math.max(salePrice, p.memoryOld?.[memory] ?? p.old ?? salePrice);
          const image = p.colorImages?.[color]?.[0] || p.img || '';
          run(`INSERT INTO product_variants
              (product_id, memory, color, price, sale_price, stock, image, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          p.id, memory, color, price, salePrice, 10, image, sortOrder++);
        }
      }
      inserted++;
    }
  });
  return inserted;
}

if (require.main === module) {
  try { console.log(`Imported ${importCatalog()} products; existing records preserved.`); }
  finally { db.close(); }
}
module.exports = { importCatalog };
