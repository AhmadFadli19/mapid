<?php

namespace App\Jobs;

use App\Services\GtfsIngestionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessGtfsIngestionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job to ingest GTFS Static Feed.
     */
    public function handle(GtfsIngestionService $gtfsService): void
    {
        Log::info("Starting Scheduled GTFS Ingestion Job...");
        $result = $gtfsService->ingestTransJakartaGtfs();
        Log::info("GTFS Ingestion Job Completed: ", $result);
    }
}
