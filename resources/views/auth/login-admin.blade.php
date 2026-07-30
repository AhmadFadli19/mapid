@extends('layouts.app')
@section('title', 'Login Admin')

@section('content')
<div class="container">
    <div class="auth-card">
        <div class="card shadow">
            <div class="card-body p-4">
                <h3 class="text-center mb-4">Login Admin</h3>

                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger">{{ session('error') }}</div>
                @endif

                <form action="{{ route('login.admin') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Username atau Email</label>
                        <input type="text" name="login" class="form-control @error('login') is-invalid @enderror" value="{{ old('login') }}" required autofocus>
                        @error('login')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" class="form-control @error('password') is-invalid @enderror" required>
                        @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>

                <div class="text-center mt-3">
                    <small><a href="{{ route('login.user') }}">Login sebagai User</a></small>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection