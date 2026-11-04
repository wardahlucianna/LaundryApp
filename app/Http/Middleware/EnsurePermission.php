<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Access\PermissionFeature;

class EnsurePermission
{
    /**
     * Route permission labels are legacy action codes. Access is now granted
     * through role_permission_features, so map those labels to their feature.
     */
    private function featureNamesFor(string $permissionCode): ?array
    {
        return match (strtoupper($permissionCode)) {
            'FEATURE_VIEW', 'FEATURE_CREATE', 'FEATURE_UPDATE', 'FEATURE_DELETE' => ['Manajemen Fitur'],
            'ROLE_VIEW', 'ROLE_MANAGE', 'ACCESS_MANAGE' => ['Management Role', 'Manajemen Role', 'Manajemen Peran'],
            default => null,
        };
    }

    public function handle(Request $request, Closure $next, string $permissionCode): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->loadMissing('role.features');

        if (strtoupper(trim((string) $user->role?->name)) === 'SUPER ADMIN') {
            return $next($request);
        }

        $featureNames = $this->featureNamesFor($permissionCode);
        $feature = $featureNames
            ? PermissionFeature::query()
                ->whereIn('name', $featureNames)
                ->where('is_active', true)
                ->first()
            : null;

        $allowed = $feature && $user->role?->features
            ->contains(fn ($assigned) => $assigned->id === $feature->id && $assigned->is_active);

        if (!$allowed) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses untuk fitur ini.'], 403);
        }

        return $next($request);
    }
}
