import { MAX_PLATE_HISTORY } from '@/lib/reservations/constants';
import { useCallback, useState } from 'react';

const STORAGE_KEY = 'truck_plate_history';

const getInitialHistory = (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error loading plate history:', error);
            return [];
        }
    }
    return [];
};

export const usePlateHistory = () => {
    const [history, setHistory] = useState<string[]>(getInitialHistory);

    // Save plate to history
    const saveToHistory = useCallback((plate: string) => {
        const cleanPlate = plate.toUpperCase().trim();

        if (!cleanPlate) return;

        setHistory((prevHistory) => {
            const newHistory = [...prevHistory];

            // Remove if already exists
            const index = newHistory.indexOf(cleanPlate);
            if (index > -1) {
                newHistory.splice(index, 1);
            }

            // Add to beginning
            newHistory.unshift(cleanPlate);

            // Limit size
            if (newHistory.length > MAX_PLATE_HISTORY) {
                newHistory.pop();
            }

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

            return newHistory;
        });
    }, []);

    // Clear history
    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        history,
        saveToHistory,
        clearHistory,
    };
};
