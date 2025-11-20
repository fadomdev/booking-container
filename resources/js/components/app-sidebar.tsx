import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CalendarDays,
    CalendarOff,
    CalendarPlus,
    ClipboardList,
    LayoutGrid,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const auth = page.props.auth as { user: { role: string } };
    const isAdmin = auth?.user?.role === 'admin';

    const navGroups: NavGroup[] = [
        {
            title: 'General',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
    ];

    if (isAdmin) {
        navGroups.push({
            title: 'Administración',
            items: [
                {
                    title: 'Usuarios',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Empresas',
                    href: '/admin/companies',
                    icon: Building2,
                },
                {
                    title: 'Configuración de Horarios',
                    href: '/admin/schedule-config',
                    icon: CalendarDays,
                },
                {
                    title: 'Horarios Especiales',
                    href: '/admin/special-schedules',
                    icon: CalendarPlus,
                },
                {
                    title: 'Fechas Bloqueadas',
                    href: '/admin/blocked-dates',
                    icon: CalendarOff,
                },
                {
                    title: 'Reservas',
                    href: '/admin/reservations',
                    icon: ClipboardList,
                },
            ],
        });
    }

    navGroups.push({
        title: 'Mis Reservas',
        items: [
            {
                title: 'Nueva Reserva',
                href: '/reservations',
                icon: Calendar,
            },
            {
                title: 'Mis Reservas',
                href: '/reservations/my-reservations',
                icon: ClipboardList,
            },
        ],
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
