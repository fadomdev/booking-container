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
import { Calendar, ClipboardList, Settings } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
                    <h1 className="text-4xl font-bold tracking-tight">
                        ¡Hola, {auth.user.name}! 👋
                    </h1>
                    <p className="mt-2 text-lg opacity-90">
                        {isAdmin
                            ? 'Bienvenido al panel de administración del sistema de reservas'
                            : 'Gestiona tus reservas de horarios de manera fácil y rápida'}
                    </p>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">
                        Acciones Rápidas
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>Nueva Reserva</CardTitle>
                                        <CardDescription>
                                            Agenda un nuevo horario disponible
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="default"
                                    className="w-full"
                                >
                                    <Link href="/reservations">
                                        Crear Reserva
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-blue-500/10 p-3">
                                        <ClipboardList className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Mis Reservas</CardTitle>
                                        <CardDescription>
                                            Consulta y gestiona tus reservas
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/reservations/my-reservations">
                                        Ver Mis Reservas
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Admin Quick Access */}
                {isAdmin && (
                    <div>
                        <h2 className="mb-4 text-xl font-semibold">
                            Administración
                        </h2>
                        <Card className="border-amber-200 bg-amber-50/50">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-amber-500/10 p-3">
                                        <Settings className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle>
                                            Panel de Administración
                                        </CardTitle>
                                        <CardDescription>
                                            Accede a las herramientas de gestión
                                            del sistema
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="default">
                                    <Link href="/admin">
                                        Ir al Panel de Administración
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Info Section */}
                <Card className="border-muted">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            ¿Cómo funciona?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/10 p-1.5">
                                <span className="text-xs font-bold text-primary">
                                    1
                                </span>
                            </div>
                            <p>
                                <strong className="text-foreground">
                                    Crea una reserva:
                                </strong>{' '}
                                Selecciona la fecha y horario disponible
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/10 p-1.5">
                                <span className="text-xs font-bold text-primary">
                                    2
                                </span>
                            </div>
                            <p>
                                <strong className="text-foreground">
                                    Completa los datos:
                                </strong>{' '}
                                Ingresa booking, transportista y patente
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/10 p-1.5">
                                <span className="text-xs font-bold text-primary">
                                    3
                                </span>
                            </div>
                            <p>
                                <strong className="text-foreground">
                                    Gestiona tus reservas:
                                </strong>{' '}
                                Consulta, modifica o cancela según necesites
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
