import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import AppLayout from '@/layouts/app-layout';
import { Company, PaginatedData } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Filter,
    Plus,
    Power,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    companies: PaginatedData<Company>;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function CompaniesIndex({ companies, filters = {} }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const { delete: destroy, processing } = useForm();

    const openDeleteDialog = (company: Company) => {
        setSelectedCompany(company);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!selectedCompany) return;

        destroy(`/admin/companies/${selectedCompany.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedCompany(null);
            },
        });
    };

    const toggleStatus = (company: Company) => {
        router.post(
            `/admin/companies/${company.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter && statusFilter !== 'all')
            params.set('status', statusFilter);

        router.get(`/admin/companies?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        router.get('/admin/companies');
    };

    return (
        <AppLayout>
            <Head title="Empresas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Empresas
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona las empresas del sistema
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/companies/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Empresa
                        </Link>
                    </Button>
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
                                    placeholder="Nombre, email o teléfono..."
                                />
                            </div>
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Estado
                                </label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Activas
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactivas
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

                {companies.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                        <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-sm text-muted-foreground">
                            No hay empresas registradas
                        </p>
                        <Button asChild>
                            <Link href="/admin/companies/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Empresa
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Dirección</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Usuarios</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.data.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {company.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {company.address || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {company.phone || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {company.email || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    {company.users_count || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        company.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {company.is_active
                                                        ? 'Activa'
                                                        : 'Inactiva'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                company,
                                                            )
                                                        }
                                                        title={
                                                            company.is_active
                                                                ? 'Desactivar'
                                                                : 'Activar'
                                                        }
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/admin/companies/${company.id}/edit`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                company,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {companies.from} a {companies.to} de{' '}
                                {companies.total} empresas
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            companies.prev_page_url || '',
                                        )
                                    }
                                    disabled={!companies.prev_page_url}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            companies.next_page_url || '',
                                        )
                                    }
                                    disabled={!companies.next_page_url}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Empresa</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar esta empresa?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCompany && (
                        <div className="rounded-lg border p-4 text-sm">
                            <p>
                                <strong>Nombre:</strong> {selectedCompany.name}
                            </p>
                            {selectedCompany.email && (
                                <p>
                                    <strong>Email:</strong>{' '}
                                    {selectedCompany.email}
                                </p>
                            )}
                            {selectedCompany.users_count > 0 && (
                                <p className="mt-2 text-destructive">
                                    <strong>Advertencia:</strong> Esta empresa
                                    tiene {selectedCompany.users_count}{' '}
                                    usuario(s) asociado(s).
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={processing}
                        >
                            {processing ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
