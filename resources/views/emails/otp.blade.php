<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box { background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>{{ $type === 'verification' ? 'Verifikasi Email' : 'Reset Password' }}</h2>
        <p>Gunakan kode berikut untuk {{ $type === 'verification' ? 'memverifikasi email Anda' : 'mereset password Anda' }}:</p>
        <div class="code-box">{{ $code }}</div>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p>Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
    </div>
</body>
</html>