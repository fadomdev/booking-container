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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData, Reservation } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Container,
    FileDown,
    Filter,
    Info,
    MoreVertical,
    Package,
    Truck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    reservations: PaginatedData<Reservation>;
    filters?: {
        status?: string;
        date?: string;
        booking?: string;
        transportista?: string;
        per_page?: string;
    };
}

export default function AdminReservationsIndex({
    reservations,
    filters = {},
}: Props) {
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [filterStatus, setFilterStatus] = useState(
        filters.status || 'active',
    );
    const [filterBooking, setFilterBooking] = useState(filters.booking || '');
    const [filterTransportista, setFilterTransportista] = useState(
        filters.transportista || '',
    );
    const [perPage, setPerPage] = useState(filters.per_page || '20');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);
    const [fileInfoDialogOpen, setFileInfoDialogOpen] = useState(false);
    const [selectedFileInfo, setSelectedFileInfo] = useState<string | null>(
        null,
    );

    const { data, setData, post, processing, reset } = useForm({
        cancellation_comment: '',
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filterDate) params.set('date', filterDate);
        params.set('status', filterStatus); // Siempre enviar status
        if (filterBooking) params.set('booking', filterBooking);
        if (filterTransportista)
            params.set('transportista', filterTransportista);
        if (perPage) params.set('per_page', perPage);

        router.get(`/admin/reservations?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterStatus('active');
        setFilterBooking('');
        setFilterTransportista('');
        setPerPage('20');
        router.get('/admin/reservations');
    };

    const exportToExcel = () => {
        const params = new URLSearchParams();
        if (filterDate) params.set('date', filterDate);
        params.set('status', filterStatus); // Siempre enviar status
        params.set('export', 'excel');

        window.location.href = `/admin/reservations?${params.toString()}`;
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        const params = new URLSearchParams(window.location.search);
        if (filterDate) params.set('date', filterDate);
        params.set('status', filterStatus); // Siempre enviar status
        params.set('per_page', value);
        params.delete('page'); // Reset to first page when changing per_page

        router.get(`/admin/reservations?${params.toString()}`);
    };

    const openCancelDialog = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setCancelDialogOpen(true);
        reset();
    };

    const handleCancel = () => {
        if (!selectedReservation) return;

        post(`/reservations/${selectedReservation.id}/cancel`, {
            onSuccess: () => {
                setCancelDialogOpen(false);
                setSelectedReservation(null);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Gestión de Reservas" />

            <div className="space-y-6">
                {/* Header Mejorado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestión de Reservas
                        </h1>
                        <p className="text-muted-foreground">
                            Administra todas las reservas del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin">← Volver</Link>
                        </Button>
                    </div>
                </div>

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
                                    Fecha
                                </label>
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) =>
                                        setFilterDate(e.target.value)
                                    }
                                    placeholder="Filtrar por fecha"
                                />
                            </div>
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Número de Booking
                                </label>
                                <Input
                                    type="text"
                                    value={filterBooking}
                                    onChange={(e) =>
                                        setFilterBooking(e.target.value)
                                    }
                                    placeholder="Buscar por booking..."
                                />
                            </div>
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Transportista
                                </label>
                                <Input
                                    type="text"
                                    value={filterTransportista}
                                    onChange={(e) =>
                                        setFilterTransportista(e.target.value)
                                    }
                                    placeholder="Buscar por transportista..."
                                />
                            </div>
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <label className="text-sm font-medium">
                                    Estado
                                </label>
                                <Select
                                    value={filterStatus}
                                    onValueChange={setFilterStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Activas
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completadas
                                        </SelectItem>
                                        <SelectItem value="expired">
                                            Expiradas
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Canceladas
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
                                <Button
                                    variant="default"
                                    onClick={exportToExcel}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mostrar</span>
                        <Select
                            value={perPage}
                            onValueChange={handlePerPageChange}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>registros por página</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {reservations.total} registros en total
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Transportista</TableHead>
                                        <TableHead>Booking</TableHead>
                                        <TableHead>Patente</TableHead>
                                        <TableHead>Contenedores</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creada</TableHead>
                                        <TableHead className="text-right">
                                            Acciones
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservations.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="h-24 text-center"
                                            >
                                                No se encontraron reservas con
                                                los filtros aplicados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reservations.data.map((reservation) => (
                                            <TableRow key={reservation.id}>
                                                {/* Fecha */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {reservation.reservation_date &&
                                                                new Date(
                                                                    reservation.reservation_date,
                                                                ).toLocaleDateString(
                                                                    'es-CL',
                                                                )}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Hora */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {
                                                                reservation.reservation_time
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Transportista */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    reservation.transportista_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    reservation
                                                                        .user
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Booking */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-mono">
                                                            {
                                                                reservation.booking_number
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Patente */}
                                                <TableCell>
                                                    <span className="font-mono text-sm uppercase">
                                                        {
                                                            reservation.truck_plate
                                                        }
                                                    </span>
                                                </TableCell>

                                                {/* Contenedores */}
                                                <TableCell>
                                                    {reservation.container_numbers &&
                                                    reservation
                                                        .container_numbers
                                                        .length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <Container className="h-4 w-4 text-muted-foreground" />
                                                            <div className="flex flex-col gap-1">
                                                                {reservation.container_numbers.map(
                                                                    (
                                                                        container,
                                                                        idx,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="font-mono text-xs"
                                                                        >
                                                                            {
                                                                                container
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            reservation.status ===
                                                            'active'
                                                                ? 'default'
                                                                : reservation.status ===
                                                                    'completed'
                                                                  ? 'secondary'
                                                                  : reservation.status ===
                                                                      'expired'
                                                                    ? 'destructive'
                                                                    : 'outline'
                                                        }
                                                        className={
                                                            reservation.status ===
                                                            'completed'
                                                                ? 'bg-green-600 hover:bg-green-700'
                                                                : reservation.status ===
                                                                    'expired'
                                                                  ? 'bg-gray-600 hover:bg-gray-700'
                                                                  : ''
                                                        }
                                                    >
                                                        {reservation.status ===
                                                        'active'
                                                            ? 'Activa'
                                                            : reservation.status ===
                                                                'completed'
                                                              ? 'Completada'
                                                              : reservation.status ===
                                                                  'expired'
                                                                ? 'Expirada'
                                                                : 'Cancelada'}
                                                    </Badge>
                                                </TableCell>

                                                {/* Fecha de Creación */}
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {reservation.created_at &&
                                                        new Date(
                                                            reservation.created_at,
                                                        ).toLocaleDateString(
                                                            'es-CL',
                                                            {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {reservation.file_info && (
                                                                <DropdownMenuItem
                                                                    onSelect={() => {
                                                                        setSelectedFileInfo(
                                                                            reservation.file_info ||
                                                                                null,
                                                                        );
                                                                        setFileInfoDialogOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Info className="mr-2 h-4 w-4" />
                                                                    Ver File
                                                                    Info
                                                                </DropdownMenuItem>
                                                            )}
                                                            {reservation.status ===
                                                                'active' && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onSelect={() =>
                                                                            router.visit(
                                                                                `/admin/reservations/${reservation.id}/show`,
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                        Marcar
                                                                        como
                                                                        completada
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onSelect={() =>
                                                                            openCancelDialog(
                                                                                reservation,
                                                                            )
                                                                        }
                                                                        className="text-destructive"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Anular
                                                                        reserva
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {reservations.data.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {reservations.from} a {reservations.to} de{' '}
                            {reservations.total} reservas
                        </div>

                        {reservations.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {reservations.prev_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                reservations.prev_page_url!,
                                            )
                                        }
                                    >
                                        ← Anterior
                                    </Button>
                                )}

                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: reservations.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter((page) => {
                                            const current =
                                                reservations.current_page;
                                            const last = reservations.last_page;
                                            // Show first page, last page, current page and adjacent pages
                                            return (
                                                page === 1 ||
                                                page === last ||
                                                (page >= current - 1 &&
                                                    page <= current + 1)
                                            );
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis between non-consecutive pages
                                            const prevPage =
                                                index > 0
                                                    ? array[index - 1]
                                                    : null;
                                            const showEllipsis =
                                                prevPage && page - prevPage > 1;

                                            return (
                                                <div
                                                    key={`page-${page}`}
                                                    className="contents"
                                                >
                                                    {showEllipsis && (
                                                        <span className="px-2 text-muted-foreground">
                                                            ...
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant={
                                                            page ===
                                                            reservations.current_page
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() => {
                                                            const params =
                                                                new URLSearchParams(
                                                                    window.location.search,
                                                                );
                                                            params.set(
                                                                'page',
                                                                page.toString(),
                                                            );
                                                            router.get(
                                                                `/admin/reservations?${params.toString()}`,
                                                            );
                                                        }}
                                                        className="min-w-[40px]"
                                                    >
                                                        {page}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                </div>

                                {reservations.next_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                reservations.next_page_url!,
                                            )
                                        }
                                    >
                                        Siguiente →
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* File Info Dialog */}
            <Dialog
                open={fileInfoDialogOpen}
                onOpenChange={setFileInfoDialogOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Información del File</DialogTitle>
                        <DialogDescription>
                            Detalles del file asociado a la reserva
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-auto rounded-md border bg-muted p-4">
                        {selectedFileInfo &&
                            selectedFileInfo.split(' - ').map((part, idx) => (
                                <div
                                    key={idx}
                                    className="mb-2 text-sm leading-relaxed"
                                >
                                    {part}
                                </div>
                            ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFileInfoDialogOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anular Reserva</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas anular esta reserva? Se
                            enviará una notificación por correo al cliente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedReservation && (
                            <div className="rounded-lg border p-4 text-sm">
                                <p>
                                    <strong>Cliente:</strong>{' '}
                                    {selectedReservation.user?.name}
                                </p>
                                <p>
                                    <strong>Fecha:</strong>{' '}
                                    {selectedReservation.reservation_date &&
                                        new Date(
                                            selectedReservation.reservation_date,
                                        ).toLocaleDateString('es-CL')}
                                </p>
                                <p>
                                    <strong>Hora:</strong>{' '}
                                    {selectedReservation.reservation_time}
                                </p>
                                <p>
                                    <strong>Booking:</strong>{' '}
                                    {selectedReservation.booking_number}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="admin_cancellation_comment">
                                Motivo de Anulación (opcional)
                            </Label>
                            <Textarea
                                id="admin_cancellation_comment"
                                placeholder="Ingresa el motivo de la anulación..."
                                value={data.cancellation_comment}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    setData(
                                        'cancellation_comment',
                                        e.target.value,
                                    )
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            {processing ? 'Anulando...' : 'Anular Reserva'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
