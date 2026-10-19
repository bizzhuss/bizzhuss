<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class Setting extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Helper to get setting value with default fallback and persistent cache support.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            return Cache::rememberForever("setting_{$key}", function () use ($key, $default) {
                try {
                    $setting = static::where('key', $key)->first();
                    if (!$setting) {
                        return $default;
                    }

                    $val = $setting->value;

                    // Handle boolean strings
                    if ($val === 'true') {
                        return true;
                    }
                    if ($val === 'false') {
                        return false;
                    }

                    // Handle JSON arrays/objects
                    if (is_string($val) && (str_starts_with($val, '[') || str_starts_with($val, '{'))) {
                        $decoded = json_decode($val, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            return $decoded;
                        }
                    }

                    return $val;
                } catch (\Throwable $e) {
                    return $default;
                }
            });
        } catch (\Throwable $e) {
            return $default;
        }
    }

    /**
     * Helper to set setting value and invalidate persistent cache.
     */
    public static function set(string $key, mixed $value): static
    {
        if (is_array($value) || is_object($value)) {
            $serialized = json_encode($value);
        } elseif (is_bool($value)) {
            $serialized = $value ? 'true' : 'false';
        } else {
            $serialized = (string) $value;
        }

        $record = static::updateOrCreate(
            ['key' => $key],
            ['value' => $serialized]
        );

        Cache::forget("setting_{$key}");

        return $record;
    }
}
