<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commission extends BaseModel
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'commissions';

    protected $fillable = [
        'sub_order_id',
        'vendor_id',
        'order_amount',
        'rate_percentage',
        'commission_amount',
        'vendor_net_amount',
        'status',
        'cleared_at',
    ];

    protected function casts(): array
    {
        return [
            'order_amount' => 'decimal:2',
            'rate_percentage' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'vendor_net_amount' => 'decimal:2',
            'cleared_at' => 'datetime',
        ];
    }

    public function subOrder(): BelongsTo
    {
        return $this->belongsTo(SubOrder::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
