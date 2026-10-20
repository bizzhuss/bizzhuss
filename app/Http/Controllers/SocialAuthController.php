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
        $redirectUri = env('GOOGLE_REDIRECT_URI') 
            ?? config('services.google.redirect') 
            ?? 'https://www.bizzhuss.com/auth/google/callback';

        if (preg_match('/https?:\/\/[^\s\)\'"]+/', $redirectUri, $matches)) {
            return $matches[0];
        }

        return route('auth.google.callback');
    }

    /**
     * Ensure Google OAuth credentials and callback URL are dynamically loaded and injected.
     */
    protected function ensureGoogleConfig(): void
    {
        $clientId = env('GOOGLE_CLIENT_ID') 
            ?? config('services.google.client_id') 
            ?? '1060850240999-jsuohpk5esq9o6vqkvvbi3oo1i5628ko.apps.googleusercontent.com';

        $clientSecret = env('GOOGLE_CLIENT_SECRET') 
            ?? config('services.google.client_secret') 
            ?? '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';

        $redirectUri = $this->getRedirectUri();

        config([
            'services.google.client_id' => trim((string) $clientId),
            'services.google.client_secret' => trim((string) $clientSecret),
            'services.google.redirect' => trim((string) $redirectUri),
        ]);
    }

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(): SymfonyRedirectResponse|RedirectResponse
    {
        $clientId = env('GOOGLE_CLIENT_ID') 
            ?? config('services.google.client_id') 
            ?? '1060850240999-jsuohpk5esq9o6vqkvvbi3oo1i5628ko.apps.googleusercontent.com';

        $clientSecret = env('GOOGLE_CLIENT_SECRET') 
            ?? config('services.google.client_secret') 
            ?? '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';

        $redirectUri = $this->getRedirectUri();

        config([
            'services.google.client_id' => $clientId,
            'services.google.client_secret' => $clientSecret,
            'services.google.redirect' => $redirectUri,
        ]);

        return Socialite::driver('google')
            ->stateless()
            ->redirectUrl($redirectUri)
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
            $clientId = env('GOOGLE_CLIENT_ID') 
                ?? config('services.google.client_id') 
                ?? '1060850240999-jsuohpk5esq9o6vqkvvbi3oo1i5628ko.apps.googleusercontent.com';

            $clientSecret = env('GOOGLE_CLIENT_SECRET') 
                ?? config('services.google.client_secret') 
                ?? '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';

            $redirectUri = $this->getRedirectUri();

            config([
                'services.google.client_id' => $clientId,
                'services.google.client_secret' => $clientSecret,
                'services.google.redirect' => $redirectUri,
            ]);

            $driver = Socialite::driver('google');
            $driver->setHttpClient($this->getHttpClient());
            $driver->redirectUrl($redirectUri);

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
                    'google_id' => $googleId,
                    'avatar' => $user->avatar ?? $googleUser->getAvatar(),
                    'approval_status' => $user->approval_status ?? 'approved',
                ]);
            } else {
                $user = User::create([
                    'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'Google User'),
                    'email' => $googleEmail,
                    'google_id' => $googleId,
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

            return $this->authenticated($request, $user);
        } catch (\Throwable $e) {
            Log::error('Google OAuth Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')->with('error', 'Unable to authenticate with Google (' . $e->getMessage() . '). Please try again or use email/password.');
        }
    }

    /**
     * Post-authentication redirection based on role and tier permissions.
     */
    protected function authenticated(Request $request, $user): RedirectResponse
    {
        // 1. Super Admin
        if ($user->role === 'super_admin' || $user->email === 'haseebkhanuddin44@gmail.com') {
            return redirect()->intended('/admin/central-command');
        }

        // 2. Staff / Employee with Permissions
        if (in_array($user->role, ['staff', 'employee']) || !empty($user->permissions)) {
            // Check assigned tier access
            $perms = (array) ($user->permissions ?? []);
            if (is_string($perms)) {
                $decoded = json_decode($perms, true);
                $perms = is_array($decoded) ? $decoded : [];
            }

            if (in_array('tier.employee_desk', $perms)) {
                return redirect()->intended('/employee/desk');
            }
            if (in_array('tier.vendor_portal', $perms)) {
                return redirect()->intended('/vendor/dashboard');
            }
            if (in_array('tier.marketing_hub', $perms)) {
                return redirect()->intended('/marketing/hub');
            }

            // Check module permissions for Super Admin sub-tabs
            foreach ($perms as $perm) {
                if (is_string($perm) && str_starts_with($perm, 'module.')) {
                    return redirect()->intended('/admin/central-command');
                }
            }

            // Fallback to employee desk
            return redirect()->intended('/employee/desk');
        }

        // 3. Vendor
        if ($user->role === 'vendor') {
            return redirect()->intended('/vendor/dashboard');
        }

        // 4. Default Customer
        return redirect()->intended('/');
    }
}
