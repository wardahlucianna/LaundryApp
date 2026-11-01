<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = \App\Models\Akses\User::with('role.permissions')
            ->where('username', $credentials['username'])
            ->where('is_active', true)
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['username' => ['Username atau password salah.']]);
        }

        $token = $user->createToken('sunrise-laundry')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'permissions' => $user->role?->permissions->pluck('code')->values() ?? [],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role.permissions');

        return response()->json([
            'user' => $user,
            'permissions' => $user->role?->permissions->pluck('code')->values() ?? [],
        ]);
    }

    public function menus(Request $request)
    {
        $user = $request->user()->load('role.permissions');
        $isSuperAdmin = $user->role?->code === 'SUPERADMIN';
        $allowedCodes = $user->role?->permissions
            ->where('is_active', true)
            ->pluck('code')
            ->all() ?? [];

        $groups = \App\Models\Akses\PermissionGroup::query()
            ->where('is_active', true)
            ->with(['features' => function ($query) {
                $query->where('is_active', true)
                    ->where('menu_type', 'sidebar')
                    ->whereNotNull('path')
                    ->where('path', '<>', '')
                    ->with(['actions' => fn ($actions) => $actions->where('is_active', true)]);
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($group) use ($isSuperAdmin, $allowedCodes) {
                $items = $group->features
                    ->filter(function ($feature) use ($isSuperAdmin, $allowedCodes) {
                        $viewPermission = $feature->actions->first(
                            fn ($action) => strtolower((string) $action->action_name) === 'view'
                        );
                        return $viewPermission && ($isSuperAdmin || in_array($viewPermission->code, $allowedCodes, true));
                    })
                    ->map(fn ($feature) => [
                        'id' => $feature->id,
                        'name' => $feature->name,
                        'code' => $feature->code,
                        'path' => $feature->path,
                    ])
                    ->values();

                return ['id' => $group->id, 'name' => $group->name, 'code' => $group->code, 'items' => $items];
            })
            ->filter(fn ($group) => $group['items']->isNotEmpty())
            ->values();

        return response()->json(['data' => $groups]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }
}