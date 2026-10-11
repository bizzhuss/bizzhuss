<?php

namespace App\Http\Controllers;

use App\Models\PromotionalCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingCampaignController extends Controller
{
    /**
     * Display Promotional Campaign Scheduler.
     */
    public function index(): Response
    {
        $campaigns = PromotionalCampaign::orderBy('id', 'desc')->get();

        $activeCampaign = PromotionalCampaign::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('end_time')->orWhere('end_time', '>=', now());
            })
            ->orderBy('end_time', 'asc')
            ->first();

        return Inertia::render('Marketing/Campaigns', [
            'campaigns' => $campaigns,
            'activeCampaign' => $activeCampaign,
        ]);
    }

    /**
     * Create a new Promotional Campaign.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'badge_label' => 'nullable|string|max:100',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'nullable|boolean',
        ]);

        PromotionalCampaign::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'badge_label' => $validated['badge_label'] ?? 'Special Offer',
            'discount_percentage' => $validated['discount_percentage'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "Campaign \"{$validated['name']}\" scheduled successfully.");
    }

    /**
     * Update an existing Campaign.
     */
    public function update(Request $request, PromotionalCampaign $campaign): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'badge_label' => 'nullable|string|max:100',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'nullable|boolean',
        ]);

        $campaign->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'badge_label' => $validated['badge_label'] ?? 'Special Offer',
            'discount_percentage' => $validated['discount_percentage'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $request->boolean('is_active'),
        ]);

        return back()->with('success', "Campaign \"{$campaign->name}\" updated.");
    }

    /**
     * Toggle Campaign Active Status.
     */
    public function toggle(PromotionalCampaign $campaign): RedirectResponse
    {
        $campaign->is_active = !$campaign->is_active;
        $campaign->save();

        $statusStr = $campaign->is_active ? 'activated' : 'paused';
        return back()->with('success', "Campaign \"{$campaign->name}\" {$statusStr}.");
    }

    /**
     * Delete a Campaign.
     */
    public function destroy(PromotionalCampaign $campaign): RedirectResponse
    {
        $campaign->delete();
        return back()->with('success', 'Campaign removed successfully.');
    }
}
