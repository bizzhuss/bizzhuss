<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class RbacProtectionTest extends TestCase
{
    public function test_guest_can_only_browse_public_storefront_routes()
    {
        $this->get('/')->assertStatus(200);
        $this->get('/shop')->assertStatus(200);
        $this->get('/category/industrial-iot')->assertRedirect(route('shop', ['category' => 'industrial-iot']));
        $this->get('/help')->assertStatus(200);
        $this->get('/terms')->assertStatus(200);
        $this->get('/contact')->assertStatus(200);
    }

    public function test_guest_blocked_from_protected_storefront_actions_and_portals()
    {
        // Protected storefront customer actions
        $this->get('/cart')->assertRedirect(route('login'));
        $this->get('/wishlist')->assertRedirect(route('login'));
        $this->get('/checkout')->assertRedirect(route('login'));

        // Portals
        $this->get('/admin')->assertRedirect(route('login'));
        $this->get('/vendor')->assertRedirect(route('login'));
        $this->get('/employee')->assertRedirect(route('login'));
        $this->get('/customer/dashboard')->assertRedirect(route('login'));
    }

    public function test_intended_redirect_preserves_destination_upon_login()
    {
        $customer = User::where('role', 'customer')->first();

        // 1. Guest hits protected route
        $response = $this->get('/checkout');
        $response->assertRedirect(route('login'));

        // 2. Logging in returns customer directly to intended /checkout
        $loginResponse = $this->post('/login', [
            'email' => $customer->email,
            'password' => 'password123',
        ]);
        $loginResponse->assertRedirect('/checkout');
    }

    public function test_authenticated_customer_can_access_cart_wishlist_and_checkout()
    {
        $customer = User::where('role', 'customer')->first();

        $this->actingAs($customer)->get('/cart')->assertStatus(200);
        $this->actingAs($customer)->get('/wishlist')->assertStatus(200);
        $this->actingAs($customer)->get('/checkout')->assertStatus(200);
    }

    public function test_customer_can_access_own_portal_but_blocked_from_others()
    {
        $customer = User::where('role', 'customer')->first();

        $this->actingAs($customer)->get('/customer/dashboard')->assertStatus(200);
        $this->actingAs($customer)->get('/admin')->assertRedirect(route('customer.dashboard'));
        $this->actingAs($customer)->get('/vendor')->assertRedirect(route('customer.dashboard'));
        $this->actingAs($customer)->get('/employee')->assertRedirect(route('customer.dashboard'));
    }

    public function test_vendor_can_access_own_portal_but_blocked_from_others()
    {
        $vendor = User::where('role', 'vendor')->first();

        $this->actingAs($vendor)->get('/vendor')->assertStatus(200);
        $this->actingAs($vendor)->get('/admin')->assertRedirect(route('vendor.portal'));
        $this->actingAs($vendor)->get('/employee')->assertRedirect(route('vendor.portal'));
        $this->actingAs($vendor)->get('/customer/dashboard')->assertRedirect(route('vendor.portal'));
    }

    public function test_employee_can_access_own_portal_but_blocked_from_others()
    {
        $employee = User::where('role', 'employee')->first();

        $this->actingAs($employee)->get('/employee')->assertStatus(200);
        $this->actingAs($employee)->get('/admin')->assertRedirect(route('employee.workspace'));
        $this->actingAs($employee)->get('/vendor')->assertRedirect(route('employee.workspace'));
        $this->actingAs($employee)->get('/customer/dashboard')->assertRedirect(route('employee.workspace'));
    }

    public function test_super_admin_can_access_all_portals()
    {
        $superAdmin = User::where('role', 'super_admin')->first();

        $this->actingAs($superAdmin)->get('/admin')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/vendor')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/employee')->assertStatus(200);
        $this->actingAs($superAdmin)->get('/')->assertStatus(200);
    }
}
