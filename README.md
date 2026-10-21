# Restoran Kita — Cloudflare Pages + D1

Starter project restoran dengan:
- Halaman menu pelanggan
- Keranjang sederhana
- Checkout pesanan (nama, telepon, alamat/catatan)
- Panel admin: login, tambah/edit/hapus menu, lihat pesanan, ubah status
- Backend Cloudflare Pages Functions + database Cloudflare D1

## 1. Buat database D1
Di Cloudflare Dashboard:
1. Workers & Pages → D1 SQL Database → Create database, misalnya `restoran-db`.
2. Buka database → Console, lalu jalankan isi `schema.sql`.
3. Catat Database ID.

## 2. Upload/deploy
Cara termudah:
1. Upload folder proyek ini ke GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build command: kosongkan.
4. Build output directory: `public`.
5. Deploy.

Setelah Pages project dibuat, tambahkan binding D1:
- Settings → Functions → D1 database bindings
- Variable name: `DB`
- Pilih database `restoran-db`

## 3. Atur kredensial admin
Pages project → Settings → Variables and Secrets:
- `ADMIN_USERNAME` = username admin pilihanmu
- `ADMIN_PASSWORD` = password admin yang kuat
- `SESSION_SECRET` = string acak panjang (minimal 32 karakter)

Lalu redeploy project setelah menambah/mengubah variables.

## 4. File schema
Jalankan SQL di `schema.sql` pada D1 Console. File ini membuat tabel menu dan pesanan serta mengisi contoh menu.

## Catatan
- Ganti nama, nomor WhatsApp, alamat, dan harga contoh di `public/index.html`.
- Ini starter sederhana. Sebelum dipakai secara komersial, tambahkan validasi harga di server, rate limiting, kebijakan privasi, dan integrasi pembayaran resmi.
- Pembayaran online belum diaktifkan; checkout mencatat pesanan dan metode pembayaran pilihan. Jangan menyimpan data kartu.
