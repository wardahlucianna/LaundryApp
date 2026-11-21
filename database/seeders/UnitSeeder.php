<?php

namespace Database\\Seeders;

use App\\Models\\Master\\Unit;
use Illuminate\\Database\\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['code' => 'SAT001', 'name' => 'Kilogram', 'symbol' => 'Kg', 'description' => 'Satuan berat untuk transaksi laundry kiloan.', 'ordering' => 1],
            ['code' => 'SAT002', 'name' => 'Pieces', 'symbol' => 'Pcs', 'description' => 'Satuan jumlah barang per buah.', 'ordering' => 2],
            ['code' => 'SAT003', 'name' => 'Pasang', 'symbol' => 'Pasang', 'description' => 'Satuan untuk barang yang berpasangan, seperti sepatu.', 'ordering' => 3],
            ['code' => 'SAT004', 'name' => 'Lusin', 'symbol' => 'Lusin', 'description' => 'Satuan untuk 12 buah barang.', 'ordering' => 4],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(
                ['code' => $unit['code']],
                [...$unit, 'isActive' => true],
            );
        }

        $this->command?->info('Data master satuan berhasil disiapkan.');
    }
}
