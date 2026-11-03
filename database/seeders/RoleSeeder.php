<?php

namespace Database\Seeders;

use App\Models\Akses\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['code' => 'SUPERADMIN', 'name' => 'Super Admin'],
            ['code' => 'ADMIN', 'name' => 'Administrator'],
            ['code' => 'KASIR', 'name' => 'Kasir'],
            ['code' => 'OPERATOR', 'name' => 'Operator Laundry'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['code' => $role['code']],
                ['name' => $role['name'], 'is_active' => true],
            );
        }

        $this->command?->info('Data role berhasil dibuat atau diperbarui.');
    }
}
