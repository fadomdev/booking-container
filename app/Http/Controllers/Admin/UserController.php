<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with('company:id,name')
            ->select('id', 'name', 'rut', 'email', 'role', 'company_id', 'created_at');

        // Filtro de búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('rut', 'like', "%{$search}%");
            });
        }

        // Filtro por rol
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filtro por empresa (búsqueda por nombre)
        if ($request->filled('company')) {
            $companySearch = $request->company;
            $query->whereHas('company', function ($q) use ($companySearch) {
                $q->where('name', 'like', "%{$companySearch}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? 'all',
                'company' => $request->company ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $companies = Company::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/users/create', [
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'rut' => ['required', 'string', 'max:12', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'transportista', 'consulta'])],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        User::create([
            'name' => $validated['name'],
            'rut' => $validated['rut'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'company_id' => $validated['company_id'] ?? null,
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $companies = Company::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/users/edit', [
            'user' => $user->only('id', 'name', 'rut', 'email', 'role', 'company_id'),
            'companies' => $companies,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'rut' => ['required', 'string', 'max:12', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'transportista', 'consulta'])],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'rut' => $validated['rut'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'company_id' => $validated['company_id'] ?? null,
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }
}
