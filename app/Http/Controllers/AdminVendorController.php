<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Vendor;
use App\Models\VendorPayout;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminVendorController extends Controller
{
    /**
     * Display the Vendor Management & Growth Analytics Suite.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $query = Vendor::with(['user:id,name,email,phone,avatar'])
            ->withCount('products');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('shop_name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $vendors = $query->orderBy('created_at', 'desc')->get()->map(function ($vendor) {
            // Aggregate sales metrics from order_items
            $items = OrderItem::where('vendor_id', $vendor->id)->get();
            $totalSales = $items->sum(fn($i) => (float)$i->unit_price * (int)$i->quantity);
            $commissionEarned = $items->sum(fn($i) => (float)$i->platform_fee);
            $cancelledCount = $items->where('delivery_status', 'cancelled')->count();
            $totalOrders = $items->count();
            $returnRate = $totalOrders > 0 ? round(($cancelledCount / $totalOrders) * 100, 1) : 0;

            // Monthly revenue breakdown for past 6 months
            $monthlyRevenue = [];
            for ($m = 5; $m >= 0; $m--) {
                $monthDate = Carbon::now()->subMonths($m);
                $monthKey = $monthDate->format('M Y');
                $monthSales = $items->filter(function ($i) use ($monthDate) {
                    return Carbon::parse($i->created_at)->format('Y-m') === $monthDate->format('Y-m');
                })->sum(fn($i) => (float)$i->unit_price * (int)$i->quantity);

                $monthlyRevenue[] = [
                    'month' => $monthKey,
                    'revenue' => round($monthSales, 2),
                ];
            }

            // Top selling products
            $topProducts = Product::where('vendor_id', $vendor->id)
                ->orderBy('price', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'price', 'stock_quantity', 'images', 'status']);

            // Recent payouts
            $payouts = VendorPayout::where('vendor_id', $vendor->id)
                ->orderBy('created_at', 'desc')
                ->limit(6)
                ->get();

            return [
                'id' => $vendor->id,
                'shop_name' => $vendor->shop_name,
                'slug' => $vendor->slug,
                'logo' => $vendor->logo,
                'banner' => $vendor->banner,
                'description' => $vendor->description,
                'commission_rate' => (float)$vendor->commission_rate,
                'status' => $vendor->status,
                'bank_details' => $vendor->bank_details,
                'created_at' => $vendor->created_at->format('Y-m-d'),
                'owner' => $vendor->user ? [
                    'id' => $vendor->user->id,
                    'name' => $vendor->user->name,
                    'email' => $vendor->user->email,
                    'phone' => $vendor->user->phone,
                    'avatar' => $vendor->user->avatar,
                ] : null,
                'metrics' => [
                    'products_count' => $vendor->products_count,
                    'total_sales' => round($totalSales, 2),
                    'commission_earned' => round($commissionEarned, 2),
                    'total_orders' => $totalOrders,
                    'return_rate' => $returnRate,
                    'customer_rating' => 4.8,
                ],
                'growth' => [
                    'monthly_revenue' => $monthlyRevenue,
                    'top_products' => $topProducts,
                    'payouts' => $payouts,
                ],
            ];
        });

        // Global Vendor KPI Summary
        $allVendors = Vendor::all();
        $allItems = OrderItem::all();

        $metrics = [
            'total_vendors' => $allVendors->count(),
            'active_vendors' => $allVendors->where('status', 'active')->count(),
            'pending_vendors' => $allVendors->where('status', 'pending')->count(),
            'suspended_vendors' => $allVendors->where('status', 'suspended')->count(),
            'total_sales' => round($allItems->sum(fn($i) => (float)$i->unit_price * (int)$i->quantity), 2),
            'total_commission' => round($allItems->sum(fn($i) => (float)$i->platform_fee), 2),
        ];

        return Inertia::render('Admin/Vendors', [
            'vendors' => $vendors,
            'metrics' => $metrics,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Update vendor status (Approve, Suspend, Reinstate).
     */
    public function updateStatus(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,suspended,pending',
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus = $vendor->status;
        $vendor->update(['status' => $validated['status']]);

        $actionVerb = match ($validated['status']) {
            'active' => $oldStatus === 'suspended' ? 'reinstated' : 'approved',
            'suspended' => 'suspended',
            default => 'updated',
        };

        return redirect()->back()->with(
            'success',
            "Vendor '{$vendor->shop_name}' has been successfully {$actionVerb}. Gatekeeper rules updated immediately."
        );
    }

    /**
     * Override custom commission rate for an individual vendor.
     */
    public function updateCommission(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);

        $vendor->update(['commission_rate' => $validated['commission_rate']]);

        return redirect()->back()->with(
            'success',
            "Custom commission rate for '{$vendor->shop_name}' updated to {$vendor->commission_rate}%."
        );
    }

    /**
     * Delete vendor.
     */
    public function destroy(Vendor $vendor)
    {
        $name = $vendor->shop_name;
        $vendor->delete();

        return redirect()->back()->with(
            'success',
            "Vendor '{$name}' has been safely removed from the marketplace."
        );
    }
}
