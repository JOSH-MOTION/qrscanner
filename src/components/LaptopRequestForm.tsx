"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { LaptopRequestData } from '@/ai/schemas/laptopRequestSchema';

interface LaptopRequestFormProps {
    data: LaptopRequestData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field?: keyof LaptopRequestData) => void;
}

export function LaptopRequestForm({ data, onChange }: LaptopRequestFormProps) {
    const handleConditionChange = (value: string) => {
        onChange(value, 'condition');
    };

    return (
        <div className="space-y-4 max-h-60 overflow-y-auto p-1">
            <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input id="studentName" name="studentName" value={data.studentName} onChange={onChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="generation">Generation (Gen)</Label>
                    <Input id="generation" name="generation" value={data.generation} onChange={onChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject/Lesson</Label>
                    <Input id="subject" name="subject" value={data.subject} onChange={onChange} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="laptopId">Laptop ID/Number</Label>
                    <Input id="laptopId" name="laptopId" value={data.laptopId} onChange={onChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="timeCollected">Time Collected</Label>
                    <Input id="timeCollected" name="timeCollected" type="time" value={data.timeCollected} onChange={onChange} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Condition at Collection</Label>
                <RadioGroup
                    value={data.condition}
                    onValueChange={handleConditionChange}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Good" id="c-good" />
                        <Label htmlFor="c-good">Good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Fair" id="c-fair" />
                        <Label htmlFor="c-fair">Fair</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Other" id="c-other" />
                        <Label htmlFor="c-other">Other</Label>
                    </div>
                </RadioGroup>
                {data.condition === 'Other' && (
                    <Input name="conditionOther" value={data.conditionOther} onChange={onChange} placeholder="Please specify" className="mt-2" />
                )}
            </div>
        </div>
    );
}
