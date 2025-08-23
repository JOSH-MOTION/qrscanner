
'use server';

import { z } from 'zod';
import { type LaptopRequestData, type FormStructureData, type UserProfile } from '@/lib/schemas';
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


export async function getLaptopRequests(adminId: string): Promise<(LaptopRequestData & { id: string })[]> {
    if (!adminId) {
        console.error("Admin ID is required to fetch laptop requests.");
        return [];
    }
    // Fetch all requests and filter in the code. This is less efficient for very large
    // datasets, but avoids the need for a composite index on Firestore, which is a
    // common deployment issue.
    const snapshot = await dbAdmin.collection('laptopRequests').get();

    const requests = snapshot.docs
        .map(doc => {
            const data = doc.data();
            // Firestore timestamps need to be converted to be sent to the client.
            const serializableData = {
                ...data,
                createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
            };
            return { 
                ...(serializableData as LaptopRequestData), 
                id: doc.id,
            };
        })
        .filter(req => req.adminId === adminId)
        .sort((a, b) => {
            // Sort by creation time, newest first.
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });

    return requests.map(req => {
        const { createdAt, ...rest } = req; // Don't send createdAt to client if not needed.
        return rest;
    }) as (LaptopRequestData & { id: string })[];
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

export async function createUserProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    try {
        await dbAdmin.collection('users').doc(profile.uid).set(profile);
        return { success: true, message: 'User profile created successfully.' };
    } catch (error: any) {
        console.error("Error creating user profile: ", error);
        return { success: false, message: `Failed to create user profile: ${error.message}` };
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const userDocRef = dbAdmin.collection('users').doc(uid);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}
