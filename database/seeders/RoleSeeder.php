<?php

namespace Database\Seeders;

use App\Models\Akses\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Super Admin'],
            ['name' => 'Administrator'],
            ['name' => 'Kasir'],
            ['name' => 'Operator Laundry'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                ['is_active' => true],
            );
        }

        $this->command?->info('Data role berhasil dibuat atau diperbarui.');
    }
}
