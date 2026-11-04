<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('roles')
            && Schema::hasColumn('roles', 'rolesId')
            && !Schema::hasColumn('roles', 'roleId')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->renameColumn('rolesId', 'roleId');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('roles')
            && Schema::hasColumn('roles', 'roleId')
            && !Schema::hasColumn('roles', 'rolesId')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->renameColumn('roleId', 'rolesId');
            });
        }
    }
};
