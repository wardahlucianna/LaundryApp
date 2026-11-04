<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Preserve the group-feature foreign key before promoting id to the feature primary key.
        if (Schema::hasTable('features') && Schema::hasColumn('features', 'id') && Schema::hasColumn('features', 'featureId') && !Schema::hasColumn('features', 'groupFeatureId')) {
            Schema::table('features', function (Blueprint $table) {
                $table->renameColumn('featureId', 'groupFeatureId');
            });
        }

        if (Schema::hasTable('features') && Schema::hasColumn('features', 'id') && !Schema::hasColumn('features', 'featureId')) {
            Schema::table('features', function (Blueprint $table) {
                $table->renameColumn('id', 'featureId');
            });
        }

        // Add nullable audit timestamps to existing roleFeatures records.
        if (Schema::hasTable('roleFeatures')) {
            if (!Schema::hasColumn('roleFeatures', 'createAt')) {
                Schema::table('roleFeatures', function (Blueprint $table) {
                    $table->timestamp('createAt')->nullable();
                });
            }

            if (!Schema::hasColumn('roleFeatures', 'updateAt')) {
                Schema::table('roleFeatures', function (Blueprint $table) {
                    $table->timestamp('updateAt')->nullable();
                });
            }
        }

        // users.remember_token -> rememberToken
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'remember_token') && !Schema::hasColumn('users', 'rememberToken')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('remember_token', 'rememberToken');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'rememberToken') && !Schema::hasColumn('users', 'remember_token')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('rememberToken', 'remember_token');
            });
        }

        if (Schema::hasTable('roleFeatures')) {
            foreach (['updateAt', 'createAt'] as $column) {
                if (Schema::hasColumn('roleFeatures', $column)) {
                    Schema::table('roleFeatures', function (Blueprint $table) use ($column) {
                        $table->dropColumn($column);
                    });
                }
            }
        }

        if (Schema::hasTable('features') && Schema::hasColumn('features', 'featureId') && !Schema::hasColumn('features', 'id')) {
            Schema::table('features', function (Blueprint $table) {
                $table->renameColumn('featureId', 'id');
            });
        }
    }
};
