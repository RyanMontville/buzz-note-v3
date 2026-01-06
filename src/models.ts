export class Inspection {
    public inspection_id?: number;
    public hive_id: number;
    public inspection_date: string;
    public hive_name: string;
    public start_time: string;
    public weather_temp: number;
    public weather_condition: string;
    public bee_temperament: string;
    public bee_population: string;
    public drone_population: string;
    public laying_pattern: string;
    public hive_beetles: string;
    public other_pests: string;
    public brood_eggs: boolean;
    public brood_larva: boolean;
    public brood_capped: boolean;
    public queen_spotted: boolean;
    public notes: string;
    public last_updated: string;

    constructor(
        hive_id: number,
        inspection_date: string,
        hive_name: string,
        start_time: string,
        weather_temp: number,
        weather_condition: string,
        bee_temperament: string,
        bee_population: string,
        drone_population: string,
        laying_pattern: string,
        hive_beetles: string,
        other_pests: string,
        brood_eggs: boolean | number,
        brood_larva: boolean | number,
        brood_capped: boolean | number,
        queen_spotted: boolean | number,
        notes: string,
        last_updated: string,
        inspection_id?: number
    ) {
        this.inspection_id = inspection_id;
        this.hive_id = hive_id;
        this.inspection_date = inspection_date;
        this.hive_name = hive_name;
        this.start_time = start_time;
        this.weather_temp = weather_temp;
        this.weather_condition = weather_condition;
        this.bee_temperament = bee_temperament;
        this.bee_population = bee_population;
        this.drone_population = drone_population;
        this.laying_pattern = laying_pattern;
        this.hive_beetles = hive_beetles;
        this.other_pests = other_pests;
        this.brood_eggs = !!brood_eggs;
        this.brood_larva = !!brood_larva;
        this.brood_capped = !!brood_capped;
        this.queen_spotted = !!queen_spotted;
        this.notes = notes;
        this.last_updated = last_updated;
    }
}

export class InspectionListItem {
    public inspection_id: number;
    public hive_name: string;
    public inspection_date: string;
    public start_time: string;
    public num_boxes: number;
    public total_frames: number;
    public has_notes: boolean;

    constructor(
        inspection_id: number,
        hive_name: string,
        inspection_date: string,
        start_time: string,
        num_boxes: number,
        total_frames: number,
        has_notes: boolean
    ) {
        this.inspection_id = inspection_id;
        this.hive_name = hive_name;
        this.inspection_date = inspection_date;
        this.start_time = start_time;
        this.num_boxes = num_boxes;
        this.total_frames = total_frames;
        this.has_notes = has_notes;
    }
}

export class Average {
    public average_id?: number;
    public inspection_id: number;
    public box_name: string;
    public num_frames: number;
    public honey: string;
    public nectar: string;
    public brood: string;
    public queen_cells: string;
    public drawn_comb: string;
    public queen_spotted: string;

    constructor(
        inspection_id: number,
        box_name: string,
        num_frames: number,
        honey: string,
        nectar: string,
        brood: string,
        queen_cells: string,
        drawn_comb: string,
        queen_spotted: string,
        average_id?: number
    ) {
        this.average_id = average_id;
        this.inspection_id = inspection_id;
        this.box_name = box_name;
        this.num_frames = num_frames;
        this.honey = honey;
        this.nectar = nectar;
        this.brood = brood;
        this.queen_cells = queen_cells;
        this.drawn_comb = drawn_comb;
        this.queen_spotted = queen_spotted;
    }
}

export class AverageDetail extends Average {
    public showFrames: boolean = false;
}


export class Hive {
    public hive_id?: number;
    public hive_name: string;
    public num_boxes: number;
    public active: number;

    constructor(
        hive_name: string,
        num_boxes: number,
        active: boolean | number = 1,
        hive_id?: number
    ) {
        this.hive_id = hive_id;
        this.hive_name = hive_name;
        this.num_boxes = num_boxes;
        this.active = active ? 1 : 0;
    }
}

export class Box {
    public box_id?: number;
    public hive_id: number;
    public box_name: string;
    public num_frames: number;
    public box_type: string;
    public overwinter: boolean;
    public active: boolean;
    constructor(
        box_id: number,
        hive_id: number,
        box_name: string,
        num_frames: number,
        box_type: string,
        overwinter: boolean,
        active: boolean
    ) {
        this.box_id = box_id;
        this.hive_id = hive_id;
        this.box_name = box_name;
        this.num_frames = num_frames;
        this.box_type = box_type;
        this.overwinter = overwinter;
        this.active = active;
    }
}

export class TempAndCondition {
    public temp: number;
    public condition: string;
    constructor(
        temp: number,
        condition: string
    ) {
        this.temp = temp;
        this.condition = condition;
    }
}

export class Frame {
    public frame_id?: number;
    public box_id: number;
    public inspection_id: number;
    public box_name: string;
    public frame_number: string;
    public drawn_comb: boolean;
    public honey: boolean;
    public nectar: boolean;
    public brood: boolean;
    public queen_cells: boolean;

    constructor(
        box_id: number,
        inspection_id: number,
        box_name: string,
        frame_number: string,
        drawn_comb: boolean | number,
        honey: boolean | number,
        nectar: boolean | number,
        brood: boolean | number,
        queen_cells: boolean | number,
        frame_id?: number
    ) {
        this.frame_id = frame_id;
        this.box_id = box_id;
        this.inspection_id = inspection_id;
        this.box_name = box_name;
        this.frame_number = frame_number;
        this.drawn_comb = !!drawn_comb;
        this.honey = !!honey;
        this.nectar = !!nectar;
        this.brood = !!brood;
        this.queen_cells = !!queen_cells;
    }
}

export class FrameFormGroup {
    public box_id: number;
    public frame_number: number;
    public honey: FramePair;
    public nectar: FramePair;
    public brood: FramePair;
    public queen_spotted: FramePair;
    public queen_cells: FramePair;
    public drawn_comb: FramePair;
    public recorded: boolean = false;
    constructor(
        box_id: number,
        frame_number: number,
        honey: FramePair,
        nectar: FramePair,
        brood: FramePair,
        queen_spotted: FramePair,
        queen_cells: FramePair,
        drawn_comb: FramePair,
        recorded: boolean
    ) {
        this.box_id = box_id;
        this.frame_number = frame_number;
        this.honey = honey;
        this.nectar = nectar;
        this.brood = brood;
        this.queen_spotted = queen_spotted;
        this.queen_cells = queen_cells;
        this.drawn_comb = drawn_comb;
        this.recorded = recorded;
    }
}

export class FramePair {
    public sideA: boolean;
    public sideB: boolean;
    constructor(
        sideA: boolean,
        sideB: boolean
    ) {
        this.sideA = sideA;
        this.sideB = sideB;
    }
}

export interface RadioGroupConfig {
    label: string;
    options: string[];
    colors: string[];
}

export class Message {
    public message: string;
    public messageContainer: string
    public icon: string;
    constructor(
        message: string,
        messageContainer: string,
        icon: string
    ) {
        this.message = message;
        this.messageContainer = messageContainer;
        this.icon = icon;
    }
}

export interface BoxGroup {
    boxInfo: Box;
    frames: FrameFormGroup[];
    recorded: boolean;
}

export interface UserLocation {
    id: number;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy: number;
}