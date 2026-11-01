<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::query()->withCount('permissions')->orderBy('name');

        if ($search = $request->string('search')->toString()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")->orWhere('code', 'ilike', "%{$search}%"));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json($query->paginate(min(max($request->integer('per_page', 10), 1), 100)));
    }

    public function store(StoreRoleRequest $request)
    {
        return response()->json(['data' => Role::create($request->validated())], 201);
    }

    public function show(Role $role)
    {
        return response()->json(['data' => $role->load('permissions')]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update($request->validated());

        return response()->json(['data' => $role->fresh()]);
    }

    public function destroy(Role $role)
    {
        if ($role->code === 'SUPERADMIN') {
            return response()->json(['message' => 'Role SUPERADMIN tidak dapat dihapus.'], 422);
        }

        if ($role->users()->exists()) {
            return response()->json(['message' => 'Role masih digunakan oleh pengguna.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    public function syncPermissions(Request $request, Role $role)
    {
        if ($role->code === 'SUPERADMIN') {
            return response()->json(['message' => 'Hak akses SUPERADMIN selalu penuh.'], 422);
        }

        $data = $request->validate([
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['uuid', 'exists:permissions,id'],
        ]);

        $role->permissions()->sync($data['permission_ids']);

        return response()->json(['data' => $role->load('permissions')]);
    }
}
