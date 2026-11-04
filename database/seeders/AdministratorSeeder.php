<?php

namespace Database\Seeders;

use App\Models\Access\Role;
use App\Models\Access\User;
use Illuminate\Database\Seeder;

class AdministratorSeeder extends Seeder
{
    public function run(): void
    {
        // Roles table uses roleId/name; no legacy code column.
        $role = Role::where('name', 'Administrator')->first();

        if (!$role) {
            $this->command?->error('Role Administrator tidak ditemukan. Jalankan RoleSeeder terlebih dahulu.');
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
                'roleId' => $role->roleId,
                'fullName' => 'Administrator',
                'email' => 'administrator@sunrise.local',
                'password' => $password,
                'isActive' => true,
            ],
        );

        $this->command->info('Akun Administrator berhasil dibuat atau diperbarui.');
        $this->command->info('Username: administrator');
    }
}
