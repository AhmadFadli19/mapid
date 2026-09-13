<?php

use Illuminate\Support\Facades\Route;

// Serve React WebGIS App Single Page Application (SPA)
Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
})->name('home');

Route::get('/app/{any?}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');

// Secure Hosting Helper Endpoints (useful for shared hosting without terminal/SSH)
Route::prefix('system')->group(function () {
    Route::get('/maintenance', function (\Illuminate\Http\Request $request) {
        $allowedKey = env('ARTISAN_MAINTENANCE_KEY');
        $appKey = config('app.key');
        $providedKey = $request->query('key');

        $isValid = false;
        if (!empty($allowedKey) && hash_equals($allowedKey, (string)$providedKey)) {
            $isValid = true;
        } elseif (!empty($appKey) && hash_equals(substr(hash('sha256', $appKey), 0, 16), (string)$providedKey)) {
            $isValid = true;
        }

        if (!$isValid) {
            abort(403, 'Unauthorized maintenance key. Pastikan parameter ?key= sesuai dengan ARTISAN_MAINTENANCE_KEY di file .env.');
        }

        $action = $request->query('action', 'help');
        $output = '';

        try {
            switch ($action) {
                case 'storage-link':
                    \Illuminate\Support\Facades\Artisan::call('storage:link');
                    $output = \Illuminate\Support\Facades\Artisan::output();
                    break;
                case 'optimize-clear':
                    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
                    $output = \Illuminate\Support\Facades\Artisan::output();
                    break;
                case 'optimize':
                    \Illuminate\Support\Facades\Artisan::call('optimize');
                    $output = \Illuminate\Support\Facades\Artisan::output();
                    break;
                case 'migrate':
                    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                    $output = \Illuminate\Support\Facades\Artisan::output();
                    break;
                default:
                    return response()->json([
                        'status' => 'ready',
                        'message' => 'Gunakan query parameter ?action=[storage-link|optimize-clear|optimize|migrate]&key=...',
                    ]);
            }

            return response()->json([
                'status' => 'success',
                'action' => $action,
                'output' => trim($output),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'action' => $action,
                'message' => $e->getMessage(),
            ], 500);
        }
    });
});

// Keep client-side routes loadable on a hard refresh without swallowing API/system errors.
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api(?:/|$)|sanctum(?:/|$)|system(?:/|$)).*');
