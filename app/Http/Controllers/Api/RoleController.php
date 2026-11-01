<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:60', 'alpha_dash', 'unique:roles,code'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        return response()->json(['data' => Role::create($data)], 201);
    }

    public function show(Role $role)
    {
        return response()->json(['data' => $role->load('permissions')]);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'code' => ['sometimes', 'required', 'string', 'max:60', 'alpha_dash', Rule::unique('roles', 'code')->ignore($role->id)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $role->update($data);
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
