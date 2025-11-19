import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function CreateBlockedDate() {
    const { data, setData, post, processing, errors } = useForm({
        date: '',
        reason: '',
        type: 'other' as 'holiday' | 'maintenance' | 'other',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/blocked-dates');
    };

    return (
        <AppLayout>
            <Head title="Bloquear Fecha" />

            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/blocked-dates">← Volver</Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Bloquear Fecha
                        </h1>
                        <p className="text-muted-foreground">
                            Marca fechas como no disponibles para reservas
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de Bloqueo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData(
                                            'type',
                                            value as
                                                | 'holiday'
                                                | 'maintenance'
                                                | 'other',
                                        )
                                    }
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="holiday">
                                            Día Festivo
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                            Mantenimiento
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Otro
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Motivo *</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder="Ej: Año Nuevo, Mantenimiento de sistema..."
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Bloqueando...'
                                        : 'Bloquear Fecha'}
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
            </div>
        </AppLayout>
    );
}
