<?php

namespace Database\Seeders;

use App\Models\Akses\Role;
use App\Models\Akses\User;
use Illuminate\Database\Seeder;

class AdministratorSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('code', 'ADMIN')->first();

        if (!$role) {
            $this->command?->error('Role ADMIN tidak ditemukan. Jalankan FeatureSeeder terlebih dahulu.');
            return;
        }

        if (!$this->command) {
            throw new \RuntimeException('Seeder ini harus dijalankan melalui Artisan agar password dapat diminta secara aman.');
        }

        $password = $this->command->secret('Masukkan password untuk administrator:');
        $confirmation = $this->command->secret('Ulangi password administrator:');

        if (!$password || $password !== $confirmation) {
            $this->command->error('Password kosong atau tidak cocok. Seeder dibatalkan.');
            return;
        }

        User::updateOrCreate(
            ['username' => 'administrator'],
            [
                'role_id' => $role->id,
                'full_name' => 'Administrator',
                'email' => 'administrator@sunrise.local',
                'password' => $password,
                'is_active' => true,
            ],
        );

        $this->command->info('Akun Administrator berhasil dibuat atau diperbarui.');
        $this->command->info('Username: administrator');
    }
}
