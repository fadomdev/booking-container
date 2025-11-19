import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeSlot } from '@/types';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

interface DateTimeStepProps {
    data: {
        reservation_date: string;
        reservation_time: string;
    };
    timeSlots: TimeSlot[];
    onDateChange: (date: string) => void;
    onTimeSelect: (time: string) => void;
    errors: {
        reservation_date?: string;
        reservation_time?: string;
    };
}

export const DateTimeStep = ({
    data,
    timeSlots,
    onDateChange,
    onTimeSelect,
    errors,
}: DateTimeStepProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Paso 1: Fecha y Hora
                </CardTitle>
                <CardDescription>
                    Selecciona la fecha y el horario de tu reserva
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-3">
                    <Label
                        htmlFor="reservation_date"
                        className="text-base font-semibold"
                    >
                        Fecha de Reserva *
                    </Label>
                    <Input
                        id="reservation_date"
                        type="date"
                        value={data.reservation_date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="h-14 border-2 px-4 text-base focus:border-[#FFCC00] focus:ring-[#FFCC00]"
                    />
                    {errors.reservation_date && (
                        <p className="text-sm text-destructive">
                            {errors.reservation_date}
                        </p>
                    )}
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label>Horario Disponible *</Label>
                    </div>
                    {timeSlots.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No hay horarios disponibles para esta fecha
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {timeSlots.map((slot) => {
                                const hasCapacity = slot.available_capacity > 0;
                                const isSelected =
                                    data.reservation_time === slot.time;

                                return (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() =>
                                            hasCapacity &&
                                            onTimeSelect(slot.time)
                                        }
                                        disabled={!hasCapacity}
                                        className={`relative rounded-lg border-2 p-5 text-left transition-all ${
                                            isSelected
                                                ? 'border-[#FFCC00] bg-[#FFCC00]/20 shadow-lg ring-2 ring-[#FFCC00]/50'
                                                : hasCapacity
                                                  ? 'border-gray-300 bg-white hover:border-[#FFCC00] hover:bg-[#FFCC00]/10 hover:shadow-md'
                                                  : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold">
                                                {slot.time}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                            <Badge
                                                className={
                                                    isSelected
                                                        ? 'border-[#FFCC00] bg-[#FFCC00] font-semibold text-black'
                                                        : hasCapacity
                                                          ? 'border-green-300 bg-green-100 text-green-800'
                                                          : 'border-[#D40511] bg-[#D40511]/10 text-[#D40511]'
                                                }
                                                variant="outline"
                                            >
                                                {slot.available_capacity} /{' '}
                                                {slot.total_capacity} cupos
                                            </Badge>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {errors.reservation_time && (
                        <p className="text-sm text-destructive">
                            {errors.reservation_time}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
