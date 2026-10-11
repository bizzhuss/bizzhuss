<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeTaskRequest;
use App\Models\Department;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display the Employee Task Management Workspace.
     */
    public function index(Request $request): Response
    {
        $priority = $request->input('priority');
        $assignedTo = $request->input('assigned_to');

        $query = Task::with(['assignee:id,name,email', 'creator:id,name']);

        if ($priority && $priority !== 'all') {
            $query->where('priority', $priority);
        }

        if ($assignedTo) {
            $query->where('assigned_to', $assignedTo);
        }

        $tasks = $query->orderBy('due_date', 'asc')->get();

        $employees = User::where('role', 'employee')
            ->with('employee.department', 'employee.designation')
            ->select('id', 'name', 'email')
            ->get();

        $departments = Department::pluck('name')->toArray();
        if (empty($departments)) {
            $departments = ['Quality Assurance', 'Logistics & Dispatch', 'Vendor Relations', 'Billing & Settlements'];
        }

        $metrics = [
            'total' => $tasks->count(),
            'todo' => $tasks->where('status', 'todo')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'review' => $tasks->where('status', 'review')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
            'urgent' => $tasks->where('priority', 'urgent')->where('status', '!=', 'completed')->count(),
        ];

        return Inertia::render('Employee/Workspace', [
            'tasks' => $tasks,
            'employees' => $employees,
            'departments' => $departments,
            'metrics' => $metrics,
            'filters' => [
                'priority' => $priority,
                'assigned_to' => $assignedTo,
            ],
        ]);
    }

    /**
     * Update task status (Kanban status selector).
     */
    public function updateStatus(Request $request, Task $task)
    {
        $request->validate([
            'status' => 'required|in:todo,in_progress,review,completed',
        ]);

        $task->update([
            'status' => $request->input('status'),
        ]);

        return redirect()->back()->with('success', "Task status changed to {$request->input('status')}.");
    }

    /**
     * Quick create task from employee portal.
     */
    public function storeTask(EmployeeTaskRequest $request)
    {
        $validated = $request->validated();
        $assignedBy = auth()->id() ?? User::where('role', 'super_admin')->first()?->id ?? 1;

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? auth()->id() ?? 1,
            'assigned_by' => $assignedBy,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => $validated['status'] ?? 'todo',
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return redirect()->back()->with('success', "Task '{$task->title}' added to board!");
    }
}
