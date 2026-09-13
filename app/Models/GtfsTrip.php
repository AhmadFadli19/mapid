<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GtfsTrip extends Model
{
    protected $fillable = ['trip_id', 'route_id', 'service_id', 'trip_headsign', 'trip_short_name', 'direction_id', 'shape_id'];

    protected $casts = ['direction_id' => 'integer'];
}
