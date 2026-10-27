<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class FinanceSetting extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'finance_settings';
    protected $guarded = [];

    protected $casts = [
        'default_tax_rate' => 'float',
        'platform_commission_rate' => 'float',
        'shipping_rules' => 'array',
    ];

    /**
     * Retrieve the active platform finance settings singleton or create default.
     */
    public static function getActive(): self
    {
        $setting = static::first();
        if (!$setting) {
            $setting = static::create([
                'default_tax_rate' => 5.0,
                'platform_commission_rate' => 10.0,
                'currency' => 'PKR',
                'auto_payout_threshold' => 5000.0,
                'shipping_rules' => [
                    [
                        'region' => 'Sindh',
                        'base_fee' => 250,
                        'free_shipping_threshold' => 5000,
                        'estimated_days' => '2-3 Business Days'
                    ],
                    [
                        'region' => 'Punjab',
                        'base_fee' => 300,
                        'free_shipping_threshold' => 5000,
                        'estimated_days' => '3-4 Business Days'
                    ],
                    [
                        'region' => 'Islamabad & Rawalpindi',
                        'base_fee' => 280,
                        'free_shipping_threshold' => 5000,
                        'estimated_days' => '2-3 Business Days'
                    ],
                    [
                        'region' => 'Khyber Pakhtunkhwa',
                        'base_fee' => 350,
                        'free_shipping_threshold' => 6000,
                        'estimated_days' => '4-5 Business Days'
                    ],
                    [
                        'region' => 'Balochistan',
                        'base_fee' => 450,
                        'free_shipping_threshold' => 8000,
                        'estimated_days' => '5-7 Business Days'
                    ],
                    [
                        'region' => 'Gilgit-Baltistan & AJK',
                        'base_fee' => 450,
                        'free_shipping_threshold' => 8000,
                        'estimated_days' => '5-7 Business Days'
                    ],
                ]
            ]);
        }
        return $setting;
    }
}
