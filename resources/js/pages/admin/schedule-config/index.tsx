import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { ScheduleConfig } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';

interface Props {
    configs: ScheduleConfig[];
}

export default function ScheduleConfigIndex({ configs }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta configuración?')) {
            router.delete(`/admin/schedule-config/${id}`);
        }
    };

    const toggleStatus = (id: number) => {
        router.post(`/admin/schedule-config/${id}/toggle-status`);
    };

    const getDayName = (day: number) => {
        const dayNames = [
            'Domingo',
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
        ];
        return dayNames[day];
    };

    // Array con los 7 días de la semana para mostrar todos
    const allDays = [0, 1, 2, 3, 4, 5, 6];

    // Crear un mapa de configuraciones por día
    const configsByDay = new Map(
        configs.map((config) => [config.day_of_week, config]),
    );

    return (
        <AppLayout>
            <Head title="Configuración de Horarios" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Configuración de Horarios
                        </h1>
                        <p className="text-muted-foreground">
                            Define las configuraciones generales de horarios
                            disponibles
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin">← Volver</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/schedule-config/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Configuración
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {allDays.map((dayOfWeek) => {
                        const config = configsByDay.get(dayOfWeek);

                        if (!config) {
                            // No hay configuración para este día
                            return (
                                <Card key={dayOfWeek} className="border-dashed">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-muted-foreground">
                                                    {getDayName(dayOfWeek)}
                                                </CardTitle>
                                                <CardDescription>
                                                    Sin configuración
                                                </CardDescription>
                                            </div>
                                            <Button asChild size="sm">
                                                <Link
                                                    href={`/admin/schedule-config/create?day=${dayOfWeek}`}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Configurar
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        }

                        // Hay configuración para este día
                        return (
                            <Card key={config.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle>
                                                    {getDayName(
                                                        config.day_of_week,
                                                    )}
                                                </CardTitle>
                                                <Badge
                                                    variant={
                                                        config.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {config.is_active
                                                        ? 'Activa'
                                                        : 'Inactiva'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Hora Inicio
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {config.start_time}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Hora Término
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {config.end_time}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Intervalo
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {config.interval_minutes} min
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Cupos por Intervalo
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {config.slots_per_interval}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 border-t pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                toggleStatus(config.id)
                                            }
                                        >
                                            {config.is_active ? (
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
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={`/admin/schedule-config/${config.id}/edit`}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(config.id)
                                            }
                                        >
                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
