<?php

namespace App\Services\Master;

use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RoleService
{
    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(Role $role, array $data): Role
    {
        $role->update($data);

        return $role->fresh();
    }

    public function delete(Role $role): void
    {
        if ($role->code === 'SUPERADMIN') {
            throw ValidationException::withMessages([
                'role' => 'Role SUPERADMIN tidak dapat dihapus.',
            ]);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => 'Role masih digunakan oleh pengguna.',
            ]);
        }

        $role->delete();
    }

    public function syncPermissions(Role $role, array $permissionIds): Role
    {
        if ($role->code === 'SUPERADMIN') {
            throw ValidationException::withMessages([
                'role' => 'Hak akses SUPERADMIN selalu penuh.',
            ]);
        }

        DB::transaction(fn () => $role->permissions()->sync($permissionIds));

        return $role->load('permissions');
    }
}
