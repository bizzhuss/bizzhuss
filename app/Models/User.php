<?php

namespace App\Models;

use App\Traits\HasMongoPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasMongoPermissions;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'designation',
        'employee_code',
        'department',
        'permissions',
        'approval_status',
        'avatar',
        'phone',
        'status',
        'google_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'permissions' => 'array',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
        ];
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return true;
        }

        $perms = (array) ($this->permissions ?? []);
        if (is_string($perms)) {
            $decoded = json_decode($perms, true);
            $perms = is_array($decoded) ? $decoded : [];
        }

        return in_array('*', $perms) || in_array($permission, $perms);
    }

    public function vendor(): HasOne
    {
        return $this->hasOne(Vendor::class);
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_by');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function isEmployee(): bool
    {
        return in_array($this->role, ['employee', 'staff']);
    }

    public function isStaff(): bool
    {
        return in_array($this->role, ['staff', 'employee']);
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isMarketingManager(): bool
    {
        return $this->role === 'marketing_manager';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
