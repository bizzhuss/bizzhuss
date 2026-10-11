<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use Tests\TestCase;

class VendorAuthorizationTest extends TestCase
{
    public function test_guest_redirected_to_login_with_informative_message_in_non_local()
    {
        // Default test environment is 'testing'
        $response = $this->get('/vendor');
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error', 'Please sign in as a vendor to access your merchant portal.');
    }

    public function test_local_dev_fallback_auto_authenticates_seeded_vendor()
    {
        // Mock environment to 'local'
        $this->app->detectEnvironment(fn () => 'local');
        $this->assertTrue(app()->environment('local'));

        $seededVendor = User::where('role', 'vendor')->first();

        $response = $this->get('/vendor');
        $response->assertStatus(200);

        // Verify the user is authenticated as the vendor
        $this->assertAuthenticatedAs($seededVendor);
    }

    public function test_missing_vendor_record_is_automatically_created()
    {
        // Create vendor user without a vendor row
        $user = User::create([
            'name' => 'Standalone Merchant',
            'email' => 'standalone@bizzhuss.com',
            'password' => bcrypt('password123'),
            'role' => 'vendor',
            'status' => 'active',
        ]);

        $this->assertNull($user->vendor);

        // Access vendor dashboard
        $response = $this->actingAs($user)->get('/vendor');
        $response->assertStatus(200);

        // Verify vendor row was auto-created
        $freshUser = $user->fresh();
        $this->assertNotNull($freshUser->vendor);
        $this->assertEquals("Standalone Merchant's Store", $freshUser->vendor->shop_name);
        $this->assertEquals('active', $freshUser->vendor->status);

        // Cleanup
        $freshUser->vendor->delete();
        $freshUser->delete();
    }
}
