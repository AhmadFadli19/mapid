<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransitRoute extends Model
{
    use HasFactory;

    protected $table = 'transit_routes';

    protected $fillable = [
        'route_id',
        'agency_id',
        'route_short_name',
        'route_long_name',
        'route_type',
        'route_color',
        'route_text_color',
        'coordinates',
    ];

    protected $casts = [
        'coordinates' => 'array',
    ];
}
