<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanModify
{
    /**
     * Handle an incoming request.
     * Blocks write operations for read-only (consulta) users.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->canModify()) {
            abort(403, 'No tienes permisos para realizar modificaciones.');
        }

        return $next($request);
    }
}
