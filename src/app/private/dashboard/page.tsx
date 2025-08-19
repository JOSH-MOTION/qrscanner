
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/RequestsTable';
import { Download } from 'lucide-react';
import Link from 'next/link';

// DUMMY DATA
const dummyRequests = [
    { id: '1', studentName: 'Ama', generation: '25', subject: 'React Hooks', laptopId: 'L001', timeCollected: '09:15', condition: 'Good' },
    { id: '2', studentName: 'Kofi', generation: '24', subject: 'Next.js Routing', laptopId: 'L005', timeCollected: '09:20', condition: 'Fair' },
    { id: '3', studentName: 'Yaa', generation: '25', subject: 'State Management', laptopId: 'L012', timeCollected: '09:30', condition: 'Good' },
    { id: '4', studentName: 'Esi', generation: '26', subject: 'UI/UX Design', laptopId: 'L007', timeCollected: '10:00', condition: 'Other', conditionOther: 'Screen flickering' },
];


export default function AdminDashboard() {

    const handleDownloadCsv = () => {
        // In a real app, this would convert the fetched requests to CSV
        const headers = ["ID", "Student Name", "Generation", "Subject", "Laptop ID", "Time Collected", "Condition", "Other Details"];
        const csvRows = [
            headers.join(','),
            ...dummyRequests.map(row => 
                [row.id, row.studentName, row.generation, row.subject, row.laptopId, row.timeCollected, row.condition, row.conditionOther || ''].join(',')
            )
        ];
        const csvString = csvRows.join('\\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'laptop_requests.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-6xl">
                 <Link href="/private" className="text-sm mb-4 inline-block text-blue-500 hover:underline">
                    &larr; Back to QR Generator
                </Link>
                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Laptop Requests</CardTitle>
                                <CardDescription>View all submitted laptop requests.</CardDescription>
                            </div>
                            <Button onClick={handleDownloadCsv}>
                                <Download className="mr-2 h-4 w-4" />
                                Download CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <RequestsTable requests={dummyRequests} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    