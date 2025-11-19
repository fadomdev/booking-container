import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    getValidationErrorMessage,
    validateContainerNumber,
} from '@/lib/container-validator';
import {
    CONTAINER_INPUT_MAX_LENGTH,
    MAX_SLOTS_PER_RESERVATION,
} from '@/lib/reservations/constants';
import { CheckCircle2, Package } from 'lucide-react';

interface ContainersStepProps {
    data: {
        slots_requested: number;
        container_numbers: string[];
    };
    selectedSlot: {
        available_capacity: number;
        total_capacity: number;
    } | null;
    onSlotsChange: (slots: number) => void;
    onContainerChange: (index: number, value: string) => void;
}

export const ContainersStep = ({
    data,
    selectedSlot,
    onSlotsChange,
    onContainerChange,
}: ContainersStepProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Paso 3: Cupos y Contenedores
                </CardTitle>
                <CardDescription>
                    Selecciona la cantidad de cupos e ingresa los números de
                    contenedor
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Slots Selection */}
                <div className="space-y-3">
                    <Label htmlFor="slots_requested" className="text-base font-semibold">Cantidad de Cupos *</Label>
                    <Select
                        value={data.slots_requested.toString()}
                        onValueChange={(value) =>
                            onSlotsChange(parseInt(value))
                        }
                    >
                        <SelectTrigger className="h-14 text-base border-2 focus:border-[#FFCC00] focus:ring-[#FFCC00]">
                            <SelectValue placeholder="Selecciona cantidad de cupos" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedSlot &&
                                Array.from(
                                    {
                                        length: Math.min(
                                            selectedSlot.available_capacity,
                                            MAX_SLOTS_PER_RESERVATION,
                                        ),
                                    },
                                    (_, i) => i + 1,
                                ).map((num) => (
                                    <SelectItem
                                        key={num}
                                        value={num.toString()}
                                    >
                                        {num} {num === 1 ? 'cupo' : 'cupos'}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {selectedSlot && (
                        <p className="text-sm text-muted-foreground">
                            Cupos disponibles: {selectedSlot.available_capacity}{' '}
                            / {selectedSlot.total_capacity}
                        </p>
                    )}
                </div>

                {/* Container Numbers */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">
                        Números de Contenedor * ({data.slots_requested}{' '}
                        {data.slots_requested === 1
                            ? 'contenedor'
                            : 'contenedores'}
                        )
                    </Label>
                    {data.container_numbers.map((container, index) => (
                        <div key={index} className="space-y-2">
                            <Label htmlFor={`container_${index}`} className="text-sm font-medium">
                                Contenedor {index + 1}
                            </Label>
                            <Input
                                id={`container_${index}`}
                                value={container}
                                onChange={(e) =>
                                    onContainerChange(
                                        index,
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="Ej: EMCU8854404"
                                maxLength={CONTAINER_INPUT_MAX_LENGTH}
                                className="h-14 text-base px-4 border-2 focus:border-[#FFCC00] focus:ring-[#FFCC00] font-mono"
                            />
                            {(() => {
                                const validation =
                                    validateContainerNumber(container);
                                if (container && !validation.valid) {
                                    return (
                                        <p className="text-sm text-destructive">
                                            {getValidationErrorMessage(
                                                validation,
                                            )}
                                        </p>
                                    );
                                }
                                if (container && validation.valid) {
                                    return (
                                        <p className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Formato válido
                                        </p>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
