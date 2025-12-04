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
import { Head, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';

export default function ReservationSearch() {
    const { data, setData, post, processing, errors } = useForm({
        search: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/reservations/search');
    };

    return (
        <AppLayout>
            <Head title="Buscar Reserva para Completar" />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Marcar Reserva como Completada
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Busca una reserva confirmada del día de hoy para
                        marcarla como completada cuando el cliente se presente.
                    </p>
                </div>

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Buscar Reserva
                        </CardTitle>
                        <CardDescription>
                            Ingresa el número de booking, placa del camión o RUT
                            del conductor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="search">
                                    Número de Booking / Placa / Transportista
                                </Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Ej: 123456789, ABC123, Transportes XYZ"
                                    value={data.search}
                                    onChange={(e) =>
                                        setData('search', e.target.value)
                                    }
                                    className="text-lg"
                                    autoFocus
                                />
                                {errors.search && (
                                    <p className="text-sm text-destructive">
                                        {errors.search}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    type="submit"
                                    disabled={processing || !data.search.trim()}
                                    className="flex-1 bg-[#ffcc00] text-[#003153] hover:bg-[#e6b800]"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Buscando...'
                                        : 'Buscar Reserva'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setData('search', '')}
                                    disabled={!data.search.trim()}
                                >
                                    Limpiar
                                </Button>
                            </div>

                            <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                                <p className="font-medium">
                                    📋 Criterios de búsqueda:
                                </p>
                                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                    <li>
                                        Solo busca reservas{' '}
                                        <strong>activas</strong>
                                    </li>
                                    <li>
                                        Solo del <strong>día de hoy</strong>
                                    </li>
                                    <li>
                                        Puedes buscar por:
                                        <ul className="list-circle mt-1 ml-6 list-inside">
                                            <li>Número de booking</li>
                                            <li>Placa del camión</li>
                                            <li>Nombre del transportista</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mx-auto mt-8 max-w-2xl">
                    <Card className="border-[#003153]/20">
                        <CardHeader>
                            <CardTitle className="text-base">
                                💡 Información
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                <strong>Proceso de completado:</strong>
                            </p>
                            <ol className="ml-2 list-inside list-decimal space-y-1">
                                <li>
                                    Busca la reserva usando cualquiera de los
                                    criterios disponibles
                                </li>
                                <li>
                                    Verifica los detalles de la reserva en la
                                    pantalla de resultados
                                </li>
                                <li>
                                    Presiona "Marcar como Completada" para
                                    confirmar la asistencia
                                </li>
                                <li>
                                    El sistema registrará la fecha/hora y el
                                    usuario que realizó la acción
                                </li>
                            </ol>
                            <p className="mt-4 border-t pt-4">
                                <strong>Nota:</strong> Las reservas que no sean
                                marcadas como completadas se marcarán
                                automáticamente como{' '}
                                <span className="text-destructive">
                                    expiradas
                                </span>{' '}
                                después de 2 horas de su horario programado.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
