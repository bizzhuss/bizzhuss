<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_name',
        'slug',
        'logo',
        'banner',
        'support_phone',
        'description',
        'return_policy',
        'commission_rate',
        'bank_details',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:2',
            'bank_details' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(VendorPayout::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
