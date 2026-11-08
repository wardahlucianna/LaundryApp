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

        $normalizedCode = strtoupper(trim($permissionCode));
        $featureNames = $this->featureNamesFor($permissionCode);
        $featurePaths = match ($normalizedCode) {
            'ROLE_VIEW', 'ROLE_MANAGE', 'ACCESS_MANAGE' => ['/roles', '/role', '/management-role', '/manajemen-role', '/peran'],
            'FEATURE_VIEW', 'FEATURE_CREATE', 'FEATURE_UPDATE', 'FEATURE_DELETE' => ['/feature', '/features', '/permission-features'],
            default => [],
        };

        // Resolve access using both canonical menu paths and legacy labels,
        // so changing a feature's display name does not silently break authorization.
        $matchingFeatures = PermissionFeature::query()
            ->where('isActive', true)
            ->where(function ($query) use ($featureNames, $featurePaths) {
                if (!empty($featureNames)) {
                    $query->whereIn('name', $featureNames);
                }
                if (!empty($featurePaths)) {
                    if (!empty($featureNames)) {
                        $query->orWhereIn('path', $featurePaths);
                    } else {
                        $query->whereIn('path', $featurePaths);
                    }
                }
            })
            ->get();

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
