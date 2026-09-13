<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Journey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'origin_station_id',
        'destination_station_id',
        'start_time',
        'estimated_arrival',
        'status',
        'gtfs_trip_id',
        'current_stage',
        'current_stop_id',
        'delay_seconds',
        'last_position_lat',
        'last_position_lon',
        'last_synced_at',
        'reminder_sent_at',
        'data_source',
        'data_quality',
        'route_payload',
        'guest_token',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'estimated_arrival' => 'datetime',
        'last_synced_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'delay_seconds' => 'integer',
        'last_position_lat' => 'float',
        'last_position_lon' => 'float',
        'route_payload' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function originStation()
    {
        return $this->belongsTo(Station::class, 'origin_station_id');
    }

    public function destinationStation()
    {
        return $this->belongsTo(Station::class, 'destination_station_id');
    }

    public function timelines()
    {
        return $this->hasMany(JourneyTimeline::class)->orderBy('step_order');
    }
}
