/**
 * @fileOverview Defines the Zod schema and TypeScript types for laptop request data.
 */
import { z } from 'zod';

export const LaptopRequestSchema = z.object({
    studentName: z.string().describe('The name of the student.'),
    generation: z.string().describe('The generation of the student.'),
    subject: z.string().describe('The subject or lesson.'),
    laptopId: z.string().describe('The ID of the laptop.'),
    timeCollected: z.string().describe('The time the laptop was collected.'),
    condition: z.enum(['Good', 'Fair', 'Other']).describe('The condition of the laptop.'),
    conditionOther: z.string().optional().describe('Details if condition is "Other".'),
});

export type LaptopRequestData = z.infer<typeof LaptopRequestSchema>;
