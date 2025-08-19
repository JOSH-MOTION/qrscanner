/**
 * @fileOverview Defines the Zod schema and TypeScript types for laptop request data.
 */
import { z } from 'zod';

export const FormFieldSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['text', 'time', 'email', 'tel']),
    required: z.boolean(),
});

export const FormStructureSchema = z.object({
    fields: z.array(FormFieldSchema),
    conditionField: z.object({
        enabled: z.boolean(),
        label: z.string(),
        options: z.array(z.string()),
    }),
});

export type FormFieldData = z.infer<typeof FormFieldSchema>;
export type FormStructureData = z.infer<typeof FormStructureSchema>;


export const LaptopRequestSchema = z.object({
    studentName: z.string().describe('The name of the student.').optional(),
    generation: z.string().describe('The generation of the student.').optional(),
    subject: z.string().describe('The subject or lesson.').optional(),
    laptopId: z.string().describe('The ID of the laptop.').optional(),
    timeCollected: z.string().describe('The time the laptop was collected.').optional(),
    condition: z.enum(['Good', 'Fair', 'Other']).describe('The condition of the laptop at collection.'),
    conditionOther: z.string().optional().describe('Details if collection condition is "Other".'),
    
    // Dynamic fields
    dynamicFields: z.record(z.string()).optional().describe('Dynamic fields from the form'),

    // Return fields
    status: z.enum(['Checked Out', 'Returned']).default('Checked Out').describe('The current status of the laptop request.'),
    timeReturned: z.string().optional().describe('The time the laptop was returned.'),
    conditionAtReturn: z.enum(['Good', 'Fair', 'Other']).optional().describe('The condition of the laptop at return.'),
    conditionAtReturnOther: z.string().optional().describe('Details if return condition is "Other".'),
    supervisor: z.string().optional().describe('The name or signature of the supervisor who received the return.'),
});

export type LaptopRequestData = z.infer<typeof LaptopRequestSchema>;

export const UpdateLaptopRequestSchema = z.object({
    id: z.string(),
    timeReturned: z.string(),
    conditionAtReturn: z.enum(['Good', 'Fair', 'Other']),
    conditionAtReturnOther: z.string().optional(),
    supervisor: z.string(),
});

export type UpdateLaptopRequestData = z.infer<typeof UpdateLaptopRequestSchema>;
