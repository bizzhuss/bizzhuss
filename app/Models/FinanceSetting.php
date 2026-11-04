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
        'default_shipping_charge' => 'float',
        'city_shipping_rules' => 'array',
        'shipping_rules' => 'array',
        'auto_payout_threshold' => 'float',
    ];

    /**
     * Retrieve the active platform finance settings singleton or create default.
     */
    public static function getActive(): self
    {
        $setting = static::first();
        if (!$setting) {
            $setting = static::create([
                'default_tax_rate' => 8.0,
                'platform_commission_rate' => 8.0,
                'default_shipping_charge' => 250, // Fallback if city not explicitly listed
                'currency' => 'PKR',
                'auto_payout_threshold' => 5000.0,
                'city_shipping_rules' => [
                    ['city' => 'Karachi', 'charge' => 150, 'sla' => '1-2 Business Days'],
                    ['city' => 'Lahore', 'charge' => 250, 'sla' => '2-3 Business Days'],
                    ['city' => 'Islamabad', 'charge' => 250, 'sla' => '2-3 Business Days'],
                    ['city' => 'Rawalpindi', 'charge' => 250, 'sla' => '2-3 Business Days'],
                    ['city' => 'Faisalabad', 'charge' => 300, 'sla' => '3-4 Business Days'],
                    ['city' => 'Multan', 'charge' => 300, 'sla' => '3-4 Business Days'],
                    ['city' => 'Peshawar', 'charge' => 300, 'sla' => '3-4 Business Days'],
                    ['city' => 'Quetta', 'charge' => 350, 'sla' => '4-5 Business Days'],
                ]
            ]);
        } elseif (empty($setting->city_shipping_rules)) {
            $setting->update([
                'default_tax_rate' => (float)($setting->default_tax_rate ?? 8.0),
                'platform_commission_rate' => (float)($setting->platform_commission_rate ?? 8.0),
                'default_shipping_charge' => 250,
                'city_shipping_rules' => [
                    ['city' => 'Karachi', 'charge' => 150, 'sla' => '1-2 Business Days'],
                    ['city' => 'Lahore', 'charge' => 250, 'sla' => '2-3 Business Days'],
                    ['city' => 'Islamabad', 'charge' => 250, 'sla' => '2-3 Business Days'],
                    ['city' => 'Rawalpindi', 'charge' => 250, 'sla' => '2-3 Business Days'],
                    ['city' => 'Faisalabad', 'charge' => 300, 'sla' => '3-4 Business Days'],
                    ['city' => 'Multan', 'charge' => 300, 'sla' => '3-4 Business Days'],
                    ['city' => 'Peshawar', 'charge' => 300, 'sla' => '3-4 Business Days'],
                    ['city' => 'Quetta', 'charge' => 350, 'sla' => '4-5 Business Days'],
                ]
            ]);
        }

        return $setting;
    }

    /**
     * Resolve delivery charge and SLA for a given city name.
     */
    public function getShippingChargeForCity(?string $city): array
    {
        $defaultCharge = (float)($this->default_shipping_charge ?? 250.0);
        $defaultSla = '2-4 Business Days';

        if (!$city) {
            return [
                'city' => 'Nationwide Standard',
                'charge' => $defaultCharge,
                'sla' => $defaultSla,
                'is_matched' => false,
            ];
        }

        $cityClean = strtolower(trim($city));
        $rules = (array)($this->city_shipping_rules ?? []);

        foreach ($rules as $rule) {
            $ruleCity = strtolower(trim($rule['city'] ?? ''));
            if ($ruleCity !== '' && ($ruleCity === $cityClean || str_contains($cityClean, $ruleCity) || str_contains($ruleCity, $cityClean))) {
                return [
                    'city' => $rule['city'],
                    'charge' => (float)($rule['charge'] ?? $defaultCharge),
                    'sla' => $rule['sla'] ?? $defaultSla,
                    'is_matched' => true,
                ];
            }
        }

        return [
            'city' => trim($city),
            'charge' => $defaultCharge,
            'sla' => $defaultSla,
            'is_matched' => false,
        ];
    }
}
