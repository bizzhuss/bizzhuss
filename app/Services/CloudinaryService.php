<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    /**
     * Upload an image to Cloudinary and return its secure URL.
     * Falls back to local public storage if Cloudinary credentials are not configured or on network failure.
     *
     * @param  \Illuminate\Http\UploadedFile|string  $file
     * @param  string  $folder
     * @return string
     * @throws \Exception
     */
    public static function uploadImage($file, $folder = 'bizzhuss_catalog'): string
    {
        $cloudName = config('services.cloudinary.cloud_name', env('CLOUDINARY_CLOUD_NAME'));
        if ($cloudName === '${CLOUDINARY_CLOUD_NAME}' || empty($cloudName)) {
            $cloudName = getenv('CLOUDINARY_CLOUD_NAME') ?: '';
        }
        $apiKey = config('services.cloudinary.api_key', env('CLOUDINARY_API_KEY'));
        $apiSecret = config('services.cloudinary.api_secret', env('CLOUDINARY_API_SECRET'));
        $uploadPreset = config('services.cloudinary.upload_preset', env('CLOUDINARY_UPLOAD_PRESET'));

        // If Cloudinary credentials are not set, fall back safely to local public disk
        if (empty($cloudName) || $cloudName === '${CLOUDINARY_CLOUD_NAME}' || empty($apiKey) || empty($apiSecret)) {
            Log::info('Cloudinary cloud name or credentials missing; storing image locally.');
            if ($file instanceof \Illuminate\Http\UploadedFile) {
                $path = $file->store($folder, 'public');
                return '/storage/' . $path;
            }
            return (string) $file;
        }

        $timestamp = time();
        $paramsToSign = [
            'folder' => $folder,
            'timestamp' => $timestamp,
        ];
        if (!empty($uploadPreset)) {
            $paramsToSign['upload_preset'] = $uploadPreset;
        }
        ksort($paramsToSign);

        $stringToSign = collect($paramsToSign)
            ->map(fn($v, $k) => "$k=$v")
            ->implode('&') . $apiSecret;

        $signature = sha1($stringToSign);

        $postData = [
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'folder' => $folder,
        ];
        if (!empty($uploadPreset)) {
            $postData['upload_preset'] = $uploadPreset;
        }

        try {
            $request = Http::timeout(30);

            if ($file instanceof \Illuminate\Http\UploadedFile) {
                $response = $request->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", $postData);
            } elseif (is_string($file)) {
                $postData['file'] = $file;
                $response = $request->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", $postData);
            } else {
                throw new \InvalidArgumentException("Invalid file type provided for Cloudinary upload.");
            }

            if ($response->successful()) {
                $json = $response->json();
                if (!empty($json['secure_url'])) {
                    return $json['secure_url'];
                }
            }

            Log::error("Cloudinary Upload API Error: " . $response->body());
        } catch (\Throwable $e) {
            Log::error("Cloudinary Upload Exception: " . $e->getMessage());
        }

        // Fallback to local storage if API call fails
        if ($file instanceof \Illuminate\Http\UploadedFile) {
            $path = $file->store($folder, 'public');
            return '/storage/' . $path;
        }

        throw new \Exception("Cloudinary Upload Failed and local fallback not applicable for non-file input.");
    }
}
