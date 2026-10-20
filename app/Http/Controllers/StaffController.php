<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    /**
     * Store a newly created staff member in MongoDB.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:staff,vendor,super_admin,employee',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        $employee = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : null,
            'role' => $request->role ?? 'staff',
            'permissions' => $request->permissions ?? [],
            'approval_status' => 'approved',
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        return back()->with('success', "Staff member '{$employee->name}' onboarded successfully.");
    }

    /**
     * Update an existing staff member in MongoDB.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:staff,vendor,super_admin,employee',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('role')) {
            $updateData['role'] = $request->role;
        }

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        if ($request->has('permissions')) {
            $updateData['permissions'] = (array) $request->permissions;
        }

        $user->update($updateData);

        return back()->with('success', "Staff record for '{$user->name}' updated successfully.");
    }
}
