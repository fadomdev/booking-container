import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { TimeSlot } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
    const selectedDate = data.reservation_date
        ? new Date(data.reservation_date + 'T00:00:00')
        : undefined;

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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`h-14 w-full justify-start border-2 px-4 text-left text-base font-normal transition-colors hover:border-[#ffcc00] hover:bg-[#ffcc00]/10 ${
                                    data.reservation_date
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                } focus:border-[#ffcc00] focus:ring-[#ffcc00]`}
                            >
                                <Calendar className="mr-3 h-5 w-5" />
                                {data.reservation_date ? (
                                    format(selectedDate!, 'PPP', { locale: es })
                                ) : (
                                    <span>SELECCIONE UNA FECHA</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        const year = date.getFullYear();
                                        const month = String(
                                            date.getMonth() + 1,
                                        ).padStart(2, '0');
                                        const day = String(
                                            date.getDate(),
                                        ).padStart(2, '0');
                                        onDateChange(`${year}-${month}-${day}`);
                                    }
                                }}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                }}
                                initialFocus
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
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
                                                ? 'border-[#ffcc00] bg-[#ffcc00]/20 shadow-lg ring-2 ring-[#ffcc00]/50'
                                                : hasCapacity
                                                  ? 'border-border bg-card hover:border-[#ffcc00] hover:bg-[#ffcc00]/10 hover:shadow-md'
                                                  : 'cursor-not-allowed border-border bg-muted opacity-50'
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
                                                        ? 'border-[#ffcc00] bg-[#ffcc00] font-semibold text-black'
                                                        : hasCapacity
                                                          ? 'border-green-500 bg-green-500/20 text-green-700 dark:text-green-400'
                                                          : 'border-[#d40511] bg-[#d40511]/10 text-[#d40511]'
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
