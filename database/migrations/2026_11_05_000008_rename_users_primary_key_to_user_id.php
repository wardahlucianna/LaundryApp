<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'usersId') && !Schema::hasColumn('users', 'userId')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('usersId', 'userId');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'userId') && !Schema::hasColumn('users', 'usersId')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('userId', 'usersId');
            });
        }
    }
};
