<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MarketingBannerController extends Controller
{
    /**
     * Display Banner Management Suite.
     */
    public function index(Request $request): Response
    {
        $query = Banner::query();

        if ($request->filled('section') && $request->input('section') !== 'all') {
            $query->where('section_key', $request->input('section'));
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $banners = $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->get();

        $metrics = [
            'total_banners' => Banner::count(),
            'active_hero' => Banner::where('section_key', 'hero_carousel')->where('is_active', true)->count(),
            'active_deals' => Banner::where('section_key', 'category_banner')->orWhere('section_key', 'flash_sale_header')->where('is_active', true)->count(),
        ];

        return Inertia::render('Marketing/Banners', [
            'banners' => $banners,
            'metrics' => $metrics,
            'filters' => $request->only(['section', 'status']),
        ]);
    }

    /**
     * Store a newly created Banner.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge_text' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'image_url' => 'nullable|string|max:1000',
            'target_url' => 'nullable|string|max:500',
            'section_key' => 'required|string|in:hero_carousel,category_banner,flash_sale_header',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('banners', 'public');
        } elseif ($request->filled('image_url')) {
            $imagePath = $request->input('image_url');
        } else {
            return back()->withErrors(['image' => 'Please upload an image file or provide an image URL.']);
        }

        Banner::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'badge_text' => $validated['badge_text'] ?? null,
            'image_path' => $imagePath,
            'target_url' => $validated['target_url'] ?? '/',
            'section_key' => $validated['section_key'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return back()->with('success', "Banner \"{$validated['title']}\" published successfully.");
    }

    /**
     * Update an existing Banner.
     */
    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge_text' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'image_url' => 'nullable|string|max:1000',
            'target_url' => 'nullable|string|max:500',
            'section_key' => 'required|string|in:hero_carousel,category_banner,flash_sale_header',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'badge_text' => $validated['badge_text'] ?? null,
            'target_url' => $validated['target_url'] ?? '/',
            'section_key' => $validated['section_key'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'is_active' => $request->boolean('is_active'),
            'sort_order' => (int) ($validated['sort_order'] ?? $banner->sort_order),
        ];

        if ($request->hasFile('image')) {
            // Delete old file if stored locally
            if ($banner->image_path && !str_starts_with($banner->image_path, 'http') && Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $updateData['image_path'] = $request->file('image')->store('banners', 'public');
        } elseif ($request->filled('image_url')) {
            $updateData['image_path'] = $request->input('image_url');
        }

        $banner->update($updateData);

        return back()->with('success', "Banner \"{$banner->title}\" updated.");
    }

    /**
     * Toggle Banner Active Status.
     */
    public function toggle(Banner $banner): RedirectResponse
    {
        $banner->is_active = !$banner->is_active;
        $banner->save();

        $statusStr = $banner->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Banner \"{$banner->title}\" {$statusStr}.");
    }

    /**
     * Delete a Banner.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        if ($banner->image_path && !str_starts_with($banner->image_path, 'http') && Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();
        return back()->with('success', 'Banner removed successfully.');
    }

    /**
     * Reorder Banners.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:promotional_banners,id',
            'orders.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['orders'] as $item) {
            Banner::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Banner display order updated.');
    }
}
