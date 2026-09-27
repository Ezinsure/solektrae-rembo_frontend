import { StatusBadge } from "@/components/common/statusBadge";
import { DetailRow } from "@/components/drawer/detailRow";
import { formatDateTime } from "@/lib/apiError";

export function ViewCustomer({ customer }: { customer: any }) {
    return (
        <div className="px-7">
            <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={customer?.status} />
            </div>
            <DetailRow label="Names" value={customer.names} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="Phone" value={customer.phoneNumber} />
            <DetailRow label="Father's Names" value={customer.fatherName} />
            <DetailRow label="Mother's Names" value={customer.motherName} />
            <DetailRow label="Spouse's Names" value={customer.spouseName} />
            <DetailRow label="Service" value={customer.service} />
            <DetailRow label="Height" value={`${customer.height} cm`} />
            <DetailRow label="Street Number" value={customer.street} />
            <DetailRow label="District" value={customer.district} />
            <DetailRow label="Sector" value={customer.sector} />
            <DetailRow label="Cell" value={customer.cell} />
            <DetailRow label="Village" value={customer.village} />
            <DetailRow label="Head of Village" value={customer.hovName} />
            <DetailRow label="Head of Village Phone" value={customer.hovNumber} />
            <DetailRow label="Registered" value={formatDateTime(customer.createdAt)} />
            {customer?.status !== 'pending' && <DetailRow label="Updated At" value={formatDateTime(customer.updatedAt)} />}
            {customer?.status !== 'pending' && <DetailRow label="Updated By" value={formatDateTime(customer.updatedBy)} />}
        </div>
    );
}