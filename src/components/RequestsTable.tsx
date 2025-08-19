
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import type { LaptopRequestData } from '@/ai/schemas/laptopRequestSchema';
import { UpdateReturnDialog } from './UpdateReturnDialog';

type LaptopRequestWithId = LaptopRequestData & { id: string };

interface RequestsTableProps {
    requests: LaptopRequestWithId[];
    onUpdateRequest: (updatedRequest: LaptopRequestWithId) => void;
}

export function RequestsTable({ requests, onUpdateRequest }: RequestsTableProps) {
    const getConditionBadge = (condition: string | undefined) => {
        switch (condition) {
            case 'Good':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Good</Badge>;
            case 'Fair':
                return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">Fair</Badge>;
            case 'Other':
                return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Other</Badge>;
            default:
                return <Badge>{condition}</Badge>;
        }
    };

    const getStatusBadge = (status: string | undefined) => {
        switch(status) {
            case 'Checked Out':
                return <Badge variant="outline" className="text-orange-500 border-orange-500">Checked Out</Badge>;
            case 'Returned':
                 return <Badge variant="outline" className="text-green-500 border-green-500">Returned</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    }
    
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Laptop ID</TableHead>
                        <TableHead>Time Collected</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length > 0 ? (
                        requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.studentName}</TableCell>
                                <TableCell>{request.laptopId}</TableCell>
                                <TableCell>{request.timeCollected}</TableCell>
                                <TableCell>
                                    {getConditionBadge(request.condition)}
                                    {request.condition === 'Other' && (
                                        <p className="text-xs text-muted-foreground mt-1">{request.conditionOther}</p>
                                    )}
                                </TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                <TableCell className="text-right">
                                    {request.status === 'Checked Out' && (
                                         <UpdateReturnDialog request={request} onUpdateRequest={onUpdateRequest} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
