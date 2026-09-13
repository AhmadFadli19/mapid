<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GtfsFrequency extends Model
{
    protected $fillable = ['trip_id', 'start_time', 'end_time', 'headway_secs', 'exact_times'];

    protected $casts = ['headway_secs' => 'integer', 'exact_times' => 'boolean'];
}
