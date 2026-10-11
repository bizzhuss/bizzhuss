<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InformationalPagesTest extends TestCase
{
    /**
     * Test Group A: Customer Care Pages render correctly.
     */
    public function test_customer_care_pages_render_correctly(): void
    {
        $this->get(route('help'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/HelpCenter'));

        $this->get(route('how-to-buy'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/HowToBuy'));

        $this->get(route('track-order'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/TrackOrder'));

        $this->get(route('returns-refunds'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/ReturnsRefunds'));

        $this->get(route('contact'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/ContactUs'));
    }

    /**
     * Test Group B: Bizzhuss Business Pages render correctly.
     */
    public function test_business_pages_render_correctly(): void
    {
        $this->get(route('business.become-seller'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/BecomeSeller'));

        $this->get(route('business.vendor-center'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/VendorCenter'));

        $this->get(route('business.fees-payouts'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/FeeStructure'));

        $this->get(route('business.enterprise'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/EnterpriseProcurement'));

        $this->get(route('business.affiliate'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/AffiliateProgram'));
    }

    /**
     * Test Group C: Platform Operations & Legal Pages render correctly.
     */
    public function test_platform_operations_pages_render_correctly(): void
    {
        $this->get(route('operations.order-routing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/OrderRouting'));

        $this->get(route('terms'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/PrivacyTerms'));

        $this->get(route('security'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/ComplianceSecurity'));

        $this->get(route('status'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info/SystemStatus'));
    }

    /**
     * Test Contact Form Submission.
     */
    public function test_contact_form_submission(): void
    {
        $response = $this->post(route('contact.submit'), [
            'name' => 'Alice Buyer',
            'email' => 'alice@example.com',
            'phone' => '+1555123456',
            'order_id' => 'ORD-2026-8942',
            'department' => 'Order Status & Delivery',
            'message' => 'Hello, I would like to inquire about my sub-order delivery timeframe.',
        ]);

        $response->assertSessionHas('success');
        $response->assertRedirect();
    }

    /**
     * Test Enterprise RFQ Form Submission.
     */
    public function test_enterprise_rfq_submission(): void
    {
        $response = $this->post(route('business.enterprise.submit'), [
            'company_name' => 'Acme Corporation Ltd',
            'business_email' => 'procurement@acme.com',
            'phone' => '+1555987654',
            'tax_id' => 'TAX-998822',
            'monthly_volume' => '$50,000 - $250,000',
            'categories' => 'Industrial Machinery',
            'notes' => 'We are seeking Net 30 volume terms for quarterly tool replenishment.',
        ]);

        $response->assertSessionHas('success');
        $response->assertRedirect();
    }
}
