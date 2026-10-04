"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

const PasswordInput = (props: React.ComponentProps<typeof Input>) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input {...props} type={visible ? "text" : "password"} className={cn("pr-10", props.className)} />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}
export default PasswordInput;