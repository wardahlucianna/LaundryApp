<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ResetSuperAdminPasswordSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('username', 'superadmin')->first();

        if (!$user) {
            $this->command->error('Akun Super Admin tidak ditemukan.');
            return;
        }

        $user->password = Hash::make('SunriseAdmin@2026!');
        $user->save();

        $this->command->info('Password Super Admin berhasil direset.');
    }
}