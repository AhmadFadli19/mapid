<?php

use Illuminate\Support\Facades\Route;

// Serve React WebGIS App Single Page Application (SPA)
Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
})->name('home');

Route::get('/app/{any?}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');

// Keep client-side routes loadable on a hard refresh without swallowing API errors.
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api(?:/|$)|sanctum(?:/|$)).*');
