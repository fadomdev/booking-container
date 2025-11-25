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
                <div className="space-y-3">
                    <Label
                        htmlFor="booking_number"
                        className="text-base font-semibold"
                    >
                        Número de Booking *
                    </Label>
                    <div className="flex gap-3">
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
                            placeholder="Ingrese número de booking"
                            className="h-14 flex-1 border-2 px-4 text-base focus:border-[#ffcc00] focus:ring-[#ffcc00]"
                        />
                        <Button
                            type="button"
                            onClick={onValidateBooking}
                            disabled={bookingValidation.validating}
                            className="h-14 bg-[#ffcc00] px-6 font-semibold text-black hover:bg-[#ffcc00]/90"
                        >
                            {bookingValidation.validating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
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
                <div className="space-y-3">
                    <Label
                        htmlFor="transporter_name"
                        className="text-base font-semibold"
                    >
                        Nombre del Transportista *
                    </Label>
                    <Input
                        id="transporter_name"
                        value={data.transporter_name}
                        onChange={(e) => {
                            const normalized = e.target.value
                                .toUpperCase()
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/Ñ/g, 'N')
                                .replace(/[^A-Z0-9 ]/g, '');
                            onDataChange('transporter_name', normalized);
                        }}
                        placeholder="NOMBRE COMPLETO"
                        readOnly
                        className="h-14 cursor-not-allowed border-2 bg-muted px-4 text-base text-foreground focus:border-[#ffcc00] focus:ring-[#ffcc00]"
                    />
                    {errors.transporter_name && (
                        <p className="text-sm text-destructive">
                            {errors.transporter_name}
                        </p>
                    )}
                </div>

                {/* Truck Plate */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="truck_plate"
                            className="text-base font-semibold"
                        >
                            Patente del Camión *
                        </Label>
                        {plateHistory.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onShowPlateHistory}
                                className="border-[#ffcc00] text-black hover:bg-[#ffcc00]/10"
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
                        placeholder="AA1234"
                        maxLength={PLATE_INPUT_MAX_LENGTH}
                        className="h-14 border-2 px-4 text-base focus:border-[#ffcc00] focus:ring-[#ffcc00]"
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
