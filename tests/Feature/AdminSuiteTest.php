<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Task;
use App\Models\VendorPayout;
use Tests\TestCase;

class AdminSuiteTest extends TestCase
{
    protected $superAdmin;
    protected $customer;
    protected $vendorUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->superAdmin = User::where('role', 'super_admin')->first();
        $this->customer = User::where('role', 'customer')->first();
        $this->vendorUser = User::where('role', 'vendor')->first();
    }

    public function test_super_admin_can_access_all_admin_suite_pages()
    {
        $this->actingAs($this->superAdmin)->get('/admin/vendors')->assertStatus(200);
        $this->actingAs($this->superAdmin)->get('/admin/workforce/departments')->assertStatus(200);
        $this->actingAs($this->superAdmin)->get('/admin/workforce/employees')->assertStatus(200);
        $this->actingAs($this->superAdmin)->get('/admin/workforce/tasks')->assertStatus(200);
        $this->actingAs($this->superAdmin)->get('/admin/settings')->assertStatus(200);
    }

    public function test_non_admin_cannot_access_admin_suite_pages()
    {
        $this->actingAs($this->customer)->get('/admin/vendors')->assertRedirect(route('customer.dashboard'));
        $this->actingAs($this->customer)->get('/admin/settings')->assertRedirect(route('customer.dashboard'));
        $this->actingAs($this->vendorUser)->get('/admin/workforce/tasks')->assertRedirect(route('vendor.portal'));
    }

    public function test_super_admin_can_update_vendor_status_and_commission()
    {
        $vendor = Vendor::first();

        // Suspend
        $response = $this->actingAs($this->superAdmin)->post("/admin/vendors/{$vendor->id}/status", [
            'status' => 'suspended',
            'reason' => 'Policy violation review',
        ]);
        $response->assertSessionHas('success');
        $this->assertEquals('suspended', $vendor->fresh()->status);

        // Update commission override
        $response = $this->actingAs($this->superAdmin)->post("/admin/vendors/{$vendor->id}/commission", [
            'commission_rate' => 15.5,
        ]);
        $response->assertSessionHas('success');
        $this->assertEquals(15.5, (float)$vendor->fresh()->commission_rate);

        // Reinstate to active
        $this->actingAs($this->superAdmin)->post("/admin/vendors/{$vendor->id}/status", [
            'status' => 'active',
        ]);
        $this->assertEquals('active', $vendor->fresh()->status);
    }

    public function test_gatekeeper_blocks_inactive_vendor_products_from_storefront()
    {
        $vendor = Vendor::first();
        $vendor->update(['status' => 'suspended']);

        // Check shop listing does not show suspended vendor products
        $response = $this->get('/shop');
        $response->assertStatus(200);
        $products = $response->viewData('page')['props']['products'];
        $productVendorIds = collect($products)->pluck('vendor_id');
        $this->assertFalse($productVendorIds->contains($vendor->id));

        // Restore vendor status
        $vendor->update(['status' => 'active']);
    }

    public function test_super_admin_can_manage_departments_and_designations()
    {
        // Create department
        $response = $this->actingAs($this->superAdmin)->post('/admin/workforce/departments', [
            'name' => 'Testing Logistics Hub',
            'description' => 'Test logistics department description',
        ]);
        $response->assertSessionHas('success');

        $dept = Department::where('name', 'Testing Logistics Hub')->first();
        $this->assertNotNull($dept);

        // Create designation
        $response = $this->actingAs($this->superAdmin)->post('/admin/workforce/designations', [
            'department_id' => $dept->id,
            'title' => 'Lead Fleet Controller',
        ]);
        $response->assertSessionHas('success');

        $desig = Designation::where('title', 'Lead Fleet Controller')->first();
        $this->assertNotNull($desig);

        // Cleanup
        $desig->delete();
        $dept->delete();
    }

    public function test_super_admin_can_delegate_task_and_update_progress()
    {
        $employee = Employee::first();

        // Create task
        $response = $this->actingAs($this->superAdmin)->post('/admin/workforce/tasks', [
            'title' => 'Audit Warehouse Temperature Logs',
            'description' => 'Verify temperature sensor logs across cold-chain hub',
            'department' => 'Logistics',
            'priority' => 'high',
            'assigned_to' => $employee ? $employee->id : null,
            'category' => 'Operations',
            'progress' => 20,
            'due_date' => now()->addDays(3)->toDateString(),
        ]);
        $response->assertSessionHas('success');

        $task = Task::where('title', 'Audit Warehouse Temperature Logs')->first();
        $this->assertNotNull($task);

        // Update progress
        $response = $this->actingAs($this->superAdmin)->patch("/admin/workforce/tasks/{$task->id}/progress", [
            'progress' => 85,
            'note' => 'Progress verified with warehouse supervisor',
        ]);
        $response->assertSessionHas('success');
        $this->assertEquals(85, $task->fresh()->progress);

        // Cleanup
        $task->delete();
    }

    public function test_super_admin_can_update_general_settings()
    {
        $response = $this->actingAs($this->superAdmin)->post('/admin/settings/general', [
            'platform_name' => 'Bizzhuss MegaStore',
            'support_email' => 'governance@bizzhuss.com',
            'support_phone' => '+1 (800) 555-BIZZ',
            'platform_currency' => 'EUR',
            'default_commission_rate' => 12.0,
            'maintenance_mode' => false,
        ]);
        $response->assertSessionHas('success');

        $this->assertEquals('Bizzhuss MegaStore', \App\Models\Setting::get('platform_name'));
        $this->assertEquals('EUR', \App\Models\Setting::get('platform_currency'));

        // Restore default
        \App\Models\Setting::set('platform_name', 'Bizzhuss Multi-Vendor Marketplace');
        \App\Models\Setting::set('platform_currency', 'USD');
    }
}
