<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            $table->dropIndex(['isActive', 'ordering']);
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'ordering']);
        });
    }

    public function down(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            $table->string('code', 30)->nullable()->unique();
            $table->unsignedInteger('ordering')->default(1);
            $table->index(['isActive', 'ordering']);
        });
    }
};
