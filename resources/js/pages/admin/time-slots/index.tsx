import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { TimeSlot } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Eye, EyeOff, Plus } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    timeSlots: TimeSlot[];
    selectedDate: string;
}

export default function TimeSlotsIndex({ timeSlots, selectedDate }: Props) {
    const { data, setData, post, processing } = useForm({
        date: selectedDate,
    });

    const handleDateChange = (newDate: string) => {
        window.location.href = `/admin/time-slots?date=${newDate}`;
    };

    const handleGenerate = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/time-slots/generate');
    };

    const toggleStatus = (slotId: number) => {
        router.post(`/admin/time-slots/${slotId}/toggle-status`);
    };

    return (
        <AppLayout>
            <Head title="Gestión de Horarios" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Horarios y Cupos
                        </h1>
                        <p className="text-muted-foreground">
                            Administra los horarios disponibles por fecha
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Seleccionar Fecha
                        </CardTitle>
                        <CardDescription>
                            Consulta o genera horarios para una fecha específica
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div className="flex items-end gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => {
                                            setData('date', e.target.value);
                                            handleDateChange(e.target.value);
                                        }}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || timeSlots.length > 0
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Generando...'
                                        : 'Generar Horarios'}
                                </Button>
                            </div>
                            {timeSlots.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Ya existen horarios para esta fecha. No se
                                    pueden generar duplicados.
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {timeSlots.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Horarios del{' '}
                                {new Date(selectedDate).toLocaleDateString(
                                    'es-CL',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    },
                                )}
                            </CardTitle>
                            <CardDescription>
                                Total: {timeSlots.length} horarios
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {timeSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className={`rounded-lg border p-4 ${
                                            slot.is_active
                                                ? 'bg-background'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-lg font-semibold">
                                                {slot.time}
                                            </span>
                                            <Badge
                                                variant={
                                                    slot.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {slot.is_active
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Badge>
                                        </div>
                                        <div className="mb-3 text-sm text-muted-foreground">
                                            Disponible:{' '}
                                            {slot.available_capacity}/
                                            {slot.total_capacity}
                                        </div>
                                        {slot.active_reservations &&
                                            slot.active_reservations.length >
                                                0 && (
                                                <div className="mb-3 space-y-1 rounded bg-muted/50 p-2 text-xs">
                                                    <p className="font-medium">
                                                        Reservas:
                                                    </p>
                                                    {slot.active_reservations.map(
                                                        (reservation) => (
                                                            <p
                                                                key={
                                                                    reservation.id
                                                                }
                                                            >
                                                                •{' '}
                                                                {
                                                                    reservation.transportista_name
                                                                }{' '}
                                                                (
                                                                {
                                                                    reservation.slots_reserved
                                                                }{' '}
                                                                cupo
                                                                {reservation.slots_reserved >
                                                                1
                                                                    ? 's'
                                                                    : ''}
                                                                )
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                toggleStatus(slot.id)
                                            }
                                        >
                                            {slot.is_active ? (
                                                <>
                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                    Desactivar
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Activar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">
                                No hay horarios para esta fecha
                            </h3>
                            <p className="mb-4 text-center text-sm text-muted-foreground">
                                Genera horarios automáticamente usando el botón
                                "Generar Horarios"
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
