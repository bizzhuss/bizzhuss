<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function designations(): HasMany
    {
        return $this->hasMany(Designation::class);
    }

    protected $appends = ['employees_count'];

    public function getEmployeesCountAttribute(): int
    {
        if ($this->relationLoaded('employees')) {
            return $this->employees ? $this->employees->count() : 0;
        }
        return $this->employees()->count();
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
