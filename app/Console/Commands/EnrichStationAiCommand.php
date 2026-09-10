<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Services\GeminiAiService;

class EnrichStationAiCommand extends Command
{
    protected $signature = 'transit:ai-enrich {--station= : Station ID to enrich (optional, default first or specified)} {--all : Enrich all stations} {--force : Force re-enrichment even if cached}';

    protected $description = 'Automatically enrich station micro-data (facilities, exit gates, boarding guide) using Gemini 3.6 Flash';

    public function handle(GeminiAiService $aiService): int
    {
        $stationId = $this->option('station');
        $all = $this->option('all');
        $force = (bool)$this->option('force');

        if ($all) {
            $stations = Station::all();
            $this->info("🤖 Starting Batch AI Enrichment for " . $stations->count() . " stations via Gemini 3.6 Flash...");
            $bar = $this->output->createProgressBar($stations->count());
            $bar->start();

            foreach ($stations as $station) {
                $aiService->enrichStation($station, $force);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("✅ Batch AI Enrichment Completed!");
            return Command::SUCCESS;
        }

        $station = $stationId ? Station::find($stationId) : Station::where('code', 'LIKE', 'ST_JT_%')->first();
        if (!$station) {
            $station = Station::first();
        }

        if (!$station) {
            $this->error("No station found in database.");
            return Command::FAILURE;
        }

        $this->info("🤖 Contacting Gemini 3.6 Flash for {$station->name} ({$station->operator})...");
        $result = $aiService->enrichStation($station, true);

        if ($result['status'] === 'success') {
            $this->info("✅ Success! Gemini AI enriched {$station->name}:");
            $this->line("  • Facilities: " . $result['facilities_count']);
            $this->line("  • Exit Gates: " . $result['exits_count']);
            $this->line("  • Boarding Recs: " . $result['boarding_count']);
            $this->line("  • Tenants: " . $result['tenants_count']);
            $this->line("  • Summary: " . $result['ai_summary']);
        } else {
            $this->warn("Result: " . json_encode($result));
        }

        return Command::SUCCESS;
    }
}
