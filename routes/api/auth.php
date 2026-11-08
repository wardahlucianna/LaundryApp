<?php

use App\\Http\\Controllers\\Api\\Auth\\AuthController;
use Illuminate\\Support\\Facades\\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:web')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/me/menus', [AuthController::class, 'menus']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
