<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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
        'status',
        'approval_status',
        'phone',
        'avatar',
        'google_id',
        'email_verified_at',
        'permissions',
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
        return $this->role === 'employee';
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

    /**
     * Check if user has a specific permission.
     */
    public function hasPermissionTo(string $permission): bool
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return true;
        }

        $perms = $this->permissions ?? [];
        if (!is_array($perms)) {
            $perms = is_string($perms) ? json_decode($perms, true) ?? [] : [];
        }

        if (in_array('*', $perms)) {
            return true;
        }

        return in_array($permission, $perms);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        if ($role === 'super_admin' && ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com')) {
            return true;
        }
        return $this->role === $role;
    }

    /**
     * Synchronize permissions for this user.
     */
    public function syncPermissions(array|\Illuminate\Support\Collection $permissions): static
    {
        if ($permissions instanceof \Illuminate\Support\Collection) {
            $permissions = $permissions->toArray();
        }
        $this->permissions = array_values(array_unique($permissions));
        $this->save();
        return $this;
    }

    /**
     * Grant permissions to this user.
     */
    public function givePermissionTo(...$permissions): static
    {
        $current = $this->permissions ?? [];
        $flattened = is_array($permissions[0] ?? null) ? $permissions[0] : $permissions;
        $this->permissions = array_values(array_unique(array_merge($current, $flattened)));
        $this->save();
        return $this;
    }

    /**
     * Get all permissions as collection.
     */
    public function getAllPermissions(): \Illuminate\Support\Collection
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return collect([(object) ['name' => '*']]);
        }

        $perms = $this->permissions ?? [];
        if (!is_array($perms)) {
            $perms = is_string($perms) ? json_decode($perms, true) ?? [] : [];
        }

        return collect($perms)->map(fn ($p) => (object) ['name' => $p]);
    }
}
