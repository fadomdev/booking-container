import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Props {
    day?: number;
}

export default function CreateScheduleConfig({ day }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        day_of_week: day ?? 1, // Lunes por defecto
        start_time: '08:00',
        end_time: '18:00',
        interval_minutes: 30,
        slots_per_interval: 2,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/schedule-config');
    };

    const dayOptions = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Lunes' },
        { value: 2, label: 'Martes' },
        { value: 3, label: 'Miércoles' },
        { value: 4, label: 'Jueves' },
        { value: 5, label: 'Viernes' },
        { value: 6, label: 'Sábado' },
    ];

    return (
        <AppLayout>
            <Head title="Nueva Configuración de Horarios" />

            <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/schedule-config">← Volver</Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Nueva Configuración
                        </h1>
                        <p className="text-muted-foreground">
                            Define los parámetros para los horarios disponibles
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de Configuración</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="day_of_week">
                                    Día de la Semana *
                                </Label>
                                <select
                                    id="day_of_week"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.day_of_week}
                                    onChange={(e) =>
                                        setData(
                                            'day_of_week',
                                            parseInt(e.target.value),
                                        )
                                    }
                                >
                                    {dayOptions.map((day) => (
                                        <option
                                            key={day.value}
                                            value={day.value}
                                        >
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.day_of_week && (
                                    <p className="text-sm text-destructive">
                                        {errors.day_of_week}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">
                                        Hora de Inicio *
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) =>
                                            setData(
                                                'start_time',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.start_time && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_time}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">
                                        Hora de Término *
                                    </Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData('end_time', e.target.value)
                                        }
                                    />
                                    {errors.end_time && (
                                        <p className="text-sm text-destructive">
                                            {errors.end_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="interval_minutes">
                                        Intervalo (minutos) *
                                    </Label>
                                    <Input
                                        id="interval_minutes"
                                        type="number"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={data.interval_minutes}
                                        onChange={(e) =>
                                            setData(
                                                'interval_minutes',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tiempo entre cada slot (15, 30, 45,
                                        60...)
                                    </p>
                                    {errors.interval_minutes && (
                                        <p className="text-sm text-destructive">
                                            {errors.interval_minutes}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slots_per_interval">
                                        Cupos por Intervalo *
                                    </Label>
                                    <Input
                                        id="slots_per_interval"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={data.slots_per_interval}
                                        onChange={(e) =>
                                            setData(
                                                'slots_per_interval',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Cantidad de reservas simultáneas por
                                        slot
                                    </p>
                                    {errors.slots_per_interval && (
                                        <p className="text-sm text-destructive">
                                            {errors.slots_per_interval}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creando...'
                                        : 'Crear Configuración'}
                                </Button>
                                <Button asChild variant="outline" type="button">
                                    <Link href="/admin/schedule-config">
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-base">
                            💡 Cómo funciona
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            • Esta configuración se aplicará únicamente al día
                            de la semana seleccionado
                        </p>
                        <p>
                            • Los horarios se generarán automáticamente según
                            los parámetros definidos
                        </p>
                        <p>
                            • Solo puedes tener una configuración por día de la
                            semana
                        </p>
                        <p>
                            • Las fechas bloqueadas tienen prioridad sobre las
                            configuraciones
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
