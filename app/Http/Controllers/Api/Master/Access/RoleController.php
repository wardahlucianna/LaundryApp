<?php

namespace App\Http\Controllers\Api\Master\Access;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\Access\Role\StoreRoleRequest;
use App\Http\Requests\Master\Access\Role\UpdateRoleRequest;
use App\Models\Access\PermissionFeature;
use App\Models\Access\Role;
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
        if ($request->has('isActive')) $query->where('isActive', $request->boolean('isActive'));
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
            ->where('isActive', true)
            ->orderBy('ordering')
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $features]);
    }

    public function show(Role $role)
    {
        $role->load('features.group')->loadCount('users');

        $availableFeatures = PermissionFeature::query()
            ->with('group')
            ->where('isActive', true)
            ->orderBy('ordering')
            ->orderBy('name')
            ->get();

        $role->setAttribute('availableFeatures', $availableFeatures);

        return response()->json(['data' => $role]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update($request->validated());
        return response()->json(['data' => $role->fresh()]);
    }

    public function destroy(Role $role)
    {
        DB::transaction(function () use ($role) {
            $role = Role::query()->whereKey($role->getKey())->lockForUpdate()->firstOrFail();
            if (strtoupper(trim($role->name)) === 'SUPER ADMIN') {
                throw ValidationException::withMessages(['role' => 'Peran SUPER ADMIN tidak dapat dihapus.']);
            }
            if ($role->users()->exists()) {
                throw ValidationException::withMessages(['role' => 'Peran masih digunakan oleh pengguna. Lepaskan peran dari seluruh pengguna terlebih dahulu.']);
            }
            if ($role->features()->exists()) {
                throw ValidationException::withMessages(['role' => 'Peran masih memiliki hak akses fitur. Hapus seluruh hak akses fitur terlebih dahulu.']);
            }
            $role->delete();
        });
        return response()->json(['message' => 'Peran berhasil dihapus.']);
    }

    public function syncFeatures(Request $request, Role $role)
    {
        $data = $request->validate([
            'featureIds' => ['present', 'array'],
            'featureIds.*' => ['uuid', 'exists:features,featureId'],
        ]);
        if (strtoupper(trim($role->name)) === 'SUPER ADMIN') {
            throw ValidationException::withMessages(['role' => 'Hak akses SUPERADMIN selalu penuh.']);
        }
        DB::transaction(fn () => $role->features()->sync($data['featureIds']));
        return response()->json(['data' => $role->load('features')]);
    }
}
