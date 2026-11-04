<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function tables(): array
    {
        return DB::select(
            "SELECT table_name
             FROM information_schema.tables
             WHERE table_schema = current_schema()
               AND table_type = 'BASE TABLE'
               AND table_name <> 'migrations'
             ORDER BY table_name"
        );
    }

    private function hasColumn(string $tableName, string $columnName): bool
    {
        return Schema::hasColumn($tableName, $columnName);
    }

    public function up(): void
    {
        foreach ($this->tables() as $tableRow) {
            $tableName = $tableRow->table_name;

            foreach ([
                'is_active' => 'isActive',
                'created_at' => 'createdAt',
                'updated_at' => 'updatedAt',
            ] as $oldName => $newName) {
                if ($this->hasColumn($tableName, $oldName) && !$this->hasColumn($tableName, $newName)) {
                    Schema::table($tableName, function (Blueprint $table) use ($oldName, $newName) {
                        $table->renameColumn($oldName, $newName);
                    });
                }
            }

            foreach (['createBy', 'updateBy'] as $auditColumn) {
                if (!$this->hasColumn($tableName, $auditColumn)) {
                    Schema::table($tableName, function (Blueprint $table) use ($auditColumn) {
                        $table->uuid($auditColumn)->nullable();
                    });
                }
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables() as $tableRow) {
            $tableName = $tableRow->table_name;

            foreach (['updateBy', 'createBy'] as $auditColumn) {
                if ($this->hasColumn($tableName, $auditColumn)) {
                    Schema::table($tableName, function (Blueprint $table) use ($auditColumn) {
                        $table->dropColumn($auditColumn);
                    });
                }
            }

            foreach ([
                'isActive' => 'is_active',
                'createdAt' => 'created_at',
                'updatedAt' => 'updated_at',
            ] as $newName => $oldName) {
                if ($this->hasColumn($tableName, $newName) && !$this->hasColumn($tableName, $oldName)) {
                    Schema::table($tableName, function (Blueprint $table) use ($newName, $oldName) {
                        $table->renameColumn($newName, $oldName);
                    });
                }
            }
        }
    }
};
