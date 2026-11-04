<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends BaseModel
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['sub_orders'];

    protected function casts(): array
    {
        return [
            'total_amount' => 'float',
            'subtotal' => 'float',
            'tax_amount' => 'float',
            'shipping_amount' => 'float',
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'items' => 'array',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Resilient Customer Name Accessor
     */
    public function getCustomerNameAttribute($value)
    {
        if (!empty($value)) return $value;
        if (!empty($this->attributes['name'])) return $this->attributes['name'];
        if (isset($this->attributes['shipping_address']['name'])) return $this->attributes['shipping_address']['name'];
        if ($this->customer) return $this->customer->name;
        return 'Customer';
    }

    /**
     * Resilient Customer Email Accessor
     */
    public function getCustomerEmailAttribute($value)
    {
        if (!empty($value)) return $value;
        if (!empty($this->attributes['email'])) return $this->attributes['email'];
        if (isset($this->attributes['shipping_address']['email'])) return $this->attributes['shipping_address']['email'];
        if ($this->customer) return $this->customer->email;
        return '';
    }

    /**
     * Resilient Customer Phone Accessor
     */
    public function getCustomerPhoneAttribute($value)
    {
        if (!empty($value)) return $value;
        if (!empty($this->attributes['phone'])) return $this->attributes['phone'];
        if (isset($this->attributes['shipping_address']['phone'])) return $this->attributes['shipping_address']['phone'];
        if ($this->customer) return $this->customer->phone;
        return '';
    }

    /**
     * Resilient Shipping Address Accessor (supports string or array)
     */
    public function getShippingAddressAttribute($value)
    {
        if (is_array($value)) {
            return $value;
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return $decoded;
            }
            return [
                'name' => $this->attributes['customer_name'] ?? ($this->attributes['name'] ?? 'Customer'),
                'email' => $this->attributes['customer_email'] ?? ($this->attributes['email'] ?? ''),
                'phone' => $this->attributes['customer_phone'] ?? ($this->attributes['phone'] ?? ''),
                'address' => $value,
                'city' => $this->attributes['city'] ?? '',
                'country' => $this->attributes['country'] ?? 'Pakistan',
            ];
        }
        return $value ?? [];
    }

    /**
     * Resilient Sub-Orders Accessor for Super Admin Dashboard
     */
    public function getSubOrdersAttribute()
    {
        $orderItems = $this->relationLoaded('orderItems') ? $this->orderItems : null;
        
        if ($orderItems && $orderItems->isNotEmpty()) {
            return $orderItems->groupBy('vendor_id')->map(function ($vItems, $vId) {
                $first = $vItems->first();
                return [
                    'id' => (string)$vId,
                    'vendor' => $first->vendor ? [
                        'id' => (string)$first->vendor->id,
                        'shop_name' => $first->vendor->shop_name
                    ] : [
                        'id' => (string)$vId,
                        'shop_name' => 'Verified Vendor'
                    ],
                    'subtotal' => (float)$vItems->sum(fn($i) => (float)$i->unit_price * (int)$i->quantity),
                ];
            })->values()->all();
        }

        if (!empty($this->attributes['items'])) {
            $rawItems = is_array($this->attributes['items']) 
                ? $this->attributes['items'] 
                : json_decode($this->attributes['items'], true);

            if (is_array($rawItems)) {
                return collect($rawItems)->groupBy('vendor_id')->map(function ($vItems, $vId) {
                    $first = $vItems->first();
                    return [
                        'id' => (string)$vId,
                        'vendor' => [
                            'id' => (string)$vId,
                            'shop_name' => $first['shop_name'] ?? 'Verified Vendor'
                        ],
                        'subtotal' => (float)collect($vItems)->sum(fn($i) => (float)($i['price'] ?? 0) * (int)($i['quantity'] ?? 1)),
                    ];
                })->values()->all();
            }
        }

        return [];
    }
}
