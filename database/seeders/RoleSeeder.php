<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // ✅ TAMBAHKAN INI

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // ❌ SALAH: insert([
        // ✅ BENAR: DB::table('roles')->insert([
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'user', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'developer', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
