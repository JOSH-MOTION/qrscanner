'use server';

import { z } from 'zod';
import { LaptopRequestSchema, type LaptopRequestData, UpdateLaptopRequestSchema, type UpdateLaptopRequestData, FormFieldSchema, FormStructureSchema, type FormStructureData } from '@/lib/schemas';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export type { LaptopRequestData };

const LaptopRequestOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type LaptopRequestOutput = z.infer<typeof LaptopRequestOutputSchema>;

export async function submitLaptopRequest(input: Omit<LaptopRequestData, 'status'>): Promise<LaptopRequestOutput> {
  const dataToSave = {...input, status: 'Checked Out'};
  try {
      await addDoc(collection(db, 'laptopRequests'), {
          ...dataToSave,
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


export async function getLaptopRequests(): Promise<(LaptopRequestData & { id: string })[]> {
    const requestsCol = collection(db, 'laptopRequests');
    const q = query(requestsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => ({ ...(doc.data() as LaptopRequestData), id: doc.id }));
    return requests;
}


export async function updateLaptopReturn(data: UpdateLaptopRequestData): Promise<LaptopRequestOutput> {
    try {
        const requestDocRef = doc(db, 'laptopRequests', data.id);
        await updateDoc(requestDocRef, {
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

const FormStructureOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export async function saveFormStructure(structure: FormStructureData): Promise<{ success: boolean; message: string }> {
    try {
        const formDocRef = doc(db, 'formStructures', 'laptopRequest');
        await setDoc(formDocRef, structure);
        return { success: true, message: 'Form structure saved successfully.' };
    } catch (error: any) {
        console.error("Error saving form structure: ", error);
        return { success: false, message: `Failed to save form structure: ${error.message}` };
    }
}


export async function getFormStructure(): Promise<FormStructureData | null> {
    const formDocRef = doc(db, 'formStructures', 'laptopRequest');
    const docSnap = await getDoc(formDocRef);
    if (docSnap.exists()) {
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
