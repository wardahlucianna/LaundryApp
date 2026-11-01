<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'success' => true,
    'application' => 'Sunrise Laundry',
    'message' => 'API is running.',
]));
