import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, ClipboardList } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    activeReservationsCount: number;
}

export default function Dashboard({ activeReservationsCount }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6">
                {/* Hero Section with DHL Colors */}
                <div className="rounded-xl bg-[#003153] p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold tracking-tight">
                        ¡Hola, {auth.user.name}! 👋
                    </h1>
                    <p className="mt-3 text-lg opacity-90">
                        Gestiona tus reservas de horarios de manera fácil y
                        rápida.{' '}
                        {activeReservationsCount > 0 ? (
                            <>
                                Tienes{' '}
                                <span className="font-bold text-[#ffcc00]">
                                    {activeReservationsCount}{' '}
                                    {activeReservationsCount === 1
                                        ? 'reserva activa'
                                        : 'reservas activas'}
                                </span>
                                .
                            </>
                        ) : (
                            'No tienes reservas activas en este momento.'
                        )}
                    </p>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-[#003153]">
                        Acciones Rápidas
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Nueva Reserva Card */}
                        <Card className="border-l-4 border-l-[#ffcc00] shadow-md transition-all hover:shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-[#ffcc00] p-3">
                                        <Calendar className="h-6 w-6 text-black" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            Nueva Reserva
                                        </CardTitle>
                                        <CardDescription>
                                            Agenda un nuevo horario disponible
                                            para carga o descarga.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    className="h-12 w-full bg-[#ffcc00] text-base font-semibold text-black hover:bg-[#ffcc00]/90"
                                >
                                    <Link href="/reservations">
                                        Crear Reserva
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Mis Reservas Card */}
                        <Card className="shadow-md transition-all hover:shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-[#003153]/10 p-3">
                                        <ClipboardList className="h-6 w-6 text-[#003153]" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            Mis Reservas
                                        </CardTitle>
                                        <CardDescription>
                                            Consulta el estado y gestiona tus
                                            reservas confirmadas.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-12 w-full border-2 border-[#003153] text-base font-semibold text-[#003153] hover:bg-[#003153]/5"
                                >
                                    <Link href="/reservations/my-reservations">
                                        Ver Mis Reservas
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* How it Works Section */}
                <Card className="border-t-4 border-t-[#ffcc00] shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl text-[#003153]">
                            ¿Cómo funciona?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ffcc00] text-lg font-bold text-black">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#003153]">
                                    Crea una reserva
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona la fecha y el horario disponible
                                    que mejor se adapte a tu logística.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ffcc00] text-lg font-bold text-black">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#003153]">
                                    Completa los datos
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Ingresa el número de booking, datos del
                                    transportista y patente del camión.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ffcc00] text-lg font-bold text-black">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#003153]">
                                    Gestiona
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Consulta, modifica o cancela tus reservas
                                    desde tu panel de control.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
