import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, ClipboardList, PlusCircle, Users } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <AppLayout>
            <Head title="Panel de Administración" />

            <div className="space-y-8">
                {/* Hero Section */}
                <div className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Panel de Administración 🛠️
                    </h1>
                    <p className="mt-2 text-lg opacity-90">
                        Gestiona y supervisa todo el sistema de reservas desde
                        aquí
                    </p>
                </div>

                {/* Stats Cards */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">
                        Resumen del Sistema
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription>
                                        Total Usuarios
                                    </CardDescription>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Usuarios registrados
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription>
                                        Reservas Activas
                                    </CardDescription>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Reservas vigentes
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription>
                                        Configuraciones
                                    </CardDescription>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Horarios configurados
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription>
                                        Fechas Bloqueadas
                                    </CardDescription>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Días bloqueados
                                </p>
                            </CardContent>
                        </Card>
                    </div>
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
                                    <div className="rounded-lg bg-blue-500/10 p-3">
                                        <PlusCircle className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>
                                            Crear Nueva Reserva
                                        </CardTitle>
                                        <CardDescription>
                                            Agenda una reserva para cualquier
                                            usuario
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
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Nueva Reserva
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-green-500/10 p-3">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Crear Usuario</CardTitle>
                                        <CardDescription>
                                            Registra un nuevo usuario en el
                                            sistema
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
                                    <Link href="/admin/users/create">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Nuevo Usuario
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Herramientas Disponibles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Utiliza el menú lateral para acceder a todas las
                            funciones de administración:
                        </p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                <span>
                                    <strong>Usuarios:</strong> Gestiona cuentas
                                    y permisos
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                <span>
                                    <strong>Configuración de Horarios:</strong>{' '}
                                    Define franjas horarias y capacidad
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                <span>
                                    <strong>Fechas Bloqueadas:</strong> Bloquea
                                    días festivos o mantenimientos
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                <span>
                                    <strong>Reservas:</strong> Visualiza y
                                    gestiona todas las reservas del sistema
                                </span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
