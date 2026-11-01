<?php

namespace Database\Seeders;

use App\Models\Akses\Permission;
use App\Models\Akses\PermissionFeature;
use App\Models\Akses\PermissionGroup;
use App\Models\Akses\Role;
use App\Models\Akses\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'DASHBOARD' => 'Dashboard',
            'TRANSACTIONS' => 'Transaksi',
            'OPERATIONS' => 'Operasional',
            'MASTER_DATA' => 'Master Data',
            'SETTINGS' => 'Pengaturan',
            'REPORTS' => 'Laporan',
        ];

        $groupModels = [];
        foreach ($groups as $code => $name) {
            $groupModels[$code] = PermissionGroup::updateOrCreate(
                ['code' => $code],
                ['name' => $name, 'is_active' => true],
            );
        }

        $features = [
            ['DASHBOARD', 'Dashboard', 'DASHBOARD', '/dashboard'],
            ['TRANSACTIONS', 'Transaksi', 'TRANSACTIONS', '/transactions'],
            ['OPERATIONS', 'Pesanan', 'ORDERS', '/orders'],
            ['OPERATIONS', 'Proses Laundry', 'LAUNDRY_PROCESS', '/process'],
            ['MASTER_DATA', 'Pelanggan', 'CUSTOMERS', '/customers'],
            ['MASTER_DATA', 'Layanan Laundry', 'SERVICES', '/services'],
            ['TRANSACTIONS', 'Pembayaran', 'PAYMENTS', '/payments'],
            ['OPERATIONS', 'Antar Jemput', 'DELIVERIES', '/deliveries'],
            ['REPORTS', 'Laporan', 'REPORTS', '/reports'],
            ['SETTINGS', 'Manajemen Role', 'ROLES', '/roles'],
            ['SETTINGS', 'Manajemen Fitur', 'FEATURES', '/permissions'],
            ['SETTINGS', 'Hak Akses', 'ACCESS', '/access'],
        ];

        $featureModels = [];
        foreach ($features as [$groupCode, $name, $code, $path]) {
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
                'update' => ['Ubah', 'TRANSACTION_UPDATE'],
                'delete' => ['Hapus', 'TRANSACTION_DELETE'],
            ],
            'ORDERS' => ['view' => ['Lihat', 'ORDERS_VIEW']],
            'LAUNDRY_PROCESS' => ['view' => ['Lihat', 'LAUNDRY_PROCESS_VIEW']],
            'CUSTOMERS' => [
                'view' => ['Lihat', 'CUSTOMER_VIEW'],
                'create' => ['Tambah', 'CUSTOMER_CREATE'],
                'update' => ['Ubah', 'CUSTOMER_UPDATE'],
                'delete' => ['Hapus', 'CUSTOMER_DELETE'],
            ],
            'SERVICES' => [
                'view' => ['Lihat', 'SERVICE_VIEW'],
                'create' => ['Tambah', 'SERVICE_CREATE'],
                'update' => ['Ubah', 'SERVICE_UPDATE'],
                'delete' => ['Hapus', 'SERVICE_DELETE'],
            ],
            'PAYMENTS' => ['view' => ['Lihat', 'PAYMENT_VIEW']],
            'DELIVERIES' => ['view' => ['Lihat', 'DELIVERY_VIEW']],
            'REPORTS' => ['view' => ['Lihat', 'REPORT_VIEW']],
            'ROLES' => [
                'view' => ['Lihat', 'ROLE_VIEW'],
                'manage' => ['Kelola', 'ROLE_MANAGE'],
            ],
            'FEATURES' => [
                'view' => ['Lihat', 'FEATURE_VIEW'],
                'create' => ['Tambah', 'FEATURE_CREATE'],
                'update' => ['Ubah', 'FEATURE_UPDATE'],
                'delete' => ['Hapus', 'FEATURE_DELETE'],
            ],
            'ACCESS' => [
                'view' => ['Lihat', 'ACCESS_VIEW'],
                'manage' => ['Kelola Hak Akses', 'ACCESS_MANAGE'],
            ],
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

        // Keep the three business roles distinct. Existing OWNER assignments remain OWNER.
        $superAdmin = Role::updateOrCreate(
            ['code' => 'SUPERADMIN'],
            ['name' => 'Super Admin', 'is_active' => true],
        );
        $admin = Role::updateOrCreate(
            ['code' => 'ADMIN'],
            ['name' => 'Admin', 'is_active' => true],
        );
        $owner = Role::updateOrCreate(
            ['code' => 'OWNER'],
            ['name' => 'Owner', 'is_active' => true],
        );

        $superAdmin->permissions()->sync($permissions->pluck('id'));

        // Admin manages day-to-day modules, but cannot administer roles or access policies.
        $adminPermissions = $permissions->reject(fn ($permission) => in_array(
            $permission->code,
            ['ROLE_VIEW', 'ROLE_MANAGE', 'ACCESS_VIEW', 'ACCESS_MANAGE'],
            true,
        ));
        $admin->permissions()->sync($adminPermissions->pluck('id'));

        // Owner can operate and monitor the laundry business without changing system access.
        $ownerCodes = [
            'DASHBOARD_VIEW',
            'TRANSACTION_VIEW', 'TRANSACTION_CREATE', 'TRANSACTION_UPDATE',
            'ORDERS_VIEW', 'LAUNDRY_PROCESS_VIEW',
            'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE',
            'SERVICE_VIEW',
            'PAYMENT_VIEW', 'DELIVERY_VIEW', 'REPORT_VIEW',
        ];
        $owner->permissions()->sync($permissions->whereIn('code', $ownerCodes)->pluck('id'));

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
