<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MapidController;

/*
|--------------------------------------------------------------------------
| API Routes for MAPID Transit Intelligence
|--------------------------------------------------------------------------
*/

// Auth Routes (React FE replacement for Blade)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public WebGIS & Transit Intelligence Routes
Route::get('/map/search', [MapidController::class, 'search']);
Route::get('/stations', [MapidController::class, 'getStations']);
Route::get('/stations/{id}', [MapidController::class, 'getStationProfile']);
Route::get('/route/plan', [MapidController::class, 'planRoute']);

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/community-report', [MapidController::class, 'submitReport']);
});
