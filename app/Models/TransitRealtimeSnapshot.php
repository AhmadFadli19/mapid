<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransitRealtimeSnapshot extends Model
{
    protected $fillable = ['record_type', 'trip_id', 'vehicle_id', 'current_stop_id', 'latitude', 'longitude', 'delay_seconds', 'service_status', 'payload', 'fetched_at', 'source'];

    protected $casts = ['latitude' => 'float', 'longitude' => 'float', 'delay_seconds' => 'integer', 'payload' => 'array', 'fetched_at' => 'datetime'];
}
