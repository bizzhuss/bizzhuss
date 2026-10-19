<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\SocialAuthController as BaseSocialAuthController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class SocialAuthController extends BaseSocialAuthController
{
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
}
