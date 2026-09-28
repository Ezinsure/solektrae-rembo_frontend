"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetMe } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccess, getDefaultRoute } from "@/config/nav";
import TopNav from "@/components/layout/top-bar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isError } = useGetMe();
  const pathname = usePathname();
  const router = useRouter();

  const allowed = canAccess(me?.role, pathname);

  useEffect(() => {
    if (isLoading) return;

    // not logged in or session invalid
    if (isError || !me) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // logged in but this role can't open this page
    if (!allowed) {
      router.replace(getDefaultRoute(me.role) ?? "/");
    }
  }, [isLoading, isError, me, allowed, pathname, router]);

  // render nothing restricted until the role is known and the route is allowed
  if (isLoading || !me || !allowed) {
    return <Skeleton className="h-screen w-full" />;
  }

  return (
    <>
      <div className="min-h-screen">
        <TopNav />
        <main className="p-10 px-12 bg-white max-w-[98%] mx-auto container mt-4 rounded-md min-h-[88vh]">
          {children}
        </main>
      </div>
    </>
  );
}
