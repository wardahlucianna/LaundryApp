<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permissionCode): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->loadMissing('role.permissions');

        if ($user->role?->code === 'OWNER') {
            return $next($request);
        }

        $allowed = $user->role?->permissions
            ->contains(fn ($permission) => $permission->code === $permissionCode && $permission->is_active);

        if (!$allowed) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses untuk tindakan ini.'], 403);
        }

        return $next($request);
    }
}
