<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    /**
     * Strictly upload an image to Cloudinary and return its secure URL.
     * Enforces direct Cloudinary storage; no local disk fallback (Vercel serverless has no persistent storage).
     *
     * @param  \Illuminate\Http\UploadedFile|string  $file
     * @param  string  $folder
     * @return string
     * @throws \Exception
     */
    public static function uploadImage($file, $folder = 'bizzhuss_products'): string
    {
        $cloudName = config('services.cloudinary.cloud_name', 'ngspxgta');
        if (empty($cloudName) || $cloudName === '${CLOUDINARY_CLOUD_NAME}' || str_contains($cloudName, '$')) {
            $cloudName = env('CLOUDINARY_CLOUD_NAME') ?: 'ngspxgta';
            if (empty($cloudName) || $cloudName === '${CLOUDINARY_CLOUD_NAME}' || str_contains($cloudName, '$')) {
                $cloudName = 'ngspxgta';
            }
        }

        $apiKey = config('services.cloudinary.api_key', '454417634251512') ?: env('CLOUDINARY_API_KEY', '454417634251512');
        $apiSecret = config('services.cloudinary.api_secret', 'QFvHkYLE9bU97Pur0LQgZ5nR-gI') ?: env('CLOUDINARY_API_SECRET', 'QFvHkYLE9bU97Pur0LQgZ5nR-gI');
        $uploadPreset = config('services.cloudinary.upload_preset', 'bizzhuss_preset') ?: env('CLOUDINARY_UPLOAD_PRESET', 'bizzhuss_preset');

        if (empty($cloudName) || empty($apiKey) || empty($apiSecret)) {
            Log::error("Cloudinary credentials missing in environment! [cloud_name: {$cloudName}, api_key: " . (empty($apiKey) ? 'MISSING' : 'CONFIGURED') . ", api_secret: " . (empty($apiSecret) ? 'MISSING' : 'CONFIGURED') . "]");
            throw new \Exception("Cloudinary credentials not configured in environment variables.");
        }

        // If file is already a Cloudinary hosted secure URL, no re-upload needed
        if (is_string($file) && (str_starts_with($file, 'https://res.cloudinary.com/') || str_starts_with($file, 'http://res.cloudinary.com/'))) {
            return $file;
        }

        $timestamp = time();
        $params = [
            'folder' => $folder,
            'timestamp' => $timestamp,
        ];
        ksort($params);

        $paramString = collect($params)->map(fn($v, $k) => "$k=$v")->implode('&');
        $signature = sha1($paramString . $apiSecret);

        $endpoint = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";

        $postData = [
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'folder' => $folder,
        ];

        try {
            $request = Http::timeout(30);

            if ($file instanceof UploadedFile) {
                $response = $request->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )->post($endpoint, $postData);
            } elseif (is_string($file) && file_exists($file)) {
                $response = $request->attach(
                    'file',
                    file_get_contents($file),
                    basename($file)
                )->post($endpoint, $postData);
            } elseif (is_string($file)) {
                $postData['file'] = $file;
                $response = $request->post($endpoint, $postData);
            } else {
                throw new \InvalidArgumentException("Invalid file type provided for Cloudinary upload.");
            }

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data['secure_url'])) {
                    Log::info("Cloudinary upload success: " . $data['secure_url']);
                    return $data['secure_url'];
                }
            }

            Log::error("Cloudinary upload failed: " . $response->body());
            throw new \Exception("Cloudinary Upload Error: " . $response->body());
        } catch (\Throwable $e) {
            Log::error("Cloudinary Upload Exception: " . $e->getMessage());
            throw $e;
        }
    }
}
