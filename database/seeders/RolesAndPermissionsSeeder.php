<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Exact required permissions
        $permissions = [
            // Tiers
            'tier.vendor_portal',
            'tier.employee_desk',
            'tier.marketing_hub',
            // Sub-Tabs / Modules
            'module.central_command',
            'module.vendor_oversight',
            'module.storefront_curation',
            'module.departments',
            'module.workforce',
            'module.kanban',
            'module.platform_settings',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $vendorRole = Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'web']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $marketingRole = Role::firstOrCreate(['name' => 'marketing_manager', 'guard_name' => 'web']);

        // Give all permissions to super_admin
        $superAdminRole->syncPermissions(Permission::all());

        // Default baseline permissions for standard employee
        $employeeRole->syncPermissions([
            'tier.employee_desk',
            'module.kanban',
        ]);

        // Default baseline permissions for marketing manager
        $marketingRole->syncPermissions([
            'tier.marketing_hub',
            'module.storefront_curation',
        ]);

        // Assign super_admin role to any existing users with role 'super_admin'
        $superAdmins = User::where('role', 'super_admin')->get();
        foreach ($superAdmins as $admin) {
            if (!$admin->hasRole('super_admin')) {
                $admin->assignRole($superAdminRole);
            }
        }

        // Assign employee role to existing employees
        $employees = User::where('role', 'employee')->get();
        foreach ($employees as $emp) {
            if (!$emp->hasRole('employee')) {
                $emp->assignRole($employeeRole);
            }
        }
    }
}
