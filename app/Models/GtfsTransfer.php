<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GtfsTransfer extends Model
{
    protected $fillable = ['from_stop_id', 'to_stop_id', 'transfer_type', 'min_transfer_time'];

    protected $casts = ['transfer_type' => 'integer', 'min_transfer_time' => 'integer'];
}
