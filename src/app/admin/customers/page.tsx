import PaginationPage from "@/components/pagination/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CustomersView = () => {
    return (
        <div>
            <h1 className="text-2xl font-medium">Customers</h1>
            <p className="text-muted-foreground mt-.5">
                Manage customer list here.
            </p>
            <div className="p-6">
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
                                <TableHead className="text-right font-semibold">Status</TableHead>
                                {/* <TableHead className="text-right">Actions</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">11/09/2026</TableCell>
                                <TableCell className="font-medium">Kwizera Em</TableCell>
                                <TableCell>em@gmail.com</TableCell>
                                <TableCell>07858373874</TableCell>
                                <TableCell>Passport</TableCell>
                                <TableCell>Huye</TableCell>
                                <TableCell className="text-right">
                                    Complete
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">11/09/2026</TableCell>
                                <TableCell className="font-medium">Kwizera Em</TableCell>
                                <TableCell>em@gmail.com</TableCell>
                                <TableCell>07858373874</TableCell>
                                <TableCell>Passport</TableCell>
                                <TableCell>Huye</TableCell>
                                <TableCell className="text-right">
                                    Complete
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table></div>
                <div ><PaginationPage /></div>
            </div>
        </div>
    );
}
export default CustomersView