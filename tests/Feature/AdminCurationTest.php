<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCurationTest extends TestCase
{
    private function getSuperAdmin(): User
    {
        return User::firstOrCreate(
            ['email' => 'superadmin@bizzhuss.com'],
            [
                'name' => 'Super Administrator',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
            ]
        );
    }

    private function getVendorUser(): User
    {
        return User::firstOrCreate(
            ['email' => 'vendor@bizzhuss.com'],
            [
                'name' => 'Vendor Test User',
                'password' => bcrypt('password'),
                'role' => 'vendor',
            ]
        );
    }

    private function getCustomerUser(): User
    {
        return User::firstOrCreate(
            ['email' => 'customer@bizzhuss.com'],
            [
                'name' => 'Customer Test User',
                'password' => bcrypt('password'),
                'role' => 'customer',
            ]
        );
    }

    private function getProduct(): Product
    {
        $product = Product::whereHas('vendor', fn ($q) => $q->where('status', 'active'))->first();
        if ($product) {
            return $product;
        }

        $vendorUser = $this->getVendorUser();
        $vendor = Vendor::firstOrCreate(
            ['user_id' => $vendorUser->id],
            [
                'shop_name' => 'Curation Test Store',
                'slug' => 'curation-test-store',
                'status' => 'active',
                'commission_rate' => 10.0,
            ]
        );

        $category = Category::firstOrCreate(
            ['slug' => 'test-curation-cat'],
            [
                'name' => 'Curation Category',
                'is_active' => true,
                'order' => 1,
            ]
        );

        return Product::create([
            'vendor_id' => $vendor->id,
            'category_id' => $category->id,
            'title' => 'Test Curation Product',
            'slug' => 'test-curation-product-' . time(),
            'price' => 100.0,
            'compare_price' => 120.0,
            'stock_quantity' => 50,
            'status' => 'published',
            'is_featured' => false,
            'is_on_special_sale' => false,
            'total_sold_count' => 0,
        ]);
    }

    /**
     * Super Admin can access Storefront Curation Suite.
     */
    public function test_super_admin_can_access_curation_suite(): void
    {
        $admin = $this->getSuperAdmin();

        $this->actingAs($admin)
            ->get(route('admin.curation.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Curation')
                ->has('products')
                ->has('metrics')
                ->has('categories')
            );
    }

    /**
     * Non-admin roles are forbidden or redirected.
     */
    public function test_non_admin_cannot_access_curation_suite(): void
    {
        $customer = $this->getCustomerUser();
        $this->actingAs($customer)
            ->get(route('admin.curation.index'))
            ->assertStatus(403);

        $vendor = $this->getVendorUser();
        $this->actingAs($vendor)
            ->get(route('admin.curation.index'))
            ->assertStatus(403);
    }

    /**
     * Super Admin can toggle Featured status.
     */
    public function test_super_admin_can_toggle_featured(): void
    {
        $admin = $this->getSuperAdmin();
        $product = $this->getProduct();

        $initial = (bool) $product->is_featured;

        $response = $this->actingAs($admin)
            ->post(route('admin.curation.toggleFeatured', $product), [
                'is_featured' => !$initial,
                'featured_order' => 5,
            ]);

        $response->assertSessionHas('success');
        $product->refresh();
        $this->assertEquals(!$initial, (bool) $product->is_featured);
        $this->assertEquals(5, $product->featured_order);
    }

    /**
     * Super Admin can toggle Special Sale offer.
     */
    public function test_super_admin_can_toggle_special_sale(): void
    {
        $admin = $this->getSuperAdmin();
        $product = $this->getProduct();

        $response = $this->actingAs($admin)
            ->post(route('admin.curation.toggleSpecialSale', $product), [
                'is_on_special_sale' => true,
                'special_sale_title' => 'Super Flash Deal',
                'compare_price' => 1999.00,
            ]);

        $response->assertSessionHas('success');
        $product->refresh();
        $this->assertTrue((bool) $product->is_on_special_sale);
        $this->assertEquals('Super Flash Deal', $product->special_sale_title);
        $this->assertEquals(1999.00, (float) $product->compare_price);
    }

    /**
     * Super Admin can update priority order and sold count.
     */
    public function test_super_admin_can_update_order_and_sold_count(): void
    {
        $admin = $this->getSuperAdmin();
        $product = $this->getProduct();

        $this->actingAs($admin)
            ->patch(route('admin.curation.updateOrder', $product), [
                'featured_order' => 3,
            ])
            ->assertSessionHas('success');

        $this->actingAs($admin)
            ->patch(route('admin.curation.updateSoldCount', $product), [
                'total_sold_count' => 88,
            ])
            ->assertSessionHas('success');

        $product->refresh();
        $this->assertEquals(3, $product->featured_order);
        $this->assertEquals(88, $product->total_sold_count);
    }

    /**
     * Super Admin can perform bulk curation actions.
     */
    public function test_super_admin_can_perform_bulk_curation(): void
    {
        $admin = $this->getSuperAdmin();
        $p1 = $this->getProduct();
        $ids = [$p1->id];

        $this->actingAs($admin)
            ->post(route('admin.curation.bulkAction'), [
                'product_ids' => $ids,
                'action' => 'make_featured',
            ])
            ->assertSessionHas('success');

        foreach ($ids as $id) {
            $this->assertTrue((bool) Product::find($id)->is_featured);
        }

        $this->actingAs($admin)
            ->post(route('admin.curation.bulkAction'), [
                'product_ids' => $ids,
                'action' => 'make_special_sale',
                'special_sale_title' => 'Bulk Campaign Eid',
            ])
            ->assertSessionHas('success');

        foreach ($ids as $id) {
            $p = Product::find($id);
            $this->assertTrue((bool) $p->is_on_special_sale);
            $this->assertEquals('Bulk Campaign Eid', $p->special_sale_title);
        }
    }

    /**
     * Storefront root route passes all 5 segmented collections to Inertia.
     */
    public function test_storefront_receives_curated_segmented_collections(): void
    {
        $this->get(route('storefront'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Home')
                ->has('products')
                ->has('featuredProducts')
                ->has('specialSaleProducts')
                ->has('bestSellingProducts')
                ->has('budgetPicks')
                ->has('premiumLuxury')
            );
    }

    /**
     * Completed order increments total_sold_count.
     */
    public function test_completed_order_increments_total_sold_count(): void
    {
        $product = $this->getProduct();
        $initialSold = (int) $product->total_sold_count;

        $orderService = app(OrderService::class);
        $orderService->processCheckout(
            [
                'name' => 'John Buyer',
                'email' => 'john@buyer.com',
                'address' => '123 Market St',
                'city' => 'Metropolis',
                'payment_method' => 'card',
            ],
            [
                ['id' => $product->id, 'quantity' => 3],
            ]
        );

        $product->refresh();
        $this->assertEquals($initialSold + 3, $product->total_sold_count);
    }
}
