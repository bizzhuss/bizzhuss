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
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // 4. Strict Role Verification
        if (!in_array($user->role, $roles)) {
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json(['message' => 'Forbidden: Unauthorized role access.'], 403);
            }

            abort(403, "Access Denied: Your account role ({$user->role}) is not authorized to access this portal.");
        }

        // 5. Verify & Auto-create Vendor Profile if missing for authenticated vendor user
        if ($user->role === 'vendor' && !$user->vendor) {
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
