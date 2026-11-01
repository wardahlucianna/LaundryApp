# Sunrise Laundry

Aplikasi manajemen operasional Sunrise Laundry dengan **Laravel 13 + React + TypeScript** dalam satu repository.

## Stack
- Laravel 13 sebagai backend dan REST API
- React 18 + TypeScript untuk antarmuka
- Vite + laravel-vite-plugin untuk asset bundling
- PostgreSQL, database bernama `laundyDb`
- Laravel Sanctum untuk autentikasi API

## Modul yang tersedia
- Login API menggunakan Laravel Sanctum
- Manajemen Role (list, tambah, detail, ubah, hapus) dengan pagination
- Manajemen Fitur (list, tambah, ubah, hapus) dengan pagination
- Pengaturan hak akses fitur per role
- Middleware backend untuk memvalidasi kode permission
- UI React untuk Role, Fitur, dan Hak Akses

## Persiapan lokal
1. Pastikan PHP 8.3+, Composer, Node.js, npm, dan PostgreSQL tersedia.
2. Install dependency:
   ```bash
   composer install
   npm install
   ```
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan kredensial PostgreSQL.
4. Buat database PostgreSQL bernama `laundyDb`.
5. Atur `INITIAL_OWNER_USERNAME` dan `INITIAL_OWNER_PASSWORD` pada `.env` untuk akun owner pertama. Jika password dibiarkan kosong, seeder membuat password acak dan menampilkannya satu kali di terminal.
6. Jalankan:
   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```
7. Jalankan aplikasi:
   ```bash
   php artisan serve
   npm run dev
   ```

Buka `http://127.0.0.1:8000`. Endpoint pemeriksaan API tersedia di `/api/health`.

## API akses
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET|POST /api/roles`
- `GET|PUT|DELETE /api/roles/{role}`
- `PUT /api/roles/{role}/permissions`
- `GET|POST /api/permissions`
- `PUT|DELETE /api/permissions/{permission}`

Endpoint manajemen memerlukan bearer token dan permission yang sesuai. Role dengan kode `OWNER` memiliki akses penuh. Seeder menyiapkan role Owner, Administrator, Kasir, dan Operator Laundry serta daftar permission awal.

## Catatan
Pagination API memakai parameter `page`, `per_page`, dan `search`. Nilai `per_page` dibatasi maksimal 100. UI menyediakan pilihan 10, 25, 50, dan 100 data per halaman.

Modul transaksi, pelanggan, pembayaran, proses laundry, dan laporan berikutnya masih perlu dikembangkan dan dihubungkan ke database.
