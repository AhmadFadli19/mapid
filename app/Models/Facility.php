<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'facility_name',
        'category',
        'floor',
        'is_available',
        'status_note',
        'operating_hours',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
