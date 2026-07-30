<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome - Auth System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .welcome-card { 
            background: rgba(255,255,255,0.95);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="welcome-card p-5 text-center">
                    <h1 class="display-4 mb-4">Welcome to Auth System</h1>
                    <p class="lead mb-5">Sistem autentikasi lengkap dengan verifikasi email dan multi-role dashboard</p>
                    
                    <div class="row g-3">
                        <div class="col-md-4">
                            <a href="{{ route('register') }}" class="btn btn-primary btn-lg w-100">
                                <i class="bi bi-person-plus"></i> Register
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="{{ route('login.user') }}" class="btn btn-success btn-lg w-100">
                                <i class="bi bi-box-arrow-in-right"></i> Login User
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="{{ route('login.admin') }}" class="btn btn-danger btn-lg w-100">
                                <i class="bi bi-shield-lock"></i> Login Admin
                            </a>
                        </div>
                    </div>

                    <hr class="my-5">

                    <div class="row text-start">
                        <div class="col-md-6">
                            <h5>✅ Features:</h5>
                            <ul>
                                <li>Register dengan verifikasi email</li>
                                <li>Login dengan username atau email</li>
                                <li>Multi-role dashboard</li>
                                <li>Lupa password via Email/WhatsApp</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h5>🔐 Roles:</h5>
                            <ul>
                                <li><span class="badge bg-danger">Admin</span> - Full access</li>
                                <li><span class="badge bg-primary">User</span> - Standard access</li>
                                <li><span class="badge bg-warning">Developer</span> - API access</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>