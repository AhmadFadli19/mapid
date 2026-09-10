<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@mapid.io'],
            [
                'name' => 'MAPID Admin',
                'username' => 'admin_mapid',
                'phone' => '081111111111',
                'password' => Hash::make('password'),
                'role_id' => 1,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Example',
                'username' => 'admin',
                'phone' => '082222222222',
                'password' => Hash::make('password'),
                'role_id' => 1,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@mapid.io'],
            [
                'name' => 'MAPID User',
                'username' => 'user_mapid',
                'phone' => '083333333333',
                'password' => Hash::make('password'),
                'role_id' => 2,
                'email_verified_at' => now(),
            ]
        );
    }
}
