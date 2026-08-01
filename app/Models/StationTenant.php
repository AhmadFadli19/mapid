<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StationTenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'tenant_name',
        'mission_type',
        'category',
        'price_avg',
        'promo_photo',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected $casts = [
        'price_avg' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
