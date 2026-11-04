<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Access\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $user = $request->user();

        // Read the access pivot explicitly to avoid Eloquent relation/key mismatch
        // after the camelCase primary/foreign-key migrations.
        $menuRows = DB::table('roleFeatures')
            ->join('features', 'features.featureId', '=', 'roleFeatures.featureId')
            ->join('groupFeature', 'groupFeature.groupFeatureId', '=', 'features.groupFeatureId')
            ->where('roleFeatures.roleId', $user->roleId)
            ->where('features.isActive', true)
            ->where('groupFeature.isActive', true)
            ->where('features.menuType', 'sidebar')
            ->whereNotNull('features.path')
            ->where('features.path', '<>', '')
            ->orderBy('groupFeature.ordering')
            ->orderBy('groupFeature.name')
            ->orderBy('features.ordering')
            ->orderBy('features.name')
            ->select([
                'groupFeature.groupFeatureId as groupId',
                'groupFeature.name as groupName',
                'groupFeature.icon as groupIcon',
                'features.featureId as featureId',
                'features.name as featureName',
                'features.path as featurePath',
            ])
            ->get();

        $groups = $menuRows
            ->groupBy('groupId')
            ->map(fn ($items) => [
                'id' => $items->first()->groupId,
                'name' => $items->first()->groupName,
                'icon' => $items->first()->groupIcon,
                'items' => $items->map(fn ($item) => [
                    'id' => $item->featureId,
                    'name' => $item->featureName,
                    'path' => $item->featurePath,
                ])->values(),
            ])
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
