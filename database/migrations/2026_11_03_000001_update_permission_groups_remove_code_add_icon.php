<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permission_groups', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
            $table->string('description', 500)->nullable()->after('name');
            $table->string('icon', 80)->default('cilFolderOpen')->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('permission_groups', function (Blueprint $table) {
            $table->dropColumn(['description', 'icon']);
            $table->string('code', 80)->nullable();
            $table->unique('code');
        });
    }
};
