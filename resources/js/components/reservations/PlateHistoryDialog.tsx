import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { History } from 'lucide-react';

interface PlateHistoryDialogProps {
    isOpen: boolean;
    history: string[];
    onClose: () => void;
    onSelectPlate: (plate: string) => void;
}

export const PlateHistoryDialog = ({
    isOpen,
    history,
    onClose,
    onSelectPlate,
}: PlateHistoryDialogProps) => {
    const handleSelectPlate = (plate: string) => {
        onSelectPlate(plate);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial de Patentes
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona una patente del historial
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    {history.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No hay patentes en el historial
                        </p>
                    ) : (
                        history.map((plate, index) => (
                            <Button
                                key={index}
                                type="button"
                                variant="outline"
                                className="w-full justify-start font-mono"
                                onClick={() => handleSelectPlate(plate)}
                            >
                                {plate}
                            </Button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
