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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Reservation } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ArrowLeft,
    Building2,
    CalendarCheck,
    CheckCircle,
    Container,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    reservation: Reservation;
}

export default function ReservationShow({ reservation }: Props) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const { post, processing } = useForm();

    const handleMarkAsCompleted = () => {
        post(`/admin/reservations/${reservation.id}/complete`, {
            onSuccess: () => {
                setConfirmDialogOpen(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "EEEE d 'de' MMMM 'de' yyyy", {
            locale: es,
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Activa', className: 'bg-blue-500' },
            confirmed: { label: 'Confirmada', className: 'bg-blue-500' },
            completed: { label: 'Completada', className: 'bg-green-500' },
            cancelled: { label: 'Cancelada', className: 'bg-red-500' },
            expired: { label: 'Expirada', className: 'bg-gray-500' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            className: 'bg-gray-500',
        };

        return <Badge className={config.className}>{config.label}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Detalles de la Reserva" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.get('/admin/reservations/search')}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la búsqueda
                    </Button>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Detalles de la Reserva
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Booking #{reservation.booking_number}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(reservation.status)}
                            {reservation.status === 'active' && (
                                <Button
                                    onClick={() => setConfirmDialogOpen(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Marcar como Completada
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5" />
                                Información de la Reserva
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Fecha
                                </Label>
                                <p className="font-medium capitalize">
                                    {formatDate(reservation.reservation_date)}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-muted-foreground">
                                    Horario
                                </Label>
                                <p className="font-medium">
                                    {formatTime(reservation.reservation_time)}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-muted-foreground">
                                    Número de Booking
                                </Label>
                                <p className="font-medium">
                                    {reservation.booking_number}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Cliente y Empresa */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Cliente
                                </Label>
                                <p className="font-medium">
                                    {reservation.user?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {reservation.user?.email}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-muted-foreground">
                                    Empresa
                                </Label>
                                <p className="font-medium">
                                    {reservation.user?.company?.name || 'N/A'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Transportista */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Transportista
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Nombre
                                </Label>
                                <p className="font-medium">
                                    {reservation.transportista_name}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-muted-foreground">
                                    Placa del Camión
                                </Label>
                                <p className="font-medium">
                                    {reservation.truck_plate}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contenedores */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Container className="h-5 w-5" />
                                Números de Contenedor (
                                {reservation.container_numbers?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reservation.container_numbers &&
                            reservation.container_numbers.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {reservation.container_numbers.map(
                                        (
                                            containerNumber: string,
                                            index: number,
                                        ) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border-2 p-3"
                                            >
                                                <Label className="text-xs text-muted-foreground">
                                                    Contenedor {index + 1}
                                                </Label>
                                                <p className="font-mono font-medium">
                                                    {containerNumber}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">
                                    No hay contenedores asociados a esta
                                    reserva.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Completado</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas marcar esta reserva como
                            completada?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium">
                                Detalles de la reserva:
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>
                                    <strong>Booking:</strong>{' '}
                                    {reservation.booking_number}
                                </li>
                                <li>
                                    <strong>Cliente:</strong>{' '}
                                    {reservation.user?.name}
                                </li>
                                <li>
                                    <strong>Transportista:</strong>{' '}
                                    {reservation.transportista_name}
                                </li>
                                <li>
                                    <strong>Placa:</strong>{' '}
                                    {reservation.truck_plate}
                                </li>
                            </ul>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Esta acción se registrará con tu usuario y la
                            fecha/hora actual.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleMarkAsCompleted}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing
                                ? 'Procesando...'
                                : 'Confirmar Completado'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
