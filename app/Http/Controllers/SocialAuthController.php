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
     * Build an HTTP client optimized for Windows and Linux environments (resolves IPv4 & verifies SSL).
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

        // Ensure Windows / XAMPP CA cert bundle is picked up if present to avoid cURL error 60
        if (file_exists('C:\\xampp\\apache\\bin\\curl-ca-bundle.crt')) {
            $options['verify'] = 'C:\\xampp\\apache\\bin\\curl-ca-bundle.crt';
        }

        return new Client($options);
    }

    /**
     * Resolve the canonical Google OAuth callback URL.
     */
    protected function getRedirectUri(): string
    {
        $configured = config('services.google.redirect');
        if (!empty($configured) && filter_var($configured, FILTER_VALIDATE_URL)) {
            return $configured;
        }

        return route('auth.google.callback');
    }

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(): SymfonyRedirectResponse|RedirectResponse
    {
        return Socialite::driver('google')
            ->redirectUrl($this->getRedirectUri())
            ->redirect();
    }

    /**
     * Obtain the user information from Google and authenticate.
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            Log::warning('Google OAuth callback returned error: ' . $request->input('error'));
            return redirect()->route('login')->with('error', 'Google sign-in was cancelled or encountered an error.');
        }

        try {
            $driver = Socialite::driver('google');
            $driver->setHttpClient($this->getHttpClient());
            $driver->redirectUrl($this->getRedirectUri());

            /** @var \Laravel\Socialite\Two\User $googleUser */
            $googleUser = $driver->stateless()->user();

            if (!$googleUser || !$googleUser->getEmail()) {
                return redirect()->route('login')->with('error', 'Google authentication failed: Email address could not be retrieved.');
            }

            $googleId = (string) $googleUser->getId();
            $googleEmail = (string) $googleUser->getEmail();

            // Find user by Google ID or by existing email address
            $user = User::where('google_id', $googleId)
                ->orWhere('email', $googleEmail)
                ->first();

            if ($user) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $user->avatar ?? $googleUser->getAvatar(),
                    'approval_status' => $user->approval_status ?? 'approved',
                ]);
            } else {
                $user = User::create([
                    'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'Google User'),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => null,
                    'role' => 'customer',
                    'status' => 'active',
                    'approval_status' => 'approved',
                    'email_verified_at' => now(),
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

            return redirect()->route('login')->with('error', 'Unable to authenticate with Google (' . $e->getMessage() . '). Please try again or use email/password.');
        }
    }
}
