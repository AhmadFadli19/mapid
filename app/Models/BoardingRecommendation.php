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
    ];

    public function station()
    {
        return $this->belongsTo(Station::class, 'station_id');
    }

    public function destinationStation()
    {
        return $this->belongsTo(Station::class, 'destination_station_id');
    }
}
