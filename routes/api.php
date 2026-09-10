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
Route::get('/community-reports', [MapidController::class, 'getCommunityReports']);
Route::post('/community-report', [MapidController::class, 'submitReport']);
Route::post('/community-reports/{id}/verify', [MapidController::class, 'verifyCommunityReport']);

// v1 API Route Group matching specification
Route::prefix('v1')->group(function () {
    Route::get('/stations', [MapidController::class, 'getStationsGeoJson']);
    Route::get('/stations/{id}', [MapidController::class, 'getStationProfile']);
    Route::get('/stations/{id}/routes', [MapidController::class, 'getStationRoutes']);
    Route::get('/routes/geojson', [MapidController::class, 'getRoutesGeoJson']);
    Route::match(['get', 'post'], '/route/plan', [MapidController::class, 'planRoute']);
    Route::get('/community-reports', [MapidController::class, 'getCommunityReports']);
    Route::post('/community-report', [MapidController::class, 'submitReport']);
    Route::post('/community-reports/{id}/verify', [MapidController::class, 'verifyCommunityReport']);

    // Gemini AI Transit Intelligence Assistant & Autonomous Enrichment
    Route::post('/ai/assistant', [MapidController::class, 'askGeminiAi']);
    Route::get('/ai/assistant', [MapidController::class, 'askGeminiAi']);
    Route::post('/ai/enrich-station/{id}', [MapidController::class, 'enrichStationAi']);

    // MAPID GeoServer Layers (Halte & Stasiun Jakarta Timur 2025)
    Route::get('/geoserver/layers', [MapidController::class, 'getGeoServerLayers']);

    // Facility Finder (Spatial POI Query)
    Route::get('/facilities/search', [MapidController::class, 'getFacilityFinder']);

    // MAPID Apps Data Integration: Menu Go & Struk Go
    Route::get('/stations/{id}/menu-go', [MapidController::class, 'getMenuGo']);
    Route::post('/stations/{id}/menu-go/refresh', [MapidController::class, 'refreshStationMenuGo']);
    Route::get('/menu-go', [MapidController::class, 'getMenuGo']);
    Route::get('/struk-go', [MapidController::class, 'getStrukGo']);
    Route::get('/stations/{id}/struk-go', [MapidController::class, 'getStrukGo']);

    // Direct MAPID API Integration (API Key: f776ee857d4c465fa98a38bd44b5ff8d)
    Route::prefix('mapid')->group(function () {
        Route::get('/live-stations', [MapidController::class, 'getLiveStations']);
        Route::get('/live-stops', [MapidController::class, 'getLiveStops']);
        Route::get('/station-context/{id}', [MapidController::class, 'getStationMapidContext']);
        Route::get('/menugo', [MapidController::class, 'getMapidMenuGo']);
        Route::get('/activities', [MapidController::class, 'getMapidActivities']);
    });
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
