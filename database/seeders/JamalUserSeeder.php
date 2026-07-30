<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class JamalUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'ayamurok@gmail.com'],
            [
                'name' => 'Jamal',
                'username' => 'jamal',
                'phone' => '081234567899',
                'password' => Hash::make('jamal1234'),
                'email_verified_at' => now(),
                'role_id' => 2, // User role
            ]
        );
    }
}
