<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropUnique('roles_code_unique');
            $table->dropColumn('code');
        });

        Schema::table('permission_features', function (Blueprint $table) {
            $table->dropUnique('permission_features_code_unique');
            $table->dropColumn('code');
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('code', 60)->nullable()->unique();
        });

        Schema::table('permission_features', function (Blueprint $table) {
            $table->string('code', 80)->nullable()->unique();
        });
    }
};
