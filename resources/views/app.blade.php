<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Google Tag Manager / Analytics (GTM-WPKHXTTK) -->
    <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = window.gtag || gtag;
        gtag('js', new Date());
        gtag('config', 'GTM-WPKHXTTK', {
            send_page_view: false // Inertia SPA router handles page tracking
        });
    </script>
    <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-WPKHXTTK"></script>

    <title inertia>{{ config('app.name', 'Bizzhuss') }} | Built for Buyers | Powered by Sellers</title>
    <meta name="description" content="Bizzhuss is Pakistan's premier multi-vendor e-commerce marketplace connecting verified local sellers with smart shoppers. Built for Buyers | Powered by Sellers.">
    <meta name="author" content="Bizzhuss">
    <link rel="canonical" href="https://www.bizzhuss.com">
    <link rel="icon" type="image/png" href="/images/bizzhuss-logo.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Scripts and Styles -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="h-full font-sans antialiased bg-slate-50 text-slate-900">
    <!-- Google Tag Manager (noscript fallback) -->
    <noscript>
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WPKHXTTK"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>

    @inertia
    @isset($page)
        <script data-page="app" type="application/json">@json($page)</script>
    @endisset
</body>
</html>
