
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import type { LaptopRequestData } from '@/ai/schemas/laptopRequestSchema';
import { updateLaptopReturn } from '@/ai/flows/laptopRequestFlow';

interface UpdateReturnDialogProps {
    request: LaptopRequestData & { id: string };
    onUpdateRequest: (updatedRequest: LaptopRequestData & { id: string }) => void;
}

export function UpdateReturnDialog({ request, onUpdateRequest }: UpdateReturnDialogProps) {
    const [open, setOpen] = useState(false);
    const [timeReturned, setTimeReturned] = useState('');
    const [conditionAtReturn, setConditionAtReturn] = useState<'Good' | 'Fair' | 'Other'>('Good');
    const [conditionAtReturnOther, setConditionAtReturnOther] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!timeReturned || !supervisor) {
             toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Please fill out all required fields.",
            });
            return;
        }

        const result = await updateLaptopReturn({
            id: request.id,
            timeReturned,
            conditionAtReturn,
            conditionAtReturnOther,
            supervisor,
        });

        if (result.success) {
            toast({
                title: "Success",
                description: "Laptop return has been recorded.",
            });
            onUpdateRequest({ ...request, status: 'Returned' });
            setOpen(false);
        } else {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: result.message,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Update Return</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Laptop Return</DialogTitle>
                    <DialogDescription>
                        Record the details of the laptop being returned by {request.studentName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="timeReturned" className="text-right">Time Returned</Label>
                        <Input id="timeReturned" type="time" value={timeReturned} onChange={(e) => setTimeReturned(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                         <Label className="text-right pt-2">Condition</Label>
                         <div className="col-span-3">
                            <RadioGroup value={conditionAtReturn} onValueChange={(val) => setConditionAtReturn(val as any)} className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Good" id="r-good" />
                                    <Label htmlFor="r-good">Good</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Fair" id="r-fair" />
                                    <Label htmlFor="r-fair">Fair</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Other" id="r-other" />
                                    <Label htmlFor="r-other">Other</Label>
                                </div>
                            </RadioGroup>
                            {conditionAtReturn === 'Other' && (
                                <Input value={conditionAtReturnOther} onChange={(e) => setConditionAtReturnOther(e.target.value)} placeholder="Please specify" className="mt-2" />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supervisor" className="text-right">Supervisor</Label>
                        <Input id="supervisor" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Save Return</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
