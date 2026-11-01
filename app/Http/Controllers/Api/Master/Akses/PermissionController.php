<?php

namespace App\Http\Controllers\Api\Master\Akses;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query()->with(['feature.group'])->withCount('roles')->orderBy('name');

        if ($search = $request->string('search')->toString()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")
                ->orWhere('code', 'ilike', "%{$search}%")
                ->orWhere('path', 'ilike', "%{$search}%"));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json($query->paginate(min(max($request->integer('per_page', 10), 1), 100)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:80', 'alpha_dash', 'unique:permissions,code'],
            'path' => ['nullable', 'string', 'max:255'],
            'permission_feature_id' => ['nullable', 'uuid', 'exists:permission_features,id'],
            'action_name' => ['nullable', 'string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        return response()->json(['data' => Permission::create($data)], 201);
    }

    public function update(Request $request, Permission $permission)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'code' => ['sometimes', 'required', 'string', 'max:80', 'alpha_dash', Rule::unique('permissions', 'code')->ignore($permission->id)],
            'path' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $permission->update($data);
        return response()->json(['data' => $permission->fresh()]);
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return response()->json(['message' => 'Fitur berhasil dihapus.']);
    }
}
