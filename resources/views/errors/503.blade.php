@extends('errors.layout')

@section('title', '503 Service Unavailable')

@section('content')
    <span class="badge" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">Maintenance Mode</span>
    <h1 class="h1">503: Service Unavailable</h1>
    <p class="desc">The platform is currently undergoing scheduled operational upgrades. We will be back online shortly.</p>
    <div>
        <a href="/" class="btn btn-primary">Refresh Page</a>
        <a href="/login" class="btn btn-secondary">Staff Sign In</a>
    </div>
@endsection
