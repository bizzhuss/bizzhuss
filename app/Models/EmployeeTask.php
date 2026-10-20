<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeTask extends BaseModel
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'employee_tasks';

    protected $fillable = [
        'title',
        'description',
        'assigned_to',
        'created_by',
        'department',
        'priority',
        'status',
        'due_date',
        'related_entity_type',
        'related_entity_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
