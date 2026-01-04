import { Inspection, InspectionListItem } from "../models";
import { db } from './db';

export async function getListOfInspections(): Promise<InspectionListItem[]> {
    const inspections = await db.inspections.reverse().toArray();
    
    const listItems = await Promise.all(inspections.map(async (ins) => {
        const averages = await db.averages
            .where('inspection_id')
            .equals(ins.inspection_id!)
            .toArray();
        const numBoxes = averages.length;
        const totalFrames = averages.reduce((sum, avg) => sum + (avg.num_frames || 0), 0);
        return new InspectionListItem(
            ins.inspection_id!,
            ins.hive_name,
            ins.inspection_date,
            ins.start_time,
            numBoxes,
            totalFrames,
            ins.notes.length > 0
        );
    }));

    return listItems;
}

export async function getInspectionForId(inspectionId: number): Promise<Inspection> {
    const inspection = await db.inspections.get(inspectionId);
    if (!inspection) throw new Error("404 - Inspection not found");
    return inspection;
}

export async function createInspection(inspection: Inspection): Promise<{message: string, inspection_id: string}> {
    const { inspection_id, ...dataToSave } = inspection;
    const preparedData = {
        ...dataToSave,
        brood_eggs: inspection.brood_eggs ? 1 : 0,
        brood_larva: inspection.brood_larva ? 1 : 0,
        brood_capped: inspection.brood_capped ? 1 : 0,
        queen_spotted: inspection.queen_spotted ? 1 : 0,
    };

    const id = await db.inspections.add(preparedData as any);
    return { message: "Created successfully", inspection_id: id.toString() };
}

export async function updateInspection(inspection: Inspection): Promise<Inspection> {
    if (!inspection.inspection_id) throw new Error("Missing Inspection ID");
    const dataToUpdate = { ...inspection } as any;
    dataToUpdate.brood_eggs = inspection.brood_eggs ? 1 : 0;
    dataToUpdate.brood_larva = inspection.brood_larva ? 1 : 0;
    dataToUpdate.brood_capped = inspection.brood_capped ? 1 : 0;
    dataToUpdate.queen_spotted = inspection.queen_spotted ? 1 : 0;

    await db.inspections.put(dataToUpdate);
    return inspection;
}