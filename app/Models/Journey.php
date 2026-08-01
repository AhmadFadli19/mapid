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
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'estimated_arrival' => 'datetime',
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
