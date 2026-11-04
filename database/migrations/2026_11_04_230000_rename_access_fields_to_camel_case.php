<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop foreign keys by their actual database names. Constraint names can
     * differ between existing databases, so do not rely on Laravel's inferred
     * name (for example features_permission_group_id_foreign).
     */
    private function dropForeignKeysForColumns(string $tableName, array $columnNames): void
    {
        $constraints = DB::select(
            'SELECT DISTINCT c.conname
             FROM pg_constraint c
             JOIN pg_class tbl ON tbl.oid = c.conrelid
             JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
             JOIN unnest(c.conkey) AS key_col(attnum) ON true
             JOIN pg_attribute attr ON attr.attrelid = tbl.oid AND attr.attnum = key_col.attnum
             WHERE c.contype = ? AND ns.nspname = current_schema()
               AND tbl.relname = ? AND attr.attname IN (' . implode(',', array_fill(0, count($columnNames), '?')) . ')',
            array_merge(['f', $tableName], $columnNames)
        );

        foreach ($constraints as $constraint) {
            DB::statement('ALTER TABLE "' . str_replace('"', '""', $tableName) . '" DROP CONSTRAINT "' . str_replace('"', '""', $constraint->conname) . '"');
        }
    }

    public function up(): void
    {
        // groupFeature: use an explicit camelCase primary key.
        $this->dropForeignKeysForColumns('features', ['permission_group_id']);
        Schema::table('groupFeature', function (Blueprint $table) {
            $table->renameColumn('id', 'groupFeatureId');
        });
        Schema::table('features', function (Blueprint $table) {
            $table->renameColumn('permission_group_id', 'featureId');
        });
        Schema::table('features', function (Blueprint $table) {
            $table->foreign('featureId')->references('groupFeatureId')->on('groupFeature')->cascadeOnDelete();
            $table->index(['featureId', 'name']);
        });

        // Role-feature pivot: camelCase table and columns.
        $this->dropForeignKeysForColumns('role_permission_features', ['role_id', 'permission_feature_id']);
        Schema::rename('role_permission_features', 'roleFeatures');
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->renameColumn('role_id', 'roleId');
        });
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->renameColumn('permission_feature_id', 'featureId');
        });
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->foreign('roleId')->references('id')->on('roles')->cascadeOnDelete();
            $table->foreign('featureId')->references('id')->on('features')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        $this->dropForeignKeysForColumns('roleFeatures', ['roleId', 'featureId']);
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->renameColumn('roleId', 'role_id');
        });
        Schema::table('roleFeatures', function (Blueprint $table) {
            $table->renameColumn('featureId', 'permission_feature_id');
        });
        Schema::rename('roleFeatures', 'role_permission_features');
        Schema::table('role_permission_features', function (Blueprint $table) {
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            $table->foreign('permission_feature_id')->references('id')->on('features')->cascadeOnDelete();
        });

        $this->dropForeignKeysForColumns('features', ['featureId']);
        Schema::table('features', function (Blueprint $table) {
            $table->renameColumn('featureId', 'permission_group_id');
        });
        Schema::table('groupFeature', function (Blueprint $table) {
            $table->renameColumn('groupFeatureId', 'id');
        });
        Schema::table('features', function (Blueprint $table) {
            $table->foreign('permission_group_id')->references('id')->on('groupFeature')->cascadeOnDelete();
        });
    }
};
