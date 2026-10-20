<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SubOrder extends BaseModel
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'sub_orders';

    protected $fillable = [
        'order_id',
        'vendor_id',
        'sub_order_number',
        'subtotal',
        'commission_rate',
        'commission_fee',
        'net_earnings',
        'status',
        'items_json',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_fee' => 'decimal:2',
            'net_earnings' => 'decimal:2',
            'items_json' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }
}
