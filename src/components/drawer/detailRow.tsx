
export function DetailRow({ label, value }: { label: string; value?: any }) {
    return (
        <div className="flex justify-between py-3 border-b last:border-0 ">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value || "—"}</span>
        </div>
    );
}