@extends('errors.layout')

@section('title', '404 Page Not Found')

@section('content')
    <span class="badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">Not Found</span>
    <h1 class="h1">404: Page Not Found</h1>
    <p class="desc">The requested resource could not be found on the Bizzhuss platform. It may have been moved or deleted.</p>
    <div>
        <a href="/" class="btn btn-primary">Return to Storefront</a>
        <a href="/login" class="btn btn-secondary">Sign In</a>
    </div>
@endsection
