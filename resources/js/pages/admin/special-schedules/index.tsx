import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPlus, Pencil, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface AuthorizedUser {
    id: number;
    name: string;
    email: string;
}

interface SpecialSchedule {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    interval_minutes: number;
    slots_per_interval: number;
    is_active: boolean;
    restricted_access: boolean;
    description: string | null;
    authorized_users: AuthorizedUser[];
    authorized_users_count: number;
}

interface Props {
    schedules: SpecialSchedule[];
}

export default function Index({ schedules }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        schedule: SpecialSchedule | null;
    }>({ open: false, schedule: null });
    const [deleting, setDeleting] = useState(false);

    const handleDelete = (schedule: SpecialSchedule) => {
        setDeleteDialog({ open: true, schedule });
    };

    const confirmDelete = () => {
        if (!deleteDialog.schedule) return;

        setDeleting(true);
        router.delete(`/admin/special-schedules/${deleteDialog.schedule.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteDialog({ open: false, schedule: null });
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Horarios Especiales" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#003153]">
                            Horarios Especiales
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Gestiona horarios personalizados para fechas
                            específicas
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-[#003153] hover:bg-[#003153]/90"
                    >
                        <Link href="/admin/special-schedules/create">
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Crear Horario Especial
                        </Link>
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Intervalo</TableHead>
                                <TableHead>Capacidad</TableHead>
                                <TableHead>Acceso</TableHead>
                                <TableHead>Usuarios</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No hay horarios especiales configurados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules.map((schedule) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-medium">
                                            {format(
                                                parseISO(
                                                    typeof schedule.date ===
                                                        'string'
                                                        ? schedule.date
                                                        : schedule.date,
                                                ),
                                                "EEEE d 'de' MMMM, yyyy",
                                                { locale: es },
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.start_time.slice(0, 5)} -{' '}
                                            {schedule.end_time.slice(0, 5)}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.interval_minutes} min
                                        </TableCell>
                                        <TableCell>
                                            {schedule.slots_per_interval}{' '}
                                            {schedule.slots_per_interval === 1
                                                ? 'slot'
                                                : 'slots'}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.restricted_access ? (
                                                <Badge variant="destructive">
                                                    Restringido
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Público
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.restricted_access ? (
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {
                                                            schedule.authorized_users_count
                                                        }{' '}
                                                        {schedule.authorized_users_count ===
                                                        1
                                                            ? 'usuario'
                                                            : 'usuarios'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.is_active ? (
                                                <Badge className="bg-green-600">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Inactivo
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/special-schedules/${schedule.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(schedule)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !deleting && setDeleteDialog({ open, schedule: null })
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar horario especial?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el
                            horario especial para{' '}
                            {deleteDialog.schedule &&
                                format(
                                    parseISO(
                                        typeof deleteDialog.schedule.date ===
                                            'string'
                                            ? deleteDialog.schedule.date
                                            : deleteDialog.schedule.date,
                                    ),
                                    "EEEE d 'de' MMMM, yyyy",
                                    { locale: es },
                                )}
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteDialog({ open: false, schedule: null })
                            }
                            disabled={deleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
