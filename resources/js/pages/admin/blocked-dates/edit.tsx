import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BlockedDate } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Props {
    blockedDate: BlockedDate;
}

export default function EditBlockedDate({ blockedDate }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        date: blockedDate.date,
        type: blockedDate.type,
        reason: blockedDate.reason,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/blocked-dates/${blockedDate.id}`);
    };

    return (
        <AppLayout>
            <Head title="Editar Fecha Bloqueada" />

            <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/blocked-dates">← Volver</Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Editar Fecha Bloqueada
                        </h1>
                        <p className="text-muted-foreground">
                            Modifica la información de esta fecha bloqueada
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de la Fecha Bloqueada</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="date">Fecha *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {errors.date && (
                                    <p className="text-sm text-destructive">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo de Bloqueo *</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.type}
                                    onChange={(e) =>
                                        setData(
                                            'type',
                                            e.target.value as
                                                | 'holiday'
                                                | 'maintenance'
                                                | 'other',
                                        )
                                    }
                                >
                                    <option value="holiday">Feriado</option>
                                    <option value="maintenance">
                                        Mantención
                                    </option>
                                    <option value="other">Otro</option>
                                </select>
                                {errors.type && (
                                    <p className="text-sm text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Razón *</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder="Ej: Feriado Nacional"
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar Cambios'}
                                </Button>
                                <Button asChild variant="outline" type="button">
                                    <Link href="/admin/blocked-dates">
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
                            💡 Información
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>• Esta fecha no estará disponible para reservas</p>
                        <p>
                            • Las fechas bloqueadas tienen prioridad sobre las
                            configuraciones de horarios
                        </p>
                        <p>
                            • Puedes desactivarla temporalmente sin eliminarla
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
