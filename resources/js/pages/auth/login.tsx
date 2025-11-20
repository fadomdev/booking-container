import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { formatRut } from '@/lib/rut';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [rutValue, setRutValue] = useState('');

    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatRut(e.target.value);
        setRutValue(formatted);
        e.target.value = formatted;
    };

    return (
        <AuthLayout
            title="Iniciar Sesión"
            description="Ingresa tu RUT y contraseña para acceder al sistema"
        >
            <Head title="Iniciar Sesión" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="rut" className="text-[#003153]">
                                    RUT
                                </Label>
                                <Input
                                    id="rut"
                                    type="text"
                                    name="rut"
                                    value={rutValue}
                                    onChange={handleRutChange}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="12345678-9"
                                    maxLength={10}
                                    className="h-14 border-gray-300 focus:border-[#ffcc00] focus:ring-[#ffcc00]"
                                />
                                <InputError message={errors.rut} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-[#003153]"
                                    >
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[#003153] hover:text-[#003153]/80"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Contraseña"
                                    className="h-14 border-gray-300 focus:border-[#ffcc00] focus:ring-[#ffcc00]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-[#003153]"
                                >
                                    Recordarme
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-[#ffcc00] font-semibold text-[#003153] hover:bg-[#ffcc00]/90"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Iniciar Sesión
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
