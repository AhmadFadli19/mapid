<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JourneyTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'journey_id',
        'step_order',
        'title',
        'instruction',
        'transport_mode',
        'latitude',
        'longitude',
        'status',
        'station_id',
        'gtfs_stop_id',
        'route_id',
        'route_name',
        'arrival_time',
        'departure_time',
        'transfer_at',
        'distance_meters',
    ];

    protected $casts = [
        'step_order' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'arrival_time' => 'datetime',
        'departure_time' => 'datetime',
        'distance_meters' => 'float',
    ];

    public function journey()
    {
        return $this->belongsTo(Journey::class);
    }
}
