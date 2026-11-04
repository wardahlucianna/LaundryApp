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
                ['name' => 'Beranda', 'icon' => 'cilSpeedometer'],
                ['name' => 'Transaksi', 'icon' => 'cilCash'],
                ['name' => 'Operasional', 'icon' => 'cilBasket'],
                ['name' => 'Master Data', 'icon' => 'cilPeople'],
                ['name' => 'Pengaturan', 'icon' => 'cilSettings'],
                ['name' => 'Laporan', 'icon' => 'cilChartLine'],
            ];

            $groupModels = [];
            foreach ($groups as $groupData) {
                $group = PermissionGroup::updateOrCreate(
                    ['name' => $groupData['name']],
                    [
                        'icon' => $groupData['icon'],
                        'isActive' => true,
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
                        'groupFeatureId' => $groupModels[$groupName]->groupFeatureId,
                        'name' => $name,
                        'ordering' => $ordering,
                        'menuType' => 'sidebar',
                        'isActive' => true,
                    ],
                );
                $featureModels[$path] = $feature;
            }

            $roles = [];
            foreach (['Super Admin', 'Administrator', 'Kasir', 'Operator Laundry'] as $roleName) {
                $roles[$roleName] = Role::updateOrCreate(
                    ['name' => $roleName],
                    ['isActive' => true],
                );
            }

            $allFeatureIds = collect($featureModels)->pluck('featureId')->all();
            $adminFeatureIds = collect($featureModels)
                ->reject(fn (PermissionFeature $feature) => $feature->path === '/access')
                ->pluck('featureId')->all();

            $roles['Super Admin']->features()->sync($allFeatureIds);
            $roles['Administrator']->features()->sync($adminFeatureIds);

            $roles['Kasir']->features()->sync(collect([
                '/dashboard', '/transactions', '/orders', '/customers', '/payments',
            ])->map(fn (string $path) => $featureModels[$path]->featureId)->all());

            $roles['Operator Laundry']->features()->sync(collect([
                '/dashboard', '/orders', '/process',
            ])->map(fn (string $path) => $featureModels[$path]->featureId)->all());
        });

        $this->command?->info('Seeder group fitur, fitur, role, dan hak akses berhasil dijalankan.');
    }
}
