<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Access\PermissionFeature;

class EnsurePermission
{
    /**
     * Legacy API permission labels map to feature menu names.
     * A role must still have one of the matching active features assigned.
     */
    private function featureNamesFor(string $permissionCode): ?array
    {
        return match (strtoupper(trim($permissionCode))) {
            'FEATURE_VIEW', 'FEATURE_CREATE', 'FEATURE_UPDATE', 'FEATURE_DELETE' => [
                'Manajemen Fitur',
                'Management Fitur',
                'Manajemen Feature',
                'Management Feature',
                'Fitur',
                'Feature',
                'Features',
            ],
            'ROLE_VIEW', 'ROLE_MANAGE', 'ACCESS_MANAGE' => [
                'Management Role',
                'Manajemen Role',
                'Manajemen Peran',
            ],
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
        $matchingFeatures = $featureNames
            ? PermissionFeature::query()
                ->whereIn('name', $featureNames)
                ->where('isActive', true)
                ->get()
            : collect();

        $assignedFeatures = $user->role?->features ?? collect();
        $allowed = $matchingFeatures->isNotEmpty() && $matchingFeatures->contains(
            fn ($feature) => $assignedFeatures->contains(
                fn ($assigned) => (string) $assigned->featureId === (string) $feature->featureId
                    && $assigned->isActive
            )
        );

        if (!$allowed) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses untuk fitur ini.'], 403);
        }

        return $next($request);
    }
}
