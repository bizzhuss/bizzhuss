<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'avatar' => $request->user()->avatar,
                    'permissions' => ($request->user()->role === 'super_admin' || $request->user()->email === 'haseebkhanuddin44@gmail.com')
                        ? ['*']
                        : (method_exists($request->user(), 'getPermissionsList')
                            ? $request->user()->getPermissionsList()
                            : (array) ($request->user()->permissions ?? [])),
                ] : null,
            ],
            'maintenance' => [
                'is_enabled' => (bool) (
                    (is_array(\App\Models\Setting::get('store_maintenance_mode')) && isset(\App\Models\Setting::get('store_maintenance_mode')['maintenance_enabled']))
                        ? \App\Models\Setting::get('store_maintenance_mode')['maintenance_enabled']
                        : (\App\Models\Setting::get('maintenance_enabled', null) !== null
                            ? \App\Models\Setting::get('maintenance_enabled')
                            : \App\Models\Setting::get('maintenance_mode', false))
                ),
                'blocked_roles' => (is_array(\App\Models\Setting::get('store_maintenance_mode')) && !empty(\App\Models\Setting::get('store_maintenance_mode')['blocked_roles']))
                    ? \App\Models\Setting::get('store_maintenance_mode')['blocked_roles']
                    : \App\Models\Setting::get('maintenance_blocked_roles', ['guest', 'customer']),
            ],
            'categories' => function () {
                try {
                    $cats = \App\Models\Category::where(function ($q) {
                            $q->where('is_active', true)->orWhereNull('is_active');
                        })
                        ->where(function ($q) {
                            $q->whereNull('parent_id')->orWhere('parent_id', '')->orWhere('parent_id', '0');
                        })
                        ->with(['products', 'subcategories' => fn ($q) => $q->where(fn ($sub) => $sub->where('is_active', true)->orWhereNull('is_active'))->with('products')])
                        ->orderBy('order', 'asc')
                        ->orderBy('name', 'asc')
                        ->get();
                    return $cats;
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Inertia categories error: ' . $e->getMessage());
                    return collect();
                }
            },
            'support' => [
                'email' => config('services.support.email', 'bizzhuss@gmail.com'),
                'phone' => config('services.support.phone', '+92 335 7895884'),
                'whatsapp' => config('services.support.whatsapp', 'https://wa.me/923357895884'),
                'instagram' => config('services.support.instagram', 'https://www.instagram.com/bizzhuss/'),
                'facebook' => config('services.support.facebook', 'https://www.facebook.com/share/1C2sHrcVQM/'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
