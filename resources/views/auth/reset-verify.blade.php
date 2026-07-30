@extends('layouts.app')
@section('title', 'Verifikasi Kode Reset')

@section('content')
<div class="container">
    <div class="auth-card">
        <div class="card shadow">
            <div class="card-body p-4">
                <h3 class="text-center mb-4">Verifikasi Kode</h3>

                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger">{{ session('error') }}</div>
                @endif

                <p class="text-center">Masukkan kode yang telah dikirim.</p>

                <form action="{{ route('reset.verify') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Kode Reset (6 digit)</label>
                        <input type="text" name="code" class="form-control text-center @error('code') is-invalid @enderror" maxlength="6" required autofocus>
                        @error('code')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Verifikasi</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection