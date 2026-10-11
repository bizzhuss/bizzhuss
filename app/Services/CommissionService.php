<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\SubOrder;
use App\Models\Vendor;

class CommissionService
{
    /**
     * Calculate platform commission amount and vendor net earnings.
     *
     * @param float $subtotal
     * @param float $ratePercentage
     * @return array{commission: float, net: float}
     */
    public function calculate(float $subtotal, float $ratePercentage): array
    {
        $commission = round(($subtotal * ($ratePercentage / 100)), 2);
        $net = round($subtotal - $commission, 2);

        return [
            'commission' => $commission,
            'net' => $net,
        ];
    }

    /**
     * Record commission ledger for a specific sub-order.
     */
    public function recordCommission(SubOrder $subOrder): Commission
    {
        $vendor = $subOrder->vendor;
        $rate = (float) $vendor->commission_rate;
        $calc = $this->calculate((float) $subOrder->subtotal, $rate);

        return Commission::create([
            'sub_order_id' => $subOrder->id,
            'vendor_id' => $vendor->id,
            'order_amount' => $subOrder->subtotal,
            'rate_percentage' => $rate,
            'commission_amount' => $calc['commission'],
            'vendor_net_amount' => $calc['net'],
            'status' => 'cleared',
            'cleared_at' => now(),
        ]);
    }

    /**
     * Mark a commission as cleared and update the vendor balance.
     */
    public function clearCommission(Commission $commission): void
    {
        if ($commission->status !== 'cleared') {
            $commission->update([
                'status' => 'cleared',
                'cleared_at' => now(),
            ]);

            $vendor = $commission->vendor;
            $vendor->increment('balance', $commission->vendor_net_amount);
        }
    }
}
