<?php

namespace App\Traits;

use Illuminate\Support\Collection;

trait HasMongoPermissions
{
    /**
     * Decode a JSON/Array value from a MongoDB attribute with BSON safety.
     * Prevents TypeError when MongoDB driver returns native PHP array instead of JSON string.
     *
     * @param  mixed  $value
     * @param  bool  $asObject
     * @return mixed
     */
    public function fromJson($value, $asObject = false)
    {
        if (is_array($value)) {
            return $asObject ? (object) $value : $value;
        }

        if (is_object($value)) {
            return $asObject ? $value : (array) $value;
        }

        return parent::fromJson($value, $asObject);
    }

    /**
     * Check if user has a specific role or matches any in a list of roles.
     * Super Admin has universal override.
     *
     * @param  string|array  $roles
     * @return bool
     */
    public function hasRole(string|array $roles): bool
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return true;
        }

        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }

        return $this->role === $roles;
    }

    /**
     * Check if user has a specific permission.
     * Super Admin has universal unrestricted access.
     *
     * @param  string  $permission
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return true;
        }

        $perms = $this->getPermissionsList();

        return in_array('*', $perms) || in_array($permission, $perms);
    }

    /**
     * Alias for Spatie HasRoles / Laravel compatibility.
     *
     * @param  string  $permission
     * @return bool
     */
    public function hasPermissionTo(string $permission): bool
    {
        return $this->hasPermission($permission);
    }

    /**
     * Check if user has any of the given permissions.
     *
     * @param  string|array  ...$permissions
     * @return bool
     */
    public function hasAnyPermission(...$permissions): bool
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return true;
        }

        $flattened = is_array($permissions[0] ?? null) ? $permissions[0] : $permissions;
        $userPerms = $this->getPermissionsList();

        if (in_array('*', $userPerms)) {
            return true;
        }

        foreach ($flattened as $perm) {
            if (in_array($perm, $userPerms)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     *
     * @param  string|array  ...$permissions
     * @return bool
     */
    public function hasAllPermissions(...$permissions): bool
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return true;
        }

        $flattened = is_array($permissions[0] ?? null) ? $permissions[0] : $permissions;
        $userPerms = $this->getPermissionsList();

        if (in_array('*', $userPerms)) {
            return true;
        }

        foreach ($flattened as $perm) {
            if (!in_array($perm, $userPerms)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Synchronize permissions for this user directly as a document array.
     *
     * @param  array|\Illuminate\Support\Collection  $permissions
     * @return static
     */
    public function syncPermissions(array|Collection $permissions): static
    {
        if ($permissions instanceof Collection) {
            $permissions = $permissions->toArray();
        }

        $clean = array_values(array_unique(array_filter($permissions, fn ($p) => is_string($p) && trim($p) !== '')));
        $this->permissions = $clean;
        $this->save();

        return $this;
    }

    /**
     * Grant permissions to this user.
     *
     * @param  mixed  ...$permissions
     * @return static
     */
    public function givePermissionTo(...$permissions): static
    {
        $current = $this->getPermissionsList();
        $flattened = is_array($permissions[0] ?? null) ? $permissions[0] : $permissions;
        $merged = array_values(array_unique(array_merge($current, (array) $flattened)));
        $this->permissions = $merged;
        $this->save();

        return $this;
    }

    /**
     * Revoke permissions from this user.
     *
     * @param  mixed  ...$permissions
     * @return static
     */
    public function revokePermissionTo(...$permissions): static
    {
        $current = $this->getPermissionsList();
        $flattened = is_array($permissions[0] ?? null) ? $permissions[0] : $permissions;
        $filtered = array_values(array_diff($current, (array) $flattened));
        $this->permissions = $filtered;
        $this->save();

        return $this;
    }

    /**
     * Assign role to user with optional persistence.
     *
     * @param  string  $role
     * @return static
     */
    public function assignRole(string $role): static
    {
        $this->role = $role;
        $this->save();

        return $this;
    }

    /**
     * Get raw array of permissions.
     *
     * @return array<string>
     */
    public function getPermissionsList(): array
    {
        $perms = $this->permissions ?? [];
        if (is_string($perms)) {
            $decoded = json_decode($perms, true);
            $perms = is_array($decoded) ? $decoded : [];
        }

        return is_array($perms) ? array_values($perms) : [];
    }

    /**
     * Get all permissions as collection of permission objects (Spatie compatible).
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAllPermissions(): Collection
    {
        if ($this->role === 'super_admin' || $this->email === 'haseebkhanuddin44@gmail.com') {
            return collect([(object) ['name' => '*']]);
        }

        $perms = $this->getPermissionsList();

        return collect($perms)->map(fn ($p) => (object) ['name' => $p]);
    }
}
