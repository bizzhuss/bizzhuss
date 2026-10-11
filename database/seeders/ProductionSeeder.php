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
        ]);

        // 2. Official Core Marketplace Categories
        $iot = Category::create([
            'name' => 'Industrial IoT',
            'slug' => 'industrial-iot',
            'description' => 'Edge computing, embedded microcontrollers, and industrial telemetry hardware.',
            'icon' => 'Cpu',
            'is_active' => true,
        ]);

        Category::create([
            'parent_id' => $iot->id,
            'name' => 'Edge Gateways',
            'slug' => 'edge-gateways',
            'description' => 'Cellular and LoRaWAN industrial gateway devices.',
            'icon' => 'Cpu',
            'is_active' => true,
        ]);

        $hardware = Category::create([
            'name' => 'Enterprise Hardware',
            'slug' => 'enterprise-hardware',
            'description' => 'High-density server nodes, modular rack enclosures, and enterprise networking.',
            'icon' => 'Layers',
            'is_active' => true,
        ]);

        Category::create([
            'parent_id' => $hardware->id,
            'name' => 'Server Racks & Enclosures',
            'slug' => 'server-racks-enclosures',
            'description' => 'Seismic-rated server rack enclosures and power distribution units.',
            'icon' => 'Layers',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Heavy Tooling',
            'slug' => 'heavy-tooling',
            'description' => 'Calibration fixtures, precision torque drivers, and manufacturing equipment.',
            'icon' => 'Wrench',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Executive Office',
            'slug' => 'executive-office',
            'description' => 'Ergonomic seating, executive desks, and architectural workspace furnishings.',
            'icon' => 'Briefcase',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Sensors & Telemetry',
            'slug' => 'sensors-telemetry',
            'description' => 'Environmental monitoring, vibration diagnostics, and optical telemetry sensors.',
            'icon' => 'Zap',
            'is_active' => true,
        ]);

        // 3. Operational Enterprise Departments & Designations
        $qaDept = Department::create([
            'name' => 'Quality Assurance',
            'code' => 'QA',
            'description' => 'Product inspection, vendor certification compliance, and sample audits.',
            'is_active' => true,
        ]);

        Designation::create([
            'department_id' => $qaDept->id,
            'title' => 'Lead QA Specialist',
            'code' => 'QA-LEAD',
            'description' => 'Responsible for vendor product quality testing and RMA authorization.',
        ]);

        $logDept = Department::create([
            'name' => 'Logistics & Dispatch',
            'code' => 'LOG',
            'description' => 'Carrier SLA tracking, freight routing, and regional fulfillment oversight.',
            'is_active' => true,
        ]);

        Designation::create([
            'department_id' => $logDept->id,
            'title' => 'Logistics Coordinator',
            'code' => 'LOG-COORD',
            'description' => 'Monitors carrier handoffs and multi-vendor shipment consolidation.',
        ]);

        $vendorDept = Department::create([
            'name' => 'Vendor Relations',
            'code' => 'VR',
            'description' => 'Merchant onboarding, store verification, and catalog compliance.',
            'is_active' => true,
        ]);

        Designation::create([
            'department_id' => $vendorDept->id,
            'title' => 'Merchant Partner Manager',
            'code' => 'VR-MGR',
            'description' => 'Manages merchant seller agreements and commission structures.',
        ]);

        $finDept = Department::create([
            'name' => 'Billing & Settlements',
            'code' => 'FIN',
            'description' => 'Automated payout ledger reconciliation, commission audit, and tax accounting.',
            'is_active' => true,
        ]);

        Designation::create([
            'department_id' => $finDept->id,
            'title' => 'Settlement Auditor',
            'code' => 'FIN-AUDIT',
            'description' => 'Audits weekly vendor disbursement batches and escrow balances.',
        ]);
    }
}
