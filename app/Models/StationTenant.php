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
        'menu_utama',
        'jam_buka',
        'jam_tutup',
        'mobilitas',
        'kondisi_tempat',
        'catatan',
        'link_menu',
        'price_avg',
        'promo_photo',
        'foto_tempat',
        'foto_menu_1',
        'foto_menu_2',
        'latitude',
        'longitude',
        'is_active',
        'synced_from_api_at',
    ];

    protected $casts = [
        'price_avg' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
        'synced_from_api_at' => 'datetime',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
