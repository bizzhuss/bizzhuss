<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Helper to get setting value with default fallback.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Helper to set setting value.
     */
    public static function set(string $key, mixed $value): static
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) $value]
        );
    }
}
