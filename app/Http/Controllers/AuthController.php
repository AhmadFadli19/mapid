<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\OTPMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $code = rand(100000, 999999);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'email_verification_code' => $code,
            'role_id' => 2,
        ]);

        // Kirim email OTP
        Mail::to($user->email)->send(new OTPMail($code, 'verification'));

        session(['verify_user_id' => $user->id]);

        return redirect()->route('verify.show')->with('success', 'Kode verifikasi telah dikirim ke email Anda.');
    }

    // ==================== VERIFY EMAIL ====================
    public function showVerify()
    {
        if (!session('verify_user_id')) {
            return redirect()->route('register')->with('error', 'Silakan register terlebih dahulu.');
        }
        return view('auth.verify');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        $user = User::find(session('verify_user_id'));

        if (!$user) {
            return back()->with('error', 'User tidak ditemukan.');
        }

        if ($user->email_verification_code != $request->code) {
            return back()->with('error', 'Kode verifikasi salah.');
        }

        $user->update([
            'email_verified_at' => now(),
            'email_verification_code' => null,
        ]);

        Auth::login($user);
        session()->forget('verify_user_id');

        return redirect()->route('user.dashboard')->with('success', 'Email berhasil diverifikasi!');
    }

    public function resendCode()
    {
        $user = User::find(session('verify_user_id'));

        if (!$user) {
            return back()->with('error', 'User tidak ditemukan.');
        }

        $code = rand(100000, 999999);
        $user->update(['email_verification_code' => $code]);

        Mail::to($user->email)->send(new OTPMail($code, 'verification'));

        return back()->with('success', 'Kode verifikasi baru telah dikirim.');
    }

    // ==================== LOGIN (SPLIT ADMIN & USER) ====================
    public function showLoginAdmin()
    {
        return view('auth.login-admin');
    }

    public function showLoginUser()
    {
        return view('auth.login-user');
    }

    public function loginAdmin(Request $request)
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required',
        ]);

        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginType, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->with('error', 'Username/Email atau password salah.');
        }

        if (!$user->isAdmin()) {
            return back()->with('error', 'Anda tidak memiliki akses admin.');
        }

        Auth::login($user);
        return redirect()->route('admin.dashboard');
    }

    public function loginUser(Request $request)
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required',
        ]);

        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginType, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->with('error', 'Username/Email atau password salah.');
        }

        if (!$user->email_verified_at) {
            session(['verify_user_id' => $user->id]);
            return redirect()->route('verify.show')->with('error', 'Silakan verifikasi email Anda terlebih dahulu.');
        }

        if ($user->isAdmin()) {
            return back()->with('error', 'Silakan gunakan halaman login admin.');
        }

        Auth::login($user);

        if ($user->isDeveloper()) {
            return redirect()->route('developer.dashboard');
        }

        return redirect()->route('user.dashboard');
    }

    // ==================== FORGOT PASSWORD ====================
    public function showForgotPassword()
    {
        return view('auth.forgot-password');
    }

    public function sendResetCode(Request $request)
    {
        $request->validate([
            'phone' => 'required|exists:users,phone',
            'method' => 'required|in:email,whatsapp',
        ]);

        $user = User::where('phone', $request->phone)->first();
        $code = rand(100000, 999999);

        $user->update([
            'reset_code' => $code,
            'reset_code_expired_at' => now()->addMinutes(10),
        ]);

        if ($request->method === 'email') {
            Mail::to($user->email)->send(new OTPMail($code, 'reset'));
            $message = 'Kode reset password telah dikirim ke email Anda.';
        } 

        session(['reset_user_id' => $user->id]);

        return redirect()->route('reset.verify.show')->with('success', $message);
    }

    public function showResetVerify()
    {
        if (!session('reset_user_id')) {
            return redirect()->route('forgot.password')->with('error', 'Silakan masukkan nomor telepon terlebih dahulu.');
        }
        return view('auth.reset-verify');
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        $user = User::find(session('reset_user_id'));

        if (!$user) {
            return back()->with('error', 'User tidak ditemukan.');
        }

        if ($user->reset_code != $request->code) {
            return back()->with('error', 'Kode salah.');
        }

        if (now()->greaterThan($user->reset_code_expired_at)) {
            return back()->with('error', 'Kode sudah kadaluarsa.');
        }

        return redirect()->route('reset.password.show');
    }

    public function showResetPassword()
    {
        if (!session('reset_user_id')) {
            return redirect()->route('forgot.password');
        }
        return view('auth.reset-password');
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::find(session('reset_user_id'));

        if (!$user) {
            return back()->with('error', 'User tidak ditemukan.');
        }

        $user->update([
            'password' => Hash::make($request->password),
            'reset_code' => null,
            'reset_code_expired_at' => null,
        ]);

        session()->forget('reset_user_id');

        return redirect()->route('login.user')->with('success', 'Password berhasil direset!');
    }

    // ==================== LOGOUT ====================
    public function logout()
    {
        Auth::logout();
        return redirect()->route('login.user');
    }
}

