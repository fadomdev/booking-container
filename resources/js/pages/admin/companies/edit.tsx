import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Company } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Users } from 'lucide-react';

interface Props {
    company: Company;
}

export default function EditCompany({ company }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        is_active: company.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/companies/${company.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar Empresa: ${company.name}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Editar Empresa
                        </h1>
                        <p className="text-muted-foreground">
                            Actualiza la información de la empresa
                        </p>
                    </div>
                </div>

                {company.users_count && company.users_count > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-blue-900">
                            <Users className="h-4 w-4" />
                            <span>
                                Esta empresa tiene{' '}
                                <strong>{company.users_count}</strong>{' '}
                                usuario(s) asociado(s)
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Información de la Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre de la Empresa *
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Ej: Transportes XYZ"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Dirección (opcional)
                                </Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    placeholder="Ej: Av. Principal 123, Santiago"
                                    rows={2}
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Teléfono (opcional)
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="Ej: +56912345678"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email (opcional)
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="contacto@empresa.cl"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Estado</Label>
                                <Select
                                    value={data.is_active ? 'true' : 'false'}
                                    onValueChange={(value) =>
                                        setData('is_active', value === 'true')
                                    }
                                >
                                    <SelectTrigger id="is_active">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">
                                            Activa
                                        </SelectItem>
                                        <SelectItem value="false">
                                            Inactiva
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.is_active && (
                                    <p className="text-sm text-destructive">
                                        {errors.is_active}
                                    </p>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                <p>
                                    Creada:{' '}
                                    {new Date(
                                        company.created_at,
                                    ).toLocaleString('es-CL')}
                                </p>
                                <p>
                                    Última actualización:{' '}
                                    {new Date(
                                        company.updated_at,
                                    ).toLocaleString('es-CL')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/companies">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
