"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetMe } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccess, getDefaultRoute } from "@/config/nav";
import TopNav from "@/components/layout/top-bar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: me, isLoading, isError } = useGetMe();
  const pathname = usePathname();
  const router = useRouter();

  const allowed = canAccess(me?.role, pathname);

  useEffect(() => {
    if (isLoading) return;

    if (isError || !me) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowed) {
      router.replace(getDefaultRoute(me.role) ?? "/");
    }
  }, [isLoading, isError, me, allowed, pathname, router]);

  if (isLoading || !me || !allowed) {
    return <Skeleton className="h-screen w-full" />;
  }

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopNav />
        <main className="container mx-auto mb-4 mt-4 min-h-0 w-full max-w-[98%] flex-1 overflow-y-auto rounded-md bg-white p-6 px-12">
          {children}
        </main>
      </div>
    </>
  );
}
