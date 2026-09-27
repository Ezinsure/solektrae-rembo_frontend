import { StatusBadge } from "@/components/common/statusBadge";
import { DetailRow } from "@/components/drawer/detailRow";
import { formatDateTime } from "@/lib/apiError";

export function ViewUser({ user }: { user: any }) {
    return (
        <div className="px-7">
            <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={user?.isActive ? 'Active' : " Inactive"} />
            </div>
            <DetailRow label="Names" value={user.names} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phoneNumber} />
            <DetailRow label="Registered" value={formatDateTime(user.createdAt)} />
            <DetailRow label="Updated At" value={formatDateTime(user.updatedAt)} />
            <DetailRow label="Updated By" value={formatDateTime(user.updatedBy)} />
        </div>
    );
}