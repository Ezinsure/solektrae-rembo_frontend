import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#f4f3fb] px-4">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <FileQuestion className="h-10 w-10 text-primary" />
                </div>

                <h1 className="text-6xl font-bold text-[#112233]">404</h1>
                <h2 className="mt-2 text-xl font-medium text-[#112233]">
                    Oooppss! This page is not Available
                </h2>

                <div className="mt-8 flex justify-center gap-3">
                    <Button variant="outline">
                        <Link href="/">Go home</Link>
                    </Button>
                    <Button >
                        <Link href="/admin/customers">Go to customers</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}