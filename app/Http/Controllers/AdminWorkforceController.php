<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminWorkforceController extends Controller
{
    /**
     * Display Department & Designation Management.
     */
    public function departments(Request $request): Response
    {
        $departments = Department::with(['designations', 'employees'])
            ->orderBy('name')
            ->get();

        $metrics = [
            'total_departments' => $departments->count(),
            'total_designations' => Designation::count(),
            'total_workforce' => Employee::count(),
        ];

        return Inertia::render('Admin/Departments', [
            'departments' => $departments,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Create a new department.
     */
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:departments,name',
            'description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Department::create($validated);

        return redirect()->back()->with('success', "Department '{$validated['name']}' created successfully.");
    }

    /**
     * Update an existing department.
     */
    public function updateDepartment(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:departments,name,' . $department->id,
            'description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $department->update($validated);

        return redirect()->back()->with('success', "Department '{$department->name}' updated successfully.");
    }

    /**
     * Delete a department.
     */
    public function destroyDepartment(Department $department)
    {
        if ($department->employees()->count() > 0) {
            return redirect()->back()->with('error', "Cannot delete department with active employees assigned. Reassign personnel first.");
        }

        $name = $department->name;
        $department->delete();

        return redirect()->back()->with('success', "Department '{$name}' deleted successfully.");
    }

    /**
     * Add a designation under a department.
     */
    public function storeDesignation(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'title' => 'required|string|max:100',
        ]);

        Designation::create($validated);

        return redirect()->back()->with('success', "Designation '{$validated['title']}' created successfully.");
    }

    /**
     * Delete a designation.
     */
    public function destroyDesignation(Designation $designation)
    {
        if (Employee::where('designation_id', $designation->id)->count() > 0) {
            return redirect()->back()->with('error', "Cannot delete designation assigned to active employees.");
        }

        $title = $designation->title;
        $designation->delete();

        return redirect()->back()->with('success', "Designation '{$title}' removed successfully.");
    }

    /**
     * Display Employee Directory & Onboarding.
     */
    public function employees(Request $request): Response
    {
        $search = $request->input('search');
        $departmentFilter = $request->input('department');

        $query = Employee::with([
            'user:id,name,email,phone,avatar,status',
            'department:id,name',
            'designation:id,title',
        ]);

        if ($departmentFilter && $departmentFilter !== 'all') {
            $query->where('department_id', $departmentFilter);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $employees = $query->get()->map(function ($employee) {
            $activeTasksCount = Task::where('assigned_to', $employee->user_id)
                ->whereIn('status', ['todo', 'in_progress', 'review'])
                ->count();

            $completedTasksCount = Task::where('assigned_to', $employee->user_id)
                ->where('status', 'completed')
                ->count();

            $userPerms = ($employee->user && method_exists($employee->user, 'getAllPermissions'))
                ? $employee->user->getAllPermissions()->pluck('name')->toArray()
                : [];

            return [
                'id' => $employee->id,
                'user_id' => $employee->user_id,
                'employee_code' => $employee->employee_code,
                'monthly_target' => $employee->monthly_target ?? 25,
                'joining_date' => $employee->joining_date ? $employee->joining_date->format('Y-m-d') : null,
                'status' => $employee->status,
                'user' => $employee->user ? [
                    'id' => $employee->user->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                    'phone' => $employee->user->phone,
                    'avatar' => $employee->user->avatar,
                    'status' => $employee->user->status,
                    'permissions' => $userPerms,
                ] : null,
                'department' => $employee->department,
                'designation' => $employee->designation,
                'active_tasks_count' => $activeTasksCount,
                'completed_tasks_count' => $completedTasksCount,
            ];
        });

        $departments = Department::with('designations')->orderBy('name')->get();

        $metrics = [
            'total_employees' => $employees->count(),
            'active_personnel' => $employees->where('status', 'active')->count(),
            'total_active_tasks' => $employees->sum('active_tasks_count'),
            'total_completed_tasks' => $employees->sum('completed_tasks_count'),
        ];

        return Inertia::render('Admin/Employees', [
            'employees' => $employees,
            'departments' => $departments,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'department' => $departmentFilter,
            ],
        ]);
    }

    /**
     * Onboard a new employee / staff member.
     */
    public function storeEmployee(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:staff,vendor,super_admin,employee',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'phone' => 'nullable|string|max:30',
            'department_id' => 'nullable|string|max:100',
            'designation_id' => 'nullable|string|max:100',
            'employee_code' => 'nullable|string',
            'monthly_target' => 'nullable|integer|min:1',
        ]);

        $role = $request->role ?? 'staff';
        $perms = $request->permissions ?? ($role === 'super_admin' ? ['*'] : ['tier.employee_desk', 'module.kanban']);

        $employee = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : null,
            'phone' => $request->phone ?? null,
            'role' => $role,
            'permissions' => $perms,
            'approval_status' => 'approved',
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        $designationId = $this->resolveDesignationId($request->designation_id, $request->department_id);

        Employee::create([
            'user_id' => $employee->id,
            'department_id' => $request->department_id,
            'designation_id' => $designationId,
            'employee_code' => $request->employee_code ?: ('EMP-' . rand(1000, 9999)),
            'monthly_target' => $request->monthly_target ?? 25,
            'joining_date' => now(),
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', "Staff member '{$employee->name}' onboarded successfully.");
    }

    /**
     * Update an employee.
     */
    public function updateEmployee(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'department_id' => 'nullable|string|max:100',
            'designation_id' => 'nullable|string|max:100',
            'monthly_target' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive,on_leave',
            'role' => 'nullable|string|in:staff,vendor,super_admin,employee',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'password' => 'nullable|string|min:6',
        ]);

        $userData = [
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? $employee->user?->phone,
        ];

        if ($request->filled('role')) {
            $userData['role'] = $request->role;
        }

        if ($request->has('permissions')) {
            $userData['permissions'] = (array) $request->permissions;
        }

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        if ($employee->user) {
            $employee->user->update($userData);
        }

        $designationId = $request->filled('designation_id') 
            ? $this->resolveDesignationId($request->designation_id, $request->department_id ?? $employee->department_id) 
            : $employee->designation_id;

        $employee->update([
            'department_id' => $validated['department_id'] ?? $employee->department_id,
            'designation_id' => $designationId,
            'monthly_target' => $validated['monthly_target'] ?? $employee->monthly_target ?? 25,
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', "Employee record for '{$employee->user?->name}' updated.");
    }

    /**
     * Resolve designation ID from either a standard slug value or ObjectId.
     */
    protected function resolveDesignationId(?string $designationId, ?string $departmentId): ?string
    {
        if (empty($designationId)) {
            return null;
        }

        $standardMap = [
            'operations_manager' => 'Operations Manager',
            'catalog_specialist' => 'Catalog Specialist',
            'merchant_auditor' => 'Merchant Auditor',
            'support_rep' => 'Customer Support Executive',
            'marketing_lead' => 'Marketing Lead',
            'staff' => 'Platform Staff / General',
            'vendor_rep' => 'Vendor Partner Representative',
        ];

        if (isset($standardMap[$designationId])) {
            $title = $standardMap[$designationId];
            $desig = Designation::firstOrCreate(
                ['title' => $title],
                ['department_id' => $departmentId]
            );
            return (string) $desig->id;
        }

        // If it's already an existing designation in database, return as is
        $existing = Designation::find($designationId);
        if ($existing) {
            return (string) $existing->id;
        }

        // If it's a custom text slug/name
        $title = ucwords(str_replace('_', ' ', $designationId));
        $desig = Designation::firstOrCreate(
            ['title' => $title],
            ['department_id' => $departmentId]
        );
        return (string) $desig->id;
    }

    /**
     * Delete an employee.
     */
    public function destroyEmployee(Employee $employee)
    {
        $name = $employee->user ? $employee->user->name : 'Employee';
        $user = $employee->user;

        $employee->delete();
        if ($user) {
            $user->delete();
        }

        return redirect()->back()->with('success', "Employee '{$name}' removed from workforce.");
    }

    /**
     * Update tier and module permissions for an employee.
     */
    public function updatePermissions(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|max:100',
        ]);

        if ($employee->user) {
            $employee->user->syncPermissions($validated['permissions'] ?? []);
        }

        return redirect()->back()->with('success', "Permissions updated for {$employee->user->name}.");
    }
}
