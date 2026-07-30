@extends('layouts.app')
@section('title', 'Lupa Password')

@section('content')
<div class="container">
    <div class="auth-card">
        <div class="card shadow">
            <div class="card-body p-4">
                <h3 class="text-center mb-4">Lupa Password</h3>

                @if(session('error'))
                    <div class="alert alert-danger">{{ session('error') }}</div>
                @endif

                <p class="text-center">Masukkan nomor telepon yang terdaftar.</p>

                <form action="{{ route('forgot.password') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Nomor Telepon</label>
                        <input type="text" name="phone" class="form-control @error('phone') is-invalid @enderror" value="{{ old('phone') }}" placeholder="+628123456789" required>
                        @error('phone')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Metode Pengiriman Kode</label>
                        <select name="method" class="form-select @error('method') is-invalid @enderror" required>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                        @error('method')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Kirim Kode</button>
                </form>

                <div class="text-center mt-3">
                    <small><a href="{{ route('login.user') }}">Kembali ke Login</a></small>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection