<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login.user');
        }

        /** @var User $user */
        $user = Auth::user();

        $allowedRoles = [
            'admin' => 1,
            'user' => 2,
            'developer' => 3,
        ];

        if (!isset($allowedRoles[$role]) || $user->role_id !== $allowedRoles[$role]) {
            abort(403, 'Unauthorized access');
        }

        return $next($request);
    }
}
