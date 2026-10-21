<?php

namespace App\Http\Controllers;

use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    /**
     * Upload an image to Cloudinary (or fallback local storage).
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|file|mimes:jpeg,jpg,png,webp,svg,gif|max:10240',
            'file' => 'nullable|file|mimes:jpeg,jpg,png,webp,svg,gif,pdf|max:10240',
            'folder' => 'nullable|string|max:100',
        ]);

        $file = $request->file('image') ?? $request->file('file');

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'No image or file was provided for upload.',
            ], 422);
        }

        $folder = $request->input('folder', 'bizzhuss_products');

        try {
            $url = CloudinaryService::uploadImage($file, $folder);

            return response()->json([
                'success' => true,
                'url' => $url,
                'message' => 'Image uploaded successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('UploadController exception: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
