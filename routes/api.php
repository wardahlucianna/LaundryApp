<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'success' => true,
    'application' => 'Sunrise Laundry',
    'message' => 'API is running.',
]));

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:ROLE_VIEW');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:ROLE_MANAGE');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:ROLE_VIEW');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:ROLE_MANAGE');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:ROLE_MANAGE');
    Route::put('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->middleware('permission:ACCESS_MANAGE');

    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:FEATURE_VIEW');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:FEATURE_MANAGE');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:FEATURE_MANAGE');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:FEATURE_MANAGE');
});
