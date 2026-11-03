<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permission_groups', function (Blueprint $table) {
            $table->unsignedInteger('ordering')->default(0)->after('icon');
        });

        // Initialize a stable ordering for existing groups by name.
        $groups = DB::table('permission_groups')->orderBy('name')->orderBy('id')->get(['id']);
        foreach ($groups as $index => $group) {
            DB::table('permission_groups')->where('id', $group->id)->update(['ordering' => $index + 1]);
        }
    }

    public function down(): void
    {
        Schema::table('permission_groups', function (Blueprint $table) {
            $table->dropColumn('ordering');
        });
    }
};
