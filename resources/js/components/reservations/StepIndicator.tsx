import { RESERVATION_STEPS } from '@/lib/reservations/constants';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {RESERVATION_STEPS.map((stepConfig) => (
                    <div
                        key={stepConfig.id}
                        className="flex flex-1 items-center"
                    >
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                                    stepConfig.id < currentStep
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : stepConfig.id === currentStep
                                          ? 'border-primary bg-primary text-white'
                                          : 'border-gray-300 bg-background text-muted-foreground dark:border-gray-600'
                                }`}
                            >
                                {stepConfig.id < currentStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {stepConfig.id}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium ${
                                    stepConfig.id <= currentStep
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {stepConfig.label}
                            </span>
                        </div>
                        {stepConfig.id < RESERVATION_STEPS.length && (
                            <div
                                className={`mx-2 h-0.5 flex-1 transition-colors ${
                                    stepConfig.id < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
