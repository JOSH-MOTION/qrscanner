
"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { submitLaptopRequest, getFormStructure } from '@/lib/actions';
import type { FormStructureData } from '@/lib/schemas';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from '@/components/ui/skeleton';

function LaptopRequestForm() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [formStructure, setFormStructure] = React.useState<FormStructureData | null>(null);
    const [formData, setFormData] = React.useState<Record<string, string>>({});
    const [condition, setCondition] = React.useState('Good');
    const [conditionOther, setConditionOther] = React.useState('');
    const [adminId, setAdminId] = React.useState<string | null>(null);


    React.useEffect(() => {
        const adminIdFromParams = searchParams.get('adminId');
        if (adminIdFromParams) {
            setAdminId(adminIdFromParams);
        }

        const fetchStructure = async () => {
            if (!adminIdFromParams) return;
            const structure = await getFormStructure(adminIdFromParams);
            setFormStructure(structure);
            if (structure) {
                const initialData: Record<string, string> = {};
                structure.fields.forEach(field => {
                    initialData[field.id] = '';
                });
                setFormData(initialData);
            }
        };
        if (adminIdFromParams) {
          fetchStructure();
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const isFormValid = () => {
        if (!formStructure) return false;

        for (const field of formStructure.fields) {
            if (field.required && !formData[field.id]) {
                return false;
            }
        }
        return true;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) {
            toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Please fill out all required fields.",
            });
            return;
        }
        if (!adminId) {
             toast({
                variant: "destructive",
                title: "Configuration Error",
                description: "This form is not linked to an administrator. Please use a valid QR code.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitLaptopRequest({
                adminId,
                dynamicFields: formData,
                condition: condition as 'Good' | 'Fair' | 'Other',
                conditionOther: conditionOther,
            });
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Your request has been submitted.",
                });
                setIsSubmitted(true);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Could not submit laptop request. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-lg mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle>Thank You!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your laptop request has been successfully submitted. You can now close this page.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Toaster />
            <Card className="w-full max-w-lg mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>Form Submission</CardTitle>
                    <CardDescription>Please fill out the form below.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                            {!formStructure ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <>
                                    {formStructure.fields.map(field => (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id}>{field.label}{field.required && ' *'}</Label>
                                            <Input
                                                id={field.id}
                                                name={field.id}
                                                type={field.type}
                                                value={formData[field.id] || ''}
                                                onChange={handleChange}
                                                required={field.required}
                                            />
                                        </div>
                                    ))}
                                    {formStructure.conditionField.enabled && (
                                         <div className="space-y-2">
                                            <Label>{formStructure.conditionField.label}</Label>
                                            <RadioGroup
                                                value={condition}
                                                onValueChange={setCondition}
                                                className="flex gap-4"
                                            >
                                                {formStructure.conditionField.options.map(opt => (
                                                    <div key={opt} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt} id={`c-${opt.toLowerCase()}`} />
                                                        <Label htmlFor={`c-${opt.toLowerCase()}`}>{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            {condition === 'Other' && (
                                                <Input name="conditionOther" value={conditionOther} onChange={(e) => setConditionOther(e.target.value)} placeholder="Please specify" className="mt-2" />
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !isFormValid()}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

function FormSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-lg mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>Form Submission</CardTitle>
                    <CardDescription>Please fill out the form below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <Button disabled>Submit Request</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function LaptopRequestPage() {
    return (
        <Suspense fallback={<FormSkeleton />}>
            <LaptopRequestForm />
        </Suspense>
    )
}

    