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
            <DetailRow label="Role" value={<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary ring-1 ring-inset ring-primary/20">
                {user.role}
            </span>} />
            <DetailRow label="Names" value={user.names} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phoneNumber} />
            <DetailRow label="Registered At" value={formatDateTime(user?.createdAt)} />
            <DetailRow label="Registered By" value={user.createdBy?.names} />
            <DetailRow label="Updated At" value={formatDateTime(user?.updatedAt)} />
            {user.updatedBy && (
                <DetailRow label="Updated By" value={user.updatedBy?.names} />
            )}
        </div>
    );
}