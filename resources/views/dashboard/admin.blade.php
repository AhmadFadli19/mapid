@extends('layouts.dashboard')
@section('title', 'Admin Dashboard')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Admin Dashboard</h4>
                </div>
                <div class="card-body">
                    <h5>Selamat datang, {{ Auth::user()->name }}!</h5>
                    <p>Role: <span class="badge bg-danger">{{ Auth::user()->role->name }}</span></p>
                    <p>Email: {{ Auth::user()->email }}</p>
                    <p>Username: {{ Auth::user()->username }}</p>
                    <p>Phone: {{ Auth::user()->phone }}</p>

                    <hr>

                    <h6>Statistik:</h6>
                    <div class="row mt-3">
                        <div class="col-md-4">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <h3>{{ \App\Models\User::where('role_id', 2)->count() }}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <h3>{{ \App\Models\User::whereNotNull('email_verified_at')->count() }}</h3>
                                    <p>Verified Users</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <h3>{{ \App\Models\User::where('role_id', 3)->count() }}</h3>
                                    <p>Developers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection