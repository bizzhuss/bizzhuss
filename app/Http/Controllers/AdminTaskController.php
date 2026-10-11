<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTaskController extends Controller
{
    /**
     * Display Task Delegation, Kanban, and Employee Performance Suite.
     */
    public function index(Request $request): Response
    {
        $priority = $request->input('priority');
        $category = $request->input('category');
        $assignedTo = $request->input('assigned_to');
        $search = $request->input('search');

        $query = Task::with([
            'assignee:id,name,email,avatar,role',
            'creator:id,name',
            'activities.user:id,name,avatar',
        ]);

        if ($priority && $priority !== 'all') {
            $query->where('priority', $priority);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($assignedTo && $assignedTo !== 'all') {
            $query->where('assigned_to', $assignedTo);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('assignee', fn($aq) => $aq->where('name', 'like', "%{$search}%"));
            });
        }

        $tasks = $query->orderBy('due_date', 'asc')->get();

        // 1. Kanban Columns Mapping
        $kanban = [
            'todo' => $tasks->where('status', 'todo')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'review' => $tasks->where('status', 'review')->values(),
            'completed' => $tasks->where('status', 'completed')->values(),
        ];

        // 2. Overdue Tasks & Bottleneck Alert
        $now = Carbon::today();
        $overdueTasks = $tasks->filter(function ($task) use ($now) {
            return $task->status !== 'completed' && $task->due_date && Carbon::parse($task->due_date)->lt($now);
        })->values();

        // 3. Employee Performance & Accountability Leaderboard
        $employees = User::where('role', 'employee')
            ->with(['employee.department', 'employee.designation'])
            ->get();

        $leaderboard = $employees->map(function ($emp) use ($now) {
            $empTasks = Task::where('assigned_to', $emp->id)->get();
            $total = $empTasks->count();
            $completed = $empTasks->where('status', 'completed');
            $completedCount = $completed->count();

            // On-time completion
            $onTimeCount = $completed->filter(function ($t) {
                if (!$t->due_date || !$t->completed_at) return true;
                return Carbon::parse($t->completed_at)->lte(Carbon::parse($t->due_date)->endOfDay());
            })->count();

            $onTimeRate = $completedCount > 0 ? round(($onTimeCount / $completedCount) * 100, 1) : 100;
            $overdueCount = $empTasks->filter(function ($t) use ($now) {
                return $t->status !== 'completed' && $t->due_date && Carbon::parse($t->due_date)->lt($now);
            })->count();

            $monthlyTarget = $emp->employee->monthly_target ?? 25;
            $targetProgress = min(100, round(($completedCount / max(1, $monthlyTarget)) * 100, 1));

            return [
                'id' => $emp->id,
                'name' => $emp->name,
                'email' => $emp->email,
                'avatar' => $emp->avatar,
                'department' => $emp->employee?->department?->name ?? 'Operations',
                'designation' => $emp->employee?->designation?->title ?? 'Specialist',
                'total_tasks' => $total,
                'completed_tasks' => $completedCount,
                'active_tasks' => $total - $completedCount,
                'overdue_tasks' => $overdueCount,
                'on_time_rate' => $onTimeRate,
                'monthly_target' => $monthlyTarget,
                'target_progress' => $targetProgress,
                'is_bottleneck' => ($overdueCount > 0 || ($total >= 3 && ($completedCount / $total) < 0.4)),
            ];
        })->sortByDesc('completed_tasks')->values();

        // 4. Global Task Metrics
        $metrics = [
            'total_tasks' => $tasks->count(),
            'todo_tasks' => $kanban['todo']->count(),
            'in_progress_tasks' => $kanban['in_progress']->count(),
            'review_tasks' => $kanban['review']->count(),
            'completed_tasks' => $kanban['completed']->count(),
            'overdue_count' => $overdueTasks->count(),
        ];

        // 5. Recent Activity Logs
        $recentActivities = TaskActivity::with(['task:id,title', 'user:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->limit(25)
            ->get();

        return Inertia::render('Admin/Tasks', [
            'tasks' => $tasks,
            'kanban' => $kanban,
            'metrics' => $metrics,
            'leaderboard' => $leaderboard,
            'overdueTasks' => $overdueTasks,
            'recentActivities' => $recentActivities,
            'employees' => $employees->map(fn($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'email' => $e->email,
                'department' => $e->employee?->department?->name ?? 'General',
            ]),
            'categories' => [
                'Vendor KYC',
                'Product Approval',
                'Customer Dispute',
                'Financial Audit',
                'Logistics & Carrier',
                'General Operations',
            ],
            'filters' => [
                'priority' => $priority,
                'category' => $category,
                'assigned_to' => $assignedTo,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Create and delegate a new task.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|string|max:100',
            'due_date' => 'nullable|date',
        ]);

        $assignee = User::findOrFail($validated['assigned_to']);

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'],
            'assigned_by' => auth()->id() ?? 1,
            'priority' => $validated['priority'],
            'category' => $validated['category'],
            'status' => 'todo',
            'progress' => 0,
            'due_date' => $validated['due_date'] ?? Carbon::now()->addDays(3)->toDateString(),
        ]);

        // Audit Trail Activity
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),
            'action' => 'created',
            'note' => "Task delegated to {$assignee->name} with priority [{$task->priority}].",
        ]);

        return redirect()->back()->with('success', "Task '{$task->title}' delegated to {$assignee->name}.");
    }

    /**
     * Update task status (todo, in_progress, review, completed).
     */
    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,review,completed',
            'note' => 'nullable|string|max:500',
        ]);

        $oldStatus = $task->status;
        $newStatus = $validated['status'];

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'completed') {
            $updateData['completed_at'] = now();
            $updateData['progress'] = 100;
        } elseif ($newStatus === 'in_progress' && $task->progress === 0) {
            $updateData['progress'] = 30;
        } elseif ($newStatus === 'review') {
            $updateData['progress'] = 85;
        }

        $task->update($updateData);

        // Audit Trail
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),
            'action' => 'status_change',
            'note' => "Status transitioned from '{$oldStatus}' to '{$newStatus}'." . ($validated['note'] ? " Note: {$validated['note']}" : ""),
        ]);

        return redirect()->back()->with('success', "Task status updated to {$newStatus}.");
    }

    /**
     * Update progress percentage and attach proof.
     */
    public function updateProgress(Request $request, Task $task)
    {
        $validated = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'proof_attachment' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:500',
        ]);

        $oldProgress = $task->progress;
        $newProgress = $validated['progress'];

        $updateData = [
            'progress' => $newProgress,
        ];

        if (!empty($validated['proof_attachment'])) {
            $updateData['proof_attachment'] = $validated['proof_attachment'];
        }

        if ($newProgress === 100) {
            $updateData['status'] = 'completed';
            $updateData['completed_at'] = now();
        } elseif ($newProgress >= 75 && $task->status === 'in_progress') {
            $updateData['status'] = 'review';
        } elseif ($newProgress > 0 && $task->status === 'todo') {
            $updateData['status'] = 'in_progress';
        }

        $task->update($updateData);

        // Audit Trail
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),
            'action' => 'progress_update',
            'note' => "Progress updated from {$oldProgress}% to {$newProgress}%." . ($validated['note'] ? " Note: {$validated['note']}" : ""),
        ]);

        return redirect()->back()->with('success', "Task progress updated to {$newProgress}%.");
    }

    /**
     * Delete a task.
     */
    public function destroy(Task $task)
    {
        $title = $task->title;
        $task->delete();

        return redirect()->back()->with('success', "Task '{$title}' has been removed.");
    }
}
