<?php

namespace Database\Seeders;

use App\Models\Access\PermissionFeature;
use App\Models\Access\PermissionGroup;
use App\Models\Access\Role;
use Illuminate\Database\Seeder;

class ServiceTypeFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $group = PermissionGroup::updateOrCreate(
            ['name' => 'Master Data'],
            ['icon' => 'cilPeople', 'isActive' => true],
        );

        $feature = PermissionFeature::updateOrCreate(
            ['path' => '/service-types'],
            [
                'groupFeatureId' => $group->groupFeatureId,
                'name' => 'Jenis Layanan',
                'ordering' => 46,
                'menuType' => 'sidebar',
                'isActive' => true,
            ],
        );

        // Add this menu to the standard administrator roles without
        // replacing any existing role-feature assignments.
        Role::query()
            ->whereIn('name', ['Super Admin', 'Administrator'])
            ->get()
            ->each(fn (Role $role) => $role->features()->syncWithoutDetaching([$feature->featureId]));

        $this->command?->info('Menu Master Jenis Layanan berhasil disiapkan.');
    }
}
