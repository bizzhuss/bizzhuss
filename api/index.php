<?php

// Fix SCRIPT_NAME and PHP_SELF for Vercel Serverless Function environment
// This ensures Symfony / Laravel generates correct root-relative URLs
$_SERVER['SCRIPT_NAME'] = '/index.php';
if (isset($_SERVER['PHP_SELF'])) {
    $_SERVER['PHP_SELF'] = '/index.php';
}

// In Vercel serverless functions, the only writable directory is /tmp.
// Prepare framework directories if not present in the ephemeral container.
$tmpDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
    '/tmp/bootstrap/cache',
];

foreach ($tmpDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Forward incoming request to Laravel's standard public front controller
require __DIR__ . '/../public/index.php';
