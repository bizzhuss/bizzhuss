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

        if ($request->filled('department_id') || $request->filled('designation_id')) {
            \App\Models\Employee::create([
                'user_id' => (string) $employee->id,
                'department_id' => $request->department_id,
                'designation_id' => $request->designation_id,
                'employee_code' => $request->employee_code ?: ('EMP-' . rand(1000, 9999)),
                'monthly_target' => $request->monthly_target ?? 25,
                'joining_date' => now(),
                'status' => 'active',
                'permissions' => $request->permissions ?? [],
            ]);
        }

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
            \App\Models\Employee::where('user_id', (string) $user->id)->update(['permissions' => (array) $request->permissions]);
        }

        $user->update($updateData);

        return back()->with('success', "Staff record for '{$user->name}' updated successfully.");
    }
}
