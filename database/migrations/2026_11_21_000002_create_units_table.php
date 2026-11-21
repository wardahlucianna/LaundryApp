<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('unitId')->primary();
            $table->string('code', 30)->unique();
            $table->string('name', 100);
            $table->string('symbol', 20);
            $table->string('description', 500)->nullable();
            $table->boolean('isActive')->default(true);
            $table->unsignedInteger('ordering')->default(1);
            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();

            $table->index(['isActive', 'ordering']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
