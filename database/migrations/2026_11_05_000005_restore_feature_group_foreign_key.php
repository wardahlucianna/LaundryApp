<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('features') || !Schema::hasTable('groupFeature')) {
            return;
        }

        // Restore the feature-to-group reference column if an earlier migration
        // removed it. Existing feature rows remain unassigned until mapped.
        if (!Schema::hasColumn('features', 'groupFeatureId')) {
            Schema::table('features', function (Blueprint $table) {
                $table->uuid('groupFeatureId')->nullable();
            });
        }

        $foreignKeyExists = DB::selectOne(
            "SELECT 1
             FROM pg_constraint c
             JOIN pg_class t ON t.oid = c.conrelid
             JOIN pg_namespace n ON n.oid = t.relnamespace
             WHERE c.contype = 'f'
               AND n.nspname = current_schema()
               AND t.relname = 'features'
               AND c.conname = 'features_groupFeatureId_foreign'
             LIMIT 1"
        );

        if (!$foreignKeyExists && Schema::hasColumn('groupFeature', 'groupFeatureId')) {
            Schema::table('features', function (Blueprint $table) {
                $table->foreign('groupFeatureId', 'features_groupFeatureId_foreign')
                    ->references('groupFeatureId')
                    ->on('groupFeature')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('features') && Schema::hasColumn('features', 'groupFeatureId')) {
            Schema::table('features', function (Blueprint $table) {
                $table->dropForeign('features_groupFeatureId_foreign');
                $table->dropColumn('groupFeatureId');
            });
        }
    }
};
