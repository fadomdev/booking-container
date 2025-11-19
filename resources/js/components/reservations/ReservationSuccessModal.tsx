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
import { router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    User,
} from 'lucide-react';

interface ReservationData {
    reservation_date: string;
    reservation_time: string;
    booking_number: string;
    transporter_name: string;
    truck_plate: string;
    slots_reserved: number;
    container_numbers: string[];
}

interface ReservationSuccessModalProps {
    isOpen: boolean;
    reservation: ReservationData | null;
    onClose: () => void;
}

export const ReservationSuccessModal = ({
    isOpen,
    reservation,
    onClose,
}: ReservationSuccessModalProps) => {
    if (!reservation) return null;

    const handleViewReservations = () => {
        onClose();
        router.visit('/reservations/my-reservations');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        ¡Reserva Creada Exitosamente!
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Tu reserva ha sido registrada correctamente
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Date and Time Highlight */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-900">
                            <Calendar className="h-6 w-6" />
                            {new Date(
                                reservation.reservation_date + 'T00:00:00',
                            ).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                timeZone: 'America/Santiago',
                            })}
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-2 text-xl font-semibold text-blue-700">
                            <Clock className="h-5 w-5" />
                            {reservation.reservation_time}
                        </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <h4 className="text-sm font-semibold">
                            Detalles de la Reserva
                        </h4>
                        <dl className="space-y-2">
                            <div className="flex items-center justify-between border-b py-2">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    Booking:
                                </dt>
                                <dd className="font-mono font-semibold">
                                    {reservation.booking_number}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between border-b py-2">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    Transportista:
                                </dt>
                                <dd className="font-medium">
                                    {reservation.transporter_name}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between border-b py-2">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Truck className="h-4 w-4" />
                                    Patente:
                                </dt>
                                <dd className="font-mono font-semibold">
                                    {reservation.truck_plate}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    Cupos:
                                </dt>
                                <dd>
                                    <Badge variant="secondary">
                                        {reservation.slots_reserved}{' '}
                                        {reservation.slots_reserved === 1
                                            ? 'cupo'
                                            : 'cupos'}
                                    </Badge>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Containers */}
                    <div className="rounded-lg border bg-green-50 p-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-900">
                            <CheckCircle2 className="h-4 w-4" />
                            Contenedores Registrados
                        </h4>
                        <div className="space-y-2">
                            {reservation.container_numbers.map(
                                (container, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 rounded border border-green-200 bg-white px-3 py-2"
                                    >
                                        <Badge
                                            className="bg-green-600 text-white"
                                            variant="default"
                                        >
                                            {idx + 1}
                                        </Badge>
                                        <span className="font-mono text-sm font-semibold">
                                            {container}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={handleViewReservations}>
                        Ver Mis Reservas
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
