<?php

namespace App\Http\Controllers\Api\Master\Access;

use App\Http\Controllers\Controller;
use App\Models\Access\PermissionGroup;
use Illuminate\Http\Request;

class PermissionGroupController extends Controller
{
    public function index(Request $request)
    {
        // Field yang digunakan tabel FE: ID untuk aksi, ikon, nama,
        // urutan, status, dan jumlah fitur. Kolom lainnya tidak dikirim.
        $paginator = PermissionGroup::query()
            ->select(['groupFeatureId', 'icon', 'name', 'ordering', 'isActive'])
            ->withCount('features')
            ->orderBy('ordering')
            ->orderBy('name')
            ->paginate(min(max($request->integer('per_page', 100), 1), 100));

        $paginator->setCollection(
            $paginator->getCollection()->map(fn (PermissionGroup $group) => [
                'groupFeatureId' => $group->groupFeatureId,
                'icon' => $group->icon,
                'name' => $group->name,
                'ordering' => $group->ordering,
                'isActive' => $group->isActive,
                'features_count' => $group->features_count,
            ])
        );

        return response()->json($paginator);
    }

    public function options(Request $request)
    {
        $selectedId = $request->query('selectedId');

        $groups = PermissionGroup::query()
            ->select('groupFeatureId', 'name', 'isActive', 'ordering')
            ->where(function ($query) use ($selectedId) {
                $query->where('isActive', true);
                if ($selectedId) {
                    $query->orWhere('groupFeatureId', $selectedId);
                }
            })
            ->orderBy('ordering')
            ->orderBy('name')
            ->get()
            ->map(fn (PermissionGroup $group) => [
                'groupFeatureId' => $group->groupFeatureId,
                'name' => $group->name,
                'isActive' => $group->isActive,
            ]);

        return response()->json(['data' => $groups]);
    }

    public function show(PermissionGroup $permissionGroup)
    {
        $group = $permissionGroup->fresh();

        // Only fields needed to populate the edit group form.
        return response()->json([
            'data' => [
                'groupFeatureId' => $group->groupFeatureId,
                'name' => $group->name,
                'icon' => $group->icon,
                'ordering' => $group->ordering,
                'isActive' => $group->isActive,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'icon' => ['required', 'string', 'max:80'],
            'ordering' => ['required', 'integer', 'min:1'],
            'isActive' => ['sometimes', 'boolean'],
        ]);
        return response()->json(['data' => PermissionGroup::create($data)], 201);
    }

    public function update(Request $request, PermissionGroup $permissionGroup)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'icon' => ['sometimes', 'required', 'string', 'max:80'],
            'ordering' => ['sometimes', 'required', 'integer', 'min:1'],
            'isActive' => ['sometimes', 'boolean'],
        ]);
        $permissionGroup->update($data);
        return response()->json(['data' => $permissionGroup->fresh()]);
    }

    public function destroy(PermissionGroup $permissionGroup)
    {
        if ($permissionGroup->features()->exists()) {
            return response()->json(['message' => 'Kelompok masih memiliki fitur. Pindahkan atau hapus fiturnya terlebih dahulu.'], 422);
        }
        $permissionGroup->delete();
        return response()->json(['message' => 'Kelompok fitur berhasil dihapus.']);
    }
}
