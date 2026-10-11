<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    /**
     * Process checkout, creating master Order and vendor-specific OrderItems.
     *
     * @param array $customerDetails
     * @param array $cartItems array of ['id' => product_id, 'quantity' => int]
     * @param User|null $customer
     * @return Order
     */
    public function processCheckout(array $customerDetails, array $cartItems, ?User $customer = null): Order
    {
        return DB::transaction(function () use ($customerDetails, $cartItems, $customer) {
            $productIds = array_column($cartItems, 'id');
            $products = Product::with('vendor')->whereIn('id', $productIds)->get()->keyBy('id');

            $orderSubtotal = 0.00;
            $preparedItems = [];

            foreach ($cartItems as $item) {
                $product = $products->get($item['id']);
                // Gatekeeper: only active vendors can receive customer orders
                if (!$product || !$product->vendor || $product->vendor->status !== 'active') {
                    continue;
                }

                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $price = (float) $product->price;
                $lineTotal = round($price * $qty, 2);
                $orderSubtotal += $lineTotal;

                $vendor = $product->vendor;
                $rate = $vendor ? (float) $vendor->commission_rate : 10.00;
                $platformFee = round($lineTotal * ($rate / 100), 2);
                $vendorEarning = round($lineTotal - $platformFee, 2);

                $preparedItems[] = [
                    'product' => $product,
                    'vendor_id' => $product->vendor_id,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'platform_fee' => $platformFee,
                    'vendor_earning' => $vendorEarning,
                ];

                // Decrement inventory and increment total_sold_count
                if ($product->stock_quantity >= $qty) {
                    $product->decrement('stock_quantity', $qty);
                }
                $product->increment('total_sold_count', $qty);
            }

            // Apply Vendor Coupon if supplied
            $discountAmount = 0.00;
            if (!empty($customerDetails['coupon_code'])) {
                $couponCode = Str::upper(trim($customerDetails['coupon_code']));
                $coupon = Coupon::where('code', $couponCode)->where('is_active', true)->first();

                if ($coupon && !$coupon->isExpired()) {
                    // Check items belonging to this vendor
                    $vendorItemsSubtotal = 0.00;
                    foreach ($preparedItems as $prep) {
                        if ($prep['vendor_id'] === $coupon->vendor_id) {
                            $vendorItemsSubtotal += ($prep['unit_price'] * $prep['quantity']);
                        }
                    }

                    if ($vendorItemsSubtotal >= (float)$coupon->min_spend) {
                        $discountAmount = $coupon->calculateDiscount($vendorItemsSubtotal);
                        $coupon->increment('times_used');
                        $coupon->increment('revenue_generated', $vendorItemsSubtotal);
                    }
                }
            }

            $orderSubtotalAfterDiscount = max(0.00, $orderSubtotal - $discountAmount);
            $shippingFee = $orderSubtotalAfterDiscount > 150 ? 0.00 : 15.00;
            $taxAmount = round($orderSubtotalAfterDiscount * 0.08, 2);
            $totalAmount = $orderSubtotalAfterDiscount + $shippingFee + $taxAmount;

            $orderNumber = 'BZH-' . strtoupper(Str::random(8));

            // Create Master Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer?->id,
                'total_amount' => $totalAmount,
                'payment_status' => 'paid',
                'shipping_address' => [
                    'name' => $customerDetails['name'] ?? 'Guest Customer',
                    'email' => $customerDetails['email'] ?? 'customer@example.com',
                    'phone' => $customerDetails['phone'] ?? null,
                    'address' => $customerDetails['shipping_address'] ?? '124 Enterprise Blvd',
                ],
                'billing_address' => [
                    'name' => $customerDetails['name'] ?? 'Guest Customer',
                    'address' => $customerDetails['shipping_address'] ?? '124 Enterprise Blvd',
                ],
            ]);

            // Create OrderItems (Vendor Sub-Orders)
            foreach ($preparedItems as $prep) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'vendor_id' => $prep['vendor_id'],
                    'product_id' => $prep['product']->id,
                    'quantity' => $prep['quantity'],
                    'unit_price' => $prep['unit_price'],
                    'platform_fee' => $prep['platform_fee'],
                    'vendor_earning' => $prep['vendor_earning'],
                    'delivery_status' => 'processing',
                ]);
            }

            return $order->load('orderItems.vendor', 'orderItems.product');
        });
    }
}
