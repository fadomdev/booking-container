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
import { BlockedDate, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';

interface Props {
    blockedDates: PaginatedData<BlockedDate>;
}

export default function BlockedDatesIndex({ blockedDates }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta fecha bloqueada?')) {
            router.delete(`/admin/blocked-dates/${id}`);
        }
    };

    const toggleStatus = (id: number) => {
        router.post(`/admin/blocked-dates/${id}/toggle-status`);
    };

    const getTypeLabel = (type: string) => {
        const types = {
            holiday: 'Día Festivo',
            maintenance: 'Mantenimiento',
            other: 'Otro',
        };
        return types[type as keyof typeof types] || 'Otro';
    };

    const getTypeColor = (type: string) => {
        const colors = {
            holiday: 'bg-red-100 text-red-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return (
            colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        );
    };

    return (
        <AppLayout>
            <Head title="Fechas Bloqueadas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Fechas Bloqueadas
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona días festivos y fechas no disponibles
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin">← Volver</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/blocked-dates/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Bloquear Fecha
                            </Link>
                        </Button>
                    </div>
                </div>

                {blockedDates.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">
                                No hay fechas bloqueadas
                            </h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Agrega fechas festivas o de mantenimiento
                            </p>
                            <Button asChild>
                                <Link href="/admin/blocked-dates/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Bloquear Fecha
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {blockedDates.data.map((blocked) => (
                            <Card key={blocked.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-1">
                                            <CardTitle className="text-lg">
                                                {new Date(
                                                    blocked.date,
                                                ).toLocaleDateString('es-CL', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </CardTitle>
                                            <CardDescription>
                                                {blocked.reason}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${getTypeColor(
                                                blocked.type,
                                            )}`}
                                        >
                                            {getTypeLabel(blocked.type)}
                                        </span>
                                        <Badge
                                            variant={
                                                blocked.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {blocked.is_active
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2 border-t pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                toggleStatus(blocked.id)
                                            }
                                        >
                                            {blocked.is_active ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Link
                                                href={`/admin/blocked-dates/${blocked.id}/edit`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(blocked.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {blockedDates.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {blockedDates.prev_page_url && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.get(blockedDates.prev_page_url!)
                                }
                            >
                                Anterior
                            </Button>
                        )}
                        <span className="flex items-center px-4">
                            Página {blockedDates.current_page} de{' '}
                            {blockedDates.last_page}
                        </span>
                        {blockedDates.next_page_url && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.get(blockedDates.next_page_url!)
                                }
                            >
                                Siguiente
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
