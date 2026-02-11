import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Reservation } from '@/types';
import { useForm } from '@inertiajs/react';

interface CompleteReservationDialogProps {
    reservation: Reservation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompleteReservationDialog({
    reservation,
    open,
    onOpenChange,
}: CompleteReservationDialogProps) {
    const { post, processing } = useForm();

    const handleMarkAsCompleted = () => {
        if (!reservation) return;

        post(`/admin/reservations/${reservation.id}/complete`, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar Completado</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas marcar esta reserva como
                        completada?
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                        <p className="font-medium">Detalles de la reserva:</p>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>
                                <strong>Booking:</strong>{' '}
                                {reservation.booking_number}
                            </li>
                            <li>
                                <strong>Fecha:</strong>{' '}
                                {reservation.reservation_date &&
                                    new Date(
                                        reservation.reservation_date,
                                    ).toLocaleDateString('es-CL')}
                            </li>
                            <li>
                                <strong>Hora:</strong>{' '}
                                {reservation.reservation_time}
                            </li>
                            <li>
                                <strong>Cliente:</strong>{' '}
                                {reservation.user?.name}
                            </li>
                            <li>
                                <strong>Transportista:</strong>{' '}
                                {reservation.transportista_name}
                            </li>
                            <li>
                                <strong>Placa:</strong>{' '}
                                {reservation.truck_plate}
                            </li>
                        </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Esta acción se registrará con tu usuario y la fecha/hora
                        actual.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleMarkAsCompleted}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {processing ? 'Procesando...' : 'Confirmar Completado'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
