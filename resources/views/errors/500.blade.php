@extends('errors.layout')

@section('title', '500 Server Error')

@section('content')
    <span class="badge" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;">System Exception</span>
    <h1 class="h1">500: Server Error</h1>
    <p class="desc">An unexpected condition occurred on the server. Our automated monitoring team has been notified.</p>
    <div>
        <a href="/" class="btn btn-primary">Return to Storefront</a>
        <a href="mailto:support@bizzhuss.com" class="btn btn-secondary">Contact Support</a>
    </div>
@endsection
