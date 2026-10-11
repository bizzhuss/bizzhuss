<?php

namespace App\Services;

use App\Models\Payout;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayoutService
{
    /**
     * Request a disbursement for a vendor.
     *
     * @param Vendor $vendor
     * @param float $amount
     * @param string $payoutMethod
     * @param string $accountDetails
     * @return Payout
     * @throws \Exception
     */
    public function requestPayout(Vendor $vendor, float $amount, string $payoutMethod = 'bank_transfer', string $accountDetails = ''): Payout
    {
        if ($vendor->balance < $amount) {
            throw new \Exception("Insufficient vendor balance: \${$vendor->balance} available.");
        }

        return DB::transaction(function () use ($vendor, $amount, $payoutMethod, $accountDetails) {
            $payout = Payout::create([
                'vendor_id' => $vendor->id,
                'payout_number' => 'PO-' . strtoupper(Str::random(8)),
                'amount' => $amount,
                'payout_method' => $payoutMethod,
                'account_details' => $accountDetails ?: 'Default Commercial Payout Routing',
                'status' => 'pending',
                'notes' => 'Automated monthly disbursement batch',
            ]);

            $vendor->decrement('balance', $amount);

            return $payout;
        });
    }

    /**
     * Approve and mark a payout as completed.
     */
    public function completePayout(Payout $payout, string $referenceId = ''): Payout
    {
        $payout->update([
            'status' => 'paid',
            'reference_id' => $referenceId ?: 'TRX-' . strtoupper(Str::random(10)),
            'processed_at' => now(),
        ]);

        return $payout;
    }
}
