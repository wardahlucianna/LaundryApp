<?php

namespace App\Http\Controllers\Api\Master\Akses;

use App\Http\Controllers\Controller;
use App\Models\Akses\PermissionGroup;
use Illuminate\Http\Request;

class PermissionGroupController extends Controller
{
    public function index()
    {
        return response()->json(PermissionGroup::query()->withCount('features')->orderBy('ordering')->orderBy('name')->paginate(100));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'icon' => ['required', 'string', 'max:80'],
            'ordering' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        return response()->json(['data' => PermissionGroup::create($data)], 201);
    }

    public function update(Request $request, PermissionGroup $permissionGroup)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'icon' => ['sometimes', 'required', 'string', 'max:80'],
            'ordering' => ['sometimes', 'required', 'integer', 'min:1'],
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
