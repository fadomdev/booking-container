import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    rut?: string;
    email: string;
    role: 'admin' | 'transportista';
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    company_id?: number;
    company?: Company;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Company {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
    users_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: number;
    booking_number: string;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ScheduleConfig {
    id: number;
    day_of_week: number; // 0=Domingo, 1=Lunes, 2=Martes, etc.
    start_time: string;
    end_time: string;
    interval_minutes: number;
    slots_per_interval: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BlockedDate {
    id: number;
    date: string;
    reason: string;
    type: 'holiday' | 'maintenance' | 'other';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TimeSlot {
    time: string;
    total_capacity: number;
    available_capacity: number;
    config_id?: number;
    is_past?: boolean;
}

export interface Reservation {
    id: number;
    user_id: number;
    reservation_date: string;
    reservation_time: string;
    booking_id?: number;
    transportista_name: string;
    truck_plate: string;
    slots_reserved: number;
    container_numbers?: string[];
    api_notes?: string;
    status: 'active' | 'cancelled' | 'completed';
    cancelled_at?: string;
    cancellation_comment?: string;
    cancelled_by?: number;
    created_at: string;
    updated_at: string;
    user?: User;
    booking?: Booking;
    cancelledBy?: User;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
