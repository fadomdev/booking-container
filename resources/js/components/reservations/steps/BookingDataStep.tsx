import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PLATE_INPUT_MAX_LENGTH } from '@/lib/reservations/constants';
import {
    AlertCircle,
    CheckCircle2,
    History,
    Loader2,
    Package,
} from 'lucide-react';

interface BookingDataStepProps {
    data: {
        booking_number: string;
        transporter_name: string;
        truck_plate: string;
    };
    bookingValidation: {
        valid: boolean | null;
        message: string;
        validating: boolean;
    };
    plateHistory: string[];
    onDataChange: (field: string, value: string) => void;
    onValidateBooking: () => void;
    onShowPlateHistory: () => void;
    errors: {
        booking_number?: string;
        transporter_name?: string;
        truck_plate?: string;
    };
}

export const BookingDataStep = ({
    data,
    bookingValidation,
    plateHistory,
    onDataChange,
    onValidateBooking,
    onShowPlateHistory,
    errors,
}: BookingDataStepProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Paso 2: Datos de la Reserva
                </CardTitle>
                <CardDescription>
                    Ingresa el número de booking, transportista y patente
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Booking Number */}
                <div className="space-y-2">
                    <Label htmlFor="booking_number">Número de Booking *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="booking_number"
                            value={data.booking_number}
                            onChange={(e) =>
                                onDataChange(
                                    'booking_number',
                                    e.target.value.toUpperCase(),
                                )
                            }
                            onBlur={onValidateBooking}
                            placeholder="Ej: 070ISA1201298"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            onClick={onValidateBooking}
                            disabled={bookingValidation.validating}
                        >
                            {bookingValidation.validating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Validar'
                            )}
                        </Button>
                    </div>
                    {bookingValidation.message && (
                        <div
                            className={`flex items-center gap-2 text-sm ${
                                bookingValidation.valid
                                    ? 'text-green-600'
                                    : 'text-destructive'
                            }`}
                        >
                            {bookingValidation.valid ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            {bookingValidation.message}
                        </div>
                    )}
                    {errors.booking_number && (
                        <p className="text-sm text-destructive">
                            {errors.booking_number}
                        </p>
                    )}
                </div>

                {/* Transporter Name */}
                <div className="space-y-2">
                    <Label htmlFor="transporter_name">
                        Nombre del Transportista *
                    </Label>
                    <Input
                        id="transporter_name"
                        value={data.transporter_name}
                        onChange={(e) =>
                            onDataChange('transporter_name', e.target.value)
                        }
                        placeholder="Ej: Juan Pérez"
                    />
                    {errors.transporter_name && (
                        <p className="text-sm text-destructive">
                            {errors.transporter_name}
                        </p>
                    )}
                </div>

                {/* Truck Plate */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="truck_plate">
                            Patente del Camión *
                        </Label>
                        {plateHistory.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onShowPlateHistory}
                            >
                                <History className="mr-2 h-4 w-4" />
                                Historial
                            </Button>
                        )}
                    </div>
                    <Input
                        id="truck_plate"
                        value={data.truck_plate}
                        onChange={(e) =>
                            onDataChange(
                                'truck_plate',
                                e.target.value.toUpperCase(),
                            )
                        }
                        placeholder="Ej: ABCD12"
                        maxLength={PLATE_INPUT_MAX_LENGTH}
                    />
                    {errors.truck_plate && (
                        <p className="text-sm text-destructive">
                            {errors.truck_plate}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
