<?php

namespace Database\Seeders;

use App\Models\Master\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Kilogram', 'symbol' => 'Kg'],
            ['name' => 'Pieces', 'symbol' => 'Pcs'],
            ['name' => 'Pasang', 'symbol' => 'Psg'],
            ['name' => 'Lusin', 'symbol' => 'Lsn'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(
                ['name' => $unit['name']],
                ['symbol' => $unit['symbol'], 'isActive' => true],
            );
        }

        $this->command?->info('Data master satuan berhasil disiapkan.');
    }
}
