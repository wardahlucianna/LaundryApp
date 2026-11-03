<?php

namespace Database\Seeders;

use App\Models\Akses\Role;
use App\Models\Akses\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdministratorSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('code', 'ADMIN')->first();

        if (!$role) {
            $this->command?->error('Role ADMIN tidak ditemukan. Jalankan FeatureSeeder terlebih dahulu.');
            return;
        }

        $password = env('INITIAL_ADMIN_PASSWORD');

        if (!$password) {
            $this->command?->error('INITIAL_ADMIN_PASSWORD belum diatur pada file .env.');
            return;
        }

        User::updateOrCreate(
            ['username' => env('INITIAL_ADMIN_USERNAME', 'administrator')],
            [
                'role_id' => $role->id,
                'full_name' => env('INITIAL_ADMIN_NAME', 'Administrator'),
                'email' => env('INITIAL_ADMIN_EMAIL', 'administrator@sunrise.local'),
                'password' => $password,
                'is_active' => true,
            ],
        );

        $this->command?->info('Akun Administrator berhasil dibuat atau diperbarui.');
        $this->command?->info('Username: ' . env('INITIAL_ADMIN_USERNAME', 'administrator'));
    }
}
