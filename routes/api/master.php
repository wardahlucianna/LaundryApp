<?php

use App\\Http\\Controllers\\Api\\Master\\Akses\\PermissionController;
use App\\Http\\Controllers\\Api\\Master\\Akses\\PermissionFeatureController;
use App\\Http\\Controllers\\Api\\Master\\Akses\\PermissionGroupController;
use App\\Http\\Controllers\\Api\\Master\\Akses\\RoleController;
use Illuminate\\Support\\Facades\\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:ROLE_VIEW');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:ROLE_CREATE');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:ROLE_VIEW');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:ROLE_UPDATE');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:ROLE_DELETE');
    Route::put('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->middleware('permission:ACCESS_MANAGE');

    Route::get('/permission-groups', [PermissionGroupController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permission-groups', [PermissionGroupController::class, 'store'])->middleware('permission:FEATURE_CREATE');
    Route::put('/permission-groups/{permissionGroup}', [PermissionGroupController::class, 'update'])->middleware('permission:FEATURE_UPDATE');
    Route::delete('/permission-groups/{permissionGroup}', [PermissionGroupController::class, 'destroy'])->middleware('permission:FEATURE_DELETE');

    Route::get('/permission-features', [PermissionFeatureController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permission-features', [PermissionFeatureController::class, 'store'])->middleware('permission:FEATURE_CREATE');
    Route::put('/permission-features/{permissionFeature}', [PermissionFeatureController::class, 'update'])->middleware('permission:FEATURE_UPDATE');
    Route::delete('/permission-features/{permissionFeature}', [PermissionFeatureController::class, 'destroy'])->middleware('permission:FEATURE_DELETE');

    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:FEATURE_CREATE');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:FEATURE_UPDATE');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:FEATURE_DELETE');
});
