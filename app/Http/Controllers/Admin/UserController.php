<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of all platform users with order and role metrics.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            if ($roleFilter === 'customer') {
                $query->where(function($q) {
                    $q->where('role', 'customer')->orWhereNull('role');
                });
            } else {
                $query->where('role', $roleFilter);
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString()->through(function($user) {
            $userIdStr = (string)($user->_id ?? $user->id);

            // Count total orders placed by this user
            $ordersCount = Order::where(function($q) use ($user, $userIdStr) {
                $q->where('user_id', $userIdStr)
                  ->orWhere('user_id', $user->id)
                  ->orWhere('customer_id', $userIdStr)
                  ->orWhere('customer_id', $user->id)
                  ->orWhere('customer_email', $user->email);
            })->count();

            // Total amount spent by user
            $totalSpent = Order::where(function($q) use ($user, $userIdStr) {
                $q->where('user_id', $userIdStr)
                  ->orWhere('user_id', $user->id)
                  ->orWhere('customer_id', $userIdStr)
                  ->orWhere('customer_id', $user->id)
                  ->orWhere('customer_email', $user->email);
            })->where('status', '!=', 'cancelled')->sum('total_amount');

            // Format registration date safely
            $createdAt = 'N/A';
            if ($user->created_at) {
                if ($user->created_at instanceof \DateTimeInterface) {
                    $createdAt = $user->created_at->format('d M Y, h:i A');
                } else {
                    try {
                        $createdAt = \Carbon\Carbon::parse($user->created_at)->format('d M Y, h:i A');
                    } catch (\Exception $e) {
                        $createdAt = (string)$user->created_at;
                    }
                }
            }

            return [
                'id' => $userIdStr,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'role' => $user->role ?? 'customer',
                'auth_provider' => !empty($user->google_id) ? 'Google' : 'Email / Password',
                'created_at' => $createdAt,
                'orders_count' => (int)$ordersCount,
                'total_spent' => (float)$totalSpent,
                'status' => $user->status ?? 'active',
                'avatar' => $user->avatar ?? null,
                'designation' => $user->designation ?? null,
                'department' => $user->department ?? null,
            ];
        });

        // Summary stats for top metrics cards
        $stats = [
            'total_users' => User::count(),
            'total_customers' => User::where('role', 'customer')->orWhereNull('role')->count(),
            'total_vendors' => User::where('role', 'vendor')->count(),
            'google_signups' => User::whereNotNull('google_id')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? 'all',
            ],
            'stats' => $stats,
        ]);
    }
}
