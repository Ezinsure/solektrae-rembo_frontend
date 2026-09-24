'use client';

import PaginationPage from "@/components/pagination/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetAllCustomers } from "@/hooks/useCustomer";

const CustomersView = () => {
    const { data: customerData, isLoading: customerLoading } =
        useGetAllCustomers();
    return (
        <div>
            <h1 className="text-2xl font-medium">Customers</h1>
            <p className="text-muted-foreground ">
                Manage customer list here.
            </p>
            <div className="py-6">
                <div className="border border-[#E9E9EB] rounded-md!">
                    <Table>
                        <TableHeader className="bg-[#E9E9EB] rounded-t-lg!">
                            <TableRow >
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Names</TableHead>
                                <TableHead className="font-semibold">Email</TableHead>
                                <TableHead className="font-semibold">Phone</TableHead>
                                <TableHead className="font-semibold">Service</TableHead>
                                <TableHead className="font-semibold">District</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                {/* <TableHead className="text-right">Actions</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customerData?.data?.map((data: any) =>
                            // eslint-disable-next-line react/jsx-key
                            (<TableRow>
                                <TableCell >{data?.createdAt.slice(0, 10)}</TableCell>
                                <TableCell >{data?.names}</TableCell>
                                <TableCell>{data?.email}</TableCell>
                                <TableCell>{data?.phoneNumber}</TableCell>
                                <TableCell>{data?.service}</TableCell>
                                <TableCell>{data?.district}</TableCell>
                                <TableCell >
                                    {data?.status}
                                </TableCell>
                            </TableRow>)
                            )}
                        </TableBody>
                    </Table></div>
                <div ><PaginationPage /></div>
            </div>
        </div>
    );
}
export default CustomersView