import { Hive } from "../models";
import { db } from './db';

export async function getAllHives(activeOnly: boolean): Promise<Hive[]> {
    if (activeOnly) {
        return await db.hives.where('active').equals(1).toArray();
    }
    return await db.hives.toArray();
}

export async function getHiveForID(hiveId: number): Promise<Hive> {
    const hive = await db.hives.get(hiveId);
    if (!hive) throw new Error("404 - Hive not found");
    return hive;
}

export async function updateHive(hive: Hive) {
    await db.hives.put(hive);
    return hive;
}

export async function addNewHive(hive: Hive): Promise<{message: string, hive_id: string}> {
    try {
        const { hive_id, ...dataToSave } = hive; 
        const preparedData = {
            ...dataToSave,
            active: hive.active ? 1 : 0
        };
        const generatedId = await db.hives.add(preparedData as Hive); 
        
        return { 
            message: "Hive added successfully", 
            hive_id: generatedId.toString() 
        };
    } catch (error: any) {
        throw error;
    }
}

export async function updateNumBoxesForID(hiveID: number, numBoxes: number) {
    await db.hives.update(hiveID, { num_boxes: numBoxes });
    return await getHiveForID(hiveID);
}