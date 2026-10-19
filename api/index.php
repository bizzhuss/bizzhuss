<?php

// Fix SCRIPT_NAME and PHP_SELF for Vercel Serverless Function environment
// This ensures Symfony / Laravel generates correct root-relative URLs
$_SERVER['SCRIPT_NAME'] = '/index.php';
if (isset($_SERVER['PHP_SELF'])) {
    $_SERVER['PHP_SELF'] = '/index.php';
}

// Ensure hot reload development file is never used in serverless production
if (file_exists(__DIR__ . '/../public/hot')) {
    @unlink(__DIR__ . '/../public/hot');
}

// In Vercel serverless functions, the only writable directory is /tmp.
// Explicitly inject environment variables for Vercel execution
$_ENV['VERCEL'] = '1';
$_SERVER['VERCEL'] = '1';
putenv('VERCEL=1');

// Synchronize all $_ENV and $_SERVER variables to putenv() for getenv() and env() compatibility
foreach (array_merge($_ENV, $_SERVER) as $key => $val) {
    if (is_string($val) && (getenv($key) === false || getenv($key) === '')) {
        putenv("{$key}={$val}");
    }
}

if (!getenv('APP_STORAGE_PATH')) {
    putenv('APP_STORAGE_PATH=/tmp/storage');
    $_ENV['APP_STORAGE_PATH'] = '/tmp/storage';
    $_SERVER['APP_STORAGE_PATH'] = '/tmp/storage';
}

if (!getenv('VIEW_COMPILED_PATH')) {
    putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
    $_ENV['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';
    $_SERVER['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';
}

if (!getenv('APP_CONFIG_CACHE')) {
    putenv('APP_CONFIG_CACHE=/tmp/bootstrap/cache/config.php');
    $_ENV['APP_CONFIG_CACHE'] = '/tmp/bootstrap/cache/config.php';
    $_SERVER['APP_CONFIG_CACHE'] = '/tmp/bootstrap/cache/config.php';
}
if (!getenv('APP_EVENTS_CACHE')) {
    putenv('APP_EVENTS_CACHE=/tmp/bootstrap/cache/events.php');
    $_ENV['APP_EVENTS_CACHE'] = '/tmp/bootstrap/cache/events.php';
    $_SERVER['APP_EVENTS_CACHE'] = '/tmp/bootstrap/cache/events.php';
}
if (!getenv('APP_PACKAGES_CACHE')) {
    putenv('APP_PACKAGES_CACHE=/tmp/bootstrap/cache/packages.php');
    $_ENV['APP_PACKAGES_CACHE'] = '/tmp/bootstrap/cache/packages.php';
    $_SERVER['APP_PACKAGES_CACHE'] = '/tmp/bootstrap/cache/packages.php';
}
if (!getenv('APP_ROUTES_CACHE')) {
    putenv('APP_ROUTES_CACHE=/tmp/bootstrap/cache/routes.php');
    $_ENV['APP_ROUTES_CACHE'] = '/tmp/bootstrap/cache/routes.php';
    $_SERVER['APP_ROUTES_CACHE'] = '/tmp/bootstrap/cache/routes.php';
}
if (!getenv('APP_SERVICES_CACHE')) {
    putenv('APP_SERVICES_CACHE=/tmp/bootstrap/cache/services.php');
    $_ENV['APP_SERVICES_CACHE'] = '/tmp/bootstrap/cache/services.php';
    $_SERVER['APP_SERVICES_CACHE'] = '/tmp/bootstrap/cache/services.php';
}

// Provide fallback APP_KEY if not yet configured in Vercel environment variables
if (!getenv('APP_KEY') && empty($_ENV['APP_KEY']) && empty($_SERVER['APP_KEY'])) {
    $fallbackKey = 'base64:niNfQlDHgmS0Ja2dov5Sv0BV0eeOYqoyRFNCFmQlcxk=';
    putenv("APP_KEY={$fallbackKey}");
    $_ENV['APP_KEY'] = $fallbackKey;
    $_SERVER['APP_KEY'] = $fallbackKey;
}

if (!getenv('SESSION_DRIVER')) {
    putenv('SESSION_DRIVER=cookie');
    $_ENV['SESSION_DRIVER'] = 'cookie';
    $_SERVER['SESSION_DRIVER'] = 'cookie';
}

if (!getenv('CACHE_STORE')) {
    putenv('CACHE_STORE=array');
    $_ENV['CACHE_STORE'] = 'array';
    $_SERVER['CACHE_STORE'] = 'array';
}

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

if (!file_exists('/tmp/database.sqlite')) {
    @touch('/tmp/database.sqlite');
}

// Forward incoming request to Laravel's standard public front controller
require __DIR__ . '/../public/index.php';

