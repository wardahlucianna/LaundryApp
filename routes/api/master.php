<?php

use App\Http\Controllers\Api\Master\Access\PermissionController;
use App\Http\Controllers\Api\Master\Access\PermissionFeatureController;
use App\Http\Controllers\Api\Master\Access\PermissionGroupController;
use App\Http\Controllers\Api\Master\Access\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:web')->group(function () {
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:ROLE_VIEW');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:ROLE_MANAGE');
    Route::get('/roles/features/options', [RoleController::class, 'featureOptions'])->middleware('permission:ROLE_VIEW');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:ROLE_VIEW');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:ROLE_MANAGE');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:ROLE_MANAGE');
    Route::put('/roles/{role}/features', [RoleController::class, 'syncFeatures'])->middleware('permission:ACCESS_MANAGE');

    Route::get('/permission-groups/options', [PermissionGroupController::class, 'options'])->middleware('permission:FEATURE_VIEW');
    Route::get('/permission-groups', [PermissionGroupController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::get('/permission-groups/{permissionGroup}', [PermissionGroupController::class, 'show'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permission-groups', [PermissionGroupController::class, 'store'])->middleware('permission:FEATURE_CREATE');
    Route::put('/permission-groups/{permissionGroup}', [PermissionGroupController::class, 'update'])->middleware('permission:FEATURE_UPDATE');
    Route::delete('/permission-groups/{permissionGroup}', [PermissionGroupController::class, 'destroy'])->middleware('permission:FEATURE_DELETE');

    Route::get('/permission-features', [PermissionFeatureController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::get('/permission-features/{permissionFeature}', [PermissionFeatureController::class, 'show'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permission-features', [PermissionFeatureController::class, 'store'])->middleware('permission:FEATURE_CREATE');
    Route::put('/permission-features/{permissionFeature}', [PermissionFeatureController::class, 'update'])->middleware('permission:FEATURE_UPDATE');
    Route::delete('/permission-features/{permissionFeature}', [PermissionFeatureController::class, 'destroy'])->middleware('permission:FEATURE_DELETE');

    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:FEATURE_CREATE');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:FEATURE_UPDATE');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:FEATURE_DELETE');
});
