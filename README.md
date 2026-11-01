# Sunrise Laundry

Aplikasi manajemen operasional Sunrise Laundry dengan Laravel 13, REST API, PostgreSQL, Laravel Sanctum, dan antarmuka baru berbasis Laravel Blade + CoreUI 5.

## Backend
- Laravel 13
- PostgreSQL
- Laravel Sanctum
- REST API untuk autentikasi, role, fitur, dan hak akses

## Frontend
Frontend React/TypeScript lama telah dihapus. Antarmuka baru akan dibangun menggunakan Laravel Blade dan CoreUI 5.

## Persiapan lokal
1. Pastikan PHP 8.3+, Composer, Node.js, npm, dan PostgreSQL tersedia.
2. Jalankan `composer install`.
3. Jalankan `npm install` untuk memasang Vite dan CoreUI.
4. Salin `.env.example` menjadi `.env`, lalu sesuaikan kredensial PostgreSQL.
5. Buat database PostgreSQL sesuai konfigurasi `.env`.
6. Atur akun Super Admin pada `.env`.
7. Jalankan:
   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   npm run dev
   php artisan serve
   ```

Endpoint pemeriksaan API tersedia di `/api/health`.

## API
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET|POST /api/roles`
- `GET|PUT|DELETE /api/roles/{role}`
- `PUT /api/roles/{role}/permissions`
- `GET|POST /api/permission-groups`
- `GET|POST /api/permission-features`
- `GET|POST /api/permissions`

Endpoint manajemen memerlukan bearer token dan permission yang sesuai. Role dengan kode `SUPERADMIN` memiliki akses penuh.
