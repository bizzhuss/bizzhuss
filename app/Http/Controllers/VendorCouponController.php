<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorCouponController extends Controller
{
    /**
     * Helper to resolve the authenticated vendor.
     */
    protected function getVendor(Request $request): Vendor
    {
        $user = $request->user();

        if (!$user) {
            abort(redirect()->route('login')->with('error', 'Please log in with vendor credentials to access this portal.'));
        }

        $vendor = $user->vendor;

        // Auto-create default vendor profile if missing
        if (!$vendor) {
            if ($user->role === 'super_admin') {
                $vendor = Vendor::first();
            }

            if (!$vendor) {
                $vendor = Vendor::create([
                    'user_id' => $user->id,
                    'shop_name' => ($user->name ?? 'Merchant') . "'s Store",
                    'slug' => Str::slug(($user->name ?? 'merchant') . '-store') . '-' . Str::lower(Str::random(4)),
                    'status' => 'active',
                    'commission_rate' => 10.00,
                    'description' => 'Official verified vendor merchant storefront.',
                ]);
            }
        }

        return $vendor;
    }

    /**
     * Display vendor's coupons listing and performance metrics.
     */
    public function index(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        $coupons = Coupon::where('vendor_id', $vendor->id)
            ->orderBy('id', 'desc')
            ->get();

        $metrics = [
            'total_coupons' => $coupons->count(),
            'active_coupons' => $coupons->where('is_active', true)->filter(fn($c) => !$c->isExpired())->count(),
            'times_used' => (int) $coupons->sum('times_used'),
            'revenue_generated' => (float) $coupons->sum('revenue_generated'),
        ];

        return Inertia::render('Vendor/Coupons/Index', [
            'vendor' => $vendor,
            'coupons' => $coupons,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Store a newly created vendor-specific coupon.
     */
    public function store(Request $request)
    {
        $vendor = $this->getVendor($request);

        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.01',
            'min_spend' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        $code = Str::upper(trim($validated['code']));

        // Check if code already exists for this vendor
        $exists = Coupon::where('vendor_id', $vendor->id)
            ->where('code', $code)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors(['code' => "Coupon code '{$code}' already exists in your shop."]);
        }

        $coupon = Coupon::create([
            'vendor_id' => $vendor->id,
            'code' => $code,
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'min_spend' => $validated['min_spend'] ?? 0.00,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => true,
            'times_used' => 0,
            'revenue_generated' => 0.00,
        ]);

        return redirect()->back()->with('success', "Coupon '{$coupon->code}' activated successfully for your storefront catalog.");
    }

    /**
     * Toggle coupon active state.
     */
    public function toggle(Request $request, Coupon $coupon)
    {
        $vendor = $this->getVendor($request);

        if ($coupon->vendor_id !== $vendor->id) {
            abort(403, 'Unauthorized access to coupon.');
        }

        $coupon->update([
            'is_active' => !$coupon->is_active,
        ]);

        $status = $coupon->is_active ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Coupon '{$coupon->code}' {$status}.");
    }

    /**
     * Remove the specified coupon.
     */
    public function destroy(Request $request, Coupon $coupon)
    {
        $vendor = $this->getVendor($request);

        if ($coupon->vendor_id !== $vendor->id) {
            abort(403, 'Unauthorized access to coupon.');
        }

        $code = $coupon->code;
        $coupon->delete();

        return redirect()->back()->with('success', "Coupon '{$code}' was successfully removed.");
    }
}
