<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StrukGo extends Model
{
    use HasFactory;

    protected $table = 'struk_gos';

    protected $fillable = [
        'user_id',
        'station_id',
        'receipt_number',
        'merchant_name',
        'transaction_type',
        'items_json',
        'subtotal',
        'discount',
        'total_amount',
        'payment_method',
        'status',
        'transaction_time',
    ];

    protected $casts = [
        'items_json' => 'array',
        'subtotal' => 'float',
        'discount' => 'float',
        'total_amount' => 'float',
        'transaction_time' => 'datetime',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
