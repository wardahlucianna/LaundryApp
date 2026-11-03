<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Akses\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function featureCodes(?User $user): array
    {
        if (!$user?->role) return [];
        if ($user->role->code === 'SUPERADMIN') {
            return \App\Models\Akses\PermissionFeature::where('is_active', true)->pluck('code')->all();
        }
        return $user->role->features->where('is_active', true)->pluck('code')->values()->all();
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('username', $credentials['username'])->where('is_active', true)->first();
        if (!$user || !\Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['username' => ['Username atau password salah.']]);
        }

        Auth::login($user);
        $request->session()->regenerate();
        $user->load('role.features');

        return response()->json(['user' => $user, 'features' => $this->featureCodes($user)]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role.features');
        return response()->json(['user' => $user, 'features' => $this->featureCodes($user)]);
    }

    public function menus(Request $request)
    {
        $user = $request->user()->load('role.features');
        $allowedCodes = $this->featureCodes($user);

        $groups = \App\Models\Akses\PermissionGroup::query()
            ->where('is_active', true)
            ->with(['features' => fn ($query) => $query->where('is_active', true)
                ->where('menu_type', 'sidebar')->whereNotNull('path')->where('path', '<>','')])
            ->orderBy('name')->get()
            ->map(function ($group) use ($allowedCodes) {
                $items = $group->features->filter(fn ($feature) => in_array($feature->code, $allowedCodes, true))
                    ->map(fn ($feature) => ['id' => $feature->id, 'name' => $feature->name, 'code' => $feature->code, 'path' => $feature->path])->values();
                return ['id' => $group->id, 'name' => $group->name, 'code' => $group->code, 'items' => $items];
            })->filter(fn ($group) => $group['items']->isNotEmpty())->values();

        return response()->json(['data' => $groups]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Berhasil keluar.']);
    }
}
