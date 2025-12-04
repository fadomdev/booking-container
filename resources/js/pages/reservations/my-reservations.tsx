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
    };
}

export default function MyReservations({ reservations, filters = {} }: Props) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');

    const { data, setData, post, processing, reset } = useForm({
        cancellation_comment: '',
    });

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

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filterDate) params.set('date', filterDate);
        if (filterStatus && filterStatus !== 'all')
            params.set('status', filterStatus);

        router.get(`/reservations/my-reservations?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilterDate('');
        setFilterStatus('all');
        router.get('/reservations/my-reservations');
    };

    return (
        <AppLayout>
            <Head title="Mis Reservas" />

            <div className="space-y-4 md:space-y-6">
                {/* Header - Responsive */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#003153] md:text-3xl dark:text-white">
                            Mis Reservas
                        </h1>
                        <p className="text-sm text-muted-foreground md:text-base">
                            Consulta y administra tus reservas de horarios
                        </p>
                    </div>
                    <Button
                        asChild
                        className="w-full bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 md:w-auto"
                    >
                        <Link href="/reservations">+ Nueva Reserva</Link>
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="border-l-4 border-l-[#003153] dark:border-l-[#ffcc00]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-[#003153] md:text-lg dark:text-white">
                            <Filter className="h-4 w-4 text-[#ffcc00] md:h-5 md:w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
                            <div className="flex-1 space-y-2 md:min-w-[200px]">
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
                            <div className="flex-1 space-y-2 md:min-w-[200px]">
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
                                            Todas
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
                            <div className="flex w-full gap-2 md:w-auto">
                                <Button
                                    onClick={applyFilters}
                                    className="flex-1 bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 md:flex-none"
                                >
                                    Aplicar
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1 border-[#003153] text-[#003153] hover:bg-[#003153]/10 md:flex-none dark:border-[#ffcc00] dark:text-[#ffcc00]"
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {reservations.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#003153]/30 py-12 dark:border-[#ffcc00]/30">
                        <p className="mb-4 text-sm text-muted-foreground">
                            No tienes reservas
                        </p>
                        <Button
                            asChild
                            className="bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90"
                        >
                            <Link href="/reservations">Nueva Reserva</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
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
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creada</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservations.data.map((reservation) => (
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
                                            <TableCell className="uppercase">
                                                {reservation.truck_plate}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.booking_number}
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
                                                <Badge
                                                    variant="default"
                                                    className={
                                                        reservation.status ===
                                                        'active'
                                                            ? 'bg-blue-600 hover:bg-blue-700'
                                                            : reservation.status ===
                                                                'completed'
                                                              ? 'bg-green-600 hover:bg-green-700'
                                                              : reservation.status ===
                                                                  'expired'
                                                                ? 'bg-gray-600 hover:bg-gray-700'
                                                                : 'bg-red-600 hover:bg-red-700'
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
                                                        size="sm"
                                                        className="bg-[#d40511] hover:bg-[#d40511]/90"
                                                        onClick={() =>
                                                            openCancelDialog(
                                                                reservation,
                                                            )
                                                        }
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Anular
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {reservations.from} a{' '}
                                {reservations.to} de {reservations.total}{' '}
                                reservas
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            reservations.prev_page_url || '',
                                        )
                                    }
                                    disabled={!reservations.prev_page_url}
                                    className="border-[#003153] text-[#003153] hover:bg-[#003153]/10 disabled:opacity-50 dark:border-[#ffcc00] dark:text-[#ffcc00]"
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            reservations.next_page_url || '',
                                        )
                                    }
                                    disabled={!reservations.next_page_url}
                                    className="border-[#003153] text-[#003153] hover:bg-[#003153]/10 disabled:opacity-50 dark:border-[#ffcc00] dark:text-[#ffcc00]"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anular Reserva</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas anular esta reserva?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedReservation && (
                            <div className="rounded-lg border p-4 text-sm">
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
                            <Label htmlFor="cancellation_comment">
                                Motivo de Anulación (opcional)
                            </Label>
                            <Textarea
                                id="cancellation_comment"
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
                            className="border-[#003153] text-[#003153] hover:bg-[#003153]/10 dark:border-[#ffcc00] dark:text-[#ffcc00]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={processing}
                            className="bg-[#d40511] hover:bg-[#d40511]/90"
                        >
                            {processing ? 'Anulando...' : 'Anular Reserva'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
