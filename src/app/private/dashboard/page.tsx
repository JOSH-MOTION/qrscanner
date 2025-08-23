
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestsTable } from '@/components/RequestsTable';
import { Download, QrCode, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getLaptopRequests, getFormStructure, saveFormStructure } from '@/lib/actions';
import type { LaptopRequestData, FormStructureData, FormFieldData } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';


type LaptopRequestWithId = LaptopRequestData & { id: string };

export default function AdminDashboard() {
    const [requests, setRequests] = useState<LaptopRequestWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    // State for dynamic form builder
    const [formStructure, setFormStructure] = useState<FormStructureData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [laptopRequestUrl, setLaptopRequestUrl] = useState('');

     useEffect(() => {
        if (typeof window !== 'undefined' && user) {
            setLaptopRequestUrl(`${window.location.origin}/laptop-request?adminId=${user.uid}`);
        }
    }, [user]);

    const fetchRequests = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const fetchedRequests = await getLaptopRequests(user.uid);
            setRequests(fetchedRequests);
        } catch (error) {
            console.error("Failed to fetch laptop requests:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to fetch laptop requests."})
        } finally {
            setLoading(false);
        }
    };
    
    const fetchFormStructure = async () => {
        try {
            const structure = await getFormStructure();
            setFormStructure(structure);
        } catch (error) {
             console.error("Failed to fetch form structure:", error);
             toast({ variant: 'destructive', title: "Error", description: "Failed to load form structure."})
        }
    }

    useEffect(() => {
        if (user) {
            fetchRequests();
            fetchFormStructure();
        }
    }, [user]);

    const handleDownloadCsv = () => {
        if (requests.length === 0) return;
        
        // Dynamically generate headers from the first request's dynamic fields
        const firstRequest = requests[0];
        const dynamicFieldKeys = firstRequest.dynamicFields ? Object.keys(firstRequest.dynamicFields) : [];
        const dynamicFieldHeaders = dynamicFieldKeys.map(key => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

        const headers = [
            "ID", 
            ...dynamicFieldHeaders,
            "Time Collected", 
            "Condition", 
            "Other Details", 
            "Status", 
            "Time Returned", 
            "Condition at Return", 
            "Return Condition Other", 
            "Supervisor"
        ];
        
        const csvRows = [
            headers.join(','),
            ...requests.map(row => {
                const dynamicFieldValues = dynamicFieldKeys.map(key => `"${row.dynamicFields?.[key] || ''}"`);
                return [
                    row.id, 
                    ...dynamicFieldValues,
                    `"${row.dynamicFields?.timeCollected || ''}"`,
                    row.condition, 
                    `"${row.conditionOther || ''}"`, 
                    row.status,
                    `"${row.timeReturned || ''}"`,
                    `"${row.conditionAtReturn || ''}"`,
                    `"${row.conditionAtReturnOther || ''}"`,
                    `"${row.supervisor || ''}"`
                ].join(',');
            })
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

    // Form builder functions
    const handleFieldChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formStructure) return;
        const newFields = [...formStructure.fields];
        newFields[index] = { ...newFields[index], [e.target.name]: e.target.value };
        setFormStructure({ ...formStructure, fields: newFields });
    };
        
    const handleRequiredChange = (index: number, checked: boolean) => {
        if (!formStructure) return;
        const newFields = [...formStructure.fields];
        newFields[index].required = checked;
        setFormStructure({ ...formStructure, fields: newFields });
    };

    const addField = () => {
        if (!formStructure) return;
        const newField: FormFieldData = { id: `custom_${Date.now()}`, label: '', type: 'text', required: false };
        setFormStructure(prev => prev ? ({ ...prev, fields: [...prev.fields, newField] }) : null);
    };

    const removeField = (index: number) => {
        if (!formStructure) return;
        const newFields = formStructure.fields.filter((_, i) => i !== index);
        setFormStructure({ ...formStructure, fields: newFields });
    };
        
    const handleSaveFormStructure = async () => {
        if (!formStructure) return;
        setIsSaving(true);
        const result = await saveFormStructure(formStructure);
        if (result.success) {
        toast({ title: 'Success', description: 'Form structure saved successfully.' });
        } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsSaving(false);
    };


    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-6xl">
                 <Link href="/private" className="text-sm mb-4 inline-flex items-center gap-2 text-blue-500 hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Back to QR Generator
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="w-full shadow-lg">
                            <CardHeader>
                                <CardTitle>Laptop Form QR Code</CardTitle>
                                <CardDescription>Students scan this to open the request form.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center gap-4">
                                {laptopRequestUrl ? (
                                    <div className="p-4 bg-white rounded-lg border">
                                        <QRCodeSVG value={laptopRequestUrl} size={200} />
                                    </div>
                                ) : (
                                    <p>Loading QR Code...</p>
                                )}
                                <Input type="text" value={laptopRequestUrl} readOnly className="text-center bg-gray-100" />
                            </CardContent>
                        </Card>

                        <Card className="w-full shadow-lg">
                            <CardHeader>
                                <CardTitle>Customize Form</CardTitle>
                                <CardDescription>Add or remove fields from the form.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-96 overflow-y-auto p-4">
                                {formStructure?.fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                                        <div className="flex-grow">
                                            <Label htmlFor={`label-${index}`} className="sr-only">Field Label</Label>
                                            <Input
                                                id={`label-${index}`} 
                                                name="label"
                                                value={field.label} 
                                                onChange={(e) => handleFieldChange(index, e)} 
                                                placeholder="Field Label"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Switch id={`required-${index}`} checked={field.required} onCheckedChange={(checked) => handleRequiredChange(index, checked)} />
                                            <Label htmlFor={`required-${index}`} className="text-xs">Required</Label>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeField(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addField} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Add Field
                                </Button>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveFormStructure} disabled={isSaving} className="w-full">
                                    <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Form Structure'}
                                </Button>
                            </CardFooter>
                        </Card>

                    </div>
                    <div className="lg:col-span-2">
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
            </div>
        </div>
    );
}

    