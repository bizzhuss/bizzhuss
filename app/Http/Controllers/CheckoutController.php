<?php

namespace App\Http\Controllers;

use App\Models\FinanceSetting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Handle enterprise order submission and multi-vendor sub-order routing.
     */
    public function placeOrder(Request $request)
    {
        // Support both customer_name/name, customer_email/email, customer_phone/phone
        $customerName = $request->input('customer_name') ?? $request->input('name') ?? 'Valued Customer';
        $customerEmail = $request->input('customer_email') ?? $request->input('email') ?? 'customer@example.com';
        $customerPhone = $request->input('customer_phone') ?? $request->input('phone') ?? '';
        $shippingAddress = $request->input('shipping_address') ?? '123 Commercial Blvd';
        $city = $request->input('city') ?? 'Karachi';
        $country = $request->input('country') ?? 'Pakistan';
        $postalCode = $request->input('postal_code') ?? '';
        $paymentMethod = $request->input('payment_method') ?? 'cod';
        $notes = $request->input('notes') ?? '';

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $financeSettings = FinanceSetting::getActive();
        $taxRate = ((float)($financeSettings->default_tax_rate ?? 8.0)) / 100;

        // Fallback default vendor for products that might not have a direct vendor_id
        $defaultVendor = Vendor::where('status', 'active')->first();

        // Calculate subtotal & match each product with its vendor
        $subtotal = 0.00;
        $itemsWithVendor = [];

        foreach ($request->items as $item) {
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $rawPrice = (float)($item['price'] ?? 0);
            $productId = (string)($item['product_id'] ?? ($item['id'] ?? ''));

            // Look up product from MongoDB
            $product = null;
            if (!empty($productId)) {
                $product = Product::where('_id', $productId)->orWhere('id', $productId)->first();
            }

            // Price resolution
            $unitPrice = $product ? (float)$product->price : $rawPrice;
            $lineTotal = round($unitPrice * $qty, 2);
            $subtotal += $lineTotal;

            // Vendor resolution: item.vendor_id -> product.vendor_id -> product.vendor -> defaultVendor
            $vendorId = $item['vendor_id'] ?? ($product ? $product->vendor_id : null);
            $vendor = null;
            if ($vendorId) {
                $vendor = Vendor::where('_id', $vendorId)->orWhere('id', $vendorId)->first();
            }
            if (!$vendor && $product && $product->vendor) {
                $vendor = $product->vendor;
            }
            if (!$vendor) {
                $vendor = $defaultVendor;
            }

            $resolvedVendorId = $vendor ? (string)($vendor->_id ?? $vendor->id) : (string)($vendorId ?? '1');
            $resolvedShopName = $vendor ? $vendor->shop_name : ($item['shop_name'] ?? 'Bizzhuss Official Store');

            // Commission & vendor net revenue calculation
            $commissionRate = $vendor ? (float)($vendor->commission_rate ?? 10.00) : (float)($financeSettings->platform_commission_rate ?? 10.00);
            $platformFee = round($lineTotal * ($commissionRate / 100), 2);
            $vendorEarning = round($lineTotal - $platformFee, 2);

            // Update inventory and sales metrics on product
            if ($product) {
                if ($product->stock_quantity >= $qty) {
                    $product->decrement('stock_quantity', $qty);
                }
                $product->increment('total_sold_count', $qty);
            }

            $image = $item['image'] ?? null;
            if (!$image && $product && !empty($product->images)) {
                $image = $product->images[0];
            }

            $itemsWithVendor[] = [
                'product_id' => (string)($product ? ($product->_id ?? $product->id) : $productId),
                'name' => $item['name'] ?? $item['title'] ?? ($product ? $product->title : 'Product Item'),
                'title' => $item['title'] ?? $item['name'] ?? ($product ? $product->title : 'Product Item'),
                'price' => $unitPrice,
                'quantity' => $qty,
                'vendor_id' => $resolvedVendorId,
                'shop_name' => $resolvedShopName,
                'image' => $image,
                'total' => $lineTotal,
                'platform_fee' => $platformFee,
                'vendor_earning' => $vendorEarning,
            ];
        }

        // Match City-Wise shipping rate using FinanceSetting helper
        $shippingInfo = $financeSettings->getShippingChargeForCity($city);
        $shippingFee = (float)$shippingInfo['charge'];
        $shippingSla = $shippingInfo['sla'] ?? '2-3 Business Days';

        $taxAmount = round($subtotal * $taxRate, 2);
        $totalAmount = round($subtotal + $taxAmount + $shippingFee, 2);
        $orderNumber = 'BIZ-ORD-' . strtoupper(Str::random(3)) . '-' . rand(1000, 9999);

        $userId = auth()->id() ? (string)auth()->id() : null;

        // 1. Create Master Order in MongoDB
        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => $userId,
            'customer_id' => $userId,
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'customer_phone' => $customerPhone,
            'shipping_address' => [
                'name' => $customerName,
                'email' => $customerEmail,
                'phone' => $customerPhone,
                'address' => $shippingAddress,
                'city' => $city,
                'postal_code' => $postalCode,
                'country' => $country,
                'shipping_fee' => $shippingFee,
                'shipping_sla' => $shippingSla,
                'tax_amount' => $taxAmount,
            ],
            'billing_address' => [
                'name' => $customerName,
                'email' => $customerEmail,
                'phone' => $customerPhone,
                'address' => $shippingAddress,
                'city' => $city,
                'country' => $country,
            ],
            'city' => $city,
            'country' => $country,
            'items' => $itemsWithVendor,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingFee,
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'paid',
            'status' => 'pending', // Visible in Super Admin order tabs
            'delivery_status' => 'pending',
            'notes' => $notes,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderIdStr = (string)($order->_id ?? $order->id);

        // 2. Create individual OrderItem documents for multi-vendor routing & vendor dashboard visibility
        foreach ($itemsWithVendor as $iv) {
            OrderItem::create([
                'order_id' => $orderIdStr,
                'vendor_id' => (string)$iv['vendor_id'],
                'product_id' => (string)$iv['product_id'],
                'quantity' => (int)$iv['quantity'],
                'unit_price' => (float)$iv['price'],
                'platform_fee' => (float)$iv['platform_fee'],
                'vendor_earning' => (float)$iv['vendor_earning'],
                'delivery_status' => 'pending',
                'tracking_number' => $orderNumber,
                'carrier' => 'Standard Merchant Dispatch',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Clear session cart
        session()->forget('cart');
        session()->save();

        return redirect()->route('checkout.thankyou', $orderIdStr);
    }

    /**
     * Alias for store method.
     */
    public function store(Request $request)
    {
        return $this->placeOrder($request);
    }

    /**
     * Display the Thank You Order Confirmation Page with printable bill.
     */
    public function thankyou($id): Response
    {
        $order = Order::with(['orderItems.product', 'orderItems.vendor', 'customer'])
            ->where('_id', $id)
            ->orWhere('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $financeSettings = FinanceSetting::getActive();

        return Inertia::render('Checkout/ThankYou', [
            'order' => $order,
            'finance_settings' => [
                'currency' => $financeSettings->currency ?? 'PKR',
                'default_tax_rate' => (float)($financeSettings->default_tax_rate ?? 8.0),
                'support_phone' => '+92 300 1234567',
                'support_email' => 'support@bizzhuss.com',
                'platform_name' => 'Bizzhuss Marketplace Enterprise',
            ],
        ]);
    }
}
