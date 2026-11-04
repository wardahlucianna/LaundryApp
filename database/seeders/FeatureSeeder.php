<?php

namespace Database\Seeders;

use App\Models\Access\PermissionFeature;
use App\Models\Access\PermissionGroup;
use App\Models\Access\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $groups = [
                ['name' => 'Beranda', 'description' => 'Ringkasan dan halaman utama aplikasi.', 'icon' => 'cilSpeedometer'],
                ['name' => 'Transaksi', 'description' => 'Fitur transaksi dan pembayaran laundry.', 'icon' => 'cilCash'],
                ['name' => 'Operasional', 'description' => 'Pengelolaan pesanan dan proses laundry.', 'icon' => 'cilBasket'],
                ['name' => 'Master Data', 'description' => 'Pengelolaan data pelanggan dan data pendukung.', 'icon' => 'cilPeople'],
                ['name' => 'Pengaturan', 'description' => 'Pengaturan role, fitur, dan hak akses pengguna.', 'icon' => 'cilSettings'],
                ['name' => 'Laporan', 'description' => 'Laporan operasional dan transaksi.', 'icon' => 'cilChartLine'],
            ];

            $groupModels = [];
            foreach ($groups as $groupData) {
                $group = PermissionGroup::updateOrCreate(
                    ['name' => $groupData['name']],
                    [
                        'description' => $groupData['description'],
                        'icon' => $groupData['icon'],
                        'is_active' => true,
                    ],
                );
                $groupModels[$groupData['name']] = $group;
            }

            $features = [
                ['Beranda', 'Dashboard', '/dashboard', 1],
                ['Transaksi', 'Manajemen Transaksi', '/transactions', 10],
                ['Operasional', 'Pesanan', '/orders', 20],
                ['Operasional', 'Proses Laundry', '/process', 30],
                ['Master Data', 'Manajemen Pelanggan', '/customers', 40],
                ['Transaksi', 'Pembayaran', '/payments', 50],
                ['Operasional', 'Antar Jemput', '/deliveries', 60],
                ['Laporan', 'Laporan', '/reports', 70],
                ['Pengaturan', 'Manajemen Role', '/roles', 80],
                ['Pengaturan', 'Manajemen Fitur', '/permissions', 90],
                ['Pengaturan', 'Hak Access', '/access', 100],
            ];

            $featureModels = [];
            foreach ($features as [$groupName, $name, $path, $ordering]) {
                $feature = PermissionFeature::updateOrCreate(
                    ['path' => $path],
                    [
                        'featureId' => $groupModels[$groupName]->groupFeatureId,
                        'name' => $name,
                        'ordering' => $ordering,
                        'menu_type' => 'sidebar',
                        'is_active' => true,
                    ],
                );
                $featureModels[$path] = $feature;
            }

            $roles = [];
            foreach (['Super Admin', 'Administrator', 'Kasir', 'Operator Laundry'] as $roleName) {
                $roles[$roleName] = Role::updateOrCreate(
                    ['name' => $roleName],
                    ['is_active' => true],
                );
            }

            $allFeatureIds = collect($featureModels)->pluck('id')->all();
            $adminFeatureIds = collect($featureModels)
                ->reject(fn (PermissionFeature $feature) => $feature->path === '/access')
                ->pluck('id')->all();

            $roles['Super Admin']->features()->sync($allFeatureIds);
            $roles['Administrator']->features()->sync($adminFeatureIds);

            $roles['Kasir']->features()->sync(collect([
                '/dashboard', '/transactions', '/orders', '/customers', '/payments',
            ])->map(fn (string $path) => $featureModels[$path]->id)->all());

            $roles['Operator Laundry']->features()->sync(collect([
                '/dashboard', '/orders', '/process',
            ])->map(fn (string $path) => $featureModels[$path]->id)->all());
        });

        $this->command?->info('Seeder group fitur, fitur, role, dan hak akses berhasil dijalankan.');
    }
}
