@extends('layouts.dashboard')
@section('title', 'User Dashboard')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h4 class="mb-0">User Dashboard</h4>
                </div>
                <div class="card-body">
                    <h5>Selamat datang, {{ Auth::user()->name }}!</h5>
                    <p>Role: <span class="badge bg-primary">{{ Auth::user()->role->name }}</span></p>
                    <p>Email: {{ Auth::user()->email }}</p>
                    <p>Username: {{ Auth::user()->username }}</p>
                    <p>Phone: {{ Auth::user()->phone }}</p>

                    <div class="alert alert-success mt-4">
                        <i class="bi bi-check-circle"></i> Email Anda telah diverifikasi!
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection