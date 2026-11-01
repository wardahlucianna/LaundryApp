<?php

namespace App\Http\Controllers\Api\Master\Akses;

use App\Http\Controllers\Controller;
use App\Models\Akses\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::query()->withCount('permissions')->withCount('users')->orderByRaw(
            "CASE code WHEN 'SUPERADMIN' THEN 0 WHEN 'ADMIN' THEN 1 WHEN 'OWNER' THEN 2 ELSE 3 END"
        )->orderBy('name');

        if ($search = $request->string('search')->toString()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")
                ->orWhere('code', 'ilike', "%{$search}%"));
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
            'code' => ['required', 'string', 'max:50', 'alpha_dash', 'not_in:SUPERADMIN,ADMIN,OWNER', 'unique:roles,code'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $role = Role::create($data);
        return response()->json(['data' => $role], 201);
    }

    public function show(Role $role)
    {
        return response()->json(['data' => $role->load('permissions')]);
    }

    public function update(Request $request, Role $role)
    {
        if (in_array($role->code, ['SUPERADMIN', 'ADMIN', 'OWNER'], true)) {
            throw ValidationException::withMessages(['role' => 'Role bawaan sistem tidak dapat diubah.']);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'code' => ['sometimes', 'required', 'string', 'max:50', 'alpha_dash', 'not_in:SUPERADMIN,ADMIN,OWNER', Rule::unique('roles', 'code')->ignore($role->id)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $role->update($data);
        return response()->json(['data' => $role->fresh()]);
    }

    public function destroy(Role $role)
    {
        if (in_array($role->code, ['SUPERADMIN', 'ADMIN', 'OWNER'], true)) {
            throw ValidationException::withMessages(['role' => 'Role bawaan sistem tidak dapat dihapus.']);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages(['role' => 'Role masih digunakan oleh pengguna.']);
        }

        $role->delete();
        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $data = $request->validate([
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['uuid', 'exists:permissions,id'],
        ]);

        if ($role->code === 'SUPERADMIN') {
            throw ValidationException::withMessages([
                'role' => 'Hak akses SUPERADMIN selalu penuh dan tidak dapat diubah.',
            ]);
        }

        DB::transaction(fn () => $role->permissions()->sync($data['permission_ids']));
        return response()->json(['data' => $role->load('permissions')]);
    }
}
