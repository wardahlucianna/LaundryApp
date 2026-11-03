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
        $query = Role::query()->withCount('features')->orderBy('name');
        if ($search = $request->string('search')->toString()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%"));
        }
        if ($request->has('is_active')) $query->where('is_active', $request->boolean('is_active'));
        return response()->json($query->paginate(min(max($request->integer('per_page', 10), 1), 100)));
    }

    public function store(StoreRoleRequest $request)
    {
        return response()->json(['data' => Role::create($request->validated())], 201);
    }

    public function featureOptions()
    {
        $features = PermissionFeature::query()
            ->with('group')
            ->where('is_active', true)
            ->orderBy('ordering')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $features]);
    }

    public function show(Role $role)
    {
        return response()->json(['data' => $role->load('features.group')->loadCount('users')]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update($request->validated());
        return response()->json(['data' => $role->fresh()]);
    }

    public function destroy(Role $role)
    {
        if (strtoupper(trim($role->name)) === 'SUPER ADMIN') throw ValidationException::withMessages(['role' => 'Role SUPERADMIN tidak dapat dihapus.']);
        if ($role->users()->exists()) throw ValidationException::withMessages(['role' => 'Role masih digunakan oleh pengguna.']);
        $role->delete();
        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    public function syncFeatures(Request $request, Role $role)
    {
        $data = $request->validate([
            'feature_ids' => ['present', 'array'],
            'feature_ids.*' => ['uuid', 'exists:permission_features,id'],
        ]);
        if (strtoupper(trim($role->name)) === 'SUPER ADMIN') throw ValidationException::withMessages(['role' => 'Hak akses SUPERADMIN selalu penuh.']);
        DB::transaction(fn () => $role->features()->sync($data['feature_ids']));
        return response()->json(['data' => $role->load('features')]);
    }
}
