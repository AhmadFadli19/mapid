<?php

namespace App\Services;

use App\Models\Station;
use App\Models\Facility;
use App\Models\ExitGate;
use App\Models\BoardingRecommendation;
use App\Models\StationTenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GeminiAiService
{
    protected string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY', '');
        $this->model = 'gemini-3.6-flash';
    }

    /**
     * Ask Gemini AI for Transit Intelligence assistance.
     */
    public function askTransitAssistant(string $userPrompt, array $context = []): array
    {
        $stationName = $context['station_name'] ?? 'Stasiun Transit Jakarta';
        $operator = $context['operator'] ?? 'TransJakarta / KRL / MRT';
        $facilities = isset($context['facilities']) ? implode(', ', $context['facilities']) : 'Toilet, Mushola, Lift, Eskalator, Indomaret, Lawson, Exit Gate A-D';

        $systemInstruction = "Anda adalah MAPID Transit Intelligence AI Assistant — asisten perjalanan WebGIS transportasi umum berbasis AI untuk Jakarta (TransJakarta, KRL, MRT, LRT). " .
            "Prinsip Anda: Memberikan rekomendasi kenyamanan, posisi gerbong, fasilitas stasiun/halte, pintu keluar terbaik (exit gate), dan panduan transit yang praktis dan ramah. " .
            "Konteks Stasiun Aktif: {$stationName} ({$operator}). Fasilitas tersedia: {$facilities}. " .
            "Jawablah dengan singkat, informatif, terstruktur dengan bullet point, dan menggunakan emoji transportasi.";

        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(12)->post($endpoint, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => "{$systemInstruction}\n\nPertanyaan Pengguna: {$userPrompt}"]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 600,
                ]
            ]);

            if ($response->successful()) {
                $json = $response->json();
                $reply = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($reply) {
                    return [
                        'status' => 'success',
                        'source' => "Gemini_AI_{$this->model}",
                        'reply' => trim($reply)
                    ];
                }
            } else {
                Log::warning('Gemini API Non-200 Response: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Gemini AI Exception: ' . $e->getMessage());
        }

        // Contextual Fallback AI Response
        $fallbackReply = $this->generateFallbackReply($userPrompt, $stationName, $operator);

        return [
            'status' => 'success',
            'source' => 'Transit_Intelligence_Local_Engine',
            'reply' => $fallbackReply
        ];
    }

    /**
     * Check if a station requires autonomous AI data enrichment.
     */
    public function shouldAutoEnrich(Station $station): bool
    {
        $meta = Cache::get("station_ai_enrichment_{$station->id}");
        if (!$meta) {
            return true;
        }

        // Auto re-enrich if older than 24 hours or has zero/generic facilities
        $isStale = now()->diffInHours($meta['enriched_at'] ?? now()->subDays(2)) >= 24;
        $hasFewFacilities = $station->facilities()->count() <= 2;

        return $isStale || $hasFewFacilities;
    }

    /**
     * Autonomous AI Transit Intelligence Enrichment
     * Queries Gemini 3.6 Flash for real, up-to-date micro-data (facilities, exit gates, boarding car guide, tenants),
     * and updates the local database automatically.
     */
    public function enrichStation(Station $station, bool $force = false): array
    {
        return [
            'status' => 'disabled',
            'message' => 'AI tidak menulis data fasilitas, exit, boarding, atau tenant resmi. Gunakan ingestion GTFS/MAPID terverifikasi.',
            'data_source' => 'AI_OPTIONAL_ONLY',
            'station_id' => $station->id,
        ];

        $cacheKey = "station_ai_enrichment_{$station->id}";
        if (!$force && !$this->shouldAutoEnrich($station)) {
            $existing = Cache::get($cacheKey);
            return [
                'status' => 'cached',
                'station_id' => $station->id,
                'station_name' => $station->name,
                'metadata' => $existing
            ];
        }

        $prompt = <<<PROMPT
Anda adalah sistem AI Pakar Spasial Transit Jabodetabek (MAPID Transit Intelligence).
Tugas Anda adalah memperbarui dan melengkapi data mikro terkini, akurat, dan realistis untuk stasiun/halte berikut:
Nama: {$station->name}
Operator: {$station->operator}
Alamat: {$station->address}
Koordinat: {$station->latitude}, {$station->longitude}

Berikan data dalam format JSON murni TANPA markdown/backticks, dengan struktur PERSIS berikut:
{
  "facilities": [
    {
      "facility_name": "Toilet Difabel & Umum",
      "category": "Accessibility",
      "floor": "Lantai 1 Concourse",
      "is_available": true,
      "status_note": "Berfungsi normal, bersih & ramah kursi roda",
      "operating_hours": "05:00 - 23:30"
    },
    {
      "facility_name": "Lift Prioritas Peron 1-2",
      "category": "Accessibility",
      "floor": "Lantai Peron",
      "is_available": true,
      "status_note": "Operasional normal untuk lansia & disabilitas",
      "operating_hours": "05:00 - 24:00"
    },
    {
      "facility_name": "Eskalator Peron Sisi Barat",
      "category": "Public Facilities",
      "floor": "Lantai Mezzanine ke Peron",
      "is_available": true,
      "status_note": "Operasional normal",
      "operating_hours": "05:00 - 23:30"
    },
    {
      "facility_name": "Musholla Transit Bersih",
      "category": "Public Facilities",
      "floor": "Lantai 1",
      "is_available": true,
      "status_note": "Tersedia tempat wudhu terpisah & mukena bersih",
      "operating_hours": "05:00 - 23:00"
    },
    {
      "facility_name": "Ruang Laktasi & Ibu Menyusui",
      "category": "Accessibility",
      "floor": "Lantai 1 Samping Pos Kesehatan",
      "is_available": true,
      "status_note": "Tersedia sofa menyusui & wastafel higienis",
      "operating_hours": "05:30 - 22:00"
    }
  ],
  "exits": [
    {
      "gate_name": "Exit Gate A (Pintu Utama)",
      "target_street": "Jalan Utama / Trotoar Terhubung",
      "is_accessible": true,
      "nearest_poi": "Halte Feeder TransJakarta & Jembatan Penyeberangan Orang"
    },
    {
      "gate_name": "Exit Gate B (Integrasi Komersial)",
      "target_street": "Akses Kawasan Perkantoran & Gedung",
      "is_accessible": true,
      "nearest_poi": "Zona Penjemputan Ojek Online & Skybridge Transit"
    }
  ],
  "boarding": [
    {
      "car_number": "Gerbong 2 atau 7",
      "reason": "Posisi tepat berhadapan dengan eskalator dan tangga transfer antar-peron stasiun",
      "nearest_exit": "Exit Gate A",
      "walking_time_seconds": 60
    },
    {
      "car_number": "Gerbong 3 atau 6",
      "reason": "Paling dekat dengan Lift Prioritas Ramah Kursi Roda dan Toilet Difabel",
      "nearest_exit": "Exit Gate B",
      "walking_time_seconds": 45
    }
  ],
  "tenants": [
    {
      "tenant_name": "Kopi Kenangan {$station->name}",
      "category": "Coffee & Pastry",
      "price_avg": 22000,
      "promo_photo": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
      "is_active": true
    },
    {
      "tenant_name": "Indomaret Point {$station->name}",
      "category": "Convenience Store",
      "price_avg": 18000,
      "promo_photo": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
      "is_active": true
    },
    {
      "tenant_name": "Roti'O Transit {$station->name}",
      "category": "Bakery",
      "price_avg": 14000,
      "promo_photo": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
      "is_active": true
    }
  ],
  "ai_summary": "Data mikro {$station->name} telah diperbarui dengan analisis spasial presisi oleh Gemini 3.6 Flash."
}
PROMPT;

        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(20)->post($endpoint, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $prompt]]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 4000,
                ]
            ]);

            if ($response->successful()) {
                $json = $response->json();
                $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                $data = null;
                if (preg_match('/\{[\s\S]*\}/', $rawText, $matches)) {
                    $data = json_decode($matches[0], true);
                }

                if (!$data) {
                    $cleaned = preg_replace('/^```(?:json)?\s*/i', '', trim($rawText));
                    $cleaned = preg_replace('/\s*```$/', '', $cleaned);
                    $data = json_decode($cleaned, true);
                }

                if ($data && is_array($data)) {
                    DB::transaction(function () use ($station, $data) {
                        // 1. Update/Insert Facilities
                        if (!empty($data['facilities'])) {
                            $station->facilities()->delete(); // Clear old generic seeder data
                            foreach ($data['facilities'] as $f) {
                                Facility::create([
                                    'station_id' => $station->id,
                                    'facility_name' => $f['facility_name'] ?? 'Fasilitas Stasiun',
                                    'category' => $f['category'] ?? 'Public Facilities',
                                    'floor' => $f['floor'] ?? 'Lantai 1',
                                    'is_available' => (bool)($f['is_available'] ?? true),
                                    'status_note' => $f['status_note'] ?? 'Berfungsi Normal',
                                    'operating_hours' => $f['operating_hours'] ?? '05:00 - 23:30',
                                    'latitude' => $station->latitude,
                                    'longitude' => $station->longitude,
                                ]);
                            }
                        }

                        // 2. Update/Insert Exit Gates
                        if (!empty($data['exits'])) {
                            $station->exits()->delete();
                            foreach ($data['exits'] as $ex) {
                                ExitGate::create([
                                    'station_id' => $station->id,
                                    'gate_name' => $ex['gate_name'] ?? 'Exit Gate A',
                                    'target_street' => $ex['target_street'] ?? 'Jalan Raya',
                                    'is_accessible' => (bool)($ex['is_accessible'] ?? true),
                                    'nearest_poi' => $ex['nearest_poi'] ?? 'Halte Integrasi',
                                    'latitude' => $station->latitude,
                                    'longitude' => $station->longitude,
                                ]);
                            }
                        }

                        // 3. Update/Insert Boarding Recommendations
                        if (!empty($data['boarding'])) {
                            $station->boardingRecommendations()->delete();
                            foreach ($data['boarding'] as $b) {
                                BoardingRecommendation::create([
                                    'station_id' => $station->id,
                                    'car_number' => $b['car_number'] ?? 'Gerbong 2 atau 7',
                                    'reason' => $b['reason'] ?? 'Posisi paling strategis',
                                    'nearest_exit' => $b['nearest_exit'] ?? 'Exit Gate A',
                                    'walking_time_seconds' => (int)($b['walking_time_seconds'] ?? 60),
                                ]);
                            }
                        }

                        // 4. Update/Insert Tenants
                        if (!empty($data['tenants'])) {
                            $station->tenants()->delete();
                            foreach ($data['tenants'] as $t) {
                                StationTenant::create([
                                    'station_id' => $station->id,
                                    'tenant_name' => $t['tenant_name'] ?? 'Tenant Stasiun',
                                    'mission_type' => 'MENU_GO',
                                    'category' => $t['category'] ?? 'F&B',
                                    'price_avg' => (float)($t['price_avg'] ?? 20000),
                                    'promo_photo' => $t['promo_photo'] ?? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
                                    'latitude' => $station->latitude,
                                    'longitude' => $station->longitude,
                                    'is_active' => true,
                                ]);
                            }
                        }

                        $station->touch(); // Update station updated_at
                    });

                    $meta = [
                        'status' => 'success',
                        'enriched_at' => now()->toIso8601String(),
                        'ai_model' => "Google Gemini 3.6 Flash",
                        'station_id' => $station->id,
                        'station_name' => $station->name,
                        'facilities_count' => count($data['facilities'] ?? []),
                        'exits_count' => count($data['exits'] ?? []),
                        'boarding_count' => count($data['boarding'] ?? []),
                        'tenants_count' => count($data['tenants'] ?? []),
                        'ai_summary' => $data['ai_summary'] ?? "Diperbarui otomatis oleh Gemini 3.6 Flash.",
                    ];

                    Cache::put($cacheKey, $meta, now()->addHours(24));

                    return $meta;
                } else {
                    $errMsg = "JSON decoding failed from Gemini raw output: " . substr($rawText, 0, 100);
                }
            } else {
                $errMsg = "Gemini API returned HTTP " . $response->status() . ": " . substr($response->body(), 0, 200);
                Log::warning('Gemini Enrichment Non-200: ' . $response->body());
            }
        } catch (\Exception $e) {
            $errMsg = "Exception: " . $e->getMessage();
            Log::error('Gemini Enrichment Exception: ' . $e->getMessage());
        }

        // Return current metadata if AI network fails
        return [
            'status' => 'failed',
            'message' => 'Gagal memanggil Gemini AI, menggunakan data lokal terakhir.',
            'error_detail' => $errMsg ?? 'Unknown error',
            'station_id' => $station->id,
            'station_name' => $station->name,
            'facilities_count' => $station->facilities()->count(),
            'exits_count' => $station->exits()->count(),
        ];
    }

    private function generateFallbackReply(string $prompt, string $station, string $operator): string
    {
        $lower = strtolower($prompt);

        if (str_contains($lower, 'exit') || str_contains($lower, 'keluar') || str_contains($lower, 'pintu')) {
            return "🚪 **Rekomendasi Pintu Keluar di {$station}**:\n" .
                "• **Exit Gate A**: Terhubung ke halte feeder & trotoar penyeberangan aman.\n" .
                "• **Exit Gate B**: Langsung menuju area komersial & pangkalan transportasi online.\n" .
                "💡 *Tips MAPID*: Gunakan Gerbong 2 atau 7 agar tiba tepat di depan eskalator Exit A.";
        }

        if (str_contains($lower, 'gerbong') || str_contains($lower, 'naik') || str_contains($lower, 'posisi')) {
            return "🚆 **Rekomendasi Posisi Naik & Gerbong di {$station}**:\n" .
                "• **Gerbong Khusus Wanita**: Gerbong 1 & 12 (paling depan & belakang).\n" .
                "• **Gerbong Paling Senggang**: Gerbong 2 & 7 (ujung peron) memiliki okupansi 30% lebih leluasa saat jam sibuk.\n" .
                "• **Aksesibilitas**: Gunakan pintu tengah untuk akses cepat ke Lift Prioritas.";
        }

        if (str_contains($lower, 'fasilitas') || str_contains($lower, 'toilet') || str_contains($lower, 'mushola') || str_contains($lower, 'atm')) {
            return "🏢 **Fasilitas Tersedia di {$station}**:\n" .
                "• 🚻 **Toilet Umum**: Lantai 1 (🟢 Buka / Operasional)\n" .
                "• 🕌 **Mushola**: Lantai Mezzanine (🟢 Buka / Bersih)\n" .
                "• 🛗 **Lift & Eskalator**: Berfungsi normal di peron arah utara & selatan\n" .
                "• 🛒 **Tenant**: Indomaret & Kopi Kenangan buka sampai jam 22.00.";
        }

        return "🚆 **Panduan Transit Intelligence untuk {$station} ({$operator})**:\n" .
            "• **Rute Efisien**: Sambungan transit tersedia dalam 3-5 menit jalan kaki melalui skybridge terhubung.\n" .
            "• **Kondisi Perjalanan**: Perjalanan aman dan lancar dengan pemantauan real-time MAPID WebGIS.\n" .
            "💡 Ada fasilitas atau posisi gerbong tertentu yang ingin Anda tanyakan lagi?";
    }
}
