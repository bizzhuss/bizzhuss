<?php

namespace App\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class DemoCatalogService
{
    /**
     * Get fallback categories for storefront and navigation.
     */
    public static function categories(): Collection
    {
        return collect([
            (object) [
                'id' => 1,
                'name' => 'Industrial Machinery & Tools',
                'slug' => 'industrial-machinery',
                'icon' => 'Wrench',
                'description' => 'Heavy manufacturing equipment, precision tools, and tooling hardware.',
                'products_count' => 24,
                'is_featured' => true,
                'is_active' => true,
                'order' => 1,
                'subcategories' => collect([
                    (object) ['id' => 101, 'name' => 'Pneumatics & Compressors', 'slug' => 'pneumatics', 'products_count' => 12, 'is_active' => true],
                    (object) ['id' => 102, 'name' => 'Precision CNC Tooling', 'slug' => 'cnc-tooling', 'products_count' => 8, 'is_active' => true],
                    (object) ['id' => 103, 'name' => 'Torque & Calibration', 'slug' => 'torque-tools', 'products_count' => 4, 'is_active' => true],
                ]),
            ],
            (object) [
                'id' => 2,
                'name' => 'Enterprise Hardware & Edge IT',
                'slug' => 'enterprise-hardware',
                'icon' => 'Cpu',
                'description' => 'Rackmount servers, edge compute nodes, and gigabit switching.',
                'products_count' => 38,
                'is_featured' => true,
                'is_active' => true,
                'order' => 2,
                'subcategories' => collect([
                    (object) ['id' => 104, 'name' => '1U/2U Rack Servers', 'slug' => 'rack-servers', 'products_count' => 18, 'is_active' => true],
                    (object) ['id' => 105, 'name' => 'Managed Core Switches', 'slug' => 'network-switches', 'products_count' => 14, 'is_active' => true],
                    (object) ['id' => 106, 'name' => 'Edge IoT Gateways', 'slug' => 'iot-gateways', 'products_count' => 6, 'is_active' => true],
                ]),
            ],
            (object) [
                'id' => 3,
                'name' => 'Executive Office & Studio Tech',
                'slug' => 'executive-office',
                'icon' => 'Briefcase',
                'description' => 'Ergonomic studio workstations, solid hardwood desk risers, and acoustic panels.',
                'products_count' => 19,
                'is_featured' => true,
                'is_active' => true,
                'order' => 3,
                'subcategories' => collect([
                    (object) ['id' => 107, 'name' => 'Motorized Sit-Stand Desks', 'slug' => 'sit-stand-desks', 'products_count' => 9, 'is_active' => true],
                    (object) ['id' => 108, 'name' => 'Ergonomic Task Chairs', 'slug' => 'task-chairs', 'products_count' => 6, 'is_active' => true],
                    (object) ['id' => 109, 'name' => 'Acoustic Desk Barriers', 'slug' => 'acoustic-panels', 'products_count' => 4, 'is_active' => true],
                ]),
            ],
            (object) [
                'id' => 4,
                'name' => 'Commercial Power & Energy',
                'slug' => 'commercial-power',
                'icon' => 'Zap',
                'description' => 'Three-phase uninterrupted power supplies, solar inverters, and battery banks.',
                'products_count' => 15,
                'is_featured' => true,
                'is_active' => true,
                'order' => 4,
                'subcategories' => collect([
                    (object) ['id' => 110, 'name' => 'Modular Online UPS', 'slug' => 'modular-ups', 'products_count' => 8, 'is_active' => true],
                    (object) ['id' => 111, 'name' => 'Hybrid Inverters', 'slug' => 'hybrid-inverters', 'products_count' => 7, 'is_active' => true],
                ]),
            ],
            (object) [
                'id' => 5,
                'name' => 'Packaging & Freight Logistics',
                'slug' => 'packaging-logistics',
                'icon' => 'Package',
                'description' => 'Heavy-duty corrugated containers, tamper-proof security seals, and strapping.',
                'products_count' => 22,
                'is_featured' => true,
                'is_active' => true,
                'order' => 5,
                'subcategories' => collect([
                    (object) ['id' => 112, 'name' => 'Reinforced Pallets', 'slug' => 'pallets', 'products_count' => 11, 'is_active' => true],
                    (object) ['id' => 113, 'name' => 'Thermal Shipping Labels', 'slug' => 'shipping-labels', 'products_count' => 11, 'is_active' => true],
                ]),
            ],
        ]);
    }

