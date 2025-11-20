import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh w-full">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="h-full w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
                    <img
                        src="/images/warehouse-bg.jpg"
                        alt="Warehouse background"
                        className="h-full w-full object-cover opacity-60"
                        onError={(e) => {
                            // Hide image if not found, show gradient instead
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <Link
                                    href={home()}
                                    className="flex flex-col items-center gap-2 font-medium"
                                >
                                    {/* 
                                    <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <AppLogoIcon className="size-10 fill-current text-primary" />
                                    </div>
                                    */}
                                    <div className="mb-2 flex w-[360px] items-center justify-center">
                                        <img
                                            src="/images/hillebrand-gori-logo.jpg"
                                            alt="Hillebrand Gori Logo"
                                        />
                                    </div>

                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-2 text-center">
                                    <h1 className="text-2xl font-bold">
                                        {title}
                                    </h1>
                                    <p className="text-center text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-4 text-center text-xs text-white/70">
                        Sistema de Gestión de Reservas de Horarios
                    </p>
                </div>
            </div>
        </div>
    );
}
