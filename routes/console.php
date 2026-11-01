<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('laundry:about', function () {
    $this->comment('Sunrise Laundry application is ready for development.');
})->purpose('Display Sunrise Laundry application information');
