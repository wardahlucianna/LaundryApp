<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Akses\PermissionFeature;

class EnsurePermission
{
    /**
     * Route permission labels are legacy action codes. Access is now granted
     * through role_permission_features, so map those labels to their feature.
     */
    private function featureNameFor(string $permissionCode): ?string
    {
        return match (strtoupper($permissionCode)) {
            'FEATURE_VIEW', 'FEATURE_CREATE', 'FEATURE_UPDATE', 'FEATURE_DELETE' => 'Manajemen Fitur',
            'ROLE_VIEW', 'ROLE_MANAGE' => 'Manajemen Role',
            'ACCESS_MANAGE' => 'Hak Akses',
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

        $featureName = $this->featureNameFor($permissionCode);
        $feature = $featureName
            ? PermissionFeature::query()
                ->where('name', $featureName)
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
