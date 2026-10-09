import { cn } from "@/lib/utils";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4  pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 border-b border-gray-200 py-7 last:border-0 lg:grid-cols-[14rem_1fr] lg:gap-10">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, hint, className, children }: { label: string; htmlFor: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-800">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function Pill({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "primary" | "green" | "amber" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 ring-gray-500/15",
    primary: "bg-primary/10 text-primary ring-primary/20",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-12 text-center">
      <p className="font-medium text-gray-900">{title}</p>
      {text && <p className="mt-1 text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        checked ? "bg-primary" : "bg-gray-300",
      )}
    >
      <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none placeholder:text-gray-400 focus-visible:border-ring focus-visible:ring-ring/50";