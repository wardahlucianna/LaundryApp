<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Access\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function featureIds(?User $user): array
    {
        if (!$user?->role) return [];
        return $user->role->features->where('isActive', true)->pluck('featureId')->values()->all();
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);
        $user = User::where('username', $credentials['username'])->where('isActive', true)->first();
        if (!$user || !\Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['username' => ['Username atau password salah.']]);
        }
        Auth::login($user);
        $request->session()->regenerate();
        $user->load('role.features');
        return response()->json(['user' => $user, 'features' => $this->featureIds($user)]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role.features');
        return response()->json(['user' => $user, 'features' => $this->featureIds($user)]);
    }

    public function menus(Request $request)
    {
        $user = $request->user()->load('role.features');
        $allowedFeatureIds = $this->featureIds($user);
        $groups = \App\Models\Access\PermissionGroup::query()
            ->where('isActive', true)
            ->with(['features' => fn ($query) => $query
                ->where('isActive', true)
                ->where('menuType', 'sidebar')
                ->whereNotNull('path')
                ->where('path', '<>', '')
                ->orderBy('ordering')])
            ->orderBy('ordering')
            ->orderBy('name')
            ->get()
            ->map(function ($group) use ($allowedFeatureIds) {
                $items = $group->features
                    ->filter(fn ($feature) => in_array($feature->featureId, $allowedFeatureIds, true))
                    ->map(fn ($feature) => ['id' => $feature->featureId, 'name' => $feature->name, 'path' => $feature->path])
                    ->values();
                return ['id' => $group->groupFeatureId, 'name' => $group->name, 'icon' => $group->icon, 'items' => $items];
            })
            ->filter(fn ($group) => $group['items']->isNotEmpty())
            ->values();
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
