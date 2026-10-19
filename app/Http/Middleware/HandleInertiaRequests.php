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
                    'permissions' => $request->user()->role === 'super_admin'
                        ? array_values(array_unique(array_merge(['*'], method_exists($request->user(), 'getAllPermissions') ? $request->user()->getAllPermissions()->pluck('name')->toArray() : [])))
                        : (method_exists($request->user(), 'getAllPermissions')
                            ? $request->user()->getAllPermissions()->pluck('name')->toArray()
                            : []),
                ] : null,
            ],
            'maintenance' => [
                'is_enabled' => (bool) (\App\Models\Setting::get('maintenance_enabled', null) !== null ? \App\Models\Setting::get('maintenance_enabled') : \App\Models\Setting::get('maintenance_mode', false)),
                'blocked_roles' => \App\Models\Setting::get('maintenance_blocked_roles', ['guest', 'customer']),
            ],
            'categories' => function () {
                try {
                    $cats = \App\Models\Category::whereNull('parent_id')
                        ->where('is_active', true)
                        ->with(['products', 'subcategories' => fn ($q) => $q->where('is_active', true)->with('products')])
                        ->orderBy('order', 'asc')
                        ->get();
                    return $cats->isNotEmpty() ? $cats : \App\Services\DemoCatalogService::categories();
                } catch (\Throwable $e) {
                    return \App\Services\DemoCatalogService::categories();
                }
            },
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
