<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeTaskRequest;
use App\Http\Requests\VendorApprovalRequest;
use App\Models\Employee;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Task;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the Super Admin Dashboard.
     */
    public function index(): Response
    {
        try {
            $totalVendors = Vendor::count() ?? 0;
            $pendingVendorsCount = Vendor::where('status', 'pending')->count() ?? 0;
            $totalProducts = Product::count() ?? 0;
            $totalOrders = Order::count() ?? 0;
            $totalGmv = (float) (Order::sum('total_amount') ?? 0);
            $platformRevenue = (float) (OrderItem::sum('platform_fee') ?? 0);
            $activeOrders = Order::whereIn('payment_status', ['pending', 'paid'])->count() ?? 0;
            $openTasks = Task::whereIn('status', ['todo', 'in_progress', 'review'])->count() ?? 0;

            $vendors = Vendor::with('user:id,name,email')
                ->orderBy('id', 'desc')
                ->take(10)
                ->get();

            $employees = User::where('role', 'employee')
                ->with('employee.department', 'employee.designation')
                ->take(10)
                ->get();

            $tasks = Task::with(['assignee:id,name,email', 'creator:id,name'])
                ->orderBy('id', 'desc')
                ->take(10)
                ->get();

            $recentOrders = Order::with('orderItems.vendor:id,shop_name')
                ->orderBy('id', 'desc')
                ->take(6)
                ->get();
        } catch (\Throwable $e) {
            $totalVendors = 0;
            $pendingVendorsCount = 0;
            $totalProducts = 0;
            $totalOrders = 0;
            $totalGmv = 0;
            $platformRevenue = 0;
            $activeOrders = 0;
            $openTasks = 0;
            $vendors = collect([]);
            $employees = collect([]);
            $tasks = collect([]);
            $recentOrders = collect([]);
        }

        $stats = [
            'totalVendors' => $totalVendors,
            'totalProducts' => $totalProducts,
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalGmv,
            'activeEmployees' => count($employees),
        ];

        $metrics = [
            'total_gmv' => $totalGmv,
            'platform_revenue' => $platformRevenue,
            'total_vendors' => $totalVendors,
            'pending_vendor_approvals' => $pendingVendorsCount,
            'active_orders' => $activeOrders,
            'open_tasks' => $openTasks,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'metrics' => $metrics,
            'vendors' => $vendors ?? [],
            'employees' => $employees ?? [],
            'tasks' => $tasks ?? [],
            'recentOrders' => $recentOrders ?? [],
        ]);
    }

    /**
     * Approve, reject, or update vendor onboarding status.
     */
    public function updateVendorStatus(VendorApprovalRequest $request)
    {
        $validated = $request->validated();
        $vendor = Vendor::findOrFail($validated['vendor_id']);

        $updateData = ['status' => $validated['status']];
        if (!empty($validated['commission_rate'])) {
            $updateData['commission_rate'] = $validated['commission_rate'];
        }

        $vendor->update($updateData);

        return redirect()->back()->with('success', "Vendor '{$vendor->shop_name}' status updated to {$validated['status']}.");
    }

    /**
     * Create and delegate a new operational duty to an employee.
     */
    public function createTask(EmployeeTaskRequest $request)
    {
        $validated = $request->validated();
        $validated['assigned_by'] = auth()->id() ?? User::where('role', 'super_admin')->first()?->id;

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'],
            'assigned_by' => $validated['assigned_by'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => $validated['status'] ?? 'todo',
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return redirect()->back()->with('success', "Operational task '{$task->title}' delegated successfully!");
    }
}
