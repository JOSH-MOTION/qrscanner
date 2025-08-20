
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
import type { LaptopRequestData } from '@/lib/schemas';
import { UpdateReturnDialog } from './UpdateReturnDialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


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

    const formatLabel = (label: string) => {
        const result = label.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length > 0 ? (
                        requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value={request.id} className="border-none">
                                            <AccordionTrigger className="font-medium p-0">
                                                {request.dynamicFields?.studentName || request.dynamicFields?.name || 'N/A'}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-sm">
                                                    {Object.entries(request.dynamicFields || {}).map(([key, value]) => (
                                                        <div key={key}>
                                                            <span className="font-semibold">{formatLabel(key)}: </span>{value as string}
                                                        </div>
                                                    ))}
                                                     <div>
                                                        <span className="font-semibold">Condition: </span> {getConditionBadge(request.condition)}
                                                        {request.condition === 'Other' && (
                                                            <span className="text-xs text-muted-foreground ml-2">{request.conditionOther}</span>
                                                        )}
                                                     </div>
                                                     {request.status === 'Returned' && (
                                                         <>
                                                            <div><span className="font-semibold">Time Returned: </span>{request.timeReturned}</div>
                                                             <div>
                                                                <span className="font-semibold">Condition at Return: </span> {getConditionBadge(request.conditionAtReturn)}
                                                                {request.conditionAtReturn === 'Other' && (
                                                                    <span className="text-xs text-muted-foreground ml-2">{request.conditionAtReturnOther}</span>
                                                                )}
                                                             </div>
                                                            <div><span className="font-semibold">Supervisor: </span>{request.supervisor}</div>
                                                         </>
                                                     )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
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
                            <TableCell colSpan={3} className="h-24 text-center">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
