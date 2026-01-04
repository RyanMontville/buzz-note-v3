import type { Box } from "../models";
import { db } from './db';

export async function getBoxesForHiveID(hiveID: number, active: boolean): Promise<Box[]> {
  const query = db.boxes.where('hive_id').equals(hiveID);
  if (active) {
    return await query.and(box => box.active === true).toArray();
  }
  return await query.toArray();
}

export async function getBoxForBoxId(boxId: number) {
  const box = await db.boxes.get(boxId);
  if (!box) throw new Error("404 - box not found");
  return box;
}

export async function addBox(box: Box): Promise<{ message: string, box_id: string }> {
  try {
    const { box_id, ...dataToSave } = box;
    const generatedId = await db.boxes.add(dataToSave);
    return { 
            message: "Box added successfully", 
            box_id: generatedId.toString() 
        };
  } catch (error: any) {
    throw error;
  }
}

export async function updateBox(boxId: number, box: Box) {
  try {
    const { box_id, ...updates } = box;
    const updatedCount = await db.boxes.update(boxId, updates);

    if (updatedCount === 0) {
        throw new Error(`Box with ID ${boxId} not found.`);
    }

    return await db.boxes.get(boxId);
  } catch (error) {
    console.error("Failed to update box:", error);
    throw error;
  }
}