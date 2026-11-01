<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');

Route::view('/{page}', 'app')
    ->where('page', 'home|roles|permissions|access');
