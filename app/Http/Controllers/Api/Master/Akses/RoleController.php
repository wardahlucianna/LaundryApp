<?php

namespace App\Http\Controllers\Api\Master\Akses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Akses\StoreRoleRequest;
use App\Http\Requests\Master\Akses\UpdateRoleRequest;
use App\Models\Role;
use App\Services\Master\Akses\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(private readonly RoleService $roleService)
    {
    }

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
        return response()->json(['data' => $this->roleService->create($request->validated())], 201);
    }

    public function show(Role $role)
    {
        return response()->json(['data' => $role->load('permissions')]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        return response()->json(['data' => $this->roleService->update($role, $request->validated())]);
    }

    public function destroy(Role $role)
    {
        $this->roleService->delete($role);

        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $data = $request->validate([
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['uuid', 'exists:permissions,id'],
        ]);

        return response()->json([
            'data' => $this->roleService->syncPermissions($role, $data['permission_ids']),
        ]);
    }
}
