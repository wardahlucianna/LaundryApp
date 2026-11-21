<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $columns = ['email', 'openingTime', 'closingTime'];
        $existingColumns = array_values(array_filter(
            $columns,
            fn (string $column) => Schema::hasColumn('outlets', $column)
        ));

        if ($existingColumns !== []) {
            Schema::table('outlets', function (Blueprint $table) use ($existingColumns) {
                $table->dropColumn($existingColumns);
            });
        }
    }

    public function down(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            $table->string('email', 120)->nullable();
            $table->time('openingTime')->nullable();
            $table->time('closingTime')->nullable();
        });
    }
};
