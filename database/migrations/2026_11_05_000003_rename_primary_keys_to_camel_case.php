<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // roleFeatures.id -> roleFeaturesId
        if (Schema::hasTable('roleFeatures') && Schema::hasColumn('roleFeatures', 'id') && !Schema::hasColumn('roleFeatures', 'roleFeaturesId')) {
            Schema::table('roleFeatures', function (Blueprint $table) {
                $table->renameColumn('id', 'roleFeaturesId');
            });
        }

        // roles.id -> rolesId
        if (Schema::hasTable('roles') && Schema::hasColumn('roles', 'id') && !Schema::hasColumn('roles', 'rolesId')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->renameColumn('id', 'rolesId');
            });
        }

        // users.id -> usersId
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'id') && !Schema::hasColumn('users', 'usersId')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('id', 'usersId');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'usersId') && !Schema::hasColumn('users', 'id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('usersId', 'id');
            });
        }

        if (Schema::hasTable('roles') && Schema::hasColumn('roles', 'rolesId') && !Schema::hasColumn('roles', 'id')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->renameColumn('rolesId', 'id');
            });
        }

        if (Schema::hasTable('roleFeatures') && Schema::hasColumn('roleFeatures', 'roleFeaturesId') && !Schema::hasColumn('roleFeatures', 'id')) {
            Schema::table('roleFeatures', function (Blueprint $table) {
                $table->renameColumn('roleFeaturesId', 'id');
            });
        }
    }
};
