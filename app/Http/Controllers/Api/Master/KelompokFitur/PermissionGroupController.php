<?php

namespace App\Http\Controllers\Api\Master\KelompokFitur;

use App\Http\Controllers\Controller;
use App\Models\PermissionGroup;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PermissionGroupController extends Controller
{
    public function index()
    {
        return response()->json(PermissionGroup::query()->withCount('features')->orderBy('name')->paginate(100));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:80', 'alpha_dash', 'unique:permission_groups,code'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        return response()->json(['data' => PermissionGroup::create($data)], 201);
    }

    public function update(Request $request, PermissionGroup $permissionGroup)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'code' => ['sometimes', 'required', 'string', 'max:80', 'alpha_dash', Rule::unique('permission_groups', 'code')->ignore($permissionGroup->id)],
            'is_active' => ['sometimes', 'boolean'],
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
