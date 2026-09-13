<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GtfsStopTime extends Model
{
    protected $fillable = ['trip_id', 'stop_id', 'stop_sequence', 'arrival_time', 'departure_time', 'stop_headsign', 'pickup_type', 'drop_off_type', 'shape_dist_traveled'];

    protected $casts = ['stop_sequence' => 'integer', 'pickup_type' => 'integer', 'drop_off_type' => 'integer', 'shape_dist_traveled' => 'float'];
}
