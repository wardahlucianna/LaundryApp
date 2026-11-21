<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outlets', function (Blueprint $table) {
            $table->uuid('outletId')->primary();
            $table->string('code', 30)->unique();
            $table->string('name', 120);
            $table->text('address')->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('email', 120)->nullable();
            $table->boolean('isPrimary')->default(false);
            $table->boolean('isActive')->default(true);
            $table->unsignedInteger('ordering')->default(1);
            $table->time('openingTime')->nullable();
            $table->time('closingTime')->nullable();
            $table->timestamps();
            $table->index(['isActive', 'ordering']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlets');
    }
};
