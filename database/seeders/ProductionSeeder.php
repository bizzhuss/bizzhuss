<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PromotionalCampaign;
use App\Models\Setting;
use App\Models\Task;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorPayout;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class ProductionSeeder extends Seeder
{
    /**
     * Seed production-ready baseline data:
     * - Master Super Admin account (driven by INITIAL_ADMIN_PASSWORD env var)
     * - Marketplace category taxonomy
     * - Enterprise departments and designations
     * - Production platform settings (Maintenance mode OFF)
     * - Zero mock products, orders, vendors, or tasks
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        PromotionalCampaign::truncate();
        Banner::truncate();
        OrderItem::truncate();
        Order::truncate();
        Product::truncate();
        Category::truncate();
        VendorPayout::truncate();
        Vendor::truncate();
        Task::truncate();
        Employee::truncate();
        Designation::truncate();
        Department::truncate();
        User::truncate();
        Setting::truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Initial Master Super Admin Account
        $adminPassword = env('INITIAL_ADMIN_PASSWORD', 'SecurePass2026!');
        User::create([
            'name' => 'Alexander Hayes',
            'email' => 'admin@bizzhuss.com',
            'password' => Hash::make($adminPassword),
            'role' => 'super_admin',
            'status' => 'active',
            'phone' => '+1 (555) 010-9900',
            'email_verified_at' => now(),
        ]);

        // 2. Production Baseline Platform Settings
        Setting::set('maintenance_enabled', false);
        Setting::set('maintenance_mode', false);
        Setting::set('maintenance_blocked_roles', ['guest', 'customer']);
        Setting::set('platform_name', 'Bizzhuss Multi-Vendor Marketplace');
        Setting::set('platform_currency', 'PKR');
        Setting::set('default_commission_rate', '10.00');
        Setting::set('support_email', 'governance@bizzhuss.com');
        Setting::set('support_phone', '+1 (800) 555-BIZZ');
        cache()->flush();

        // 3. Official Core Marketplace Categories & Taxonomies
        $iot = Category::create([
            'name' => 'Industrial IoT',
            'slug' => 'industrial-iot',
            'icon' => 'Cpu',
            'parent_id' => null,
        ]);

        Category::create([
            'parent_id' => $iot->id,
            'name' => 'Edge Gateways',
            'slug' => 'edge-gateways',
            'icon' => 'Cpu',
        ]);

        $hardware = Category::create([
            'name' => 'Enterprise Hardware',
            'slug' => 'enterprise-hardware',
            'icon' => 'Layers',
            'parent_id' => null,
        ]);

        Category::create([
            'parent_id' => $hardware->id,
            'name' => 'Server Racks & Enclosures',
            'slug' => 'server-racks-enclosures',
            'icon' => 'Layers',
        ]);

        Category::create([
            'name' => 'Heavy Tooling',
            'slug' => 'heavy-tooling',
            'icon' => 'Wrench',
            'parent_id' => null,
        ]);

        Category::create([
            'name' => 'Executive Office',
            'slug' => 'executive-office',
            'icon' => 'Briefcase',
            'parent_id' => null,
        ]);

        Category::create([
            'name' => 'Sensors & Telemetry',
            'slug' => 'sensors-telemetry',
            'icon' => 'Zap',
            'parent_id' => null,
        ]);

        // 4. Operational Enterprise Departments & Designations
        $qaDept = Department::create([
            'name' => 'Quality Assurance',
            'slug' => 'quality-assurance',
            'description' => 'Product inspection, vendor certification compliance, and sample audits.',
        ]);

        Designation::create([
            'department_id' => $qaDept->id,
            'title' => 'Senior QA & Compliance Lead',
        ]);

        $logDept = Department::create([
            'name' => 'Logistics & Dispatch',
            'slug' => 'logistics-dispatch',
            'description' => 'Carrier SLA tracking, freight routing, and regional fulfillment oversight.',
        ]);

        Designation::create([
            'department_id' => $logDept->id,
            'title' => 'Logistics Coordinator',
        ]);

        $vendorDept = Department::create([
            'name' => 'Vendor Relations',
            'slug' => 'vendor-relations',
            'description' => 'Merchant onboarding, store verification, and catalog compliance.',
        ]);

        Designation::create([
            'department_id' => $vendorDept->id,
            'title' => 'Merchant Partner Manager',
        ]);

        $finDept = Department::create([
            'name' => 'Billing & Settlements',
            'slug' => 'billing-settlements',
            'description' => 'Automated payout ledger reconciliation, commission audit, and tax accounting.',
        ]);

        Designation::create([
            'department_id' => $finDept->id,
            'title' => 'Settlement Auditor',
        ]);
    }
}
