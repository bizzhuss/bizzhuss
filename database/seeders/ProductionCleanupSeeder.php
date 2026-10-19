<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionCleanupSeeder extends Seeder
{
    /**
     * Helper to get a MongoDB collection query builder.
     */
    protected function collection(string $name)
    {
        return DB::connection('mongodb')->table($name);
    }

    public function run(): void
    {
        // 1. Collections to Completely Wipe Clean (Dummy E-Commerce Data)
        $collectionsToWipe = [
            'products',
            'orders',
            'order_items',
            'carts',
            'cart_items',
            'reviews',
            'coupons',
            'flash_deals',
            'payout_requests',
            'vendor_profiles',
            'vendors',
            'vendor_payouts',
            'notifications',
        ];

        foreach ($collectionsToWipe as $collection) {
            $this->collection($collection)->truncate();
        }

        // 2. Clean Test Users (Keep ONLY Super Admin)
        // Ensure at least one Super Admin exists for Haseeb first before purging
        $adminEmail = 'haseebkhanuddin44@gmail.com';
        $admin = User::where('email', $adminEmail)->first();

        if ($admin) {
            $admin->update([
                'role' => 'super_admin',
                'status' => 'active',
                'approval_status' => 'approved',
                'permissions' => ['*'],
            ]);
        } else {
            User::create([
                'name' => 'Haseeb',
                'email' => $adminEmail,
                'role' => 'super_admin',
                'status' => 'active',
                'approval_status' => 'approved',
                'permissions' => ['*'],
            ]);
        }

        // Delete all customers, employees, and test vendors, but preserve super_admin accounts
        User::where('role', '!=', 'super_admin')
            ->where('email', '!=', $adminEmail)
            ->delete();

        // 3. Keep Clean Baseline Taxonomies (Categories)
        // Wipe and insert clean starting departments
        $categoriesCollection = $this->collection('categories');
        $categoriesCollection->truncate();

        $defaultCategories = [
            [
                'name' => 'Electronics & Gadgets',
                'slug' => 'electronics-gadgets',
                'is_active' => true,
                'is_verified_featured' => true,
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Industrial & Hardware',
                'slug' => 'industrial-hardware',
                'is_active' => true,
                'is_verified_featured' => true,
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Executive Office',
                'slug' => 'executive-office',
                'is_active' => true,
                'is_verified_featured' => true,
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $categoriesCollection->insert($defaultCategories);

        // 4. Reset Platform Settings
        $settingsCollection = $this->collection('settings');
        $settingsCollection->updateOrInsert(
            ['key' => 'store_maintenance_mode'],
            [
                'maintenance_enabled' => false,
                'blocked_roles' => ['guest', 'customer'],
                'updated_at' => now(),
            ]
        );
    }
}
