import { Frame } from "../models";
import { db } from './db';

export async function getFramesForInspectionIDAndBoxName(
    inspectionID: number, 
    boxName: string
): Promise<Frame[]> {
    try {
        const frames = await db.frames
            .where('inspection_id')
            .equals(inspectionID)
            .filter(frame => frame.box_name === boxName)
            .toArray();
        if (!frames || frames.length === 0) {
            console.warn(`No frames found for Inspection: ${inspectionID}, Box: ${boxName}`);
        }
        return frames;
    } catch (error: any) {
        console.error("IndexedDB Fetch Error:", error);
        throw error;
    }
}

export async function addNewFrame(frame: Frame): Promise<{message: string, frame_id: string}> {
    try {
        const { frame_id, ...dataToSave } = frame; 
        const preparedData = {
            ...dataToSave,
            drawn_comb: frame.drawn_comb ? 1 : 0,
            honey: frame.honey ? 1 : 0,
            nectar: frame.nectar ? 1 : 0,
            brood: frame.brood ? 1 : 0,
            queen_cells: frame.queen_cells ? 1 : 0
        };
        const generatedId = await db.frames.add(preparedData as any); 

        return { 
            message: "Frame added successfully", 
            frame_id: generatedId.toString() 
        };
    } catch (error: any) {
        console.error("Error adding frame to IndexedDB:", error);
        throw error;
    }
}