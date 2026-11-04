<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // groupFeature: use an explicit camelCase primary key.
        Schema::table('features', function (Blueprint $table) {
            $table->dropForeign(['permission_group_id']);
        });
        Schema::renameColumn('groupFeature', 'id', 'groupFeatureId');
        Schema::renameColumn('features', 'permission_group_id', 'featureId');
        Schema::table('features', function (Blueprint $table) {
            $table->foreign('featureId')->references('groupFeatureId')->on('groupFeature')->cascadeOnDelete();
            $table->index(['featureId', 'name']);
        });

        // Role-feature pivot: camelCase table and columns.
        Schema::table('role_permission_features', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['permission_feature_id']);
        });
        Schema::rename('role_permission_features', 'roleFeatures');
        Schema::renameColumn('roleFeatures', 'role_id', 'roleId');
        Schema::renameColumn('roleFeatures', 'permission_feature_id', 'featureId');
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->foreign('roleId')->references('id')->on('roles')->cascadeOnDelete();
            $table->foreign('featureId')->references('id')->on('features')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->dropForeign(['roleId']);
            $table->dropForeign(['featureId']);
        });
        Schema::renameColumn('roleFeatures', 'roleId', 'role_id');
        Schema::renameColumn('roleFeatures', 'featureId', 'permission_feature_id');
        Schema::rename('roleFeatures', 'role_permission_features');
        Schema::table('role_permission_features', function (Blueprint $table) {
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            $table->foreign('permission_feature_id')->references('id')->on('features')->cascadeOnDelete();
        });

        Schema::table('features', function (Blueprint $table) {
            $table->dropForeign(['featureId']);
        });
        Schema::renameColumn('features', 'featureId', 'permission_group_id');
        Schema::renameColumn('groupFeature', 'groupFeatureId', 'id');
        Schema::table('features', function (Blueprint $table) {
            $table->foreign('permission_group_id')->references('id')->on('groupFeature')->cascadeOnDelete();
        });
    }
};
