'use server';
/**
 * @fileOverview A flow for handling laptop request submissions.
 *
 * - submitLaptopRequest - A function that handles the laptop request submission process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { LaptopRequestSchema, type LaptopRequestData } from '@/ai/schemas/laptopRequestSchema';

export type { LaptopRequestData };

const LaptopRequestOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type LaptopRequestOutput = z.infer<typeof LaptopRequestOutputSchema>;

export async function submitLaptopRequest(input: LaptopRequestData): Promise<LaptopRequestOutput> {
  return laptopRequestFlow(input);
}

const laptopRequestFlow = ai.defineFlow(
  {
    name: 'laptopRequestFlow',
    inputSchema: LaptopRequestSchema,
    outputSchema: LaptopRequestOutputSchema,
  },
  async (input) => {
    console.log('Received laptop request:', input);
    // In a real application, you would save this data to a database (e.g., Firestore).
    // For now, we just simulate a successful submission.
    return {
      success: true,
      message: 'Laptop request submitted successfully.',
    };
  }
);
