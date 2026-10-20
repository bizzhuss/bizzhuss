<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MaintenanceController extends Controller
{
    /**
     * Update Storefront Maintenance Mode in MongoDB settings collection.
     */
    public function update(Request $request)
    {
        // Support either 'maintenance_enabled' or 'is_enabled' from UI forms
        if (!$request->has('maintenance_enabled') && $request->has('is_enabled')) {
            $request->merge(['maintenance_enabled' => $request->input('is_enabled')]);
        }

        $request->validate([
            'maintenance_enabled' => 'required|boolean',
            'blocked_roles' => 'nullable|array',
            'message' => 'nullable|string',
            'social_links' => 'nullable|array',
        ]);

        $isEnabled = (bool) $request->maintenance_enabled;
        $blockedRoles = $request->blocked_roles ?? ['guest', 'customer'];
        $message = $request->message ?? 'Store is temporarily under maintenance.';
        $socialLinks = $request->social_links ?? [];

        // Normalize guest/customer symmetry
        if (in_array('guest', $blockedRoles) && !in_array('customer', $blockedRoles)) {
            $blockedRoles[] = 'customer';
        }
        if (in_array('customer', $blockedRoles) && !in_array('guest', $blockedRoles)) {
            $blockedRoles[] = 'guest';
        }

        $settings = DB::connection('mongodb')->collection('settings');
        
        $settings->updateOrInsert(
            ['key' => 'store_maintenance_mode'],
            [
                'key' => 'store_maintenance_mode',
                'maintenance_enabled' => $isEnabled,
                'is_enabled' => $isEnabled,
                'blocked_roles' => $blockedRoles,
                'message' => $message,
                'social_links' => $socialLinks,
                'updated_at' => now(),
            ]
        );

        // Keep flat setting keys in sync for existing middleware & cache reads
        Setting::set('maintenance_enabled', $isEnabled);
        Setting::set('maintenance_mode', $isEnabled);
        Setting::set('maintenance_blocked_roles', $blockedRoles);
        Setting::set('maintenance_message', $message);

        Cache::forget('store_maintenance_mode');
        Cache::forget('maintenance_enabled');
        Cache::forget('maintenance_blocked_roles');
        Cache::forever('maintenance_enabled', $isEnabled);
        Cache::forever('maintenance_blocked_roles', $blockedRoles);

        $statusMsg = $isEnabled 
            ? 'Maintenance Mode activated. Targeted storefront audiences are now redirected to maintenance screen.' 
            : 'Maintenance Mode deactivated. Marketplace storefront is now live for all users.';

        return back()->with('success', $statusMsg);
    }
}
