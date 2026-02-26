import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useCanModify } from '@/hooks/use-can-modify';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Pencil, PlusCircle, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    users: PaginatedData<User>;
    filters?: {
        search?: string;
        role?: string;
        company?: string;
    };
}

export default function UsersIndex({ users, filters = {} }: Props) {
    const canModify = useCanModify();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [companyFilter, setCompanyFilter] = useState(filters.company || '');

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);
        if (companyFilter) params.set('company', companyFilter);

        router.get(`/admin/users?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setCompanyFilter('');
        router.get('/admin/users');
    };

    return (
        <AppLayout>
            <Head title="Gestión de Usuarios" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Usuarios
                        </h1>
                        <p className="text-muted-foreground">
                            Administra los usuarios del sistema
                        </p>
                    </div>
                    {canModify && (
                        <Button asChild>
                            <Link href="/admin/users/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo Usuario
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Buscar
                                </label>
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Nombre, email o RUT..."
                                />
                            </div>
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Empresa
                                </label>
                                <Input
                                    type="text"
                                    value={companyFilter}
                                    onChange={(e) =>
                                        setCompanyFilter(e.target.value)
                                    }
                                    placeholder="Nombre de empresa..."
                                />
                            </div>
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Rol
                                </label>
                                <Select
                                    value={roleFilter}
                                    onValueChange={setRoleFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="transportista">
                                            Transportista
                                        </SelectItem>
                                        <SelectItem value="consulta">
                                            Consulta
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={applyFilters}>Aplicar</Button>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {users.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-sm text-muted-foreground">
                            No hay usuarios registrados
                        </p>
                        {canModify && (
                            <Button asChild>
                                <Link href="/admin/users/create">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Nuevo Usuario
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Usuarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Empresa</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>
                                                Fecha Creación
                                            </TableHead>
                                            {canModify && (
                                                <TableHead className="text-right">
                                                    Acciones
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium uppercase">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>
                                                    {user.rut}
                                                </TableCell>
                                                <TableCell className="lowercase">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="uppercase">
                                                    {user.company?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.role ===
                                                            'admin'
                                                                ? 'default'
                                                                : user.role ===
                                                                    'consulta'
                                                                  ? 'outline'
                                                                  : 'secondary'
                                                        }
                                                    >
                                                        {user.role === 'admin'
                                                            ? 'Admin'
                                                            : user.role ===
                                                                'consulta'
                                                              ? 'Consulta'
                                                              : 'Transportista'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        user.created_at,
                                                    ).toLocaleDateString(
                                                        'es-CL',
                                                    )}
                                                </TableCell>
                                                {canModify && (
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Link
                                                                    href={`/admin/users/${user.id}/edit`}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        user.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {users.from} a {users.to} de{' '}
                                {users.total} usuarios
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(users.prev_page_url || '')
                                    }
                                    disabled={!users.prev_page_url}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(users.next_page_url || '')
                                    }
                                    disabled={!users.next_page_url}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
