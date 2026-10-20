<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'department_id',
        'designation_id',
        'employee_code',
        'monthly_target',
        'joining_date',
        'status',
        'permissions',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'permissions' => 'array',
    ];

    protected function casts(): array
    {
        return [
            'joining_date' => 'date',
            'permissions' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to', 'user_id');
    }
}
