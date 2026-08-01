<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JourneyTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'journey_id',
        'step_order',
        'title',
        'instruction',
        'transport_mode',
        'latitude',
        'longitude',
        'status',
    ];

    protected $casts = [
        'step_order' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function journey()
    {
        return $this->belongsTo(Journey::class);
    }
}
