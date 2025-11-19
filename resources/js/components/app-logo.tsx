import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#ffcc00] text-black">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-bold text-foreground">
                    Hillebrand GORI
                </span>
            </div>
        </>
    );
}
