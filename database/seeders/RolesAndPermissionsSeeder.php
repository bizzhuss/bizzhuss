<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds for MongoDB Roles and Document-Based Permissions.
     */
    public function run(): void
    {
        // Platform Permissions Matrix
        $tierPermissions = [
            'tier.vendor_portal',
            'tier.employee_desk',
            'tier.marketing_hub',
        ];

        $modulePermissions = [
            'module.central_command',
            'module.vendor_oversight',
            'module.storefront_curation',
            'module.departments',
            'module.workforce',
            'module.kanban',
            'module.platform_settings',
        ];

        // 1. Ensure Primary Super Admin exists and has full access
        $superAdminEmails = [
            'haseebkhanuddin44@gmail.com',
            'admin@bizzhuss.com',
            'superadmin@bizzhuss.com',
            'bizzhuss@gmail.com',
        ];

        foreach ($superAdminEmails as $email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->update([
                    'role' => 'super_admin',
                    'status' => 'active',
                    'approval_status' => 'approved',
                    'permissions' => ['*'],
                ]);
            }
        }

        // 2. Ensure all other super admins have wildcard permissions
        User::where('role', 'super_admin')->get()->each(function ($admin) {
            $perms = $admin->permissions ?? [];
            if (!in_array('*', (array) $perms)) {
                $admin->syncPermissions(['*']);
            }
        });

        // 3. Ensure employees have baseline desk & kanban access
        User::where('role', 'employee')->get()->each(function ($emp) {
            $perms = (array) ($emp->permissions ?? []);
            if (empty($perms)) {
                $emp->syncPermissions([
                    'tier.employee_desk',
                    'module.kanban',
                ]);
            }
        });

        // 4. Ensure marketing managers have baseline marketing hub & curation access
        User::where('role', 'marketing_manager')->get()->each(function ($mm) {
            $perms = (array) ($mm->permissions ?? []);
            if (empty($perms)) {
                $mm->syncPermissions([
                    'tier.marketing_hub',
                    'module.storefront_curation',
                ]);
            }
        });

        // 5. Ensure vendors have vendor portal tier access
        User::where('role', 'vendor')->get()->each(function ($vendor) {
            $perms = (array) ($vendor->permissions ?? []);
            if (empty($perms)) {
                $vendor->syncPermissions([
                    'tier.vendor_portal',
                ]);
            }
        });
    }
}
