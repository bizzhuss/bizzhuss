<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorOrderController extends Controller
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
     * Display multi-vendor sub-orders for the authenticated vendor.
     */
    public function index(Request $request): Response
    {
        $vendor = $this->getVendor($request);

        // Fetch vendor's order items grouped by order
        $orderItemsQuery = OrderItem::with(['order.customer', 'product'])
            ->where('vendor_id', $vendor->id);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $orderItemsQuery->where(function ($q) use ($search) {
                $q->whereHas('order', function ($oq) use ($search) {
                    $oq->where('order_number', 'like', "%{$search}%")
                       ->orWhere('shipping_address', 'like', "%{$search}%");
                })->orWhereHas('product', function ($pq) use ($search) {
                    $pq->where('title', 'like', "%{$search}%")
                       ->orWhere('sku', 'like', "%{$search}%");
                });
            });
        }

        // Delivery Status filter
        $status = $request->input('status', 'all');
        if ($status !== 'all') {
            $orderItemsQuery->where('delivery_status', $status);
        }

        $items = $orderItemsQuery->orderBy('id', 'desc')->get();

        // Group into sub-orders by order_id
        $grouped = $items->groupBy('order_id');
        $subOrders = [];

        foreach ($grouped as $orderId => $vendorItems) {
            $first = $vendorItems->first();
            $order = $first->order;
            if (!$order) continue;

            $shipping = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address ?? '[]', true);

            $vendorItemsSubtotal = $vendorItems->sum(fn($i) => (float)$i->unit_price * $i->quantity);
            $vendorPlatformFee = $vendorItems->sum(fn($i) => (float)$i->platform_fee);
            $vendorNetEarnings = $vendorItems->sum(fn($i) => (float)$i->vendor_earning);

            // Determine aggregate sub-order status
            $statuses = $vendorItems->pluck('delivery_status')->unique();
            $effectiveStatus = $statuses->count() === 1 ? $statuses->first() : $first->delivery_status;

            $subOrders[] = [
                'order_id' => $order->id,
                'sub_order_number' => "SO-{$order->order_number}-{$vendor->id}",
                'order_number' => $order->order_number,
                'customer_name' => $shipping['name'] ?? ($order->customer ? $order->customer->name : 'Customer'),
                'customer_email' => $shipping['email'] ?? ($order->customer ? $order->customer->email : 'N/A'),
                'customer_phone' => $shipping['phone'] ?? 'N/A',
                'shipping_address' => $shipping['address'] ?? ($shipping['full_address'] ?? 'N/A'),
                'items_count' => $vendorItems->sum('quantity'),
                'items' => $vendorItems->map(fn($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'title' => $item->product ? $item->product->title : 'Product Removed',
                    'sku' => $item->product ? $item->product->sku : 'N/A',
                    'image' => ($item->product && !empty($item->product->images)) ? $item->product->images[0] : null,
                    'quantity' => $item->quantity,
                    'unit_price' => (float)$item->unit_price,
                    'platform_fee' => (float)$item->platform_fee,
                    'vendor_earning' => (float)$item->vendor_earning,
                    'delivery_status' => $item->delivery_status,
                    'tracking_number' => $item->tracking_number,
                    'carrier' => $item->carrier,
                ]),
                'subtotal' => round($vendorItemsSubtotal, 2),
                'platform_commission' => round($vendorPlatformFee, 2),
                'net_earnings' => round($vendorNetEarnings, 2),
                'payment_status' => $order->payment_status,
                'delivery_status' => $effectiveStatus,
                'tracking_number' => $first->tracking_number,
                'carrier' => $first->carrier,
                'created_at' => $order->created_at->toISOString(),
            ];
        }

        // Metrics for top overview
        $allVendorItems = OrderItem::where('vendor_id', $vendor->id)->get();
        $metrics = [
            'total_sub_orders' => $allVendorItems->pluck('order_id')->unique()->count(),
            'pending' => $allVendorItems->where('delivery_status', 'pending')->pluck('order_id')->unique()->count(),
            'processing' => $allVendorItems->where('delivery_status', 'processing')->pluck('order_id')->unique()->count(),
            'shipped' => $allVendorItems->where('delivery_status', 'shipped')->pluck('order_id')->unique()->count(),
            'delivered' => $allVendorItems->where('delivery_status', 'delivered')->pluck('order_id')->unique()->count(),
            'cancelled' => $allVendorItems->where('delivery_status', 'cancelled')->pluck('order_id')->unique()->count(),
            'total_net_revenue' => (float) $allVendorItems->where('delivery_status', '!=', 'cancelled')->sum('vendor_earning'),
        ];

        return Inertia::render('Vendor/Orders/Index', [
            'vendor' => $vendor,
            'subOrders' => $subOrders,
            'metrics' => $metrics,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $status,
            ],
        ]);
    }

    /**
     * Update fulfillment delivery status step-by-step for the vendor's items.
     */
    public function updateFulfillment(Request $request, $orderId)
    {
        $vendor = $this->getVendor($request);

        $validated = $request->validate([
            'delivery_status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
            'carrier' => 'nullable|string|max:100',
        ]);

        $items = OrderItem::where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->get();

        if ($items->isEmpty()) {
            abort(404, 'No orders found matching this vendor.');
        }

        $updateData = ['delivery_status' => $validated['delivery_status']];
        if (isset($validated['tracking_number'])) {
            $updateData['tracking_number'] = $validated['tracking_number'];
        }
        if (isset($validated['carrier'])) {
            $updateData['carrier'] = $validated['carrier'];
        }

        OrderItem::where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->update($updateData);

        return redirect()->back()->with('success', "Fulfillment status updated to '{$validated['delivery_status']}'.");
    }

    /**
     * Return invoice / packing slip data for the vendor sub-order.
     */
    public function invoice(Request $request, $orderId): Response
    {
        $vendor = $this->getVendor($request);

        $order = Order::with('customer')->findOrFail($orderId);
        $vendorItems = OrderItem::with('product')
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->get();

        if ($vendorItems->isEmpty()) {
            abort(403, 'Unauthorized access to order invoice.');
        }

        $shipping = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address ?? '[]', true);

        $invoiceData = [
            'vendor' => $vendor,
            'order' => $order,
            'shipping' => $shipping,
            'sub_order_number' => "SO-{$order->order_number}-{$vendor->id}",
            'items' => $vendorItems,
            'subtotal' => $vendorItems->sum(fn($i) => (float)$i->unit_price * $i->quantity),
            'platform_fee' => $vendorItems->sum(fn($i) => (float)$i->platform_fee),
            'net_earnings' => $vendorItems->sum(fn($i) => (float)$i->vendor_earning),
        ];

        return Inertia::render('Vendor/Orders/Invoice', [
            'invoice' => $invoiceData,
        ]);
    }
}
