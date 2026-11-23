<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Constraint mungkin tidak ada pada database yang sudah pernah diubah.
        DB::statement('ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_code_unique"');

        // PostgreSQL otomatis menghapus index yang bergantung pada kolom saat kolom dihapus.
        foreach (['code', 'description', 'ordering'] as $column) {
            if (Schema::hasColumn('units', $column)) {
                Schema::table('units', function ($table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('units', function ($table) {
            $table->string('code', 30)->nullable();
            $table->string('description', 500)->nullable();
            $table->unsignedInteger('ordering')->default(1);
        });

        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS "units_code_unique" ON "units" ("code")');
        DB::statement('CREATE INDEX IF NOT EXISTS "units_isactive_ordering_index" ON "units" ("isActive", "ordering")');
    }
};
