<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropIndex(['isActive', 'ordering']);
            $table->dropColumn(['code', 'description', 'ordering']);
        });
    }

    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->string('code', 30)->nullable()->unique();
            $table->string('description', 500)->nullable();
            $table->unsignedInteger('ordering')->default(1);
            $table->index(['isActive', 'ordering']);
        });
    }
};
