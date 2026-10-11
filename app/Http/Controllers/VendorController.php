<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
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
     * Display the Vendor Central Command Dashboard.
     */
    public function index(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        // Products and inventory metrics
        $products = Product::with('category')
            ->where('vendor_id', $vendor->id)
            ->orderBy('id', 'desc')
            ->get();

        $lowStockProducts = $products->filter(function ($p) {
            return $p->stock_quantity <= ($p->low_stock_threshold ?? 5);
        })->values();

        // Sub-orders
        $orderItems = OrderItem::with(['order.customer', 'product'])
            ->where('vendor_id', $vendor->id)
            ->orderBy('id', 'desc')
            ->get();

        $recentOrders = $orderItems->take(8)->map(fn($item) => [
            'id' => $item->id,
            'order_id' => $item->order_id,
            'order_number' => $item->order ? $item->order->order_number : 'N/A',
            'product_title' => $item->product ? $item->product->title : 'Item Removed',
            'product_image' => ($item->product && !empty($item->product->images)) ? $item->product->images[0] : null,
            'quantity' => $item->quantity,
            'unit_price' => (float)$item->unit_price,
            'vendor_earning' => (float)$item->vendor_earning,
            'delivery_status' => $item->delivery_status,
            'created_at' => $item->created_at->toISOString(),
        ]);

        // Payouts
        $payouts = VendorPayout::where('vendor_id', $vendor->id)
            ->orderBy('id', 'desc')
            ->get();

        $approvedPayoutsTotal = (float) $payouts->where('status', 'approved')->sum('amount');
        $totalEarned = (float) $orderItems->where('delivery_status', '!=', 'cancelled')->sum('vendor_earning');
        $availableBalance = max(0.00, round($totalEarned - $approvedPayoutsTotal, 2));

        $metrics = [
            'total_sales_gmv' => (float) $orderItems->where('delivery_status', '!=', 'cancelled')->sum(fn($i) => (float)$i->unit_price * $i->quantity),
            'total_net_earnings' => $totalEarned,
            'available_balance' => $availableBalance,
            'orders_to_fulfill' => $orderItems->whereIn('delivery_status', ['pending', 'processing'])->pluck('order_id')->unique()->count(),
            'total_products' => $products->count(),
            'low_stock_count' => $lowStockProducts->count(),
        ];

        return Inertia::render('Vendor/Dashboard', [
            'vendor' => $vendor,
            'metrics' => $metrics,
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts->take(5),
            'payouts' => $payouts->take(5),
        ]);
    }

    /**
     * Display Shop Profile & Customization Settings.
     */
    public function settings(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        return Inertia::render('Vendor/Settings', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Update Shop Profile & Customization Settings.
     */
    public function updateSettings(Request $request)
    {
        $vendor = $this->getVendor($request);

        $validated = $request->validate([
            'shop_name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'support_phone' => 'nullable|string|max:30',
            'return_policy' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'bank_details' => 'nullable|array',
        ]);

        if ($validated['shop_name'] !== $vendor->shop_name) {
            $validated['slug'] = Str::slug($validated['shop_name']) . '-' . Str::lower(Str::random(4));
        }

        $vendor->update($validated);

        return redirect()->back()->with('success', 'Shop profile and storefront branding updated successfully.');
    }

    /**
     * Display Financial Wallet & Payout Management.
     */
    public function wallet(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        $orderItems = OrderItem::where('vendor_id', $vendor->id)->get();
        $payouts = VendorPayout::where('vendor_id', $vendor->id)
            ->orderBy('id', 'desc')
            ->get();

        $grossSales = (float) $orderItems->where('delivery_status', '!=', 'cancelled')->sum(fn($i) => (float)$i->unit_price * $i->quantity);
        $platformFeePaid = (float) $orderItems->where('delivery_status', '!=', 'cancelled')->sum('platform_fee');
        $totalEarned = (float) $orderItems->where('delivery_status', '!=', 'cancelled')->sum('vendor_earning');

        $approvedPayouts = (float) $payouts->where('status', 'approved')->sum('amount');
        $pendingPayouts = (float) $payouts->where('status', 'pending')->sum('amount');
        $availableBalance = max(0.00, round($totalEarned - $approvedPayouts - $pendingPayouts, 2));

        $pendingClearance = (float) $orderItems->whereIn('delivery_status', ['pending', 'processing', 'shipped'])->sum('vendor_earning');

        $walletMetrics = [
            'available_balance' => $availableBalance,
            'pending_clearance' => round($pendingClearance, 2),
            'total_withdrawn' => round($approvedPayouts, 2),
            'pending_payouts' => round($pendingPayouts, 2),
            'gross_sales' => round($grossSales, 2),
            'platform_fee_paid' => round($platformFeePaid, 2),
        ];

        return Inertia::render('Vendor/Wallet', [
            'vendor' => $vendor,
            'walletMetrics' => $walletMetrics,
            'payouts' => $payouts,
        ]);
    }

    /**
     * Request a disbursement payout.
     */
    public function requestPayout(Request $request)
    {
        $vendor = $this->getVendor($request);

        if ($vendor->status !== 'active') {
            return redirect()->back()->with('error', "Your vendor account is {$vendor->status}. Disbursements can only be requested by verified active vendors.");
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:50',
            'payment_method' => 'required|string|in:bank_wire,easypaisa,jazzcash,paypal',
            'account_details' => 'nullable|string',
        ]);

        // Calculate available balance to guard against overdraft requests
        $orderItems = OrderItem::where('vendor_id', $vendor->id)->get();
        $payouts = VendorPayout::where('vendor_id', $vendor->id)->get();

        $totalEarned = (float) $orderItems->where('delivery_status', '!=', 'cancelled')->sum('vendor_earning');
        $approvedPayouts = (float) $payouts->where('status', 'approved')->sum('amount');
        $pendingPayouts = (float) $payouts->where('status', 'pending')->sum('amount');
        $availableBalance = max(0.00, round($totalEarned - $approvedPayouts - $pendingPayouts, 2));

        if ((float)$validated['amount'] > $availableBalance) {
            return redirect()->back()->with('error', "Requested amount (\${$validated['amount']}) exceeds your currently available withdrawal balance (\${$availableBalance}).");
        }

        $payout = VendorPayout::create([
            'vendor_id' => $vendor->id,
            'amount' => (float)$validated['amount'],
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => 'PO-' . strtoupper(Str::random(8)),
            'notes' => $validated['account_details'] ?? 'Merchant withdrawal request',
        ]);

        return redirect()->back()->with('success', "Disbursement request for \${$payout->amount} submitted successfully.");
    }
}
