<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExitGate extends Model
{
    use HasFactory;

    protected $table = 'exits';

    protected $fillable = [
        'station_id',
        'gate_name',
        'target_street',
        'is_accessible',
        'nearest_poi',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'is_accessible' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
