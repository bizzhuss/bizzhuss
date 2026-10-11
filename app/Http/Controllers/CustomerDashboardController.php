<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    /**
     * Display the Dedicated Customer Portal.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Order History
        $orders = Order::with(['items.product', 'items.vendor'])
            ->where('customer_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        // 2. Shipping & Delivery Addresses
        $addresses = [
            [
                'id' => 1,
                'is_default' => true,
                'title' => 'Primary Industrial Facility & Dock',
                'recipient' => $user->name,
                'phone' => $user->phone ?? '+1 (555) 776-8822',
                'street' => '400 Technology Way, Dock 7',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'country' => 'United States',
            ],
            [
                'id' => 2,
                'is_default' => false,
                'title' => 'Corporate Administration Office',
                'recipient' => $user->name,
                'phone' => $user->phone ?? '+1 (555) 776-8822',
                'street' => '100 Enterprise Plaza, Suite 400',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'country' => 'United States',
            ],
        ];

        // 3. Platform Coupons & Member Vouchers
        $vouchers = [
            [
                'id' => 1,
                'code' => 'BIZZ10',
                'discount' => '10% OFF',
                'description' => 'Platform-wide discount valid on all multi-vendor orders.',
                'valid_until' => 'October 31, 2026',
                'min_spend' => 200.00,
                'status' => 'active',
            ],
            [
                'id' => 2,
                'code' => 'VIPTECH',
                'discount' => '$150 OFF',
                'description' => 'VIP tier credit on Enterprise Hardware and Server Chassis orders.',
                'valid_until' => 'November 15, 2026',
                'min_spend' => 1000.00,
                'status' => 'active',
            ],
            [
                'id' => 3,
                'code' => 'FREESHIP',
                'discount' => 'FREE FREIGHT',
                'description' => 'Zero-fee expedited courier delivery on heavy equipment & tooling.',
                'valid_until' => 'October 15, 2026',
                'min_spend' => 500.00,
                'status' => 'active',
            ],
        ];

        return Inertia::render('Customer/Dashboard', [
            'user' => $user,
            'orders' => $orders,
            'addresses' => $addresses,
            'vouchers' => $vouchers,
        ]);
    }

    /**
     * Process "Upgrade to Vendor / Become a Seller" seamlessly.
     */
    public function upgradeToVendor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shop_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'routing_number' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();

        // Check if user already has a vendor profile
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            $slug = Str::slug($validated['shop_name']) . '-' . Str::random(5);
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $validated['shop_name'],
                'slug' => $slug,
                'description' => $validated['description'] ?? "Official marketplace merchant store for {$validated['shop_name']}.",
                'commission_rate' => 10.00,
                'bank_details' => [
                    'bank_name' => $validated['bank_name'] ?? 'Commercial Treasury Bank',
                    'account_number' => $validated['account_number'] ?? '****' . rand(1000, 9999),
                    'routing_number' => $validated['routing_number'] ?? '021000021',
                    'beneficiary' => $validated['shop_name'],
                ],
                'status' => 'active',
            ]);
        } else {
            $vendor->update([
                'shop_name' => $validated['shop_name'],
                'status' => 'active',
            ]);
        }

        // Switch role to vendor
        $user->update([
            'role' => 'vendor',
            'phone' => $validated['phone'] ?? $user->phone,
        ]);

        return redirect()->route('vendor.portal')->with(
            'success',
            "Congratulations! Your customer account has been upgraded to a Verified Vendor. Welcome to your Vendor Portal!"
        );
    }

    /**
     * Update customer profile settings.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        $updateData = [
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? $user->phone,
        ];

        if (!empty($validated['password'])) {
            if (!empty($validated['current_password']) && !Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'The provided current password does not match.']);
            }
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', 'Profile settings updated successfully.');
    }

    /**
     * Upload and update customer avatar profile picture.
     */
    public function uploadAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete old avatar file if stored locally on public disk
        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            $relativePath = str_replace('/storage/', '', $user->avatar);
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
            }
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => '/storage/' . $path]);

        return back()->with('success', 'Profile picture updated successfully!');
    }

    /**
     * Remove customer avatar picture.
     */
    public function removeAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            $relativePath = str_replace('/storage/', '', $user->avatar);
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
            }
        }

        $user->update(['avatar' => null]);

        return back()->with('success', 'Profile picture removed.');
    }
}
