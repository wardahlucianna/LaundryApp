<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // features.menu_type -> menuType
        if (Schema::hasTable('features') && Schema::hasColumn('features', 'menu_type') && !Schema::hasColumn('features', 'menuType')) {
            Schema::table('features', function (Blueprint $table) {
                $table->renameColumn('menu_type', 'menuType');
            });
        }

        // users.full_name -> fullName and role_id -> roleId
        if (Schema::hasTable('users')) {
            foreach (['full_name' => 'fullName', 'role_id' => 'roleId'] as $oldName => $newName) {
                if (Schema::hasColumn('users', $oldName) && !Schema::hasColumn('users', $newName)) {
                    Schema::table('users', function (Blueprint $table) use ($oldName, $newName) {
                        $table->renameColumn($oldName, $newName);
                    });
                }
            }
        }

        // Convert roleFeatures composite key into a UUID id primary key.
        if (Schema::hasTable('roleFeatures') && !Schema::hasColumn('roleFeatures', 'id')) {
            Schema::table('roleFeatures', function (Blueprint $table) {
                $table->uuid('id')->nullable();
            });

            DB::table('roleFeatures')->whereNull('id')->update(['id' => DB::raw('gen_random_uuid()')]);

            DB::statement('ALTER TABLE "roleFeatures" ALTER COLUMN "id" SET NOT NULL');
            DB::statement('ALTER TABLE "roleFeatures" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()');

            $primaryKey = DB::select(
                "SELECT c.conname
                 FROM pg_constraint c
                 JOIN pg_class tbl ON tbl.oid = c.conrelid
                 JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
                 WHERE c.contype = 'p' AND ns.nspname = current_schema()
                   AND tbl.relname = 'roleFeatures'"
            );

            foreach ($primaryKey as $constraint) {
                DB::statement('ALTER TABLE "roleFeatures" DROP CONSTRAINT "' . str_replace('"', '""', $constraint->conname) . '"');
            }

            DB::statement('ALTER TABLE "roleFeatures" ADD CONSTRAINT "roleFeatures_pkey" PRIMARY KEY ("id")');
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS "roleFeatures_roleId_featureId_unique" ON "roleFeatures" ("roleId", "featureId")');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('roleFeatures') && Schema::hasColumn('roleFeatures', 'id')) {
            DB::statement('DROP INDEX IF EXISTS "roleFeatures_roleId_featureId_unique"');

            $primaryKey = DB::select(
                "SELECT c.conname
                 FROM pg_constraint c
                 JOIN pg_class tbl ON tbl.oid = c.conrelid
                 JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
                 WHERE c.contype = 'p' AND ns.nspname = current_schema()
                   AND tbl.relname = 'roleFeatures'"
            );

            foreach ($primaryKey as $constraint) {
                DB::statement('ALTER TABLE "roleFeatures" DROP CONSTRAINT "' . str_replace('"', '""', $constraint->conname) . '"');
            }

            DB::statement('ALTER TABLE "roleFeatures" DROP COLUMN "id"');
            DB::statement('ALTER TABLE "roleFeatures" ADD CONSTRAINT "roleFeatures_pkey" PRIMARY KEY ("roleId", "featureId")');
        }

        if (Schema::hasTable('users')) {
            foreach (['roleId' => 'role_id', 'fullName' => 'full_name'] as $newName => $oldName) {
                if (Schema::hasColumn('users', $newName) && !Schema::hasColumn('users', $oldName)) {
                    Schema::table('users', function (Blueprint $table) use ($newName, $oldName) {
                        $table->renameColumn($newName, $oldName);
                    });
                }
            }
        }

        if (Schema::hasTable('features') && Schema::hasColumn('features', 'menuType') && !Schema::hasColumn('features', 'menu_type')) {
            Schema::table('features', function (Blueprint $table) {
                $table->renameColumn('menuType', 'menu_type');
            });
        }
    }
};
