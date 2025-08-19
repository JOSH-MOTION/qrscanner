
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LaptopRequestForm } from '@/components/LaptopRequestForm';
import { submitLaptopRequest } from '@/ai/flows/laptopRequestFlow';
import type { LaptopRequestData } from '@/ai/schemas/laptopRequestSchema';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function LaptopRequestPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const [laptopRequestData, setLaptopRequestData] = useState<Omit<LaptopRequestData, 'status'>>({
        studentName: '',
        generation: '',
        subject: '',
        laptopId: '',
        timeCollected: '',
        condition: 'Good',
        conditionOther: '',
    });

    const handleLaptopRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field?: keyof LaptopRequestData) => {
        if (typeof e === 'string') {
            setLaptopRequestData(prev => ({ ...prev, condition: e as LaptopRequestData['condition'] }));
        } else {
            const { name, value } = e.target as HTMLInputElement;
            setLaptopRequestData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const isFormValid = () => {
        return laptopRequestData.studentName && laptopRequestData.generation && laptopRequestData.subject && laptopRequestData.laptopId && laptopRequestData.timeCollected;
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

        setIsSubmitting(true);
        try {
            const result = await submitLaptopRequest(laptopRequestData);
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
                    <CardTitle>Codetrain Africa</CardTitle>
                    <CardDescription>Laptop Request Form</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <LaptopRequestForm data={laptopRequestData as LaptopRequestData} onChange={handleLaptopRequestChange} />
                        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                            <p className="font-bold">Student Agreement</p>
                            <p>I agree to take care of the Codetrain Africa laptop while using it and return it immediately after class.</p>
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
