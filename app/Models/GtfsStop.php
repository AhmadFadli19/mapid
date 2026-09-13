<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GtfsStop extends Model
{
    protected $fillable = ['stop_id', 'stop_code', 'stop_name', 'stop_desc', 'stop_lat', 'stop_lon', 'parent_station', 'location_type', 'wheelchair_boarding'];

    protected $casts = ['stop_lat' => 'float', 'stop_lon' => 'float', 'location_type' => 'integer', 'wheelchair_boarding' => 'integer'];
}
