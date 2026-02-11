import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

interface TimeSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    /** Intervalo de minutos (default: 5) */
    minuteInterval?: number;
    /** Hora mínima permitida (0-23, default: 0) */
    minHour?: number;
    /** Hora máxima permitida (0-23, default: 23) */
    maxHour?: number;
    /** Mostrar icono de reloj */
    showIcon?: boolean;
    className?: string;
}

// Pre-generar opciones de horas comunes (cache estático)
const HOURS_CACHE: Record<string, string[]> = {};
const MINUTES_CACHE: Record<number, string[]> = {};

function getHours(minHour: number, maxHour: number): string[] {
    const key = `${minHour}-${maxHour}`;
    if (!HOURS_CACHE[key]) {
        const hours: string[] = [];
        for (let h = minHour; h <= maxHour; h++) {
            hours.push(h.toString().padStart(2, '0'));
        }
        HOURS_CACHE[key] = hours;
    }
    return HOURS_CACHE[key];
}

function getMinutes(interval: number): string[] {
    if (!MINUTES_CACHE[interval]) {
        const minutes: string[] = [];
        for (let m = 0; m < 60; m += interval) {
            minutes.push(m.toString().padStart(2, '0'));
        }
        MINUTES_CACHE[interval] = minutes;
    }
    return MINUTES_CACHE[interval];
}

export const TimeSelect = memo(function TimeSelect({
    value,
    onChange,
    disabled = false,
    minuteInterval = 5,
    minHour = 0,
    maxHour = 23,
    showIcon = true,
    className,
}: TimeSelectProps) {
    // Parse current value
    const [currentHour, currentMinute] = useMemo(() => {
        return value ? value.split(':') : ['', ''];
    }, [value]);

    // Usar cache estático para las opciones
    const hours = getHours(minHour, maxHour);
    const minutes = getMinutes(minuteInterval);

    const handleHourChange = useCallback((newHour: string) => {
        const minute = currentMinute || '00';
        onChange(`${newHour}:${minute}`);
    }, [currentMinute, onChange]);

    const handleMinuteChange = useCallback((newMinute: string) => {
        const hour = currentHour || '00';
        onChange(`${hour}:${newMinute}`);
    }, [currentHour, onChange]);

    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            {showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
            
            {/* Selector de Hora */}
            <Select 
                value={currentHour} 
                onValueChange={handleHourChange} 
                disabled={disabled}
            >
                <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                    {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                            {hour}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="text-lg font-medium">:</span>

            {/* Selector de Minutos */}
            <Select 
                value={currentMinute} 
                onValueChange={handleMinuteChange} 
                disabled={disabled}
            >
                <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                    {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                            {minute}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
});
