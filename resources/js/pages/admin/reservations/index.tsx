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
import { Filter, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    reservations: PaginatedData<Reservation>;
    filters?: {
        status?: string;
        date?: string;
        per_page?: string;
    };
}

export default function AdminReservationsIndex({
    reservations,
    filters = {},
}: Props) {
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '20');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        cancellation_comment: '',
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filterDate) params.set('date', filterDate);
        if (filterStatus && filterStatus !== 'all')
            params.set('status', filterStatus);
        if (perPage) params.set('per_page', perPage);

        router.get(`/admin/reservations?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterStatus('all');
        setPerPage('20');
        router.get('/admin/reservations');
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        const params = new URLSearchParams(window.location.search);
        if (filterDate) params.set('date', filterDate);
        if (filterStatus && filterStatus !== 'all')
            params.set('status', filterStatus);
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Todas las Reservas
                        </h1>
                        <p className="text-muted-foreground">
                            Consulta todas las reservas del sistema
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin">← Volver</Link>
                    </Button>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Transportista</TableHead>
                                    <TableHead>Patente</TableHead>
                                    <TableHead>Booking</TableHead>
                                    <TableHead>Cupos</TableHead>
                                    <TableHead>Contenedores</TableHead>
                                    <TableHead>Notas API</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Creada</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={12}
                                            className="h-24 text-center"
                                        >
                                            No se encontraron reservas con los
                                            filtros aplicados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reservations.data.map((reservation) => (
                                        <TableRow key={reservation.id}>
                                            <TableCell>
                                                {reservation.reservation_date &&
                                                    new Date(
                                                        reservation.reservation_date,
                                                    ).toLocaleDateString(
                                                        'es-CL',
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.reservation_time}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.transportista_name}
                                            </TableCell>
                                            <TableCell className="font-mono uppercase">
                                                {reservation.truck_plate}
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    reservation.booking
                                                        ?.booking_number
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {reservation.slots_reserved}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.container_numbers &&
                                                reservation.container_numbers
                                                    .length > 0 ? (
                                                    <div className="flex flex-col gap-1 font-mono text-xs">
                                                        {reservation.container_numbers.map(
                                                            (
                                                                container,
                                                                idx,
                                                            ) => (
                                                                <div key={idx}>
                                                                    {container}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.api_notes ? (
                                                    <div className="max-w-md">
                                                        <details className="cursor-pointer">
                                                            <summary className="text-xs font-medium text-blue-600 hover:text-blue-800">
                                                                Ver notas API
                                                            </summary>
                                                            <div className="mt-2 space-y-2">
                                                                {(() => {
                                                                    try {
                                                                        const notes =
                                                                            JSON.parse(
                                                                                reservation.api_notes,
                                                                            );
                                                                        return (
                                                                            <div className="rounded-md border bg-muted/50 p-3 text-xs">
                                                                                <div className="mb-2 flex items-center justify-between border-b pb-2">
                                                                                    <span className="font-semibold">
                                                                                        Resumen
                                                                                    </span>
                                                                                    <span className="text-muted-foreground">
                                                                                        {
                                                                                            notes.timestamp
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                                                                                    <div className="rounded bg-green-100 p-2">
                                                                                        <div className="text-lg font-bold text-green-700">
                                                                                            {
                                                                                                notes.successful
                                                                                            }
                                                                                        </div>
                                                                                        <div className="text-[10px] text-green-600">
                                                                                            Exitosos
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="rounded bg-red-100 p-2">
                                                                                        <div className="text-lg font-bold text-red-700">
                                                                                            {
                                                                                                notes.failed
                                                                                            }
                                                                                        </div>
                                                                                        <div className="text-[10px] text-red-600">
                                                                                            Fallidos
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="rounded bg-blue-100 p-2">
                                                                                        <div className="text-lg font-bold text-blue-700">
                                                                                            {
                                                                                                notes.total_containers
                                                                                            }
                                                                                        </div>
                                                                                        <div className="text-[10px] text-blue-600">
                                                                                            Total
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {notes.errors &&
                                                                                    notes
                                                                                        .errors
                                                                                        .length >
                                                                                        0 && (
                                                                                        <div className="mt-2 space-y-1 border-t pt-2">
                                                                                            <div className="mb-1 text-[10px] font-semibold text-red-600 uppercase">
                                                                                                Errores:
                                                                                            </div>
                                                                                            {notes.errors.map(
                                                                                                (
                                                                                                    error: {
                                                                                                        container: string;
                                                                                                        message: string;
                                                                                                        type: string;
                                                                                                    },
                                                                                                    idx: number,
                                                                                                ) => (
                                                                                                    <div
                                                                                                        key={
                                                                                                            idx
                                                                                                        }
                                                                                                        className="rounded bg-red-50 p-2"
                                                                                                    >
                                                                                                        <div className="flex items-start gap-2">
                                                                                                            <span className="font-mono font-semibold text-red-700">
                                                                                                                {
                                                                                                                    error.container
                                                                                                                }
                                                                                                            </span>
                                                                                                            <span className="rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                                                                                                                {
                                                                                                                    error.type
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div className="mt-1 text-[11px] text-red-600">
                                                                                                            {
                                                                                                                error.message
                                                                                                            }
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ),
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                {notes.results &&
                                                                                    notes
                                                                                        .results
                                                                                        .length >
                                                                                        0 && (
                                                                                        <div className="mt-2 space-y-1 border-t pt-2">
                                                                                            <div className="mb-1 text-[10px] font-semibold text-green-600 uppercase">
                                                                                                Exitosos:
                                                                                            </div>
                                                                                            {notes.results.map(
                                                                                                (
                                                                                                    result: {
                                                                                                        container: string;
                                                                                                    },
                                                                                                    idx: number,
                                                                                                ) => (
                                                                                                    <div
                                                                                                        key={
                                                                                                            idx
                                                                                                        }
                                                                                                        className="rounded bg-green-50 p-1.5"
                                                                                                    >
                                                                                                        <span className="font-mono text-[11px] font-medium text-green-700">
                                                                                                            ✓{' '}
                                                                                                            {
                                                                                                                result.container
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                ),
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
                                                                                    <strong>
                                                                                        API:
                                                                                    </strong>{' '}
                                                                                    {
                                                                                        notes.api_url
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    } catch {
                                                                        // Si no es JSON válido, mostrar como texto plano
                                                                        return (
                                                                            <div className="rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">
                                                                                {
                                                                                    reservation.api_notes
                                                                                }
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()}
                                                            </div>
                                                        </details>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Sin notas
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.user?.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        reservation.status ===
                                                        'active'
                                                            ? 'default'
                                                            : reservation.status ===
                                                                'completed'
                                                              ? 'secondary'
                                                              : 'outline'
                                                    }
                                                >
                                                    {reservation.status ===
                                                    'active'
                                                        ? 'Activa'
                                                        : reservation.status ===
                                                            'completed'
                                                          ? 'Completada'
                                                          : 'Cancelada'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {reservation.created_at &&
                                                    new Date(
                                                        reservation.created_at,
                                                    ).toLocaleString('es-CL', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.status ===
                                                    'active' && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            openCancelDialog(
                                                                reservation,
                                                            )
                                                        }
                                                        title="Anular reserva"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
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
                                    {
                                        selectedReservation.booking
                                            ?.booking_number
                                    }
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
