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
        <div className="relative flex min-h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/images/warehouse-bg.jpg)',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl backdrop-blur-sm md:p-8 dark:border-gray-700 dark:bg-gray-900/98">
                        <div className="flex flex-col gap-6 md:gap-8">
                            <div className="flex flex-col items-center gap-3 md:gap-4">
                                <Link
                                    href={home()}
                                    className="flex flex-col items-center gap-2 font-medium"
                                >
                                    {/* 
                                    <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <AppLogoIcon className="size-10 fill-current text-primary" />
                                    </div>
                                    */}
                                    <div className="mb-2 flex w-full max-w-[280px] items-center justify-center md:w-[360px] md:max-w-none">
                                        <img
                                            src="/images/hillebrand-gori-logo.jpg"
                                            alt="Hillebrand Gori Logo"
                                            className="w-full"
                                        />
                                    </div>

                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-2 text-center">
                                    <h1 className="text-xl font-bold text-foreground md:text-2xl">
                                        {title}
                                    </h1>
                                    <p className="text-center text-xs text-muted-foreground md:text-sm">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-3 text-center text-xs text-white/70 md:mt-4">
                        Sistema de Gestión de Reservas de Horarios
                    </p>
                </div>
            </div>
        </div>
    );
}
