<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FinanceSetting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Vendor;
use App\Models\VendorPayout;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display the comprehensive Accounts & Financial Intelligence Dashboard.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $typeFilter = $request->input('type', 'all');
        $datePreset = $request->input('date_preset', '30d');

        // 1. Retrieve or seed dynamic Platform Finance Configuration
        $financeSetting = FinanceSetting::getActive();

        // 2. Aggregate Core Platform Financial Metrics
        $orders = Order::all();
        $orderItems = OrderItem::all();
        $payouts = VendorPayout::with('vendor:id,shop_name')->get();
        $vendors = Vendor::all();

        // Safe Decimal128 cast helper
        $toNum = function($val) {
            if ($val === null) return 0.0;
            return is_numeric($val) ? (float)$val : (float)(string)$val;
        };

        // Total Gross Merchandise Value (GMV)
        $totalGmv = $orders->sum(fn($o) => $toNum($o->total_amount));

        // Platform Retained Commission Revenue
        $totalCommission = $orderItems->sum(fn($i) => $toNum($i->platform_fee ?? 0));

        // Vendor Net Earnings (Platform Liabilities)
        $totalVendorEarnings = $orderItems->sum(fn($i) => $toNum($i->vendor_earning ?? ($toNum($i->unit_price) * (int)($i->quantity ?? 1) - $toNum($i->platform_fee ?? 0))));

        // Settled Payouts
        $settledPayouts = $payouts->whereIn('status', ['approved', 'completed', 'paid'])->sum(fn($p) => $toNum($p->amount));
        $pendingPayouts = $payouts->whereIn('status', ['pending', 'processing'])->sum(fn($p) => $toNum($p->amount));

        // Escrow Float (Outstanding Net Payable to Vendors)
        $escrowFloat = max(0, $totalVendorEarnings - $settledPayouts);

        // Tax Collected estimate (default tax rate on GMV)
        $taxRate = (float)($financeSetting->default_tax_rate ?? 5.0);
        $totalEstimatedTax = ($totalGmv * $taxRate) / 100;

        // 3. Build General Ledger (Double-Entry Audit Stream)
        $ledgerEntries = collect();

        // A. Customer Payments (Credits: Inflow into Platform Escrow)
        foreach ($orders as $order) {
            $amt = $toNum($order->total_amount);
            $orderDate = $order->created_at ? Carbon::parse($order->created_at) : Carbon::now();
            $customerName = $order->shipping_address['name'] ?? $order->customer_email ?? 'Online Customer';

            $ledgerEntries->push([
                'id' => 'LED-ORD-' . substr((string)($order->_id ?? $order->id), -8),
                'reference' => $order->order_number ?? ('BZH-' . substr((string)($order->_id ?? $order->id), -6)),
                'type' => 'customer_payment',
                'type_label' => 'Customer Order Payment',
                'date' => $orderDate->format('d M Y, h:i A'),
                'timestamp' => $orderDate->timestamp,
                'entity_type' => 'Customer',
                'entity_name' => $customerName,
                'credit' => $amt,
                'debit' => 0.0,
                'net_impact' => $amt,
                'status' => in_array($order->payment_status, ['paid', 'completed']) ? 'cleared' : 'pending',
                'description' => "Order {$order->order_number} settlement received from buyer.",
            ]);
        }

        // B. Platform Commission Retentions (Earnings Recognized)
        foreach ($orderItems as $item) {
            $fee = $toNum($item->platform_fee ?? 0);
            if ($fee <= 0) continue;

            $itemDate = $item->created_at ? Carbon::parse($item->created_at) : Carbon::now();
            $vendor = $vendors->firstWhere('id', (string)$item->vendor_id);
            $vendorName = $vendor ? $vendor->shop_name : 'Merchant Store';

            $ledgerEntries->push([
                'id' => 'LED-COM-' . substr((string)($item->_id ?? $item->id), -8),
                'reference' => 'COM-' . substr((string)($item->_id ?? $item->id), -6),
                'type' => 'platform_commission',
                'type_label' => 'Platform Fee Retained',
                'date' => $itemDate->format('d M Y, h:i A'),
                'timestamp' => $itemDate->timestamp,
                'entity_type' => 'Platform Treasury',
                'entity_name' => "Commission from {$vendorName}",
                'credit' => $fee,
                'debit' => 0.0,
                'net_impact' => $fee,
                'status' => 'cleared',
                'description' => "Retained marketplace commission fee on order item.",
            ]);
        }

        // C. Vendor Split Allocations (Vendor Net Payable Liability)
        foreach ($orderItems as $item) {
            $earning = $toNum($item->vendor_earning ?? 0);
            if ($earning <= 0) continue;

            $itemDate = $item->created_at ? Carbon::parse($item->created_at) : Carbon::now();
            $vendor = $vendors->firstWhere('id', (string)$item->vendor_id);
            $vendorName = $vendor ? $vendor->shop_name : 'Merchant Store';

            $ledgerEntries->push([
                'id' => 'LED-SPLIT-' . substr((string)($item->_id ?? $item->id), -8),
                'reference' => 'SPLIT-' . substr((string)($item->_id ?? $item->id), -6),
                'type' => 'vendor_split',
                'type_label' => 'Vendor Escrow Split',
                'date' => $itemDate->format('d M Y, h:i A'),
                'timestamp' => $itemDate->timestamp,
                'entity_type' => 'Vendor Escrow',
                'entity_name' => $vendorName,
                'credit' => 0.0,
                'debit' => $earning,
                'net_impact' => -$earning,
                'status' => 'cleared',
                'description' => "Allocated net merchant share to {$vendorName} payable wallet.",
            ]);
        }

        // D. Vendor Payout Settlements (Disbursements Outflow)
        foreach ($payouts as $payout) {
            $payoutAmt = $toNum($payout->amount);
            $payoutDate = $payout->created_at ? Carbon::parse($payout->created_at) : Carbon::now();
            $vendorName = $payout->vendor ? $payout->vendor->shop_name : 'Merchant Store';

            $ledgerEntries->push([
                'id' => 'LED-PAY-' . substr((string)($payout->_id ?? $payout->id), -8),
                'reference' => $payout->transaction_reference ?? ('PO-' . substr((string)($payout->_id ?? $payout->id), -6)),
                'type' => 'vendor_payout',
                'type_label' => 'Vendor Payout Disbursed',
                'date' => $payoutDate->format('d M Y, h:i A'),
                'timestamp' => $payoutDate->timestamp,
                'entity_type' => 'Disbursement',
                'entity_name' => $vendorName,
                'credit' => 0.0,
                'debit' => $payoutAmt,
                'net_impact' => -$payoutAmt,
                'status' => in_array($payout->status, ['approved', 'completed', 'paid']) ? 'cleared' : 'pending',
                'description' => "Settlement via {$payout->payment_method} to {$vendorName}.",
            ]);
        }

        // Apply Ledger Filters (Type & Search)
        $filteredLedger = $ledgerEntries->sortByDesc('timestamp');

        if ($typeFilter && $typeFilter !== 'all') {
            $filteredLedger = $filteredLedger->where('type', $typeFilter);
        }

        if ($search) {
            $s = strtolower($search);
            $filteredLedger = $filteredLedger->filter(function($row) use ($s) {
                return str_contains(strtolower($row['id']), $s) ||
                       str_contains(strtolower($row['reference']), $s) ||
                       str_contains(strtolower($row['entity_name']), $s) ||
                       str_contains(strtolower($row['description']), $s);
            });
        }

        // 4. Vendor Split Settlements Overview
        $vendorSettlements = $vendors->map(function($vendor) use ($orderItems, $payouts, $toNum) {
            $vendorIdStr = (string)($vendor->_id ?? $vendor->id);
            $items = $orderItems->filter(fn($i) => (string)$i->vendor_id === $vendorIdStr);

            $grossSales = $items->sum(fn($i) => $toNum($i->unit_price) * (int)($i->quantity ?? 1));
            $commissionDeducted = $items->sum(fn($i) => $toNum($i->platform_fee ?? 0));
            $netEarnings = $items->sum(fn($i) => $toNum($i->vendor_earning ?? ($toNum($i->unit_price) * (int)($i->quantity ?? 1) - $toNum($i->platform_fee ?? 0))));

            $vendorPayouts = $payouts->filter(fn($p) => (string)$p->vendor_id === $vendorIdStr);
            $totalSettled = $vendorPayouts->whereIn('status', ['approved', 'completed', 'paid'])->sum(fn($p) => $toNum($p->amount));
            $pendingSettled = $vendorPayouts->whereIn('status', ['pending', 'processing'])->sum(fn($p) => $toNum($p->amount));

            $payableBalance = max(0, $netEarnings - $totalSettled);

            return [
                'id' => $vendorIdStr,
                'shop_name' => $vendor->shop_name,
                'slug' => $vendor->slug ?? '',
                'commission_rate' => (float)($vendor->commission_rate ?? 10.0),
                'gross_sales' => round($grossSales, 2),
                'commission_deducted' => round($commissionDeducted, 2),
                'net_earnings' => round($netEarnings, 2),
                'total_settled' => round($totalSettled, 2),
                'pending_settled' => round($pendingSettled, 2),
                'payable_balance' => round($payableBalance, 2),
                'order_items_count' => $items->count(),
                'status' => $vendor->status ?? 'active',
            ];
        });

        // 5. Package KPI Metrics
        $metrics = [
            'total_gmv' => round($totalGmv, 2),
            'total_platform_commission' => round($totalCommission, 2),
            'total_vendor_earnings' => round($totalVendorEarnings, 2),
            'total_payouts_settled' => round($settledPayouts, 2),
            'pending_payouts' => round($pendingPayouts, 2),
            'escrow_float' => round($escrowFloat, 2),
            'estimated_tax' => round($totalEstimatedTax, 2),
            'total_orders' => $orders->count(),
            'active_vendors_count' => $vendors->where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/Finance/Index', [
            'metrics' => $metrics,
            'ledger' => $filteredLedger->values()->take(50), // top 50 rows for performance
            'total_ledger_count' => $filteredLedger->count(),
            'vendor_settlements' => $vendorSettlements->values(),
            'finance_settings' => $financeSetting,
            'filters' => [
                'search' => $search ?? '',
                'type' => $typeFilter,
                'date_preset' => $datePreset,
            ],
            'recent_payouts' => $payouts->take(10)->values(),
        ]);
    }

    /**
     * Update dynamic regional tax & shipping matrix.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'default_tax_rate' => 'required|numeric|min:0|max:100',
            'platform_commission_rate' => 'required|numeric|min:0|max:100',
            'currency' => 'required|string|max:10',
            'auto_payout_threshold' => 'required|numeric|min:0',
            'shipping_rules' => 'required|array',
            'shipping_rules.*.region' => 'required|string',
            'shipping_rules.*.base_fee' => 'required|numeric|min:0',
            'shipping_rules.*.free_shipping_threshold' => 'required|numeric|min:0',
            'shipping_rules.*.estimated_days' => 'required|string',
        ]);

        $setting = FinanceSetting::getActive();
        $setting->update($validated);

        return redirect()->back()->with('success', 'Platform Financial Rules & Regional Shipping Matrix successfully updated.');
    }

    /**
     * Create and record a vendor settlement disbursement.
     */
    public function createPayout(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'transaction_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $vendor = Vendor::where('_id', $validated['vendor_id'])->orWhere('id', $validated['vendor_id'])->firstOrFail();

        $reference = $validated['transaction_reference'] ?: ('BZH-PAY-' . strtoupper(substr(md5(uniqid()), 0, 8)));

        VendorPayout::create([
            'vendor_id' => (string)($vendor->_id ?? $vendor->id),
            'amount' => (float)$validated['amount'],
            'status' => 'approved',
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $reference,
            'notes' => $validated['notes'] ?? ("Manual settlement payout to {$vendor->shop_name}"),
            'processed_at' => Carbon::now(),
        ]);

        return redirect()->back()->with('success', "Disbursement of PKR {$validated['amount']} to {$vendor->shop_name} recorded successfully (Ref: {$reference}).");
    }

    /**
     * Settle / approve a pending payout request.
     */
    public function settlePayout(Request $request, $id)
    {
        $payout = VendorPayout::where('_id', $id)->orWhere('id', $id)->firstOrFail();

        $payout->update([
            'status' => 'approved',
            'transaction_reference' => $payout->transaction_reference ?: ('BZH-STL-' . strtoupper(substr(md5(uniqid()), 0, 8))),
            'processed_at' => Carbon::now(),
        ]);

        return redirect()->back()->with('success', "Vendor payout (Ref: {$payout->transaction_reference}) successfully approved & settled.");
    }
}
