<?php

namespace App\Http\Middleware;

use App\Models\Akses\Permission;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permissionCode): Response
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);
        $user->loadMissing('role.features');
        if ($user->role?->code === 'SUPERADMIN') return $next($request);

        // Route middleware continues to express action-level policy, while role assignment
        // is feature-level: any action code maps to its owning feature.
        $feature = Permission::where('code', $permissionCode)->with('feature')->first()?->feature;
        $allowed = $feature && $feature->is_active && $user->role?->features
            ->contains(fn ($assigned) => $assigned->id === $feature->id && $assigned->is_active);

        if (!$allowed) return response()->json(['message' => 'Anda tidak memiliki hak akses untuk fitur ini.'], 403);
        return $next($request);
    }
}
