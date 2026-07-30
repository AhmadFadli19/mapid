<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'role_id',
        'email_verified_at',
        'email_verification_code',
        'reset_code',
        'reset_code_expired_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_code',
        'reset_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'reset_code_expired_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function isAdmin()
    {
        return $this->role_id === 1;
    }

    public function isUser()
    {
        return $this->role_id === 2;
    }

    public function isDeveloper()
    {
        return $this->role_id === 3;
    }
}
