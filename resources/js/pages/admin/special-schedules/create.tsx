import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    users: User[];
}

export default function Create({ users }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        date: '',
        start_time: '08:00',
        end_time: '18:00',
        interval_minutes: '60',
        slots_per_interval: '2',
        is_active: true,
        restricted_access: false,
        description: '',
        authorized_user_ids: [] as number[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/special-schedules');
    };

    const toggleUser = (userId: number) => {
        const newSelected = selectedUsers.includes(userId)
            ? selectedUsers.filter((id) => id !== userId)
            : [...selectedUsers, userId];

        setSelectedUsers(newSelected);
        setData('authorized_user_ids', newSelected);
    };

    return (
        <AppLayout>
            <Head title="Crear Horario Especial" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/special-schedules">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#003153]">
                            Crear Horario Especial
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Define horarios personalizados para una fecha
                            específica
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="space-y-6">
                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date">
                                    Fecha{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'h-14 w-full justify-start text-left font-normal',
                                                !data.date &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date ? (
                                                format(
                                                    parseISO(data.date),
                                                    'PPPP',
                                                    { locale: es },
                                                )
                                            ) : (
                                                <span>
                                                    Selecciona una fecha
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={
                                                data.date
                                                    ? parseISO(data.date)
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setData(
                                                    'date',
                                                    date
                                                        ? format(
                                                              date,
                                                              'yyyy-MM-dd',
                                                          )
                                                        : '',
                                                )
                                            }
                                            disabled={(date) =>
                                                date <
                                                new Date(
                                                    new Date().setHours(
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                    ),
                                                )
                                            }
                                            locale={es}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.date} />
                            </div>

                            {/* Time Range */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">
                                        Hora Inicio{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
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
                                        className="h-14"
                                    />
                                    <InputError message={errors.start_time} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">
                                        Hora Fin{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData('end_time', e.target.value)
                                        }
                                        className="h-14"
                                    />
                                    <InputError message={errors.end_time} />
                                </div>
                            </div>

                            {/* Interval & Capacity */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="interval_minutes">
                                        Intervalo (minutos){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.interval_minutes}
                                        onValueChange={(value) =>
                                            setData('interval_minutes', value)
                                        }
                                    >
                                        <SelectTrigger className="h-14">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">
                                                30 minutos
                                            </SelectItem>
                                            <SelectItem value="60">
                                                60 minutos
                                            </SelectItem>
                                            <SelectItem value="90">
                                                90 minutos
                                            </SelectItem>
                                            <SelectItem value="120">
                                                120 minutos
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.interval_minutes}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slots_per_interval">
                                        Slots por Intervalo{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="slots_per_interval"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.slots_per_interval}
                                        onChange={(e) =>
                                            setData(
                                                'slots_per_interval',
                                                e.target.value,
                                            )
                                        }
                                        className="h-14"
                                    />
                                    <InputError
                                        message={errors.slots_per_interval}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Descripción (opcional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Ej: Horario extendido por alta demanda"
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-4">
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
                                        className="cursor-pointer font-normal"
                                    >
                                        Horario activo
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="restricted_access"
                                        checked={data.restricted_access}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'restricted_access',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="restricted_access"
                                        className="cursor-pointer font-normal"
                                    >
                                        Acceso restringido (solo usuarios
                                        autorizados)
                                    </Label>
                                </div>
                            </div>

                            {/* Authorized Users */}
                            {data.restricted_access && (
                                <div className="space-y-2">
                                    <Label>Usuarios Autorizados</Label>
                                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-4">
                                        {users.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No hay usuarios disponibles
                                            </p>
                                        ) : (
                                            users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`user-${user.id}`}
                                                        checked={selectedUsers.includes(
                                                            user.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleUser(user.id)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`user-${user.id}`}
                                                        className="flex-1 cursor-pointer font-normal"
                                                    >
                                                        {user.name} (
                                                        {user.email})
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <InputError
                                        message={errors.authorized_user_ids}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/special-schedules">
                                Cancelar
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#003153] hover:bg-[#003153]/90"
                            disabled={processing}
                        >
                            {processing
                                ? 'Creando...'
                                : 'Crear Horario Especial'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
