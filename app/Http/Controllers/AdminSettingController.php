<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Setting;
use App\Models\VendorPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    /**
     * Display Global Platform Controls, Category CRUD, and Payout Queue.
     */
    public function index(Request $request): Response
    {
        // 1. Settings
        $settings = [
            'maintenance_mode' => Setting::get('maintenance_mode', 'false') === 'true',
            'platform_currency' => Setting::get('platform_currency', 'PKR'),
            'default_commission_rate' => (float) Setting::get('default_commission_rate', '10.00'),
            'platform_name' => Setting::get('platform_name', 'Bizzhuss Multi-Vendor Marketplace'),
            'support_email' => Setting::get('support_email', 'governance@bizzhuss.com'),
            'support_phone' => Setting::get('support_phone', '+1 (800) 555-BIZZ'),
        ];

        // 2. Categories with parent/child tree and product counts
        $categories = Category::with(['parent', 'subcategories'])
            ->withCount('products')
            ->orderBy('name')
            ->get();

        $rootCategories = Category::whereNull('parent_id')
            ->with(['subcategories' => fn($q) => $q->withCount('products')])
            ->withCount('products')
            ->orderBy('name')
            ->get();

        // 3. Payout Requests Queue
        $payouts = VendorPayout::with(['vendor:id,shop_name,logo,commission_rate,status'])
            ->orderBy('created_at', 'desc')
            ->get();

        $payoutMetrics = [
            'total_payouts' => $payouts->count(),
            'pending_payouts' => $payouts->where('status', 'pending')->count(),
            'pending_amount' => $payouts->where('status', 'pending')->sum('amount'),
            'approved_amount' => $payouts->where('status', 'approved')->sum('amount'),
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'categories' => $categories,
            'rootCategories' => $rootCategories,
            'payouts' => $payouts,
            'payoutMetrics' => $payoutMetrics,
        ]);
    }

    /**
     * Update Global Marketplace Settings.
     */
    public function updateGeneralSettings(Request $request)
    {
        $validated = $request->validate([
            'maintenance_mode' => 'required|boolean',
            'platform_currency' => 'required|string|max:10',
            'default_commission_rate' => 'required|numeric|min:0|max:100',
            'platform_name' => 'required|string|max:150',
            'support_email' => 'required|email',
            'support_phone' => 'nullable|string|max:30',
        ]);

        Setting::set('maintenance_mode', $validated['maintenance_mode']);
        Setting::set('platform_currency', $validated['platform_currency']);
        Setting::set('default_commission_rate', $validated['default_commission_rate']);
        Setting::set('platform_name', $validated['platform_name']);
        Setting::set('support_email', $validated['support_email']);
        Setting::set('support_phone', $validated['support_phone'] ?? '');

        return redirect()->back()->with('success', 'Global platform settings updated successfully.');
    }

    /**
     * Store a new category or subcategory.
     */
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:120|unique:categories,slug',
            'icon' => 'nullable|string|max:100',
            'banner' => 'nullable|string|max:500',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        Category::create($validated);

        return redirect()->back()->with('success', "Category '{$validated['name']}' created successfully.");
    }

    /**
     * Update an existing category.
     */
    public function updateCategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:120|unique:categories,slug,' . $category->id,
            'icon' => 'nullable|string|max:100',
            'banner' => 'nullable|string|max:500',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', "Category '{$category->name}' updated successfully.");
    }

    /**
     * Delete a category.
     */
    public function destroyCategory(Category $category)
    {
        if ($category->products()->count() > 0) {
            return redirect()->back()->with('error', "Cannot delete category containing {$category->products()->count()} active products. Reassign products first.");
        }

        $name = $category->name;
        $category->delete();

        return redirect()->back()->with('success', "Category '{$name}' removed.");
    }

    /**
     * Approve vendor payout request.
     */
    public function approvePayout(Request $request, VendorPayout $payout)
    {
        $validated = $request->validate([
            'transaction_reference' => 'required|string|max:100',
            'receipt_url' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        $payout->update([
            'status' => 'approved',
            'transaction_reference' => $validated['transaction_reference'],
            'receipt_url' => $validated['receipt_url'] ?? null,
            'notes' => $validated['notes'] ?? $payout->notes,
        ]);

        return redirect()->back()->with('success', "Disbursement payout of \${$payout->amount} approved with Ref: {$validated['transaction_reference']}.");
    }

    /**
     * Reject vendor payout request.
     */
    public function rejectPayout(Request $request, VendorPayout $payout)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $payout->update([
            'status' => 'rejected',
            'notes' => "Rejected: " . $validated['reason'],
        ]);

        return redirect()->back()->with('success', "Disbursement payout of \${$payout->amount} has been rejected.");
    }
}
