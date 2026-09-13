<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production or when APP_URL is configured with https
        if (str_starts_with(config('app.url') ?? '', 'https://') || $this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
