<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GtfsCalendar extends Model
{
    protected $fillable = ['service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'start_date', 'end_date'];

    protected $casts = ['monday' => 'boolean', 'tuesday' => 'boolean', 'wednesday' => 'boolean', 'thursday' => 'boolean', 'friday' => 'boolean', 'saturday' => 'boolean', 'sunday' => 'boolean', 'start_date' => 'date', 'end_date' => 'date'];
}
