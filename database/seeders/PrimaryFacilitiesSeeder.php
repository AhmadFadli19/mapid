<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Station;
use App\Models\Facility;
use App\Models\ExitGate;
use App\Models\BoardingRecommendation;

class PrimaryFacilitiesSeeder extends Seeder
{
    public function run(): void
    {
        $primaryCodes = ['BHI', 'DKA', 'BLM', 'CWG-LRT', 'MRI', 'HRM'];
        $stations = Station::whereIn('code', $primaryCodes)->get();

        foreach ($stations as $st) {
            Facility::firstOrCreate(
                ['station_id' => $st->id, 'facility_name' => 'Lift Prioritas Difabel & Lansia'],
                [
                    'category' => 'Accessibility',
                    'floor' => 'Lantai Concourse',
                    'is_available' => true,
                    'status_note' => 'Berfungsi Normal',
                    'operating_hours' => '05:00 - 24:00',
                    'latitude' => $st->latitude,
                    'longitude' => $st->longitude,
                ]
            );

            Facility::firstOrCreate(
                ['station_id' => $st->id, 'facility_name' => 'Toilet Difabel & Umum'],
                [
                    'category' => 'Public Facilities',
                    'floor' => 'Lantai 1',
                    'is_available' => true,
                    'status_note' => 'Bersih & Buka',
                    'operating_hours' => '05:00 - 24:00',
                    'latitude' => $st->latitude,
                    'longitude' => $st->longitude,
                ]
            );

            Facility::firstOrCreate(
                ['station_id' => $st->id, 'facility_name' => 'Eskalator Peron Sisi Barat'],
                [
                    'category' => 'Accessibility',
                    'floor' => 'Peron 1-2',
                    'is_available' => true,
                    'status_note' => 'Operasional Lancar',
                    'operating_hours' => '05:00 - 24:00',
                    'latitude' => $st->latitude,
                    'longitude' => $st->longitude,
                ]
            );

            Facility::firstOrCreate(
                ['station_id' => $st->id, 'facility_name' => 'Musala Transit Terawat'],
                [
                    'category' => 'Public Facilities',
                    'floor' => 'Lantai Concourse',
                    'is_available' => true,
                    'status_note' => 'Buka & Suci',
                    'operating_hours' => '05:00 - 24:00',
                    'latitude' => $st->latitude,
                    'longitude' => $st->longitude,
                ]
            );

            ExitGate::firstOrCreate(
                ['station_id' => $st->id, 'gate_name' => 'Exit Gate A (Jalur Utama)'],
                [
                    'target_street' => 'Jl. Protokol & Integrasi Halte TransJakarta',
                    'is_accessible' => true,
                    'nearest_poi' => 'Plaza / Gedung Perkantoran',
                    'latitude' => $st->latitude,
                    'longitude' => $st->longitude,
                ]
            );

            ExitGate::firstOrCreate(
                ['station_id' => $st->id, 'gate_name' => 'Exit Gate B (Skybridge Integrasi)'],
                [
                    'target_street' => 'Jembatan Penyeberangan Multimoda',
                    'is_accessible' => true,
                    'nearest_poi' => 'Skybridge Dukuh Atas / Halte BRT',
                    'latitude' => $st->latitude,
                    'longitude' => $st->longitude,
                ]
            );

            BoardingRecommendation::firstOrCreate(
                ['station_id' => $st->id],
                [
                    'car_number' => 'Gerbong 2 atau 7',
                    'reason' => "Posisi paling dekat dengan Lift & Eskalator Exit Gate A di {$st->name}.",
                    'nearest_exit' => 'Exit Gate A',
                    'walking_time_seconds' => 65,
                ]
            );
        }
    }
}
