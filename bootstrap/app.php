<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        $middleware->redirectGuestsTo(function (\Illuminate\Http\Request $request) {
            if ($request->is('vendor*')) {
                $msg = 'Please log in with vendor credentials to access this portal.';
            } elseif ($request->is('marketing*')) {
                $msg = 'Please sign in with marketing credentials to access this portal.';
            } elseif ($request->is('cart*', 'wishlist*', 'checkout*')) {
                $msg = 'Please sign in to add items to your cart or wishlist.';
            } else {
                $msg = 'Please sign in to access this page.';
            }
            session()->flash('error', $msg);
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL']) || env('VERCEL')) {
    $app->useStoragePath(env('APP_STORAGE_PATH', '/tmp/storage'));
}

return $app;
