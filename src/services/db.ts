import Dexie, { type Table } from 'dexie';
import { 
    Frame, 
    Inspection, 
    Average, 
    Hive, 
    Box, 
    type UserLocation} from '../models';


export class DemoDatabase extends Dexie {
  hives!: Table<Hive>;
  inspections!: Table<Inspection>;
  boxes!: Table<Box>;
  averages!: Table<Average>;
  frames!: Table<Frame>;
  locations!: Table<UserLocation>;

  constructor() {
    super('BuzzNote');
    this.version(1).stores({
      hives: '++hive_id, active',
      inspections: '++inspection_id, hive_id, weather_condition, queen_spotted, weather_temp, inspection_date',
      boxes: '++box_id, hive_id, active',
      averages: '++average_id, inspection_id',
      frames: '++frame_id, inspection_id, box_id', 
      locations: '++id, timestamp'
    });
    this.hives.mapToClass(Hive);
    this.inspections.mapToClass(Inspection);
    this.boxes.mapToClass(Box);
    this.averages.mapToClass(Average);
    this.frames.mapToClass(Frame);
  }
}

export const db = new DemoDatabase();