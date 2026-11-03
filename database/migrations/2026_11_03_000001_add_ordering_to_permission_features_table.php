<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permission_features', function (Blueprint $table) {
            $table->unsignedInteger('ordering')->default(0)->after('path');
        });
    }

    public function down(): void
    {
        Schema::table('permission_features', function (Blueprint $table) {
            $table->dropColumn('ordering');
        });
    }
};
