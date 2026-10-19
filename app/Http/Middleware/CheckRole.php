<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\Vendor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request for strict RBAC protection.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $isVendorPortal = in_array('vendor', $roles) || $request->is('vendor*');

        // If unauthenticated guest, strictly redirect to login (no automatic bypass)
        if (!$user) {
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json(['message' => 'Authentication required.'], 401);
            }

            $message = $isVendorPortal
                ? 'Please log in with vendor credentials to access this portal.'
                : 'Authentication required. Please sign in to access this portal.';

            return redirect()->guest(route('login'))->with('error', $message);
        }

        // 3. Super Admin has universal supervisory authorization
        if ($user->role === 'super_admin' || (method_exists($user, 'hasRole') && $user->hasRole('super_admin'))) {
            return $next($request);
        }

        // 4. Admin Operational Modules Permission Verification
        if ($request->is('admin*') || in_array('super_admin', $roles)) {
            $adminModuleMap = [
                'admin/vendors*' => 'module.vendor_oversight',
                'admin/marketing/curation*' => 'module.storefront_curation',
                'admin/curation*' => 'module.storefront_curation',
                'admin/workforce/departments*' => 'module.departments',
                'admin/workforce/employees*' => 'module.workforce',
                'admin/workforce/tasks*' => 'module.kanban',
                'admin/settings*' => 'module.platform_settings',
                'admin/dashboard' => 'module.central_command',
                'admin' => 'module.central_command',
            ];

            $matchedPermission = null;
            foreach ($adminModuleMap as $pattern => $permission) {
                if ($request->is($pattern)) {
                    $matchedPermission = $permission;
                    break;
                }
            }

            if ($matchedPermission) {
                $hasPerm = method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo($matchedPermission);
                if ($hasPerm) {
                    return $next($request);
                }

                if ($request->expectsJson() && !$request->header('X-Inertia')) {
                    return response()->json(['message' => "Forbidden: Missing permission [{$matchedPermission}]."], 403);
                }

                abort(403, "Access Denied: You do not have permission ({$matchedPermission}) to access this operational module.");
            }

            abort(403, "Access Denied: Super Admin authorization required.");
        }

        // 5. Tier Portal Permissions Verification
        $hasTierAccess = false;
        if ($request->is('vendor*') || in_array('vendor', $roles)) {
            $hasTierAccess = in_array($user->role, ['vendor', 'super_admin']) || 
                (method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo('tier.vendor_portal'));
        } elseif ($request->is('employee*') || in_array('employee', $roles)) {
            $hasTierAccess = in_array($user->role, ['employee', 'super_admin']) || 
                (method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo('tier.employee_desk'));
        } elseif ($request->is('marketing*') || in_array('marketing_manager', $roles)) {
            $hasTierAccess = in_array($user->role, ['marketing_manager', 'super_admin']) || 
                (method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo('tier.marketing_hub'));
        } else {
            $hasTierAccess = in_array($user->role, $roles);
        }

        if (!$hasTierAccess) {
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json(['message' => 'Forbidden: Unauthorized portal access.'], 403);
            }

            abort(403, "Access Denied: Your account role ({$user->role}) is not authorized to access this portal.");
        }

        // 6. Verify & Auto-create Vendor Profile if missing for authenticated vendor user or staff with vendor portal access
        if (($user->role === 'vendor' || (method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo('tier.vendor_portal'))) && !$user->vendor) {
            Vendor::create([
                'user_id' => $user->id,
                'shop_name' => ($user->name ?? 'Merchant') . "'s Store",
                'slug' => Str::slug(($user->name ?? 'merchant') . '-store') . '-' . Str::lower(Str::random(4)),
                'status' => 'active',
                'commission_rate' => 10.00,
                'description' => 'Official verified vendor merchant storefront on Bizzhuss.',
            ]);
            $user->unsetRelation('vendor');
        }

        return $next($request);
    }
}
