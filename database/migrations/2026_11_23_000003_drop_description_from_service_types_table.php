<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('serviceTypes', 'description')) {
            Schema::table('serviceTypes', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('serviceTypes', 'description')) {
            Schema::table('serviceTypes', function (Blueprint $table) {
                $table->string('description', 500)->nullable();
            });
        }
    }
};
