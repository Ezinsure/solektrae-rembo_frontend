"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { settingsNav } from "@/lib/settings/datas";

const SettingsNav = () => {
    const pathname = usePathname();

    return (
        <nav aria-label="Settings" className="bg-[#E9E9EB]/20 min-h-[74vh] rounded-lg">
            <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 py-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-0">
                {settingsNav.map(({ label, description, href, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                        <li key={href} className="shrink-0">
                            <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:py-1.5",
                                    active ? "bg-white font-medium text-primary border-r-3 border-r-[#112233]" : "text-foreground hover:bg-gray-100 hover:text-gray-900",
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="whitespace-nowrap lg:whitespace-normal">
                                    {label}
                                    <span className={cn("hidden text-xs font-normal lg:block", active ? "text-primary/70" : "text-gray-600")}>{description}</span>
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
export default SettingsNav