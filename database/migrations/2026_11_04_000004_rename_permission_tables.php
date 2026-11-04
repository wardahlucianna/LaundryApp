<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('permission_features', 'features');
        Schema::rename('permission_groups', 'groupFeature');
    }

    public function down(): void
    {
        Schema::rename('groupFeature', 'permission_groups');
        Schema::rename('features', 'permission_features');
    }
};