    /**
     * Get fallback featured vendors.
     */
    public static function vendors(): Collection
    {
        return collect([
            (object) [
                'id' => 1,
                'shop_name' => 'Apex Heavy Industrial',
                'slug' => 'apex-heavy-industrial',
                'logo' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.9,
                'verified' => true,
                'commission_rate' => 10,
                'status' => 'active',
            ],
            (object) [
                'id' => 2,
                'shop_name' => 'CyberCore Edge Systems',
                'slug' => 'cybercore-systems',
                'logo' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.8,
                'verified' => true,
                'commission_rate' => 12,
                'status' => 'active',
            ],
            (object) [
                'id' => 3,
                'shop_name' => 'Volta Power Grid Works',
                'slug' => 'volta-power',
                'logo' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.95,
                'verified' => true,
                'commission_rate' => 8,
                'status' => 'active',
            ],
            (object) [
                'id' => 4,
                'shop_name' => 'Artisan Craft Studio',
                'slug' => 'artisan-craft',
                'logo' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&auto=format&fit=crop&q=80',
                'rating' => 4.75,
                'verified' => true,
                'commission_rate' => 15,
                'status' => 'active',
            ],
        ]);
    }

    /**
     * Get fallback hero carousel promotional banners.
     */
    public static function banners(): Collection
    {
        return collect([
            (object) [
                'id' => 1,
                'title' => 'Mega Tech & Hardware Expo',
                'subtitle' => 'Direct Manufacturer Pricing on Edge Gateways, Precision Tools & Server Infrastructure',
                'tag' => 'EXCLUSIVE 48-HOUR EVENT',
                'discount' => 'Up to 45% OFF',
                'bgGradient' => 'from-slate-950 via-slate-900 to-indigo-950',
                'cta_text' => 'Shop Flash Deals',
                'cta_link' => '/shop',
                'image' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
            ],
            (object) [
                'id' => 2,
                'title' => 'Military-Grade Industrial Tooling',
                'subtitle' => 'Torque Wrenches, Cleanroom Calibration & Pneumatics from Apex Heavy Tools',
                'tag' => 'OFFICIAL BRAND DAY',
                'discount' => 'Free Freight Included',
                'bgGradient' => 'from-amber-950 via-slate-900 to-stone-900',
                'cta_text' => 'Explore Apex Catalog',
                'cta_link' => '/shop?category=industrial-machinery',
                'image' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
            ],
            (object) [
                'id' => 3,
                'title' => 'Executive Workspace & Ergonomics',
                'subtitle' => 'Handcrafted Walnut Risers & Full-Grain Tuscan Leather Gear by Artisan Craft',
                'tag' => 'STUDIO COLLECTION 2026',
                'discount' => 'Starting at Rs. 15,000',
                'bgGradient' => 'from-slate-900 via-stone-900 to-emerald-950',
                'cta_text' => 'View Workspace Gear',
                'cta_link' => '/shop?category=executive-office',
                'image' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
            ],
        ]);
    }

