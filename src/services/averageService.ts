import { Average, AverageDetail } from "../models";
import { db } from './db';

export async function getAverageForId(inspectionId: number): Promise<AverageDetail[] | null> {
    try {
        const results = await db.averages
            .where('inspection_id')
            .equals(inspectionId)
            .toArray();

        if (results.length === 0) {
            return null;
        }
        return results.map(item => {
            const detail = new AverageDetail(
                item.inspection_id,
                item.box_name,
                item.num_frames,
                item.honey,
                item.nectar,
                item.brood,
                item.queen_cells,
                item.drawn_comb,
                item.queen_spotted,
                item.average_id
            );
            return detail;
        });
    } catch (error: any) {
        console.error("Error fetching averages:", error);
        throw error;
    }
}

export async function addAverage(newAverage: Average): Promise<{message: string, average_id: string}> {
    try {
        const { average_id, ...dataToSave } = newAverage;
        const generatedId = await db.averages.add(dataToSave as any);

        return {
            message: "Average added successfully",
            average_id: generatedId.toString()
        };
    } catch (error: any) {
        console.error("Error adding average:", error);
        throw error;
    }
}