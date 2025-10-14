<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //Define devis permissions
        Permission::create(['name'=> 'view devis']);
        Permission::create(['name'=> 'create devis']);
        Permission::create(['name'=> 'edit devis']);
        Permission::create(['name'=> 'delete devis']);

        //Define factures permissions
        Permission::create(['name'=> 'view factures']);
        Permission::create(['name'=> 'create factures']);
        Permission::create(['name'=> 'edit factures']);
        Permission::create(['name'=> 'delete factures']);

        //Define factures permissions
        Permission::create(['name'=> 'view users']);
        Permission::create(['name'=> 'delete users']);

        //Define products permissions
        Permission::create(['name'=> 'view products']);
        Permission::create(['name'=> 'create products']);
        Permission::create(['name'=> 'edit products']);
        Permission::create(['name'=> 'delete products']);

        //Define reclamations permissions
        Permission::create(['name'=> 'view reclamations']);
        Permission::create(['name'=> 'create reclamations']);
        Permission::create(['name'=> 'edit reclamations']);
        Permission::create(['name'=> 'delete reclamations']);


        // create admin role and assign all permissions
            $adminRole=Role::create(['name' => 'admin']);
            $adminRole->givePermissionTo([
            'view factures',
            'view products',
            'view devis',
            'view users',
            'delete users',
            'view reclamations',
            'delete reclamations'
        ]);
        
        
        
        // create provider role and assign all permissions
        $providerRole=Role::create(['name' => 'provider']);
        $providerRole->givePermissionTo([
            'view devis',
            'create devis',
            'edit devis',
            'delete devis',
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view reclamations',
            'create reclamations',
            'edit reclamations',
            'delete reclamations'
        ]);


        // create buyer role and assign all permissions
            $buyerRole=Role::create(['name' => 'buyer']);
            $buyerRole->givePermissionTo([
            'view devis',
            'view factures',
            'create factures',
            'edit factures',
            'delete factures',
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view reclamations',
            'create reclamations',
            'edit reclamations',
            'delete reclamations'
        ]);
    }
}
