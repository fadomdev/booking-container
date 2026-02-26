import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Hook to check if the current user can perform modifications.
 * Returns false for 'consulta' users (read-only admin access).
 */
export function useCanModify(): boolean {
    const { auth } = usePage<SharedData>().props;
    return auth.user.role !== 'consulta';
}
