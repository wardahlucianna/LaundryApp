<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Constraint mungkin tidak ada pada database yang sudah pernah diubah.
        DB::statement('ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_code_unique"');

        // PostgreSQL otomatis menghapus index yang bergantung pada kolom saat
        // kolom tersebut dihapus, jadi tidak perlu dropIndex secara terpisah.
        foreach ((['code', 'description', 'ordering']) as $column) {
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
            if (!Schema::hasColumn('units', 'code')) {
                $table->string('code', 30)->nullable();
            }

            if (!Schema::hasColumn('units', 'description')) {
                $table->string('description', 500)->nullable();
            }

            if (!Schema::hasColumn('units', 'ordering')) {
                $table->unsignedInteger('ordering')->default(1);
            }
        });

        // Kembalikan unique constraint dan index saat rollback.
        if (Schema::hasColumn('units', 'code')) {
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS "units_code_unique" ON "units" ("code")');
        }

        if (Schema::hasColumn('units', 'isActive') && Schema::hasColumn('units', 'ordering')) {
            DB::statement('CREATE INDEX IF NOT EXISTS "units_isactive_ordering_index" ON "units" ("isActive", "ordering")');
        }
    }
};
