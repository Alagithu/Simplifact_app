<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       if(!User::where('email', 'admin@gmail.com')->exists()){
            User::create([
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'phone' => '00000000',
                'cdi' => 0,
                'society' => 'Company',
                'category' => 'General',
            ]);
        }
    }
}
