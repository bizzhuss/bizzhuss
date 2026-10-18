<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - Bizzhuss Enterprise</title>
    <link rel="icon" type="image/png" href="/images/bizzhuss-logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
        .header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .brand { font-weight: 800; font-size: 18px; text-decoration: none; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .card { max-width: 480px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05); }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
        .desc { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0; }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: #2563eb; color: #ffffff; border: none; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; margin-left: 8px; }
        .btn-secondary:hover { background: #e2e8f0; }
        .footer { padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <header class="header">
        <a href="/" class="brand">
            <span style="display:inline-block; width:28px; height:28px; background:#2563eb; color:#fff; border-radius:8px; text-align:center; line-height:28px; font-weight:900;">B</span>
            <span>Bizzhuss</span>
        </a>
        <a href="/login" style="font-size: 12px; font-weight: 600; color: #475569; text-decoration: none;">Sign In &rarr;</a>
    </header>

    <main class="main">
        <div class="card">
            @yield('content')
        </div>
    </main>

    <footer class="footer">
        &copy; {{ date('Y') }} Bizzhuss Enterprise. All rights reserved.
    </footer>
</body>
</html>
