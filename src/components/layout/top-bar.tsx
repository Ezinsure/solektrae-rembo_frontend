"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IremboLogo from "../../../public/favicon.ico";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { CircleAlertIcon, CircleDashedIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS: { href: string; label: string }[] = [
    { label: "Dashboard", href: "/admin" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Settings", href: "/admin/settings" },
];

const TopNav = () => {
    const pathname = usePathname();

    return (
        <header className="w-full bg-white max-w-[98%] mx-auto container my-3 rounded-2xl">
            <div className=" flex h-14 items-center justify-between px-6">
                <Link href="/admin" className="flex items-center gap-2">
                    <Image
                        src={IremboLogo}
                        alt="Irembo Logo"
                        width={34}
                        height={34}
                        priority
                    />
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => {
                        const isActive =
                            link.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive
                                        ? "text-foreground bg-[#004ea420] px-4 py-1.5 rounded-2xl "
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="h-auto p-1 pr-3 gap-3 data-[state=open]:bg-accent">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="Ntwali Chris"
                                        className="grayscale"
                                    />
                                    <AvatarFallback>NC</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:flex flex-col items-start leading-tight">
                                    <span className="text-base font-medium">Ntwali Chris</span>
                                    <span className="text-xs text-muted-foreground">Admin</span>
                                </div>
                            </NavigationMenuTrigger>

                            <NavigationMenuContent>
                                <ul className="grid w-[220px] gap-1 p-2">
                                    <li>
                                        <NavigationMenuLink
                                            render={
                                                <Link
                                                    href="/profile"
                                                    className={cn(
                                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                                                        "hover:bg-accent hover:text-accent-foreground"
                                                    )}
                                                >
                                                    <CircleAlertIcon className="h-4 w-4" />
                                                    Profile
                                                </Link>
                                            }
                                        />
                                    </li>
                                    <li>
                                        <NavigationMenuLink
                                            render={
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // TODO: signOut()
                                                        console.log("Log out");
                                                    }}
                                                    className={cn(
                                                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left",
                                                        "hover:bg-accent hover:text-accent-foreground"
                                                    )}
                                                >
                                                    <CircleDashedIcon className="h-4 w-4" />
                                                    Log out
                                                </button>
                                            }
                                        />
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    );
};
export default TopNav;