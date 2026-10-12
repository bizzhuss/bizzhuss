<?php

namespace App\Http\Controllers;

use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class SocialAuthController extends Controller
{
    /**
     * Build an HTTP client optimized for Windows environments (resolves IPv4 & verifies SSL).
     */
    protected function getHttpClient(): Client
    {
        $options = [
            'force_ip_resolve' => 'v4',
            'curl' => [
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            ],
            'timeout' => 20,
        ];

        // Ensure Windows / XAMPP CA cert bundle is picked up if present
        if (file_exists('C:\\xampp\\apache\\bin\\curl-ca-bundle.crt')) {
            $options['verify'] = 'C:\\xampp\\apache\\bin\\curl-ca-bundle.crt';
        }

        return new Client($options);
    }

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(): SymfonyRedirectResponse|RedirectResponse
    {
        $driver = Socialite::driver('google');
        $driver->setHttpClient($this->getHttpClient());

        return $driver->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google and authenticate.
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        try {
            $driver = Socialite::driver('google');
            $driver->setHttpClient($this->getHttpClient());

            /** @var \Laravel\Socialite\Two\User $googleUser */
            $googleUser = $driver->stateless()->user();

            if (!$googleUser || !$googleUser->getEmail()) {
                return redirect()->route('login')->with('error', 'Google authentication failed: Email address could not be retrieved.');
            }

            // Find user by Google ID or by existing email address
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Link account if Google ID was not set
                if (empty($user->google_id)) {
                    $user->google_id = $googleUser->getId();
                }

                // If user doesn't have an avatar or it's default, update with Google's avatar
                if ((empty($user->avatar) || str_contains($user->avatar, 'images.unsplash.com')) && $googleUser->getAvatar()) {
                    $user->avatar = $googleUser->getAvatar();
                }

                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                }

                $user->save();
            } else {
                // Register a new customer user via Google OAuth
                $user = User::create([
                    'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'Google User'),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar() ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    'role' => 'customer',
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'password' => null,
                ]);
            }

            Auth::login($user, true);
            $request->session()->regenerate();

            // Match role-based auto redirection
            return match ($user->role) {
                'super_admin' => redirect()->intended(route('admin.dashboard'))->with('success', "Welcome back, Administrator {$user->name}!"),
                'marketing_manager' => redirect()->intended(route('marketing.dashboard'))->with('success', "Welcome to the Marketing Portal, {$user->name}!"),
                'vendor' => redirect()->intended(route('vendor.portal'))->with('success', "Welcome to your Vendor Portal, {$user->name}!"),
                'employee' => redirect()->intended(route('employee.workspace'))->with('success', "Logged in to Workforce Workspace, {$user->name}."),
                'customer' => redirect()->intended(route('customer.dashboard'))->with('success', "Welcome back, {$user->name}!"),
                default => redirect()->intended(route('storefront'))->with('success', "Welcome back, {$user->name}!"),
            };
        } catch (\Throwable $e) {
            Log::error('Google OAuth Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')->with('error', 'Unable to authenticate with Google. Please try again or use email/password.');
        }
    }
}
