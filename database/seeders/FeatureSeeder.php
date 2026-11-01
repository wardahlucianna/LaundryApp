<?php

namespace Database\\Seeders;

use App\\Models\\Akses\\Permission;
use App\\Models\\Akses\\PermissionFeature;
use App\\Models\\Akses\\PermissionGroup;
use App\\Models\\Akses\\Role;
use App\\Models\\Akses\\User;
use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Str;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'DASHBOARD' => ['Beranda', 'Dashboard'],
            'TRANSACTIONS' => ['Transaksi', 'Transactions'],
            'OPERATIONS' => ['Operasional', 'Operations'],
            'MASTER_DATA' => ['Master Data', 'MasterData'],
            'SETTINGS' => ['Pengaturan', 'Settings'],
            'REPORTS' => ['Laporan', 'Reports'],
        ];

        $groupModels = [];
        foreach ($groups as $code => [$name]) {
            $groupModels[$code] = PermissionGroup::updateOrCreate(
                ['code' => $code],
                ['name' => $name, 'is_active' => true],
            );
        }

        $features = [
            ['DASHBOARD', 'Dashboard', 'DASHBOARD', '/dashboard', 'DASHBOARD_VIEW'],
            ['TRANSACTIONS', 'Manajemen Transaksi', 'TRANSACTIONS', '/transactions', 'TRANSACTION_VIEW'],
            ['OPERATIONS', 'Pesanan', 'ORDERS', '/orders', 'ORDERS_VIEW'],
            ['OPERATIONS', 'Proses Laundry', 'LAUNDRY_PROCESS', '/process', 'LAUNDRY_PROCESS_VIEW'],
            ['MASTER_DATA', 'Manajemen Pelanggan', 'CUSTOMERS', '/customers', 'CUSTOMER_VIEW'],
            ['TRANSACTIONS', 'Pembayaran', 'PAYMENTS', '/payments', 'PAYMENT_VIEW'],
            ['OPERATIONS', 'Antar Jemput', 'DELIVERIES', '/deliveries', 'DELIVERY_VIEW'],
            ['REPORTS', 'Laporan', 'REPORTS', '/reports', 'REPORT_VIEW'],
            ['SETTINGS', 'Manajemen Role', 'ROLES', '/roles', 'ROLE_VIEW'],
            ['SETTINGS', 'Manajemen Fitur', 'FEATURES', '/permissions', 'FEATURE_VIEW'],
            ['SETTINGS', 'Hak Akses', 'ACCESS', '/access', 'ACCESS_MANAGE'],
        ];

        $featureModels = [];
        foreach ($features as [$groupCode, $name, $code, $path, $viewCode]) {
            $featureModels[$code] = PermissionFeature::updateOrCreate(
                ['code' => $code],
                [
                    'permission_group_id' => $groupModels[$groupCode]->id,
                    'name' => $name,
                    'path' => $path,
                    'menu_type' => 'sidebar',
                    'is_active' => true,
                ],
            );
        }

        $actions = [
            'DASHBOARD' => ['view' => ['Lihat', 'DASHBOARD_VIEW']],
            'TRANSACTIONS' => [
                'view' => ['Lihat', 'TRANSACTION_VIEW'],
                'create' => ['Tambah', 'TRANSACTION_CREATE'],
                'update' => ['Edit', 'TRANSACTION_UPDATE'],
                'delete' => ['Hapus', 'TRANSACTION_DELETE'],
            ],
            'ORDERS' => ['view' => ['Lihat', 'ORDERS_VIEW']],
            'LAUNDRY_PROCESS' => ['view' => ['Lihat', 'LAUNDRY_PROCESS_VIEW']],
            'CUSTOMERS' => [
                'view' => ['Lihat', 'CUSTOMER_VIEW'],
                'create' => ['Tambah', 'CUSTOMER_CREATE'],
                'update' => ['Edit', 'CUSTOMER_UPDATE'],
                'delete' => ['Hapus', 'CUSTOMER_DELETE'],
            ],
            'PAYMENTS' => ['view' => ['Lihat', 'PAYMENT_VIEW']],
            'DELIVERIES' => ['view' => ['Lihat', 'DELIVERY_VIEW']],
            'REPORTS' => ['view' => ['Lihat', 'REPORT_VIEW']],
            'ROLES' => [
                'view' => ['Lihat', 'ROLE_VIEW'],
                'create' => ['Tambah', 'ROLE_CREATE'],
                'update' => ['Edit', 'ROLE_UPDATE'],
                'delete' => ['Hapus', 'ROLE_DELETE'],
            ],
            'FEATURES' => [
                'view' => ['Lihat', 'FEATURE_VIEW'],
                'create' => ['Tambah', 'FEATURE_CREATE'],
                'update' => ['Edit', 'FEATURE_UPDATE'],
                'delete' => ['Hapus', 'FEATURE_DELETE'],
            ],
            'ACCESS' => ['manage' => ['Kelola Hak Akses', 'ACCESS_MANAGE']],
        ];

        $permissions = collect();
        foreach ($actions as $featureCode => $featureActions) {
            foreach ($featureActions as $actionCode => [$actionLabel, $permissionCode]) {
                $permission = Permission::updateOrCreate(
                    ['code' => $permissionCode],
                    [
                        'name' => $actionLabel,
                        'path' => $featureModels[$featureCode]->path,
                        'permission_feature_id' => $featureModels[$featureCode]->id,
                        'action_name' => $actionCode,
                        'is_active' => true,
                    ],
                );
                $permissions->push($permission);
            }
        }

        // Migrate legacy OWNER role to SUPERADMIN without losing its user assignments.
        $superAdmin = Role::where('code', 'OWNER')->first();
        if ($superAdmin) {
            $superAdmin->update(['code' => 'SUPERADMIN', 'name' => 'Super Admin', 'is_active' => true]);
        } else {
            $superAdmin = Role::updateOrCreate(
                ['code' => 'SUPERADMIN'],
                ['name' => 'Super Admin', 'is_active' => true],
            );
        }
        $superAdmin->permissions()->sync($permissions->pluck('id'));

        User::where('role_id', $superAdmin->id)->where('username', 'owner')->update([
            'username' => 'superadmin',
            'full_name' => 'Super Admin',
            'email' => env('INITIAL_SUPERADMIN_EMAIL', 'superadmin@sunrise.local'),
        ]);

        $admin = Role::updateOrCreate(['code' => 'ADMIN'], ['name' => 'Administrator', 'is_active' => true]);
        $admin->permissions()->sync($permissions->reject(fn ($permission) => $permission->code === 'ACCESS_MANAGE')->pluck('id'));

        $cashier = Role::updateOrCreate(['code' => 'KASIR'], ['name' => 'Kasir', 'is_active' => true]);
        $cashier->permissions()->sync($permissions->whereIn('code', [
            'DASHBOARD_VIEW', 'TRANSACTION_VIEW', 'TRANSACTION_CREATE', 'TRANSACTION_UPDATE',
            'ORDERS_VIEW', 'CUSTOMER_VIEW', 'PAYMENT_VIEW',
        ])->pluck('id'));

        $operator = Role::updateOrCreate(['code' => 'OPERATOR'], ['name' => 'Operator Laundry', 'is_active' => true]);
        $operator->permissions()->sync($permissions->whereIn('code', [
            'DASHBOARD_VIEW', 'ORDERS_VIEW', 'LAUNDRY_PROCESS_VIEW',
        ])->pluck('id'));

        if (!User::query()->exists()) {
            $username = env('INITIAL_SUPERADMIN_USERNAME', 'superadmin');
            $password = env('INITIAL_SUPERADMIN_PASSWORD') ?: Str::random(20);

            User::create([
                'role_id' => $superAdmin->id,
                'full_name' => env('INITIAL_SUPERADMIN_NAME', 'Super Admin'),
                'username' => $username,
                'email' => env('INITIAL_SUPERADMIN_EMAIL', 'superadmin@sunrise.local'),
                'password' => $password,
                'is_active' => true,
            ]);

            $this->command?->info("Initial Super Admin created. Username: {$username} | Password: {$password}");
            $this->command?->warn('Simpan kredensial ini dan segera ganti password setelah login pertama.');
        }
    }
}
