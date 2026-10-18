@extends('errors.layout')

@section('title', '403 Forbidden')

@section('content')
    <span class="badge" style="background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;">Access Restricted</span>
    <h1 class="h1">403: Permission Denied</h1>
    <p class="desc">You do not have the required role or authorization privileges to access this secure zone or resource.</p>
    <div>
        <a href="/" class="btn btn-primary">Return to Storefront</a>
        <a href="/login" class="btn btn-secondary">Sign In</a>
    </div>
@endsection
