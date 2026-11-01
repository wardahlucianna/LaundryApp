<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = [
            ['Dashboard', 'DASHBOARD_VIEW', '/dashboard'],
            ['Transaksi - Lihat', 'TRANSACTION_VIEW', '/transactions'],
            ['Transaksi - Tambah', 'TRANSACTION_CREATE', '/transactions'],
            ['Transaksi - Ubah', 'TRANSACTION_UPDATE', '/transactions'],
            ['Pesanan', 'ORDERS_VIEW', '/orders'],
            ['Proses Laundry', 'LAUNDRY_PROCESS_VIEW', '/process'],
            ['Pelanggan', 'CUSTOMER_VIEW', '/customers'],
            ['Pembayaran', 'PAYMENT_VIEW', '/payments'],
            ['Antar Jemput', 'DELIVERY_VIEW', '/deliveries'],
            ['Laporan', 'REPORT_VIEW', '/reports'],
            ['Manajemen Role - Lihat', 'ROLE_VIEW', '/access/roles'],
            ['Manajemen Role - Kelola', 'ROLE_MANAGE', '/access/roles'],
            ['Manajemen Fitur - Lihat', 'FEATURE_VIEW', '/access/features'],
            ['Manajemen Fitur - Kelola', 'FEATURE_MANAGE', '/access/features'],
            ['Pengaturan Hak Akses', 'ACCESS_MANAGE', '/access/permissions'],
        ];

        $permissions = collect($definitions)->map(fn (array $item) => Permission::updateOrCreate(
            ['code' => $item[1]],
            ['name' => $item[0], 'path' => $item[2], 'is_active' => true],
        ));

        $owner = Role::updateOrCreate(
            ['code' => 'OWNER'],
            ['name' => 'Owner', 'is_active' => true],
        );
        $owner->permissions()->sync($permissions->pluck('id'));

        $admin = Role::updateOrCreate(
            ['code' => 'ADMIN'],
            ['name' => 'Administrator', 'is_active' => true],
        );
        $admin->permissions()->sync($permissions->reject(fn ($permission) => $permission->code === 'ACCESS_MANAGE')->pluck('id'));

        $cashier = Role::updateOrCreate(
            ['code' => 'KASIR'],
            ['name' => 'Kasir', 'is_active' => true],
        );
        $cashier->permissions()->sync($permissions->whereIn('code', [
            'DASHBOARD_VIEW', 'TRANSACTION_VIEW', 'TRANSACTION_CREATE', 'TRANSACTION_UPDATE',
            'ORDERS_VIEW', 'CUSTOMER_VIEW', 'PAYMENT_VIEW',
        ])->pluck('id'));

        $operator = Role::updateOrCreate(
            ['code' => 'OPERATOR'],
            ['name' => 'Operator Laundry', 'is_active' => true],
        );
        $operator->permissions()->sync($permissions->whereIn('code', [
            'DASHBOARD_VIEW', 'ORDERS_VIEW', 'LAUNDRY_PROCESS_VIEW',
        ])->pluck('id'));
    }
}
