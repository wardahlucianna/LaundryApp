# Sunrise Laundry

Aplikasi manajemen operasional Sunrise Laundry dengan **Laravel 13 + React + TypeScript** dalam satu repository.

## Stack
- Laravel 13 sebagai backend dan REST API
- React 18 + TypeScript untuk antarmuka
- Vite + laravel-vite-plugin untuk asset bundling
- PostgreSQL, database bernama `laundyDb`
- Laravel Sanctum untuk autentikasi API (fondasi paket sudah dipasang)

## Struktur utama
```
app/                  # Laravel application
bootstrap/            # Laravel bootstrap
config/               # Konfigurasi aplikasi dan database
database/migrations/  # Skema database
resources/js/         # React + TypeScript
resources/css/        # CSS Sunrise Laundry
resources/views/      # Blade entry point
routes/               # Web dan API routes
```

## Persiapan lokal
1. Pastikan PHP 8.3+, Composer, Node.js, npm, dan PostgreSQL tersedia.
2. Install dependency:
   ```bash
   composer install
   npm install
   ```
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan kredensial PostgreSQL.
4. Buat database PostgreSQL bernama `laundyDb`.
5. Generate application key dan jalankan migration:
   ```bash
   php artisan key:generate
   php artisan migrate
   ```
6. Jalankan aplikasi:
   ```bash
   php artisan serve
   npm run dev
   ```

Buka `http://127.0.0.1:8000`. Endpoint pemeriksaan API tersedia di `/api/health`.

## Status pengembangan
Fondasi Laravel dan integrasi React sudah disiapkan. UI saat ini masih menggunakan data contoh; modul transaksi, pelanggan, pembayaran, proses laundry, dan laporan berikutnya perlu dihubungkan ke API dan database.
