<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'success' => true,
    'application' => 'Sunrise Laundry',
    'message' => 'API is running.',
]));

require __DIR__.'/api/auth.php';
require __DIR__.'/api/master.php';
