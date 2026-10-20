<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show login form.
     */
    public function showLogin(Request $request): Response
    {
        if ($request->filled('intended')) {
            $request->session()->put('url.intended', $request->input('intended'));
        }

        if ($request->filled('message') && !$request->session()->has('error')) {
            $request->session()->flash('error', $request->input('message'));
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Handle an incoming authentication request with auto-role redirection.
     */
    public function login(Request $request): RedirectResponse
    {
        if ($request->filled('intended') && !$request->session()->has('url.intended')) {
            $request->session()->put('url.intended', $request->input('intended'));
        }

        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        $user = Auth::user();

        return $this->authenticated($request, $user);
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

    /**
     * Show registration form.
     */
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle user/vendor registration.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'in:customer,vendor'],
            'phone' => ['nullable', 'string', 'max:50'],
            'shop_name' => ['required_if:role,vendor', 'nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'status' => 'active',
            'approval_status' => 'approved',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        ]);

        // If registered as vendor, auto-provision vendor store
        if ($validated['role'] === 'vendor') {
            $shopName = $validated['shop_name'] ?? ($validated['name'] . ' Enterprise Shop');
            Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $shopName,
                'slug' => Str::slug($shopName) . '-' . Str::random(5),
                'commission_rate' => 10.00,
                'status' => 'active',
                'description' => "Verified marketplace merchant account for {$shopName}.",
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        if ($user->role === 'vendor') {
            return redirect()->route('vendor.portal')->with('success', "Merchant account created! Welcome to Bizzhuss Vendor Center.");
        }

        return redirect()->route('storefront')->with('success', "Account created successfully! Welcome to Bizzhuss.");
    }

    /**
     * Log out the current user session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('storefront')->with('success', 'You have been logged out successfully.');
    }
}
