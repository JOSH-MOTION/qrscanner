
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/RequestsTable';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { getLaptopRequests } from '@/lib/actions';
import type { LaptopRequestData } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';

type LaptopRequestWithId = LaptopRequestData & { id: string };

export default function AdminDashboard() {
    const [requests, setRequests] = useState<LaptopRequestWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchRequests = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const fetchedRequests = await getLaptopRequests(user.uid);
            setRequests(fetchedRequests);
        } catch (error) {
            console.error("Failed to fetch laptop requests:", error);
            // Handle error (e.g., show a toast message)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const handleDownloadCsv = () => {
        if (requests.length === 0) return;

        const headers = ["ID", "Student Name", "Generation", "Subject", "Laptop ID", "Time Collected", "Condition", "Other Details", "Status", "Time Returned", "Condition at Return", "Return Condition Other", "Supervisor"];
        const csvRows = [
            headers.join(','),
            ...requests.map(row => 
                [
                    row.id, 
                    row.dynamicFields?.studentName || '', 
                    row.dynamicFields?.generation || '', 
                    row.dynamicFields?.subject || '', 
                    row.dynamicFields?.laptopId || '', 
                    row.dynamicFields?.timeCollected || '', 
                    row.condition, 
                    row.conditionOther || '', 
                    row.status,
                    row.timeReturned || '',
                    row.conditionAtReturn || '',
                    row.conditionAtReturnOther || '',
                    row.supervisor || ''
                ].join(',')
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
    
    const handleUpdateRequest = (updatedRequest: LaptopRequestWithId) => {
        setRequests(prevRequests => 
            prevRequests.map(req => req.id === updatedRequest.id ? updatedRequest : req)
        );
        fetchRequests(); // Refresh the list from the server
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
                            <Button onClick={handleDownloadCsv} disabled={requests.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Download CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {loading ? <p>Loading requests...</p> : <RequestsTable requests={requests} onUpdateRequest={handleUpdateRequest} />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
