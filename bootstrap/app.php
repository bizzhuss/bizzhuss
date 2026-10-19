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
            \App\Http\Middleware\CustomerMaintenanceMode::class,
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
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            $status = $response->getStatusCode();
            if ($status < 400 && $exception) {
                $status = 500;
            }

            if (!app()->environment(['local', 'testing']) && in_array($status, [500, 503, 404, 403])) {
                $message = config('app.debug') ? ($exception->getMessage() ?: 'Internal server exception encountered') : null;
                return \Inertia\Inertia::render('Error', [
                    'status' => $status,
                    'message' => $message,
                ])
                    ->toResponse($request)
                    ->setStatusCode($status);
            } elseif ($status === 419) {
                return back()->with([
                    'error' => 'The page session expired. Please submit again.',
                ]);
            }
            return $response;
        });
    })->create();

if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL']) || env('VERCEL')) {
    $app->useStoragePath(env('APP_STORAGE_PATH', '/tmp/storage'));
}

return $app;
