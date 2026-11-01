<?php

namespace App\Http\Controllers\Api\Master\Akses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Akses\Role\StoreRoleRequest;
use App\Http\Requests\Master\Akses\Role\UpdateRoleRequest;
use App\Models\Akses\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        $role = Role::create($request->validated());

        return response()->json(['data' => $role], 201);
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
                'role' => 'Hak akses SUPERADMIN selalu penuh.',
            ]);
        }

        DB::transaction(fn () => $role->permissions()->sync($data['permission_ids']));

        return response()->json([
            'data' => $role->load('permissions'),
        ]);
    }
}
