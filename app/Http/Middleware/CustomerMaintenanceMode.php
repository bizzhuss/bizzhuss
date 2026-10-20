<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CustomerMaintenanceMode
{
    /**
     * Handle an incoming request for dynamic maintenance mode with audience targeting.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Resolve maintenance state from Setting/Cache / MongoDB collection
        $storeMaintenanceDoc = Setting::get('store_maintenance_mode', null);
        if (is_array($storeMaintenanceDoc) && isset($storeMaintenanceDoc['maintenance_enabled'])) {
            $isMaintenanceActive = (bool) $storeMaintenanceDoc['maintenance_enabled'];
        } else {
            $maintenanceEnabledSetting = Setting::get('maintenance_enabled', null);
            $isMaintenanceActive = (bool) ($maintenanceEnabledSetting !== null 
                ? $maintenanceEnabledSetting 
                : Setting::get('maintenance_mode', false));
        }

        // 2. If maintenance mode is OFF:
        if (!$isMaintenanceActive) {
            // If user explicitly visits /maintenance while platform is live, redirect back to storefront
            if ($request->is('maintenance')) {
                return redirect()->route('storefront');
            }
            return $next($request);
        }

        // 3. Maintenance mode is ON:
        // Always whitelist auth routes so administrators and authorized staff can sign in to bypass
        if ($request->is(
            'maintenance',
            'login',
            'register',
            'logout',
            'auth/*',
            'up',
            '@vite/*',
            'build/*',
            'storage/*',
            'sanctum/*'
        )) {
            return $next($request);
        }

        // 4. Super Admin is ALWAYS bypassed and never locked out
        $user = $request->user();
        if ($user && ($user->role === 'super_admin' || (method_exists($user, 'hasRole') && $user->hasRole('super_admin')))) {
            return $next($request);
        }

        // 5. Determine blocked roles list
        $blockedRoles = Setting::get('maintenance_blocked_roles', ['guest', 'customer']);
        if (is_string($blockedRoles)) {
            $decoded = json_decode($blockedRoles, true);
            $blockedRoles = is_array($decoded) ? $decoded : ['guest', 'customer'];
        }

        // 6. Resolve current actor's role
        $currentRole = $user ? $user->role : 'guest';

        // 7. Check if current actor's role is targeted by maintenance
        $isBlocked = false;

        if ($currentRole === 'guest') {
            $isBlocked = in_array('guest', $blockedRoles) || in_array('customer', $blockedRoles);
        } elseif ($currentRole === 'customer') {
            $isBlocked = in_array('customer', $blockedRoles) || in_array('guest', $blockedRoles);
        } elseif ($currentRole === 'vendor') {
            $isBlocked = in_array('vendor', $blockedRoles);
        } elseif (in_array($currentRole, ['employee', 'staff'])) {
            $isBlocked = in_array('employee', $blockedRoles) || in_array('staff', $blockedRoles);
        }

        if ($isBlocked) {
            // Render modern Inertia maintenance page with HTTP status 503
            return Inertia::render('Maintenance')
                ->toResponse($request)
                ->setStatusCode(503);
        }

        return $next($request);
    }
}
