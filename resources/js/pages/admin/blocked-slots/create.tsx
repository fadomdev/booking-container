import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

export default function CreateBlockedSlot() {
    const { data, setData, post, processing, errors } = useForm({
        date: '',
        start_time: '',
        end_time: '',
        reason: '',
        is_recurring: false,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/blocked-slots');
    };

    return (
        <AppLayout>
            <Head title="Nuevo Horario Bloqueado" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Nuevo Horario Bloqueado
                        </h1>
                        <p className="text-muted-foreground">
                            Crea un nuevo bloqueo de horario
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
                                    {processing ? 'Guardando...' : 'Guardar'}
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
