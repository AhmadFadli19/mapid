@extends('layouts.app')
@section('title', 'Verifikasi Email')

@section('content')
<div class="container">
    <div class="auth-card">
        <div class="card shadow">
            <div class="card-body p-4">
                <h3 class="text-center mb-4">Verifikasi Email</h3>

                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger">{{ session('error') }}</div>
                @endif

                <p class="text-center">Masukkan kode verifikasi yang telah dikirim ke email Anda.</p>

                <form action="{{ route('verify') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Kode Verifikasi (6 digit)</label>
                        <input type="text" name="code" class="form-control text-center @error('code') is-invalid @enderror" maxlength="6" required autofocus>
                        @error('code')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Verifikasi</button>
                </form>

                <form action="{{ route('verify.resend') }}" method="POST" class="mt-3">
                    @csrf
                    <button type="submit" class="btn btn-link w-100">Kirim Ulang Kode</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection