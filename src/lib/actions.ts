'use server';

import { z } from 'zod';
import { type LaptopRequestData, type FormStructureData } from '@/lib/schemas';
import { dbAdmin } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export type { LaptopRequestData };

const LaptopRequestOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type LaptopRequestOutput = z.infer<typeof LaptopRequestOutputSchema>;

export async function submitLaptopRequest(input: Omit<LaptopRequestData, 'status'>): Promise<LaptopRequestOutput> {
  const dataToSave = {
    ...input, 
    status: 'Checked Out',
    createdAt: Timestamp.now(),
  };
  try {
      await dbAdmin.collection('laptopRequests').add(dataToSave);
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


export async function getLaptopRequests(): Promise<(LaptopRequestData & { id: string })[]> {
    const snapshot = await dbAdmin.collection('laptopRequests').orderBy('createdAt', 'desc').get();
    const requests = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            ...(data as LaptopRequestData), 
            id: doc.id,
            // Firestore Timestamps need to be converted to a serializable format.
            // For this app, we don't need to display it, so we can omit it or stringify.
        };
    });
    return requests;
}


export async function updateLaptopReturn(data: any): Promise<LaptopRequestOutput> {
    try {
        const requestDocRef = dbAdmin.collection('laptopRequests').doc(data.id);
        await requestDocRef.update({
            status: 'Returned',
            timeReturned: data.timeReturned,
            conditionAtReturn: data.conditionAtReturn,
            conditionAtReturnOther: data.conditionAtReturnOther,
            supervisor: data.supervisor,
        });
        return {
            success: true,
            message: 'Laptop return updated successfully.',
        };
    } catch (error: any) {
        console.error("Error updating document: ", error);
        return {
            success: false,
            message: `Failed to update return: ${error.message}`,
        };
    }
}

export async function saveFormStructure(structure: FormStructureData): Promise<{ success: boolean; message: string }> {
    try {
        const formDocRef = dbAdmin.collection('formStructures').doc('laptopRequest');
        await formDocRef.set(structure);
        return { success: true, message: 'Form structure saved successfully.' };
    } catch (error: any) {
        console.error("Error saving form structure: ", error);
        return { success: false, message: `Failed to save form structure: ${error.message}` };
    }
}


export async function getFormStructure(): Promise<FormStructureData | null> {
    const formDocRef = dbAdmin.collection('formStructures').doc('laptopRequest');
    const docSnap = await formDocRef.get();

    if (docSnap.exists) {
        return docSnap.data() as FormStructureData;
    } else {
        // Return a default structure if it doesn't exist
        return {
             fields: [
                { id: 'studentName', label: 'Student Name', type: 'text', required: true },
                { id: 'generation', label: 'Generation (Gen)', type: 'text', required: true },
                { id: 'subject', label: 'Subject/Lesson', type: 'text', required: true },
                { id: 'laptopId', label: 'Laptop ID/Number', type: 'text', required: true },
                { id: 'timeCollected', label: 'Time Collected', type: 'time', required: true },
            ],
            conditionField: {
                enabled: true,
                label: 'Condition at Collection',
                options: ['Good', 'Fair', 'Other'],
            },
        };
    }
}
