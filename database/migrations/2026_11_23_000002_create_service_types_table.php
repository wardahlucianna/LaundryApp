<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('serviceTypes', function (Blueprint $table) {
            $table->uuid('serviceTypeId')->primary();
            $table->string('name', 100)->unique();
            $table->string('description', 500)->nullable();
            $table->boolean('isActive')->default(true);
            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
            $table->index('isActive');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('serviceTypes');
    }
};
