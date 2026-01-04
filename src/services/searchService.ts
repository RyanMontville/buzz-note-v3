import { Inspection, InspectionListItem } from "../models";
import { db } from './db';

async function singleSearch(keyName: string, id: number | string) {
    let inspections: Inspection[] = [];
    switch (keyName) {
        case "hive_id":
        case "weather_condition":
            inspections = await db.inspections.where(keyName).equals(id).toArray();
            break;
        case "queen_spotted":
            inspections = await db.inspections.where('queen_spotted').equals(id).toArray();
            break;
        default:
            break;
    }

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

async function rangeSearch(keyName: string, min: number | string, max: number | string) {
    let inspections: Inspection[] = [];
    switch (keyName) {
        case "weather_temp":
            inspections = await db.inspections.where(keyName).between(min, max).toArray();
            break;
        case "inspection_date":
            inspections = await db.inspections
                .where('inspection_date')
                .between(min, max, true, true)
                .reverse() // Newest first
                .toArray();
            break;
        default:
            break;
    }

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

export async function getInspectionsForHiveID(hiveID: number): Promise<InspectionListItem[]> {
    return await singleSearch('hive_id', hiveID);
}

export async function getInspectionsByDateRange(startDate: string, endDate: string): Promise<InspectionListItem[]> {
    return rangeSearch("inspection_date", startDate, endDate);
}

export async function getInspectionsByTempRange(minTemp: number, maxTemp: number): Promise<InspectionListItem[]> {
    return await rangeSearch("weather_temp", minTemp, maxTemp);
}

export async function getInspectionByWeather(condition: string): Promise<InspectionListItem[]> {
    return await singleSearch('weather_condition', condition);
}

export async function FilterQueenSpotted(queenSpotted: number): Promise<InspectionListItem[]> {
    return singleSearch("queen_spotted", queenSpotted);
}