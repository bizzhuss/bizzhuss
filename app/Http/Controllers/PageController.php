<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Customer Care: Help Center & FAQ
     */
    public function helpCenter(Request $request): Response
    {
        return Inertia::render('Info/HelpCenter');
    }

    /**
     * Customer Care: How to Buy Guide
     */
    public function howToBuy(Request $request): Response
    {
        return Inertia::render('Info/HowToBuy');
    }

    /**
     * Customer Care: Track Order
     */
    public function trackOrder(Request $request): Response
    {
        return Inertia::render('Info/TrackOrder', [
            'initialOrderId' => $request->query('order_id', ''),
        ]);
    }

    /**
     * Customer Care: Returns & Refunds Policy
     */
    public function returnsRefunds(Request $request): Response
    {
        return Inertia::render('Info/ReturnsRefunds');
    }

    /**
     * Customer Care: Contact Us
     */
    public function contactUs(Request $request): Response
    {
        return Inertia::render('Info/ContactUs');
    }

    /**
     * Handle Contact Us inquiry submission
     */
    public function submitContact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:30',
            'order_id' => 'nullable|string|max:50',
            'department' => 'required|string|max:50',
            'message' => 'required|string|min:10|max:2000',
        ]);

        return back()->with('success', 'Thank you! Your inquiry has been submitted. Our team will contact you within 2 hours.');
    }

    /**
     * Business: Become a Seller
     */
    public function becomeSeller(Request $request): Response
    {
        return Inertia::render('Info/BecomeSeller');
    }

    /**
     * Business: Vendor Center Guidelines
     */
    public function vendorCenter(Request $request): Response
    {
        return Inertia::render('Info/VendorCenter');
    }

    /**
     * Business: Fee Structure & Payouts
     */
    public function feeStructure(Request $request): Response
    {
        return Inertia::render('Info/FeeStructure');
    }

    /**
     * Business: Enterprise B2B Procurement
     */
    public function enterpriseProcurement(Request $request): Response
    {
        return Inertia::render('Info/EnterpriseProcurement');
    }

    /**
     * Handle Enterprise B2B inquiry submission
     */
    public function submitEnterprise(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:150',
            'business_email' => 'required|email|max:100',
            'phone' => 'required|string|max:30',
            'tax_id' => 'nullable|string|max:50',
            'monthly_volume' => 'required|string|max:50',
            'categories' => 'nullable|string|max:255',
            'notes' => 'required|string|min:10|max:2000',
        ]);

        return back()->with('success', 'Enterprise RFQ received! A dedicated account executive will reach out with volume pricing within 4 business hours.');
    }

    /**
     * Business: Affiliate Program
     */
    public function affiliateProgram(Request $request): Response
    {
        return Inertia::render('Info/AffiliateProgram');
    }

    /**
     * Platform Operations: Order Routing Service
     */
    public function orderRouting(Request $request): Response
    {
        return Inertia::render('Info/OrderRouting');
    }

    /**
     * Platform Operations: Privacy Policy, Terms of Service & Cookies
     */
    public function privacyTerms(Request $request): Response
    {
        return Inertia::render('Info/PrivacyTerms', [
            'initialTab' => $request->query('tab', 'terms'),
        ]);
    }

    /**
     * Platform Operations: Compliance & Security
     */
    public function complianceSecurity(Request $request): Response
    {
        return Inertia::render('Info/ComplianceSecurity');
    }

    /**
     * Platform Operations: Live System Status
     */
    public function systemStatus(Request $request): Response
    {
        return Inertia::render('Info/SystemStatus');
    }
}
