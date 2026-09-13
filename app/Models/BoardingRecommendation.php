<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardingRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'destination_station_id',
        'car_number',
        'reason',
        'nearest_exit',
        'walking_time_seconds',
        'platform_position',
        'exit_gate_id',
        'walking_distance_meters',
        'analysis_method',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class, 'station_id');
    }

    public function destinationStation()
    {
        return $this->belongsTo(Station::class, 'destination_station_id');
    }

    protected $casts = [
        'walking_time_seconds' => 'integer',
        'walking_distance_meters' => 'float',
    ];
}
