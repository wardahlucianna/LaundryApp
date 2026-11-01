<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Akses\PermissionFeature;
use App\Models\Akses\User;
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

        $user = User::with('role.permissions')
            ->where('username', $credentials['username'])
            ->where('is_active', true)
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['username' => ['Username atau password salah.']]);
        }

        $token = $user->createToken('sunrise-laundry')->plainTextToken;

        return response()->json($this->authPayload($user, $token));
    }

    public function me(Request $request)
    {
        return response()->json($this->authPayload($request->user()->load('role.permissions')));
    }

    public function menus(Request $request)
    {
        $user = $request->user()->loadMissing('role.permissions');
        $permissionCodes = $user->role?->permissions
            ->where('is_active', true)->pluck('code')->all() ?? [];

        $features = PermissionFeature::query()
            ->with(['group', 'actions' => fn ($query) => $query->where('is_active', true)])
            ->where('is_active', true)
            ->whereHas('actions', function ($query) use ($user, $permissionCodes) {
                $query->where('action_name', 'view');
                if ($user->role?->code !== 'SUPERADMIN') {
                    $query->whereIn('code', $permissionCodes);
                }
            })
            ->get()
            ->sortBy(fn ($feature) => [$feature->group?->name, $feature->name])
            ->values();

        return response()->json([
            'data' => $features->map(fn ($feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'code' => $feature->code,
                'path' => $feature->path,
                'group' => $feature->group?->name,
                'permissions' => $feature->actions->mapWithKeys(fn ($action) => [
                    $action->action_name => $user->role?->code === 'SUPERADMIN'
                        || in_array($action->code, $permissionCodes, true),
                ]),
            ])->values(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Berhasil keluar.']);
    }

    private function authPayload(User $user, ?string $token = null): array
    {
        $permissions = $user->role?->permissions
            ->where('is_active', true)->pluck('code')->values() ?? collect();

        return array_filter([
            'token' => $token,
            'user' => $user->loadMissing('role'),
            'permissions' => $user->role?->code === 'SUPERADMIN' ? ['*'] : $permissions,
        ], fn ($value) => $value !== null);
    }
}
