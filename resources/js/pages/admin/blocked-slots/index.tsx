import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { BlockedSlot, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, Edit, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    blockedSlots: PaginatedData<BlockedSlot>;
}

export default function BlockedSlotsIndex({ blockedSlots }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<BlockedSlot | null>(null);

    const openDeleteDialog = (slot: BlockedSlot) => {
        setSelectedSlot(slot);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!selectedSlot) return;

        router.delete(`/admin/blocked-slots/${selectedSlot.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedSlot(null);
            },
        });
    };

    const handleToggleActive = (slot: BlockedSlot) => {
        router.post(`/admin/blocked-slots/${slot.id}/toggle-active`);
    };

    return (
        <AppLayout>
            <Head title="Horarios Bloqueados" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Horarios Bloqueados
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona los horarios no disponibles para reservas
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/admin/blocked-slots/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Bloqueo
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Bloqueos Registrados</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Horario</TableHead>
                                        <TableHead>Motivo</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">
                                            Acciones
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blockedSlots.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                No hay horarios bloqueados
                                                registrados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        blockedSlots.data.map((slot) => (
                                            <TableRow key={slot.id}>
                                                {/* Fecha */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {slot.date
                                                                ? new Date(
                                                                      slot.date,
                                                                  ).toLocaleDateString(
                                                                      'es-CL',
                                                                  )
                                                                : 'Todos los días'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Horario */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-mono">
                                                            {slot.start_time} -{' '}
                                                            {slot.end_time}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Motivo */}
                                                <TableCell>
                                                    {slot.reason}
                                                </TableCell>

                                                {/* Tipo */}
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            slot.is_recurring
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {slot.is_recurring
                                                            ? 'Recurrente'
                                                            : 'Puntual'}
                                                    </Badge>
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            slot.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className={
                                                            slot.is_active
                                                                ? 'bg-green-600 hover:bg-green-700'
                                                                : ''
                                                        }
                                                    >
                                                        {slot.is_active
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleToggleActive(
                                                                    slot,
                                                                )
                                                            }
                                                            title={
                                                                slot.is_active
                                                                    ? 'Desactivar'
                                                                    : 'Activar'
                                                            }
                                                        >
                                                            <Power
                                                                className={`h-4 w-4 ${
                                                                    slot.is_active
                                                                        ? 'text-green-600'
                                                                        : 'text-gray-400'
                                                                }`}
                                                            />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            title="Editar"
                                                        >
                                                            <Link
                                                                href={`/admin/blocked-slots/${slot.id}/edit`}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    slot,
                                                                )
                                                            }
                                                            title="Eliminar"
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
                    </CardContent>
                </Card>

                {/* Pagination */}
                {blockedSlots.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {blockedSlots.prev_page_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(blockedSlots.prev_page_url!)
                                }
                            >
                                ← Anterior
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Página {blockedSlots.current_page} de{' '}
                            {blockedSlots.last_page}
                        </span>
                        {blockedSlots.next_page_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(blockedSlots.next_page_url!)
                                }
                            >
                                Siguiente →
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Horario Bloqueado</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este bloqueo?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSlot && (
                        <div className="rounded-lg border p-4 text-sm">
                            <p>
                                <strong>Fecha:</strong>{' '}
                                {selectedSlot.date
                                    ? new Date(
                                          selectedSlot.date,
                                      ).toLocaleDateString('es-CL')
                                    : 'Todos los días'}
                            </p>
                            <p>
                                <strong>Horario:</strong>{' '}
                                {selectedSlot.start_time} -{' '}
                                {selectedSlot.end_time}
                            </p>
                            <p>
                                <strong>Motivo:</strong> {selectedSlot.reason}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
