<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MapidController;

/*
|--------------------------------------------------------------------------
| API Routes for PanduYuk Transit Intelligence & TransJakarta BRT
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public WebGIS & Transit Intelligence Routes
Route::get('/map/search', [MapidController::class, 'search']);
Route::get('/stations', [MapidController::class, 'getStations']);
Route::get('/stations/{id}', [MapidController::class, 'getStationProfile']);
Route::get('/stations/{id}/routes', [MapidController::class, 'getStationRoutes']);

// Route Planning & Transit Intelligence
Route::match(['get', 'post'], '/route/plan', [MapidController::class, 'planRoute']);

// GeoJSON Feeds for MAPID MAPS
Route::get('/transit/stations-geojson', [MapidController::class, 'getStationsGeoJson']);
Route::get('/transit/routes-geojson', [MapidController::class, 'getRoutesGeoJson']);

// Protected & Public Community Reports
Route::post('/community-report', [MapidController::class, 'submitReport']);

// v1 API Route Group matching specification
Route::prefix('v1')->group(function () {
    Route::get('/stations', [MapidController::class, 'getStationsGeoJson']);
    Route::get('/stations/{id}', [MapidController::class, 'getStationProfile']);
    Route::get('/stations/{id}/routes', [MapidController::class, 'getStationRoutes']);
    Route::get('/routes/geojson', [MapidController::class, 'getRoutesGeoJson']);
    Route::match(['get', 'post'], '/route/plan', [MapidController::class, 'planRoute']);
    Route::post('/community-report', [MapidController::class, 'submitReport']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
