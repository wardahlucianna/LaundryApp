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
        $data = $request->validated();
        $featureIds = $data['featureIds'] ?? [];
        unset($data['featureIds']);

        $role = DB::transaction(function () use ($data, $featureIds) {
            $role = Role::create($data);

            if (strtoupper(trim($role->name)) !== 'SUPER ADMIN') {
                $role->features()->sync($featureIds);
            }

            return $role->load('features');
        });

        return response()->json(['data' => $role], 201);
    }

    public function featureOptions()
    {
        // Return only fields consumed by the role permission checklist.
        $features = PermissionFeature::query()
            ->select(['featureId', 'groupFeatureId', 'name', 'ordering'])
            ->with(['group' => function ($query) {
                $query->select(['groupFeatureId', 'name', 'ordering']);
            }])
            ->where('isActive', true)
            ->orderBy('ordering')
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $features]);
    }

    public function show(Role $role)
    {
        $usersCount = $role->users()->count();

        // FE detail hanya membutuhkan identitas role, jumlah pengguna,
        // ID fitur yang diberikan, dan ringkasan fitur aktif untuk tampilan.
        $assignedFeatureIds = $role->features()
            ->pluck('features.featureId')
            ->values();

        $availableFeatures = PermissionFeature::query()
            ->select(['featureId', 'groupFeatureId', 'name', 'ordering'])
            ->with(['group' => function ($query) {
                $query->select(['groupFeatureId', 'name', 'ordering']);
            }])
            ->where('isActive', true)
            ->orderBy('ordering')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => [
                'roleId' => $role->roleId,
                'name' => $role->name,
                'isActive' => $role->isActive,
                'users_count' => $usersCount,
                'features' => $assignedFeatureIds->map(fn ($featureId) => [
                    'featureId' => $featureId,
                ]),
                'availableFeatures' => $availableFeatures,
            ],
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $data = $request->validated();
        $featureIds = $data['featureIds'] ?? null;
        unset($data['featureIds']);

        $updatedRole = DB::transaction(function () use ($role, $data, $featureIds) {
            $role->update($data);

            if ($featureIds !== null) {
                if (strtoupper(trim($role->name)) === 'SUPER ADMIN') {
                    throw ValidationException::withMessages(['role' => 'Hak akses SUPER ADMIN selalu penuh.']);
                }

                $role->features()->sync($featureIds);
            }

            return $role->fresh()->load('features');
        });

        return response()->json(['data' => $updatedRole]);
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
