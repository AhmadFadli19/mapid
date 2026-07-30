@extends('layouts.app')
@section('title', 'Reset Password')

@section('content')
<div class="container">
    <div class="auth-card">
        <div class="card shadow">
            <div class="card-body p-4">
                <h3 class="text-center mb-4">Reset Password</h3>

                @if(session('error'))
                    <div class="alert alert-danger">{{ session('error') }}</div>
                @endif

                <form action="{{ route('reset.password') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Password Baru</label>
                        <input type="password" name="password" class="form-control @error('password') is-invalid @enderror" required>
                        @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Konfirmasi Password</label>
                        <input type="password" name="password_confirmation" class="form-control" required>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Reset Password</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection