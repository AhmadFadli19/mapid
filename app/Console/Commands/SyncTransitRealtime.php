<?php

namespace App\Console\Commands;

use App\Services\GtfsRealtimeService;
use Illuminate\Console\Command;

class SyncTransitRealtime extends Command
{
    protected $signature = 'transit:sync-realtime';
    protected $description = 'Synchronize the configured GTFS Realtime feed without inventing fallback values.';

    public function handle(GtfsRealtimeService $service): int
    {
        $result = $service->sync();
        $this->line(json_encode($result, JSON_UNESCAPED_UNICODE));
        return ($result['status'] ?? 'unavailable') === 'success' ? self::SUCCESS : self::FAILURE;
    }
}
