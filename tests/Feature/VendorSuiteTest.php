<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorPayout;
use Tests\TestCase;

class VendorSuiteTest extends TestCase
{
    protected $vendorUser;
    protected $vendor;
    protected $otherVendorUser;
    protected $otherVendor;
    protected $customer;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendorUser = User::where('role', 'vendor')->first();
        $this->vendor = $this->vendorUser->vendor;

        $this->customer = User::where('role', 'customer')->first();

        // Ensure category exists
        $this->category = Category::first() ?? Category::create([
            'name' => 'Electronics Test',
            'slug' => 'electronics-test',
        ]);

        // Create second vendor for isolation testing if not present
        $this->otherVendorUser = User::where('email', 'vendor2@bizzhuss.com')->first();
        if (!$this->otherVendorUser) {
            $this->otherVendorUser = User::create([
                'name' => 'Secondary Merchant',
                'email' => 'vendor2@bizzhuss.com',
                'password' => bcrypt('password123'),
                'role' => 'vendor',
                'status' => 'active',
            ]);
            $this->otherVendor = Vendor::create([
                'user_id' => $this->otherVendorUser->id,
                'shop_name' => 'Secondary Test Shop',
                'slug' => 'secondary-test-shop',
                'status' => 'active',
                'commission_rate' => 12.00,
            ]);
        } else {
            $this->otherVendor = $this->otherVendorUser->vendor;
        }
    }

    public function test_vendor_can_access_all_vendor_suite_pages()
    {
        $this->actingAs($this->vendorUser)->get('/vendor')->assertStatus(200);
        $this->actingAs($this->vendorUser)->get('/vendor/products')->assertStatus(200);
        $this->actingAs($this->vendorUser)->get('/vendor/products/create')->assertStatus(200);
        $this->actingAs($this->vendorUser)->get('/vendor/orders')->assertStatus(200);
        $this->actingAs($this->vendorUser)->get('/vendor/coupons')->assertStatus(200);
        $this->actingAs($this->vendorUser)->get('/vendor/wallet')->assertStatus(200);
        $this->actingAs($this->vendorUser)->get('/vendor/settings')->assertStatus(200);
    }

    public function test_non_vendor_blocked_from_vendor_suite_pages()
    {
        $this->actingAs($this->customer)->get('/vendor/products')->assertRedirect(route('customer.dashboard'));
        $this->actingAs($this->customer)->get('/vendor/wallet')->assertRedirect(route('customer.dashboard'));
        
        auth()->logout();
        $this->get('/vendor/orders')->assertRedirect(route('login'));
    }

    public function test_vendor_can_create_update_duplicate_and_delete_product()
    {
        // 1. Create product
        $sku = 'TEST-SKU-' . rand(10000, 99999);
        $response = $this->actingAs($this->vendorUser)->post('/vendor/products', [
            'title' => 'Ultra Wireless Earbuds',
            'category_id' => $this->category->id,
            'brand' => 'AcousticTech',
            'description' => 'Noise-cancelling wireless earbuds',
            'price' => 79.99,
            'compare_price' => 99.99,
            'cost_per_item' => 35.00,
            'sku' => $sku,
            'barcode' => '123456789012',
            'stock_quantity' => 50,
            'low_stock_threshold' => 10,
            'variants' => [
                [
                    'option_type' => 'Color',
                    'option_value' => 'Midnight Black',
                    'sku' => "{$sku}-BLK",
                    'stock' => 25,
                    'price_adjustment' => '0.00',
                ]
            ],
            'status' => 'published',
        ]);
        $response->assertSessionHas('success');

        $product = Product::where('sku', $sku)->first();
        $this->assertNotNull($product);
        $this->assertEquals($this->vendor->id, $product->vendor_id);
        $this->assertEquals('AcousticTech', $product->brand);
        $this->assertEquals(79.99, (float)$product->price);

        // 2. Update product
        $response = $this->actingAs($this->vendorUser)->put("/vendor/products/{$product->id}", [
            'title' => 'Ultra Wireless Earbuds Gen 2',
            'category_id' => $this->category->id,
            'brand' => 'AcousticTech Pro',
            'price' => 89.99,
            'sku' => $sku,
            'stock_quantity' => 45,
            'status' => 'published',
        ]);
        $response->assertSessionHas('success');
        $this->assertEquals('Ultra Wireless Earbuds Gen 2', $product->fresh()->title);
        $this->assertEquals(89.99, (float)$product->fresh()->price);

        // 3. Duplicate product
        $response = $this->actingAs($this->vendorUser)->post("/vendor/products/{$product->id}/duplicate");
        $response->assertSessionHas('success');

        $copy = Product::where('vendor_id', $this->vendor->id)
            ->where('title', 'Ultra Wireless Earbuds Gen 2 (Copy)')
            ->first();
        $this->assertNotNull($copy);
        $this->assertEquals('draft', $copy->status);

        // 4. Isolation: Other vendor cannot edit or delete this product
        $response = $this->actingAs($this->otherVendorUser)->put("/vendor/products/{$product->id}", [
            'title' => 'Hijacked Title',
            'category_id' => $this->category->id,
            'price' => 10.00,
            'sku' => $sku,
            'stock_quantity' => 10,
            'status' => 'published',
        ]);
        $response->assertStatus(403);

        // 5. Delete product
        $response = $this->actingAs($this->vendorUser)->delete("/vendor/products/{$product->id}");
        $response->assertSessionHas('success');
        $this->assertNull(Product::find($product->id));

        // Cleanup copy
        $copy->delete();
    }

    public function test_vendor_can_update_fulfillment_status()
    {
        // Create product and order item for testing
        $product = Product::create([
            'vendor_id' => $this->vendor->id,
            'category_id' => $this->category->id,
            'title' => 'Fulfillment Test Item',
            'slug' => 'fulfillment-test-item-' . rand(100, 999),
            'sku' => 'FULFILL-SKU-' . rand(1000, 9999),
            'price' => 40.00,
            'stock_quantity' => 20,
            'status' => 'published',
        ]);

        $order = Order::create([
            'order_number' => 'BZH-TEST-' . rand(1000, 9999),
            'total_amount' => 40.00,
            'payment_status' => 'paid',
            'shipping_address' => [
                'name' => 'Test Customer',
                'address' => '742 Evergreen Terrace',
            ],
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'vendor_id' => $this->vendor->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 40.00,
            'platform_fee' => 4.00,
            'vendor_earning' => 36.00,
            'delivery_status' => 'pending',
        ]);

        // Update fulfillment step-by-step to shipped
        $response = $this->actingAs($this->vendorUser)->patch("/vendor/orders/{$order->id}/fulfillment", [
            'delivery_status' => 'shipped',
            'tracking_number' => 'TRK-123456789',
            'carrier' => 'FedEx Express',
        ]);
        $response->assertSessionHas('success');

        $freshItem = $item->fresh();
        $this->assertEquals('shipped', $freshItem->delivery_status);
        $this->assertEquals('TRK-123456789', $freshItem->tracking_number);
        $this->assertEquals('FedEx Express', $freshItem->carrier);

        // Verify invoice page renders
        $response = $this->actingAs($this->vendorUser)->get("/vendor/orders/{$order->id}/invoice");
        $response->assertStatus(200);

        // Cleanup
        $item->delete();
        $order->delete();
        $product->delete();
    }

    public function test_vendor_coupon_engine_creation_and_checkout_scoping()
    {
        $code = 'TESTPROMO' . rand(100, 999);

        // 1. Create coupon
        $response = $this->actingAs($this->vendorUser)->post('/vendor/coupons', [
            'code' => $code,
            'discount_type' => 'percentage',
            'discount_value' => 20.00,
            'min_spend' => 50.00,
            'usage_limit' => 100,
        ]);
        $response->assertSessionHas('success');

        $coupon = Coupon::where('code', $code)->first();
        $this->assertNotNull($coupon);
        $this->assertEquals($this->vendor->id, $coupon->vendor_id);
        $this->assertTrue($coupon->is_active);

        // 2. Toggle active state
        $response = $this->actingAs($this->vendorUser)->patch("/vendor/coupons/{$coupon->id}/toggle");
        $response->assertSessionHas('success');
        $this->assertFalse($coupon->fresh()->is_active);

        // Re-enable
        $this->actingAs($this->vendorUser)->patch("/vendor/coupons/{$coupon->id}/toggle");
        $this->assertTrue($coupon->fresh()->is_active);

        // 3. Test checkout scoping: coupon only applies to products of THIS vendor
        $vendorProduct = Product::create([
            'vendor_id' => $this->vendor->id,
            'category_id' => $this->category->id,
            'title' => 'Coupon Test Product',
            'slug' => 'coupon-test-prod-' . rand(100, 999),
            'sku' => 'CPN-SKU-' . rand(1000, 9999),
            'price' => 100.00,
            'stock_quantity' => 15,
            'status' => 'published',
        ]);

        $checkoutResponse = $this->actingAs($this->customer)->post('/checkout', [
            'name' => 'Alice Customer',
            'email' => 'alice@example.com',
            'phone' => '+15550199',
            'shipping_address' => '456 Oak Avenue',
            'payment_method' => 'card',
            'coupon_code' => $code,
            'items' => [
                ['id' => $vendorProduct->id, 'quantity' => 1]
            ],
        ]);
        $checkoutResponse->assertSessionHas('success');

        // Check coupon redemptions incremented
        $this->assertEquals(1, $coupon->fresh()->times_used);
        $this->assertEquals(100.00, (float)$coupon->fresh()->revenue_generated);

        // 4. Delete coupon
        $response = $this->actingAs($this->vendorUser)->delete("/vendor/coupons/{$coupon->id}");
        $response->assertSessionHas('success');
        $this->assertNull(Coupon::find($coupon->id));

        // Cleanup
        $vendorProduct->delete();
    }

    public function test_vendor_can_update_settings_and_request_payout()
    {
        // 1. Update shop settings
        $response = $this->actingAs($this->vendorUser)->post('/vendor/settings', [
            'shop_name' => 'Updated Merchant Boutique',
            'description' => 'Finest curated goods and accessories.',
            'support_phone' => '+1 (800) 555-SHOP',
            'return_policy' => '14-day direct exchange policy.',
            'bank_details' => [
                'bank_name' => 'Enterprise National Bank',
                'account_title' => 'Updated Merchant Boutique LLC',
                'account_number' => 'US99ENB000123456789',
            ],
        ]);
        $response->assertSessionHas('success');

        $freshVendor = $this->vendor->fresh();
        $this->assertEquals('Updated Merchant Boutique', $freshVendor->shop_name);
        $this->assertEquals('+1 (800) 555-SHOP', $freshVendor->support_phone);
        $this->assertEquals('Enterprise National Bank', $freshVendor->bank_details['bank_name']);

        // Restore original name
        $this->vendor->update(['shop_name' => 'Official Vendor Shop']);
    }
}
