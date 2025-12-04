import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BlockedSlot } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface Props {
    blockedSlot: BlockedSlot;
}

export default function EditBlockedSlot({ blockedSlot }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        date: blockedSlot.date || '',
        start_time: blockedSlot.start_time,
        end_time: blockedSlot.end_time,
        reason: blockedSlot.reason,
        is_recurring: blockedSlot.is_recurring,
        is_active: blockedSlot.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/blocked-slots/${blockedSlot.id}`);
    };

    return (
        <AppLayout>
            <Head title="Editar Horario Bloqueado" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Editar Horario Bloqueado
                        </h1>
                        <p className="text-muted-foreground">
                            Modifica los datos del bloqueo
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/blocked-slots">← Volver</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Bloqueo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Fecha */}
                            <div className="space-y-2">
                                <Label htmlFor="date">
                                    Fecha (opcional)
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        Si no se especifica, aplica todos los
                                        días
                                    </span>
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                />
                                {errors.date && (
                                    <p className="text-sm text-destructive">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            {/* Horarios */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">
                                        Hora Inicio
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        required
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
                                        Hora Fin
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        required
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

                            {/* Motivo */}
                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Motivo del Bloqueo
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reason"
                                    required
                                    placeholder="Ej: Colación, Mantenimiento, Reunión, etc."
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    rows={3}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            {/* Opciones */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_recurring"
                                        checked={data.is_recurring}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_recurring',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="is_recurring"
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        Bloqueo recurrente (se repite todos los
                                        días en este horario)
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_active',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        Activo (el bloqueo está habilitado)
                                    </Label>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Actualizando...'
                                        : 'Actualizar'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/blocked-slots">
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
