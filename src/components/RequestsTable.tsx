
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

interface LaptopRequest {
    id: string;
    studentName: string;
    generation: string;
    subject: string;
    laptopId: string;
    timeCollected: string;
    condition: 'Good' | 'Fair' | 'Other';
    conditionOther?: string;
}

interface RequestsTableProps {
    requests: LaptopRequest[];
}

export function RequestsTable({ requests }: RequestsTableProps) {
    const getConditionBadge = (condition: string) => {
        switch (condition) {
            case 'Good':
                return <Badge variant="default" className="bg-green-500">Good</Badge>;
            case 'Fair':
                return <Badge variant="secondary" className="bg-yellow-500 text-black">Fair</Badge>;
            case 'Other':
                return <Badge variant="destructive">Other</Badge>;
            default:
                return <Badge>{condition}</Badge>;
        }
    };
    
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Generation</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Laptop ID</TableHead>
                        <TableHead>Time Collected</TableHead>
                        <TableHead>Condition</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length > 0 ? (
                        requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.studentName}</TableCell>
                                <TableCell>{request.generation}</TableCell>
                                <TableCell>{request.subject}</TableCell>
                                <TableCell>{request.laptopId}</TableCell>
                                <TableCell>{request.timeCollected}</TableCell>
                                <TableCell>
                                    {getConditionBadge(request.condition)}
                                    {request.condition === 'Other' && (
                                        <p className="text-xs text-muted-foreground mt-1">{request.conditionOther}</p>
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

    