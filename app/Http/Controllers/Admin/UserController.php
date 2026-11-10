<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of all platform users with order, buyer, and vendor metrics.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::with('vendor');

        if ($search) {
            // Find vendor user IDs where store name or slug matches search
            $matchingVendorUserIds = Vendor::where('shop_name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")
                ->pluck('user_id')
                ->filter()
                ->map(fn($id) => (string)$id)
                ->all();

            $query->where(function($q) use ($search, $matchingVendorUserIds) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('shop_name', 'like', "%{$search}%")
                  ->orWhere('store_name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");

                if (!empty($matchingVendorUserIds)) {
                    $q->orWhereIn('_id', $matchingVendorUserIds)
                      ->orWhereIn('id', $matchingVendorUserIds);
                }
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            if ($roleFilter === 'customer') {
                $query->where(function($q) {
                    $q->where('role', 'customer')->orWhereNull('role');
                });
            } else {
                $query->where('role', $roleFilter);
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString()->through(function($user) {
            $userIdStr = (string)($user->_id ?? $user->id);

            // Lifetime orders placed as a customer
            $ordersPlaced = Order::where(function($q) use ($userIdStr, $user) {
                $q->where('user_id', $userIdStr)
                  ->orWhere('user_id', $user->id)
                  ->orWhere('customer_id', $userIdStr)
                  ->orWhere('customer_id', $user->id)
                  ->orWhere('customer_email', $user->email);
            })->count();

            // Total purchases spent as a buyer
            $rawSpent = Order::where(function($q) use ($userIdStr, $user) {
                $q->where('user_id', $userIdStr)
                  ->orWhere('user_id', $user->id)
                  ->orWhere('customer_id', $userIdStr)
                  ->orWhere('customer_id', $user->id)
                  ->orWhere('customer_email', $user->email);
            })->whereNotIn('status', ['cancelled', 'failed'])->sum('total_amount');

            $totalSpent = is_numeric($rawSpent) ? (float)$rawSpent : (float)(string)$rawSpent;

            // Resolve vendor profile
            $vendor = $user->vendor;
            if (!$vendor && $user->role === 'vendor') {
                $vendor = Vendor::where('user_id', $userIdStr)
                    ->orWhere('user_id', $user->id)
                    ->first();
            }
            $vendorIdStr = $vendor ? (string)($vendor->_id ?? $vendor->id) : null;

            // If vendor, calculate orders received and total merchant revenue
            $vendorOrdersCount = 0;
            $vendorGrossSales = 0.0;
            if ($user->role === 'vendor' || $vendor) {
                $vendorOrders = Order::where(function($q) use ($userIdStr, $vendorIdStr) {
                    $q->where('vendor_id', $userIdStr)
                      ->orWhere('items.vendor_id', $userIdStr);
                    if ($vendorIdStr) {
                        $q->orWhere('vendor_id', $vendorIdStr)
                          ->orWhere('items.vendor_id', $vendorIdStr);
                    }
                })->whereNotIn('status', ['cancelled', 'failed'])->get();

                $vendorOrdersCount = $vendorOrders->count();
                $vendorGrossSales = (float)$vendorOrders->sum('total_amount');
            }

            // Buyer address extraction (check user fields, fallback to most recent order shipping address)
            $buyerAddress = $user->address ?? $user->street_address ?? null;
            $buyerCity = $user->city ?? null;
            $buyerCountry = $user->country ?? 'Pakistan';
            $buyerPostal = $user->postal_code ?? null;

            if (empty($buyerAddress) || empty($buyerCity)) {
                $lastOrder = Order::where(function($q) use ($userIdStr, $user) {
                    $q->where('user_id', $userIdStr)
                      ->orWhere('customer_id', $userIdStr)
                      ->orWhere('customer_email', $user->email);
                })->orderBy('created_at', 'desc')->first();

                if ($lastOrder && !empty($lastOrder->shipping_address)) {
                    $sa = is_array($lastOrder->shipping_address) ? $lastOrder->shipping_address : [];
                    $buyerAddress = $buyerAddress ?: ($sa['address'] ?? null);
                    $buyerCity = $buyerCity ?: ($sa['city'] ?? null);
                    $buyerCountry = $buyerCountry ?: ($sa['country'] ?? 'Pakistan');
                    $buyerPostal = $buyerPostal ?: ($sa['postal_code'] ?? null);
                }
            }

            // Format registration date safely
            $createdAt = 'N/A';
            if ($user->created_at) {
                if ($user->created_at instanceof \DateTimeInterface) {
                    $createdAt = $user->created_at->format('d M Y, h:i A');
                } else {
                    try {
                        $createdAt = \Carbon\Carbon::parse($user->created_at)->format('d M Y, h:i A');
                    } catch (\Throwable $e) {
                        $createdAt = (string)$user->created_at;
                    }
                }
            }

            return [
                'id' => $userIdStr,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'role' => $user->role ?? 'customer',
                'auth_provider' => !empty($user->google_id) ? 'Google' : 'Email / Password',
                'created_at' => $createdAt,
                'orders_count' => (int)$ordersPlaced,
                'total_spent' => (float)$totalSpent,

                // Detailed Buyer Info
                'address' => $buyerAddress ?? 'No saved address',
                'city' => $buyerCity ?? 'N/A',
                'country' => $buyerCountry ?? 'Pakistan',
                'postal_code' => $buyerPostal ?? 'N/A',

                // Detailed Vendor Profile Info
                'shop_name' => $user->shop_name ?? $user->store_name ?? $vendor?->shop_name ?? ($user->role === 'vendor' ? $user->name . "'s Store" : null),
                'vendor_slug' => $user->slug ?? $user->vendor_slug ?? $vendor?->slug ?? null,
                'business_registration' => $user->business_registration ?? $vendor?->business_registration ?? $vendor?->ntn ?? null,
                'vendor_orders_count' => (int)$vendorOrdersCount,
                'vendor_gross_sales' => (float)$vendorGrossSales,
                'status' => $user->status ?? 'active',
                'avatar' => $user->avatar ?? null,
                'designation' => $user->designation ?? null,
                'department' => $user->department ?? null,
            ];
        });

        // Summary stats for top metrics cards
        $stats = [
            'total_users' => User::count(),
            'total_customers' => User::where('role', 'customer')->orWhereNull('role')->count(),
            'total_vendors' => User::where('role', 'vendor')->count(),
            'google_signups' => User::whereNotNull('google_id')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? 'all',
            ],
            'stats' => $stats,
        ]);
    }
}
