'use server';
/**
 * @fileOverview A flow for handling laptop request submissions.
 *
 * - submitLaptopRequest - A function that handles the laptop request submission process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { LaptopRequestSchema, type LaptopRequestData } from '@/ai/schemas/laptopRequestSchema';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    try {
        await addDoc(collection(db, 'laptopRequests'), {
            ...input,
            createdAt: new Date(),
        });
        return {
            success: true,
            message: 'Laptop request submitted successfully.',
        };
    } catch (error: any) {
        console.error("Error adding document: ", error);
        return {
            success: false,
            message: `Failed to submit request: ${error.message}`,
        };
    }
  }
);


export async function getLaptopRequests(): Promise<(LaptopRequestData & { id: string })[]> {
    const requestsCol = collection(db, 'laptopRequests');
    const q = query(requestsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => ({ ...doc.data() as LaptopRequestData, id: doc.id }));
    return requests;
}
