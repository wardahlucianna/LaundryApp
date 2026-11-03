<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permission_features', function (Blueprint $table) {
            $table->uuid('role_id');
            $table->uuid('permission_feature_id');
            $table->primary(['role_id', 'permission_feature_id']);
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            $table->foreign('permission_feature_id')->references('id')->on('permission_features')->cascadeOnDelete();
        });

        if (Schema::hasTable('role_permissions') && Schema::hasTable('permissions') && Schema::hasColumn('permissions', 'permission_feature_id')) {
            DB::table('role_permission_features')->insertUsing(
                ['role_id', 'permission_feature_id'],
                DB::table('role_permissions')->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                    ->whereNotNull('permissions.permission_feature_id')
                    ->select('role_permissions.role_id', 'permissions.permission_feature_id')->distinct()
            );
        }

        foreach (['role_permissions', 'permissions', 'personal_access_tokens', 'password_reset_tokens', 'sessions'] as $table) {
            if (Schema::hasTable($table)) Schema::drop($table);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permission_features');
        // The legacy action-permission and token/session tables are intentionally not recreated.
    }
};
