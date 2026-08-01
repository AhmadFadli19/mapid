<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'line_color',
        'operator',
        'latitude',
        'longitude',
        'address',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function facilities()
    {
        return $this->hasMany(Facility::class);
    }

    public function exits()
    {
        return $this->hasMany(ExitGate::class, 'station_id');
    }

    public function boardingRecommendations()
    {
        return $this->hasMany(BoardingRecommendation::class, 'station_id');
    }

    public function communityReports()
    {
        return $this->hasMany(CommunityReport::class, 'station_id');
    }

    public function tenants()
    {
        return $this->hasMany(StationTenant::class, 'station_id');
    }

    /**
     * Geospatial PostGIS distance query scope (in meters)
     */
    public function scopeNearby($query, float $latitude, float $longitude, float $radiusMeters = 1000)
    {
        if (DB::getDriverName() === 'pgsql') {
            return $query->whereRaw(
                "ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)",
                [$longitude, $latitude, $radiusMeters]
            );
        }

        // Haversine fallback for SQLite/MySQL
        $haversine = "(6371000 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))";
        return $query->selectRaw("*, {$haversine} AS distance", [$latitude, $longitude, $latitude])
            ->whereRaw("{$haversine} <= ?", [$latitude, $longitude, $latitude, $radiusMeters])
            ->orderBy('distance');
    }
}
