import { initializeApp } from "./main";
import { getListOfInspections } from "./services/inspectionService";
import type { InspectionListItem } from "./models";
import {
    createButton,
    createMessage,
    createListTable,
    storeInspectionIds
} from "./modules/utils";
import { navigateTo } from "./modules/navigate";

const mainElement = document.querySelector('main') as HTMLElement;
const loading = document.getElementById('loading') as HTMLElement;
const backButton = document.getElementById("back-button") as HTMLElement;
let inspections: InspectionListItem[] | null = null;
let yearsList: string[] = [];

initializeApp("Past Inspections").then(async () => {
    try {
        backButton.addEventListener('click', () => navigateTo('/'));
        const urlParams = new URLSearchParams(window.location.search);
        const year = urlParams.get('year');
        inspections = await getListOfInspections();
        if (inspections) storeInspectionIds(inspections);
        getYears();
        if (year) {
            displayInspections(year);
        } else {
            displayInspections(yearsList[yearsList.length - 1]);
        }
        loading.classList.add('hide');
    } catch (error: any) {
        loading.classList.add('hide');
        createMessage(error, 'main-message', 'error');
    }
    mainElement.classList.remove('hide');
});

function getYear(date: string): string {
    return date.split("-")[0];
}

function getYears() {
    if (inspections) {
        const years: string[] = inspections.reduce((acc: string[], currentInspection: InspectionListItem) => {
            const yearForCurrentInspection = getYear(currentInspection['inspection_date']);
            if (!acc.includes(yearForCurrentInspection)) {
                acc.push(yearForCurrentInspection);
            }
            return acc;
        }, [] as string[]);
        yearsList = years.reverse();
    }
}

function loadYearSelector(year: string) {
    const yearSelector = yearsList.reduce((acc: HTMLElement, currentYear: string) => {
        const yearButton = createButton(currentYear, "button", currentYear, "button white");
        if (year === currentYear) {
            yearButton.classList.remove('white');
            yearButton.classList.add('blue');
        }
        yearButton.addEventListener('click', () => {
            displayInspections(currentYear);
        });
        acc.appendChild(yearButton);
        return acc;
    }, document.createElement('section'));
    yearSelector.setAttribute('class', "button-group-row");
    yearSelector.setAttribute('id', "year-selector");
    mainElement.appendChild(yearSelector);
}

function filterInspectionsForYear(year: string) {
    if (inspections) {
        return inspections.filter(inspeciton => getYear(inspeciton['inspection_date']) === year);
    }
}

function displayInspections(year: string) {
    mainElement.innerHTML = '';
    loadYearSelector(year);
    const inspectionsToShow = filterInspectionsForYear(year);
    const columnHeaders: string[] = ['inspection_date', 'hive_name', 'start_time', 'num_boxes', 'total_frames'];
    if (inspectionsToShow) {
        const inspectionsTable = createListTable(inspectionsToShow, columnHeaders, "inspection_id");
        inspectionsTable.classList.add('table-clickable');
        const rows = inspectionsTable.querySelectorAll('tr');
        rows.forEach(row => row.addEventListener('click', () => navigateTo('/past/inspectionDetail', { params: {sentFrom: "past", year: year, inspectionId: row.id} })));
        mainElement.appendChild(inspectionsTable);
    }
}