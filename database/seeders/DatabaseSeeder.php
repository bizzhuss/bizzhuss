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
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with Phase 2 & 3 enterprise entities.
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

        // 1. Core Users & RBAC (Password for all: password123)
        $superAdmin = User::create([
            'name' => 'Alexander Hayes',
            'email' => 'admin@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'status' => 'active',
            'phone' => '+1 (555) 010-9900',
            'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        ]);

        $marketingUser = User::create([
            'name' => 'Maya Lin',
            'email' => 'marketing@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'marketing_manager',
            'status' => 'active',
            'phone' => '+1 (555) 492-7711',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        ]);

        $vendorUser1 = User::create([
            'name' => 'Dr. Aris Thorne',
            'email' => 'vendor@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'vendor',
            'status' => 'active',
            'phone' => '+1 (555) 441-8921',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        ]);

        $vendorUser2 = User::create([
            'name' => 'Klara Lindholm',
            'email' => 'artisan@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'vendor',
            'status' => 'active',
            'phone' => '+1 (555) 323-5511',
        ]);

        $vendorUser3 = User::create([
            'name' => 'Robert Sterling',
            'email' => 'apex@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'vendor',
            'status' => 'active',
            'phone' => '+1 (555) 887-1234',
        ]);

        $employeeUser1 = User::create([
            'name' => 'Elena Rostova',
            'email' => 'employee@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'employee',
            'status' => 'active',
            'phone' => '+1 (555) 601-3211',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        ]);

        $employeeUser2 = User::create([
            'name' => 'Marcus Vance',
            'email' => 'marcus.v@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'employee',
            'status' => 'active',
            'phone' => '+1 (555) 601-3212',
        ]);

        $customerUser = User::create([
            'name' => 'David Miller',
            'email' => 'customer@bizzhuss.com',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'status' => 'active',
            'phone' => '+1 (555) 776-8822',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        ]);

        // 2. Departments & Designations
        $depQA = Department::create([
            'name' => 'Quality Assurance',
            'slug' => 'quality-assurance',
            'description' => 'Product inspection, vendor compliance verification, and return validation.',
        ]);

        $depLogistics = Department::create([
            'name' => 'Logistics & Dispatch',
            'slug' => 'logistics-dispatch',
            'description' => 'Freight coordination, customs documentation, and carrier SLA management.',
        ]);

        $depSupport = Department::create([
            'name' => 'Vendor Relations',
            'slug' => 'vendor-relations',
            'description' => 'Supplier onboarding, catalog integrations, and dispute settlement.',
        ]);

        $depBilling = Department::create([
            'name' => 'Billing & Settlements',
            'slug' => 'billing-settlements',
            'description' => 'Platform commission calculations, ACH disbursements, and bank wire reconciliation.',
        ]);

        $desQALead = Designation::create([
            'department_id' => $depQA->id,
            'title' => 'Senior QA & Compliance Lead',
        ]);

        $desLogisticsCoord = Designation::create([
            'department_id' => $depLogistics->id,
            'title' => 'Freight Dispatch Specialist',
        ]);

        $desVendorManager = Designation::create([
            'department_id' => $depSupport->id,
            'title' => 'Merchant Account Executive',
        ]);

        // 3. Employee Records
        Employee::create([
            'user_id' => $employeeUser1->id,
            'department_id' => $depQA->id,
            'designation_id' => $desQALead->id,
            'employee_code' => 'EMP-001',
            'joining_date' => '2024-01-15',
            'status' => 'active',
        ]);

        Employee::create([
            'user_id' => $employeeUser2->id,
            'department_id' => $depLogistics->id,
            'designation_id' => $desLogisticsCoord->id,
            'employee_code' => 'EMP-002',
            'joining_date' => '2024-03-01',
            'status' => 'active',
        ]);

        // 4. Vendors
        $v1 = Vendor::create([
            'user_id' => $vendorUser1->id,
            'shop_name' => 'TechNova Dynamics',
            'slug' => 'technova-dynamics',
            'logo' => null,
            'banner' => null,
            'description' => 'Industrial edge computing, telemetry sensors, and automated manufacturing hardware.',
            'commission_rate' => 10.00,
            'bank_details' => [
                'bank_name' => 'JPMorgan Chase Commercial',
                'account_number' => '****4921',
                'routing_number' => '021000021',
                'beneficiary' => 'TechNova Dynamics Inc.',
            ],
            'status' => 'active',
        ]);

        $v2 = Vendor::create([
            'user_id' => $vendorUser2->id,
            'shop_name' => 'Artisan Craft & Studio',
            'slug' => 'artisan-craft-studio',
            'logo' => null,
            'banner' => null,
            'description' => 'Handcrafted workspace ergonomics, sustainable leather gear, and executive desk accessories.',
            'commission_rate' => 12.00,
            'bank_details' => [
                'bank_name' => 'Wells Fargo Treasury',
                'account_number' => '****8812',
                'routing_number' => '121000247',
                'beneficiary' => 'Artisan Studios LLC',
            ],
            'status' => 'active',
        ]);

        $v3 = Vendor::create([
            'user_id' => $vendorUser3->id,
            'shop_name' => 'Apex Heavy Tools',
            'slug' => 'apex-heavy-tools',
            'logo' => null,
            'banner' => null,
            'description' => 'Military-grade pneumatic equipment, precision torque wrenches, and warehouse robotics.',
            'commission_rate' => 8.50,
            'bank_details' => [
                'bank_name' => 'Bank of America Corporate',
                'account_number' => '****7301',
                'routing_number' => '026009593',
                'beneficiary' => 'Apex Tooling Group',
            ],
            'status' => 'active',
        ]);

        // 5. Vendor Payouts
        VendorPayout::create([
            'vendor_id' => $v1->id,
            'amount' => 12500.00,
            'status' => 'approved',
            'payment_method' => 'bank_wire',
            'transaction_reference' => 'WIRE-98218731',
            'notes' => 'Q3 Tier-1 Settlement approved by Admin',
        ]);

        VendorPayout::create([
            'vendor_id' => $v3->id,
            'amount' => 20000.00,
            'status' => 'approved',
            'payment_method' => 'bank_wire',
            'transaction_reference' => 'WIRE-55319802',
            'notes' => 'Bi-weekly automated disbursement',
        ]);

        VendorPayout::create([
            'vendor_id' => $v2->id,
            'amount' => 3200.00,
            'status' => 'pending',
            'payment_method' => 'ach_transfer',
            'transaction_reference' => null,
            'notes' => 'Pending monthly merchant settlement run',
        ]);

        // 6. Categories (with sub-categories)
        $catIoT = Category::create([
            'name' => 'Industrial IoT',
            'slug' => 'industrial-iot',
            'icon' => 'Cpu',
            'parent_id' => null,
        ]);

        $catHardware = Category::create([
            'name' => 'Enterprise Hardware',
            'slug' => 'enterprise-hardware',
            'icon' => 'Layers',
            'parent_id' => null,
        ]);

        $catTooling = Category::create([
            'name' => 'Heavy Tooling',
            'slug' => 'heavy-tooling',
            'icon' => 'Wrench',
            'parent_id' => null,
        ]);

        $catOffice = Category::create([
            'name' => 'Executive Office',
            'slug' => 'executive-office',
            'icon' => 'Briefcase',
            'parent_id' => null,
        ]);

        $catSensors = Category::create([
            'name' => 'Sensors & Telemetry',
            'slug' => 'sensors-telemetry',
            'icon' => 'Zap',
            'parent_id' => null,
        ]);

        // Sub-categories
        Category::create([
            'name' => 'Edge Gateways',
            'slug' => 'edge-gateways',
            'icon' => 'Cpu',
            'parent_id' => $catIoT->id,
        ]);

        Category::create([
            'name' => 'Server Racks & Enclosures',
            'slug' => 'server-racks-enclosures',
            'icon' => 'Layers',
            'parent_id' => $catHardware->id,
        ]);

        // 7. Products
        $p1 = Product::create([
            'vendor_id' => $v1->id,
            'category_id' => $catIoT->id,
            'title' => 'EdgePulse Pro IIoT Telemetry Gateway',
            'slug' => 'edgepulse-pro-iiot-telemetry-gateway',
            'sku' => 'TND-GW-901',
            'price' => 1249.00,
            'compare_price' => 1499.00,
            'stock_quantity' => 48,
            'images' => ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Ruggedized IP67 enterprise gateway with dual 5G fallback, Modbus RTU support, and real-time anomaly detection.',
            'status' => 'published',
            'is_featured' => true,
            'featured_order' => 1,
            'curation_tier' => 'flagship_featured',
            'sale_badge_label' => 'Top Flagship',
            'total_sold_count' => 142,
        ]);

        $p2 = Product::create([
            'vendor_id' => $v1->id,
            'category_id' => $catHardware->id,
            'title' => 'CyberRack 48U High-Density Server Chassis',
            'slug' => 'cyberrack-48u-high-density-server-chassis',
            'sku' => 'TND-SR-48U',
            'price' => 2850.00,
            'compare_price' => 3100.00,
            'stock_quantity' => 14,
            'images' => ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Perforated airflow rack with integrated smart PDU, environmental probes, and cryptographic cabinet locks.',
            'status' => 'published',
            'curation_tier' => 'enterprise_heavy_duty',
            'sale_badge_label' => 'Enterprise Spec',
            'total_sold_count' => 38,
        ]);

        $p3 = Product::create([
            'vendor_id' => $v1->id,
            'category_id' => $catSensors->id,
            'title' => 'VortexField High-Temp Infrared Pyrometer',
            'slug' => 'vortexfield-high-temp-infrared-pyrometer',
            'sku' => 'TND-PY-300',
            'price' => 680.00,
            'compare_price' => 750.00,
            'stock_quantity' => 85,
            'images' => ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Non-contact temperature monitoring probe rated for molten metals and chemical synthesis chambers up to 2200°C.',
            'status' => 'published',
            'curation_tier' => 'smart_value_budget',
            'sale_badge_label' => 'Smart Value',
            'total_sold_count' => 95,
        ]);

        $p4 = Product::create([
            'vendor_id' => $v2->id,
            'category_id' => $catOffice->id,
            'title' => 'Executive Full-Grain Tuscan Leather Desk Pad',
            'slug' => 'executive-full-grain-tuscan-leather-desk-pad',
            'sku' => 'ART-DP-01',
            'price' => 195.00,
            'compare_price' => 240.00,
            'stock_quantity' => 110,
            'images' => ['https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Vegetable-tanned full-grain leather with suede backing, magnetic cable anchor, and spill-resistant micro-coating.',
            'status' => 'published',
            'is_on_special_sale' => true,
            'special_sale_title' => 'Mega Flash Sale - 20% OFF',
            'curation_tier' => 'special_flash_sale',
            'discount_percentage' => 20.00,
            'flash_sale_end_time' => now()->addHours(24),
            'sale_badge_label' => 'Flash 20% Off',
            'total_sold_count' => 210,
        ]);

        $p5 = Product::create([
            'vendor_id' => $v2->id,
            'category_id' => $catOffice->id,
            'title' => 'Solid American Walnut Dual-Monitor Stand',
            'slug' => 'solid-american-walnut-dual-monitor-stand',
            'sku' => 'ART-MS-02',
            'price' => 245.00,
            'compare_price' => 290.00,
            'stock_quantity' => 62,
            'images' => ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Hand-finished sustainable walnut shelf with integrated aluminum cable tray and modular stationery slots.',
            'status' => 'published',
            'is_featured' => true,
            'featured_order' => 2,
            'curation_tier' => 'flagship_featured',
            'sale_badge_label' => 'Studio Choice',
            'total_sold_count' => 164,
        ]);

        $p6 = Product::create([
            'vendor_id' => $v3->id,
            'category_id' => $catTooling->id,
            'title' => 'TitanForce 1-Inch Cordless Brushless Impact Wrench',
            'slug' => 'titanforce-1-inch-cordless-brushless-impact-wrench',
            'sku' => 'APX-IW-100',
            'price' => 1480.00,
            'compare_price' => 1650.00,
            'stock_quantity' => 29,
            'images' => ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Delivers 2,200 ft-lbs of breakaway torque with telemetry bluetooth logging and digital shut-off torque limiter.',
            'status' => 'published',
            'is_on_special_sale' => true,
            'special_sale_title' => 'Industrial Flash Deal',
            'curation_tier' => 'special_flash_sale',
            'discount_percentage' => 15.00,
            'flash_sale_end_time' => now()->addHours(24),
            'sale_badge_label' => 'Save $170',
            'total_sold_count' => 88,
        ]);

        $p7 = Product::create([
            'vendor_id' => $v3->id,
            'category_id' => $catTooling->id,
            'title' => 'Precision OptiTorque Digital Screwdriver Suite',
            'slug' => 'precision-optitorque-digital-screwdriver-suite',
            'sku' => 'APX-TS-55',
            'price' => 920.00,
            'compare_price' => 1050.00,
            'stock_quantity' => 40,
            'images' => ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80'],
            'description' => 'Cleanroom ISO Class 4 certified electric screwdriver suite with calibrated micro-Newton accuracy.',
            'status' => 'published',
            'curation_tier' => 'enterprise_heavy_duty',
            'sale_badge_label' => 'Cleanroom Spec',
            'total_sold_count' => 52,
        ]);

        // 8. Orders & Order Items (Customer Order History with distinct statuses)
        
        // Order 1: Processing Status
        $order1 = Order::create([
            'customer_id' => $customerUser->id,
            'order_number' => 'BZH-908124',
            'total_amount' => 2729.00,
            'payment_status' => 'paid',
            'shipping_address' => [
                'recipient' => 'David Miller',
                'street' => '400 Technology Way, Dock 7',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'country' => 'USA',
            ],
            'billing_address' => [
                'company' => 'Global Corp Technologies',
                'street' => '100 Enterprise Plaza',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
            ],
            'created_at' => now()->subHours(8),
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'vendor_id' => $v1->id,
            'product_id' => $p1->id,
            'quantity' => 1,
            'unit_price' => 1249.00,
            'platform_fee' => 124.90, // 10%
            'vendor_earning' => 1124.10,
            'delivery_status' => 'processing',
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'vendor_id' => $v3->id,
            'product_id' => $p6->id,
            'quantity' => 1,
            'unit_price' => 1480.00,
            'platform_fee' => 125.80, // 8.5%
            'vendor_earning' => 1354.20,
            'delivery_status' => 'processing',
        ]);

        // Order 2: Shipped Status (In Transit)
        $order2 = Order::create([
            'customer_id' => $customerUser->id,
            'order_number' => 'BZH-881023',
            'total_amount' => 2850.00,
            'payment_status' => 'paid',
            'shipping_address' => [
                'recipient' => 'David Miller',
                'street' => '400 Technology Way, Dock 7',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'country' => 'USA',
            ],
            'billing_address' => [
                'company' => 'Global Corp Technologies',
                'street' => '100 Enterprise Plaza',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
            ],
            'created_at' => now()->subDays(3),
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'vendor_id' => $v1->id,
            'product_id' => $p2->id,
            'quantity' => 1,
            'unit_price' => 2850.00,
            'platform_fee' => 285.00,
            'vendor_earning' => 2565.00,
            'delivery_status' => 'shipped',
        ]);

        // Order 3: Delivered Status
        $order3 = Order::create([
            'customer_id' => $customerUser->id,
            'order_number' => 'BZH-762901',
            'total_amount' => 440.00,
            'payment_status' => 'paid',
            'shipping_address' => [
                'recipient' => 'David Miller',
                'street' => '400 Technology Way, Dock 7',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'country' => 'USA',
            ],
            'billing_address' => [
                'company' => 'Global Corp Technologies',
                'street' => '100 Enterprise Plaza',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
            ],
            'created_at' => now()->subDays(12),
        ]);

        OrderItem::create([
            'order_id' => $order3->id,
            'vendor_id' => $v2->id,
            'product_id' => $p4->id,
            'quantity' => 1,
            'unit_price' => 195.00,
            'platform_fee' => 23.40,
            'vendor_earning' => 171.60,
            'delivery_status' => 'delivered',
        ]);

        OrderItem::create([
            'order_id' => $order3->id,
            'vendor_id' => $v2->id,
            'product_id' => $p5->id,
            'quantity' => 1,
            'unit_price' => 245.00,
            'platform_fee' => 29.40,
            'vendor_earning' => 215.60,
            'delivery_status' => 'delivered',
        ]);

        // 9. Tasks (Workforce Management Kanban)
        Task::create([
            'title' => 'Verify Lumina Biotech FDA/CE compliance certificates',
            'description' => 'Review uploaded calibration paperwork and biological hazard safety sheets for the pending vendor application.',
            'assigned_to' => $employeeUser1->id,
            'assigned_by' => $superAdmin->id,
            'priority' => 'urgent',
            'status' => 'todo',
            'due_date' => now()->addDays(2),
        ]);

        Task::create([
            'title' => 'Coordinate freight customs clearance for Order #BZH-908124',
            'description' => 'Expedite customs import docs for the EdgePulse telemetry shipment going to Austin TX warehouse.',
            'assigned_to' => $employeeUser2->id,
            'assigned_by' => $superAdmin->id,
            'priority' => 'high',
            'status' => 'in_progress',
            'due_date' => now()->addDays(1),
        ]);

        Task::create([
            'title' => 'Audit Q3 merchant commission statements against ledger',
            'description' => 'Reconcile 10% platform fee calculations against Stripe connect merchant accounts.',
            'assigned_to' => $employeeUser1->id,
            'assigned_by' => $superAdmin->id,
            'priority' => 'medium',
            'status' => 'review',
            'due_date' => now()->addDays(4),
        ]);

        Task::create([
            'title' => 'Assist TechNova with bulk catalog CSV upload API mapping',
            'description' => 'Walk vendor operations lead through OpenAPI product batch schema and image hosting CDN sync.',
            'assigned_to' => $employeeUser2->id,
            'assigned_by' => $superAdmin->id,
            'priority' => 'medium',
            'status' => 'completed',
            'due_date' => now()->subDays(1),
        ]);

        Task::create([
            'title' => 'Inspect pneumatic tool batch for Apex Heavy Tools',
            'description' => 'Perform random torque test on TitanForce 1-inch units before releasing backorder hold.',
            'assigned_to' => $employeeUser1->id,
            'assigned_by' => $superAdmin->id,
            'priority' => 'high',
            'status' => 'in_progress',
            'due_date' => now()->addDays(3),
        ]);

        // 10. Promotional Banners for Storefront Hero Carousel
        Banner::create([
            'title' => 'Mega Tech & Hardware Expo',
            'subtitle' => 'Direct Manufacturer Pricing on Edge Gateways, Precision Tools & Server Infrastructure',
            'badge_text' => 'EXCLUSIVE 48-HOUR EVENT',
            'image_path' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
            'target_url' => '#special-sales',
            'section_key' => 'hero_carousel',
            'start_time' => now()->subDay(),
            'end_time' => now()->addDays(2),
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Banner::create([
            'title' => 'Military-Grade Industrial Tooling',
            'subtitle' => 'Torque Wrenches, Cleanroom Calibration & Pneumatics from Apex Heavy Tools',
            'badge_text' => 'OFFICIAL BRAND DAY',
            'image_path' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
            'target_url' => '/?category=heavy-tooling',
            'section_key' => 'hero_carousel',
            'start_time' => now()->subDay(),
            'end_time' => now()->addDays(5),
            'is_active' => true,
            'sort_order' => 2,
        ]);

        Banner::create([
            'title' => 'Executive Workspace & Ergonomics',
            'subtitle' => 'Handcrafted Walnut Risers & Full-Grain Tuscan Leather Gear by Artisan Craft',
            'badge_text' => 'STUDIO COLLECTION 2026',
            'image_path' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
            'target_url' => '/?category=executive-office',
            'section_key' => 'hero_carousel',
            'start_time' => now()->subDay(),
            'end_time' => now()->addDays(7),
            'is_active' => true,
            'sort_order' => 3,
        ]);

        // 11. Global Promotional Campaigns & Flash Deals
        PromotionalCampaign::create([
            'name' => 'Q4 Industrial Flash Sale Mega Event',
            'description' => 'Global merchandising campaign featuring deep manufacturer subsidies and limited-time discounts across top vendors.',
            'badge_label' => 'Special Flash Offer',
            'discount_percentage' => 25.00,
            'start_time' => now()->subHours(6),
            'end_time' => now()->addHours(18), // 18 hours remaining for live countdown
            'is_active' => true,
        ]);
    }
}
