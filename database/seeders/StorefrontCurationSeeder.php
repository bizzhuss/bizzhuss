<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StorefrontCurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendor = Vendor::where('status', 'active')->first();
        if (!$vendor) {
            return;
        }

        $categories = Category::all()->keyBy('slug');
        $defaultCat = Category::first();

        $curatedProducts = [
            [
                'title' => 'EdgePulse Pro IIoT Telemetry Gateway',
                'slug' => 'edgepulse-pro-iiot-telemetry-gateway',
                'sku' => 'TND-GW-901',
                'category_slug' => 'industrial-iot',
                'brand' => 'TechNova Dynamics',
                'price' => 1249.00,
                'compare_price' => 1599.00,
                'stock_quantity' => 48,
                'is_featured' => true,
                'featured_order' => 1,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Mega Eid Deal - 22% OFF',
                'total_sold_count' => 158,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Ruggedized IP67 enterprise gateway with dual 5G fallback and Modbus RTU telemetry support.',
            ],
            [
                'title' => 'CyberRack 48U High-Density Server Chassis',
                'slug' => 'cyberrack-48u-high-density-server-chassis',
                'sku' => 'TND-SR-48U',
                'category_slug' => 'enterprise-hardware',
                'brand' => 'TechNova Dynamics',
                'price' => 2850.00,
                'compare_price' => 3300.00,
                'stock_quantity' => 14,
                'is_featured' => true,
                'featured_order' => 2,
                'is_on_special_sale' => false,
                'special_sale_title' => null,
                'total_sold_count' => 46,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Perforated airflow server rack with integrated smart PDU and digital environmental sensors.',
            ],
            [
                'title' => 'TitanForce 1-Inch Cordless Brushless Impact Wrench',
                'slug' => 'titanforce-1-inch-cordless-brushless-impact-wrench',
                'sku' => 'APX-IW-100',
                'category_slug' => 'heavy-tooling',
                'brand' => 'Apex Heavy Tools',
                'price' => 1480.00,
                'compare_price' => 1750.00,
                'stock_quantity' => 28,
                'is_featured' => true,
                'featured_order' => 3,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Clearance 15% Off',
                'total_sold_count' => 112,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Heavy industrial torque output up to 2,400 Nm with dual 20V Li-Ion battery pack.',
            ],
            [
                'title' => 'Precision OptiTorque Digital Screwdriver Suite',
                'slug' => 'precision-optitorque-digital-screwdriver-suite',
                'sku' => 'APX-TS-55',
                'category_slug' => 'heavy-tooling',
                'brand' => 'Apex Heavy Tools',
                'price' => 920.00,
                'compare_price' => 1150.00,
                'stock_quantity' => 40,
                'is_featured' => true,
                'featured_order' => 4,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Factory Direct Special',
                'total_sold_count' => 84,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Cleanroom ISO Class 4 certified electric torque screwdriver suite with digital telemetry calibration.',
            ],
            [
                'title' => 'Executive Full-Grain Tuscan Leather Desk Pad',
                'slug' => 'executive-full-grain-tuscan-leather-desk-pad',
                'sku' => 'AC-DP-01',
                'category_slug' => 'executive-office',
                'brand' => 'Artisan Craft',
                'price' => 195.00,
                'compare_price' => 245.00,
                'stock_quantity' => 65,
                'is_featured' => true,
                'featured_order' => 5,
                'is_on_special_sale' => false,
                'special_sale_title' => null,
                'total_sold_count' => 230,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Handcrafted vegetable-tanned Tuscan leather desk pad with microsuede non-slip backing.',
            ],
            [
                'title' => 'Solid American Walnut Dual-Monitor Stand',
                'slug' => 'solid-american-walnut-dual-monitor-stand',
                'sku' => 'AC-MS-02',
                'category_slug' => 'executive-office',
                'brand' => 'Artisan Craft',
                'price' => 245.00,
                'compare_price' => 310.00,
                'stock_quantity' => 30,
                'is_featured' => false,
                'featured_order' => 0,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Flash 48h Offer',
                'total_sold_count' => 140,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Hand-finished sustainable walnut shelf with integrated aluminum cable tray and brass risers.',
            ],
            [
                'title' => 'VortexField High-Temp Infrared Pyrometer',
                'slug' => 'vortexfield-high-temp-infrared-pyrometer',
                'sku' => 'TND-PY-300',
                'category_slug' => 'industrial-iot',
                'brand' => 'TechNova Dynamics',
                'price' => 680.00,
                'compare_price' => 820.00,
                'stock_quantity' => 85,
                'is_featured' => false,
                'featured_order' => 0,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Limited Stock Deal',
                'total_sold_count' => 95,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Non-contact temperature monitoring probe rated for molten metals up to 1800°C.',
            ],
            [
                'title' => 'Ergonomic Precision Magnetic Bit Set 64-in-1',
                'slug' => 'ergonomic-precision-magnetic-bit-set-64-in-1',
                'sku' => 'APX-BT-64',
                'category_slug' => 'heavy-tooling',
                'brand' => 'Apex Heavy Tools',
                'price' => 45.00,
                'compare_price' => 65.00,
                'stock_quantity' => 150,
                'is_featured' => false,
                'featured_order' => 0,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Clearance 30% Off',
                'total_sold_count' => 310,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
                'description' => 'S2 alloy steel precision screwdriver bits with CNC machined aluminum swivel driver.',
            ],
            [
                'title' => 'UltraFast Wireless Barcode & RFID Scanner',
                'slug' => 'ultrafast-wireless-barcode-rfid-scanner',
                'sku' => 'TND-RF-40',
                'category_slug' => 'industrial-iot',
                'brand' => 'TechNova Dynamics',
                'price' => 490.00,
                'compare_price' => 620.00,
                'stock_quantity' => 72,
                'is_featured' => true,
                'featured_order' => 6,
                'is_on_special_sale' => false,
                'special_sale_title' => null,
                'total_sold_count' => 180,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'],
                'description' => 'High-speed wireless warehouse scanner with Bluetooth LE 5.3 telemetry and IP65 drop rating.',
            ],
            [
                'title' => 'Industrial Anti-Static Cleanroom Wristband & Mat Kit',
                'slug' => 'industrial-anti-static-cleanroom-wristband-mat-kit',
                'sku' => 'APX-ESD-10',
                'category_slug' => 'heavy-tooling',
                'brand' => 'Apex Heavy Tools',
                'price' => 38.00,
                'compare_price' => 55.00,
                'stock_quantity' => 200,
                'is_featured' => false,
                'featured_order' => 0,
                'is_on_special_sale' => false,
                'special_sale_title' => null,
                'total_sold_count' => 420,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'],
                'description' => 'ESD dissipative work mat with dual ground cords and conductive wrist strap for sensitive assembly.',
            ],
            [
                'title' => 'Modular Aluminum Server Cabinet 24U Silent Acoustic',
                'slug' => 'modular-aluminum-server-cabinet-24u-silent-acoustic',
                'sku' => 'TND-SC-24U',
                'category_slug' => 'enterprise-hardware',
                'brand' => 'TechNova Dynamics',
                'price' => 1950.00,
                'compare_price' => 2200.00,
                'stock_quantity' => 18,
                'is_featured' => true,
                'featured_order' => 7,
                'is_on_special_sale' => false,
                'special_sale_title' => null,
                'total_sold_count' => 32,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Sound-dampening acoustic lining with ultra-quiet 120mm exhaust fans and integrated thermostat.',
            ],
            [
                'title' => 'Executive Ergonomic Top-Grain Leather Task Chair',
                'slug' => 'executive-ergonomic-top-grain-leather-task-chair',
                'sku' => 'AC-CH-09',
                'category_slug' => 'executive-office',
                'brand' => 'Artisan Craft',
                'price' => 1120.00,
                'compare_price' => 1350.00,
                'stock_quantity' => 25,
                'is_featured' => false,
                'featured_order' => 0,
                'is_on_special_sale' => true,
                'special_sale_title' => 'Mega Eid Deal - $230 OFF',
                'total_sold_count' => 78,
                'status' => 'published',
                'images' => ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80'],
                'description' => 'Dynamic lumbar support with synchron-tilt mechanism and polished die-cast aluminum frame.',
            ],
        ];

        foreach ($curatedProducts as $data) {
            $cat = $categories->get($data['category_slug']) ?? $defaultCat;
            unset($data['category_slug']);
            $data['vendor_id'] = $vendor->id;
            $data['category_id'] = $cat?->id ?? 1;

            Product::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
