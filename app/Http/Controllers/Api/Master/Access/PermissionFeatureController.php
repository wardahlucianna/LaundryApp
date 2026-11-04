<?php

namespace App\Http\Controllers\Api\Master\Access;

use App\Http\Controllers\Controller;
use App\Models\Access\PermissionFeature;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PermissionFeatureController extends Controller
{
    public function index(Request $request)
    {
        $query = PermissionFeature::query()->with('group')->withCount('roles')->orderBy('ordering')->orderBy('name');
        if ($search = $request->string('search')->toString()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")
                ->orWhereHas('group', fn ($g) => $g->where('name', 'ilike', "%{$search}%")));
        }
        if ($request->filled('groupFeatureId')) {
            $query->where('groupFeatureId', $request->input('groupFeatureId'));
        }
        if ($request->has('isActive')) $query->where('isActive', $request->boolean('isActive'));
        return response()->json($query->paginate(min(max($request->integer('per_page', 100), 1), 100)));
    }

    public function show(PermissionFeature $permissionFeature)
    {
        return response()->json(['data' => $permissionFeature->load('group')]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'groupFeatureId' => ['required', 'uuid', 'exists:groupFeature,groupFeatureId'],
            'name' => ['required', 'string', 'max:120'],
            'path' => ['nullable', 'string', 'max:255'],
            'ordering' => ['required', 'integer', 'min:0'],
            'menuType' => ['required', Rule::in(['sidebar', 'topbar'])],
            'isActive' => ['sometimes', 'boolean'],
        ]);
        return response()->json(['data' => PermissionFeature::create($data)], 201);
    }

    public function update(Request $request, PermissionFeature $permissionFeature)
    {
        $data = $request->validate([
            'groupFeatureId' => ['sometimes', 'required', 'uuid', 'exists:groupFeature,groupFeatureId'],
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'path' => ['nullable', 'string', 'max:255'],
            'ordering' => ['sometimes', 'required', 'integer', 'min:0'],
            'menuType' => ['sometimes', 'required', Rule::in(['sidebar', 'topbar'])],
            'isActive' => ['sometimes', 'boolean'],
        ]);
        $permissionFeature->update($data);
        return response()->json(['data' => $permissionFeature->fresh('group')]);
    }

    public function destroy(PermissionFeature $permissionFeature)
    {
        $roleCount = $permissionFeature->roles()->count();
        if ($roleCount > 0) {
            return response()->json([
                'message' => "Fitur tidak dapat dihapus karena masih terhubung dengan {$roleCount} role permission. Lepaskan relasi fitur dari role terlebih dahulu.",
                'related_roles_count' => $roleCount,
            ], 409);
        }
        $permissionFeature->delete();
        return response()->json(['message' => 'Fitur berhasil dihapus.']);
    }
}
