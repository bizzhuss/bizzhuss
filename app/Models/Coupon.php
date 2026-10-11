<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'code',
        'discount_type',
        'discount_value',
        'min_spend',
        'usage_limit',
        'times_used',
        'revenue_generated',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_spend' => 'decimal:2',
            'revenue_generated' => 'decimal:2',
            'is_active' => 'boolean',
            'times_used' => 'integer',
            'usage_limit' => 'integer',
            'expires_at' => 'date',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isValidForAmount(float $amount): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->isExpired()) {
            return false;
        }

        if ($this->usage_limit !== null && $this->times_used >= $this->usage_limit) {
            return false;
        }

        if ($amount < (float)$this->min_spend) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $applicableSubtotal): float
    {
        if ($this->discount_type === 'percentage') {
            return round(($applicableSubtotal * (float)$this->discount_value) / 100, 2);
        }

        return min($applicableSubtotal, (float)$this->discount_value);
    }
}
