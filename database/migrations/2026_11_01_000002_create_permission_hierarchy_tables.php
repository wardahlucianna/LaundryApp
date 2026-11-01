<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 120);
            $table->string('code', 80)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('permission_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('permission_group_id');
            $table->string('name', 120);
            $table->string('code', 80)->unique();
            $table->string('path')->nullable();
            $table->string('menu_type', 20)->default('sidebar');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('permission_group_id')->references('id')->on('permission_groups')->cascadeOnDelete();
            $table->index(['permission_group_id', 'name']);
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->uuid('permission_feature_id')->nullable();
            $table->string('action_name', 80)->nullable();
            $table->foreign('permission_feature_id')->references('id')->on('permission_features')->nullOnDelete();
            $table->index(['permission_feature_id', 'action_name']);
        });
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropForeign(['permission_feature_id']);
            $table->dropIndex(['permission_feature_id', 'action_name']);
            $table->dropColumn(['permission_feature_id', 'action_name']);
        });
        Schema::dropIfExists('permission_features');
        Schema::dropIfExists('permission_groups');
    }
};