    /**
     * Get fallback product catalog.
     */
    public static function products(): Collection
    {
        return collect([
            (object) [
                'id' => 1,
                'title' => 'Apex Pro Industrial Torque Multiplier Wrench (3500 Nm)',
                'slug' => 'apex-pro-industrial-torque-multiplier-wrench',
                'description' => 'Heavy-duty planetary gear torque multiplier built from forged chrome-vanadium steel. Designed for mining, oil rigs, and aerospace assembly lines.',
                'price' => 84900.00,
                'compare_price' => 105000.00,
                'stock_quantity' => 28,
                'sku' => 'APX-TRQ-3500',
                'images' => ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'flagship_featured',
                'is_featured' => true,
                'is_on_special_sale' => false,
                'total_sold_count' => 142,
                'rating' => 4.9,
                'reviews_count' => 38,
                'category_id' => 1,
                'category' => (object) ['id' => 1, 'name' => 'Industrial Machinery & Tools', 'slug' => 'industrial-machinery'],
                'vendor_id' => 1,
                'vendor' => (object) ['id' => 1, 'shop_name' => 'Apex Heavy Industrial', 'logo' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150', 'status' => 'active', 'commission_rate' => 10],
            ],
            (object) [
                'id' => 2,
                'title' => 'CyberCore Quantum-1000 1U Rackmount Server (Dual EPYC 9654)',
                'slug' => 'cybercore-quantum-1000-1u-rackmount-server',
                'description' => 'Ultra-dense 1U datacenter compute platform equipped with 192 cores, 1.5TB DDR5 ECC RAM, and redundant titanium-rated 1600W hot-swap power supplies.',
                'price' => 1250000.00,
                'compare_price' => 1400000.00,
                'stock_quantity' => 15,
                'sku' => 'CC-SRV-1U-9654',
                'images' => ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'flagship_featured',
                'is_featured' => true,
                'is_on_special_sale' => true,
                'total_sold_count' => 64,
                'rating' => 5.0,
                'reviews_count' => 19,
                'category_id' => 2,
                'category' => (object) ['id' => 2, 'name' => 'Enterprise Hardware & Edge IT', 'slug' => 'enterprise-hardware'],
                'vendor_id' => 2,
                'vendor' => (object) ['id' => 2, 'shop_name' => 'CyberCore Edge Systems', 'logo' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150', 'status' => 'active', 'commission_rate' => 12],
            ],
            (object) [
                'id' => 3,
                'title' => 'Volta GridGuard 10kVA Online Double-Conversion 3-Phase UPS',
                'slug' => 'volta-gridguard-10kva-online-ups',
                'description' => 'Zero-transfer-time enterprise power protection system with hot-swappable lithium iron phosphate battery cartridges and SNMP network management.',
                'price' => 345000.00,
                'compare_price' => 389000.00,
                'stock_quantity' => 22,
                'sku' => 'VLT-UPS-10KVA',
                'images' => ['https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'special_flash_sale',
                'is_featured' => true,
                'is_on_special_sale' => true,
                'total_sold_count' => 88,
                'rating' => 4.85,
                'reviews_count' => 27,
                'category_id' => 4,
                'category' => (object) ['id' => 4, 'name' => 'Commercial Power & Energy', 'slug' => 'commercial-power'],
                'vendor_id' => 3,
                'vendor' => (object) ['id' => 3, 'shop_name' => 'Volta Power Grid Works', 'logo' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150', 'status' => 'active', 'commission_rate' => 8],
            ],
            (object) [
                'id' => 4,
                'title' => 'Artisan Craft Master Solid American Walnut Dual-Tier Desk Shelf',
                'slug' => 'artisan-craft-solid-walnut-desk-shelf',
                'description' => 'Architect-grade solid American black walnut desk organizer shelf with brushed aerospace aluminum chassis and integrated MagSafe charging dock.',
                'price' => 42000.00,
                'compare_price' => 49000.00,
                'stock_quantity' => 45,
                'sku' => 'ART-DSK-WLNT',
                'images' => ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'flagship_featured',
                'is_featured' => true,
                'is_on_special_sale' => false,
                'total_sold_count' => 210,
                'rating' => 4.95,
                'reviews_count' => 64,
                'category_id' => 3,
                'category' => (object) ['id' => 3, 'name' => 'Executive Office & Studio Tech', 'slug' => 'executive-office'],
                'vendor_id' => 4,
                'vendor' => (object) ['id' => 4, 'shop_name' => 'Artisan Craft Studio', 'logo' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150', 'status' => 'active', 'commission_rate' => 15],
            ],
            (object) [
                'id' => 5,
                'title' => 'LogiPack Heavy-Duty Thermal Shipping Label Printer (300 DPI Industrial)',
                'slug' => 'logipack-thermal-shipping-label-printer',
                'description' => 'High-throughput direct thermal barcode and shipping label printer rated for continuous 24/7 fulfillment warehouse operations.',
                'price' => 36500.00,
                'compare_price' => 44000.00,
                'stock_quantity' => 50,
                'sku' => 'LGP-LBL-300',
                'images' => ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'smart_value_budget',
                'is_featured' => false,
                'is_on_special_sale' => true,
                'total_sold_count' => 310,
                'rating' => 4.7,
                'reviews_count' => 52,
                'category_id' => 5,
                'category' => (object) ['id' => 5, 'name' => 'Packaging & Freight Logistics', 'slug' => 'packaging-logistics'],
                'vendor_id' => 1,
                'vendor' => (object) ['id' => 1, 'shop_name' => 'Apex Heavy Industrial', 'logo' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150', 'status' => 'active', 'commission_rate' => 10],
            ],
            (object) [
                'id' => 6,
                'title' => 'CyberCore 48-Port Layer-3 Managed 10G PoE++ Network Switch',
                'slug' => 'cybercore-48-port-managed-10g-poe-switch',
                'description' => 'Carrier-grade switching with 48x 2.5GbE PoE++ ports (90W per port) and 4x 25G SFP28 uplink slots with redundant power supplies.',
                'price' => 285000.00,
                'compare_price' => 320000.00,
                'stock_quantity' => 18,
                'sku' => 'CC-SW-48P-10G',
                'images' => ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'enterprise_heavy_duty',
                'is_featured' => true,
                'is_on_special_sale' => false,
                'total_sold_count' => 45,
                'rating' => 4.9,
                'reviews_count' => 14,
                'category_id' => 2,
                'category' => (object) ['id' => 2, 'name' => 'Enterprise Hardware & Edge IT', 'slug' => 'enterprise-hardware'],
                'vendor_id' => 2,
                'vendor' => (object) ['id' => 2, 'shop_name' => 'CyberCore Edge Systems', 'logo' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150', 'status' => 'active', 'commission_rate' => 12],
            ],
            (object) [
                'id' => 7,
                'title' => 'Artisan Craft Aerocore Ergonomic Carbon-Fiber Executive Task Chair',
                'slug' => 'artisan-craft-aerocore-executive-task-chair',
                'description' => 'Precision synchronous-tilt mechanism with Italian top-grain leather headrest, dynamic lumbar tracking, and breathable woven membrane.',
                'price' => 118000.00,
                'compare_price' => 135000.00,
                'stock_quantity' => 30,
                'sku' => 'ART-CHR-AERO',
                'images' => ['https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'flagship_featured',
                'is_featured' => true,
                'is_on_special_sale' => false,
                'total_sold_count' => 92,
                'rating' => 4.9,
                'reviews_count' => 31,
                'category_id' => 3,
                'category' => (object) ['id' => 3, 'name' => 'Executive Office & Studio Tech', 'slug' => 'executive-office'],
                'vendor_id' => 4,
                'vendor' => (object) ['id' => 4, 'shop_name' => 'Artisan Craft Studio', 'logo' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150', 'status' => 'active', 'commission_rate' => 15],
            ],
            (object) [
                'id' => 8,
                'title' => 'Apex Industrial Cleanroom Laser Particle Counter (0.1µm Sensitivity)',
                'slug' => 'apex-industrial-cleanroom-laser-particle-counter',
                'description' => 'ISO 21501-4 compliant airborne particle counter with integrated flow sensor, HEPA exhaust filter, and Wi-Fi audit data streaming.',
                'price' => 495000.00,
                'compare_price' => 550000.00,
                'stock_quantity' => 10,
                'sku' => 'APX-LSR-01UM',
                'images' => ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'curation_tier' => 'enterprise_heavy_duty',
                'is_featured' => false,
                'is_on_special_sale' => false,
                'total_sold_count' => 28,
                'rating' => 4.95,
                'reviews_count' => 9,
                'category_id' => 1,
                'category' => (object) ['id' => 1, 'name' => 'Industrial Machinery & Tools', 'slug' => 'industrial-machinery'],
                'vendor_id' => 1,
                'vendor' => (object) ['id' => 1, 'shop_name' => 'Apex Heavy Industrial', 'logo' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150', 'status' => 'active', 'commission_rate' => 10],
            ],
        ]);
    }

    /**
     * Get paginated fallback products for shop.
     */
    public static function paginateProducts(int $perPage = 12): LengthAwarePaginator
    {
        $items = static::products();
        return new LengthAwarePaginator(
            $items->forPage(1, $perPage)->values(),
            $items->count(),
            $perPage,
            1,
            ['path' => url('/shop')]
        );
    }
}
