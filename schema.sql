CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Makanan',
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  items_json TEXT NOT NULL,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Bayar saat diterima',
  status TEXT NOT NULL DEFAULT 'Menunggu',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT 'Nasi Goreng Spesial', 'Nasi goreng, telur, ayam, dan kerupuk.', 'Makanan', 25000, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Nasi Goreng Spesial');

INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT 'Mie Goreng', 'Mie goreng gurih dengan sayuran segar.', 'Makanan', 22000, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Mie Goreng');

INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT 'Es Teh Manis', 'Teh dingin segar.', 'Minuman', 7000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Es Teh Manis');
