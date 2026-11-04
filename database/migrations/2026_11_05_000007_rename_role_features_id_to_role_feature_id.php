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

        if (Schema::hasTable('roleFeatures')
            && Schema::hasColumn('roleFeatures', 'roleFeaturesId')
            && !Schema::hasColumn('roleFeatures', 'roleFeatureId')) {
            Schema::table('roleFeatures', function (Blueprint $table) {
                $table->renameColumn('roleFeaturesId', 'roleFeatureId');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('roleFeatures')
            && Schema::hasColumn('roleFeatures', 'roleFeatureId')
            && !Schema::hasColumn('roleFeatures', 'roleFeaturesId')) {
            Schema::table('roleFeatures', function (Blueprint $table) {
                $table->renameColumn('roleFeatureId', 'roleFeaturesId');
            });
        }

        if (Schema::hasTable('roles')
            && Schema::hasColumn('roles', 'roleId')
            && !Schema::hasColumn('roles', 'rolesId')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->renameColumn('roleId', 'rolesId');
            });
        }
    }
};
