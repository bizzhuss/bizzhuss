<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Banner extends BaseModel
{
    use HasFactory;

    protected $table = 'promotional_banners';

    protected $fillable = [
        'title',
        'subtitle',
        'badge_text',
        'image_path',
        'target_url',
        'section_key',
        'start_time',
        'end_time',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Scope for active banners within scheduled window if set.
     */
    public function scopeActive(Builder $query): Builder
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_time')->orWhere('start_time', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_time')->orWhere('end_time', '>=', $now);
            });
    }

    /**
     * Scope for a specific section key (e.g. hero_carousel).
     */
    public function scopeSection(Builder $query, string $sectionKey): Builder
    {
        return $query->where('section_key', $sectionKey);
    }

    /**
     * Get accessible image URL.
     */
    public function getImageUrlAttribute(): string
    {
        if (empty($this->image_path)) {
            return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800';
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        if (str_starts_with($this->image_path, '/storage/')) {
            return $this->image_path;
        }

        return '/storage/' . ltrim($this->image_path, '/');
    }

    /**
     * Append image_url automatically to array / JSON serialization.
     */
    protected $appends = ['image_url'];
}
