import { getAllHives } from "./services/hiveService";
import { FilterQueenSpotted, getInspectionByWeather, getInspectionsByDateRange, getInspectionsByTempRange, getInspectionsForHiveID,  } from "./services/searchService";
import { initializeApp } from "./main";
import type { Hive, InspectionListItem } from "./models";
import { 
    clearMessages, 
    createButton, 
    createMessage, 
    makeElement, 
    createListTable,
    createInput,
    storeInspectionIds
 } from "./modules/utils";
 import { WeatherConditionsArray } from "./services/weatherService";
import { navigateTo } from "./modules/navigate";

const loading = document.getElementById("loading") as HTMLHtmlElement;
const mainElement = document.querySelector('main') as HTMLElement;
const backButton = document.getElementById('back-button') as HTMLElement;

initializeApp("Search").then(() => {
    backButton.addEventListener('click', () => navigateTo('/'));
    const ChooseHeading = makeElement("h2", null, null, "Choose a search option");
    mainElement.appendChild(ChooseHeading);
    //Search options
    const optionsButtonGroup = makeElement("section", "search-option-buttons", "search-button-group", null);
    //Hive
    const hivesButton = createButton("Hive", 'button', 'hive-button', 'button white');
    hivesButton.addEventListener('click', async () => {
        resetPage();
        hivesButton.classList.remove('white');
        hivesButton.classList.add('blue');
        await searchHives();
    });
    optionsButtonGroup.appendChild(hivesButton);
    // //Date Range
    const dateRangeButton = createButton("Date Range", "button", "date-range-button", "button white");
    dateRangeButton.addEventListener('click', async () => {
        resetPage();
        dateRangeButton.classList.remove('white');
        dateRangeButton.classList.add('blue');
        await searchDateRange();
    });
    optionsButtonGroup.appendChild(dateRangeButton);
    // //Temp Range
    const tempRangeButton = createButton("Temperature Range", "button", "temp-range-button", "button white");
    tempRangeButton.addEventListener('click', async () => {
        resetPage();
        tempRangeButton.classList.remove('white');
        tempRangeButton.classList.add('blue');
        await searchTempRange();
    });
    optionsButtonGroup.appendChild(tempRangeButton);
    //Weather condition
    const weatherConditionButton = createButton("Weather Condition", "button", "weather-condition-button", "button white");
    weatherConditionButton.addEventListener('click', async () => {
        resetPage();
        weatherConditionButton.classList.remove('white');
        weatherConditionButton.classList.add('blue');
        await searchWeatherCondition();
    });
    optionsButtonGroup.appendChild(weatherConditionButton);
    //Queen Spotted
    const queenSpottedButton = createButton("Queen Spotted", "button", "queen-spotted-button", "button white");
    queenSpottedButton.addEventListener('click', async () => {
        resetPage();
        queenSpottedButton.classList.remove('white');
        queenSpottedButton.classList.add('blue');
        await searchQueenSpotted();
    });
    optionsButtonGroup.appendChild(queenSpottedButton);
    mainElement.appendChild(optionsButtonGroup);
    loading.classList.add('hide');
    mainElement.classList.remove('hide');
});


function resetPage() {
    clearMessages();
    let elementsToRemove: string[] = ['inspection-table', 'hive-selection', 'set-date-range-form', 'set-temp-range-form', 'condition-selection', 'queen-button-row'];
    elementsToRemove.forEach(element => {
        const elementToRemove = document.getElementById(element);
        if (elementToRemove) elementToRemove.remove();
    });
    const optionsButtonGroup = document.getElementById('search-option-buttons');
    if (optionsButtonGroup) {
        const buttons = optionsButtonGroup.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.classList.contains('blue')) button.classList.remove('blue');
            if (!button.classList.contains('white')) button.classList.add('white');
        });
    }
}

async function displayInspectionsList(inspecitonsList: InspectionListItem[]) {
    clearMessages();
    const loadingText = makeElement("h3", "loading-text", null, "Loading inspections...");
    mainElement.appendChild(loadingText);
    const columnHeaders: string[] = ['hive_name', 'inspection_date', 'start_time', 'num_boxes', 'total_frames', 'has_notes'];
    const inspectionsTable = createListTable(inspecitonsList, columnHeaders, "inspection_id");
    inspectionsTable.classList.add('table-clickable');
    inspectionsTable.setAttribute('id', 'inspection-table');
    const rows = inspectionsTable.querySelectorAll('tr');
    rows.forEach(row => row.addEventListener('click', () => navigateTo('/past/inspectionDetail', { params: {sentFrom: "search", inspectionId: row.id } })));
    loadingText.remove();
    mainElement.appendChild(inspectionsTable);
}

async function searchHives() {
    try {
        const hiveSelectionSection = makeElement("section", "hive-selection", null, null);
        const loadingText = makeElement("h3", "loading-text", null, "Loading Hives...");
        hiveSelectionSection.appendChild(loadingText);
        mainElement.appendChild(hiveSelectionSection);
        const chooseHiveH3 = makeElement("h3", null, "hide", "Choose a hive:");
        hiveSelectionSection.appendChild(chooseHiveH3);
        const hives = await getAllHives(false);
        const buttonGroup = hives.reduce((acc: HTMLElement, currentHive: Hive) => {
            let hiveId: number = 0;
            if (currentHive['hive_id']) hiveId = currentHive['hive_id']
            const hiveButtonText = `${currentHive['hive_name']} ${currentHive['active'] ? '(active)' : '(not active)'}`;
            const hiveButton = createButton(hiveButtonText, "button", hiveId.toString(), "button white");
            hiveButton.addEventListener('click', async () => {
                const filteredHives = await getInspectionsForHiveID(hiveId);
                hiveSelectionSection.remove();
                if (filteredHives.length > 0) {
                    storeInspectionIds(filteredHives);
                    await displayInspectionsList(filteredHives);
                }
                createMessage(`${filteredHives.length} inspections for ${currentHive['hive_name']}`, "main-message", "info");

            })
            acc.appendChild(hiveButton);
            return acc;
        }, document.createElement("section"));
        buttonGroup.setAttribute('class', 'search-button-group');
        loadingText.remove();
        chooseHiveH3.classList.remove('hide');
        hiveSelectionSection.appendChild(buttonGroup);
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }

}

async function searchDateRange() {
    try {
        const setDateRangeForm = makeElement("form", "set-date-range-form", null, null) as HTMLFormElement;
        const formH3 = makeElement("h3", null, null, "Search dates between");
        setDateRangeForm.appendChild(formH3);
        const formRow = makeElement("section", null, "search-button-group", null);
        const startDateInput = createInput("date", 'start-date-input', null, null);
        formRow.appendChild(startDateInput);
        const and = makeElement("p", null, null, "and");
        formRow.appendChild(and);
        const endDateInput = createInput("date", 'end-date-input', null, null);
        formRow.appendChild(endDateInput);
        const submitButton = createButton("Search", "submit", "date-submit-button", "button green", "search");
        formRow.appendChild(submitButton);
        setDateRangeForm.appendChild(formRow);
        setDateRangeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData: FormData = new FormData(setDateRangeForm);
            const startDate = formData.get('start-date-input');
            const endDate = formData.get('end-date-input');
            if (startDate && endDate) {
                setDateRangeForm.remove();
                const inspectionsInDateRange = await getInspectionsByDateRange(startDate.toString(), endDate.toString());
                if (inspectionsInDateRange.length > 0) {
                    storeInspectionIds(inspectionsInDateRange);
                    displayInspectionsList(inspectionsInDateRange);
                }
                createMessage(`${inspectionsInDateRange.length} inspections between ${startDate} and ${endDate}`, "main-message", "info");
            } else {
                createMessage("Please enter a start and end date", "main-message", "error");
            }
            
        })
        mainElement.appendChild(setDateRangeForm);
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }
}

async function searchTempRange() {
    try {
        const setTempRangeForm = makeElement("form", "set-temp-range-form", null, null) as HTMLFormElement;
        const formH3 = makeElement("h3", null, null, "Search temperature between");
        setTempRangeForm.appendChild(formH3);
        const formRow = makeElement("section", null, "search-button-group", null);
        const lowestTempInput = createInput("number", 'min-temp-input', null, null);
        formRow.appendChild(lowestTempInput);
        const and = makeElement("p", null, null, "and");
        formRow.appendChild(and);
        const highestTempInput = createInput("number", 'max-temp-input', null, null);
        formRow.appendChild(highestTempInput);
        const submitButton = createButton("Search", "submit", "temp-submit-button", "button green", "search");
        formRow.appendChild(submitButton);
        setTempRangeForm.appendChild(formRow);
        setTempRangeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData: FormData = new FormData(setTempRangeForm);
            const minTemp = formData.get('min-temp-input');
            const maxTemp = formData.get('max-temp-input');
            if (minTemp && maxTemp) {
                setTempRangeForm.remove();
                const inspectionsInTempeRange = await getInspectionsByTempRange(parseInt(minTemp.toString()), parseInt(maxTemp.toString()));
                if (inspectionsInTempeRange.length > 0) {
                    storeInspectionIds(inspectionsInTempeRange);
                    displayInspectionsList(inspectionsInTempeRange);
                }
                createMessage(`${inspectionsInTempeRange.length} inspections between ${minTemp}°F and ${maxTemp}°F`, "main-message", "info");
            } else {
                createMessage("Please enter a min and max temperature", "main-message", "error");
            }
            
        })
        mainElement.appendChild(setTempRangeForm);
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }
}

async function searchWeatherCondition() {
    try {
        const conditionSelectionSection = makeElement("section", "condition-selection", "form-row", null);
        const searchH2 = makeElement("h2", null, null, "Weather Condition:");
        const conditionSelect = WeatherConditionsArray.reduce((acc: HTMLSelectElement, condition: string) => {
            const option = document.createElement("option");
            option.textContent = condition;
            option.setAttribute("value", condition);
            acc.appendChild(option);
            return acc;
        }, document.createElement('select'));
        conditionSelect.addEventListener('change', async (e) => {
            const target = e.target as HTMLSelectElement;
            const selectedCondition = target.value;
            conditionSelectionSection.remove();
            const inspectionsMatchingCondition = await getInspectionByWeather(selectedCondition);
            if (inspectionsMatchingCondition.length > 0) {
                storeInspectionIds(inspectionsMatchingCondition);
                    displayInspectionsList(inspectionsMatchingCondition);
            }
            createMessage(`${inspectionsMatchingCondition.length} inspections with weather condition ${selectedCondition}`, "main-message", "info");
        });
        const choose = document.createElement('option');
        choose.textContent = "Select a condition";
        choose.selected = true;
        conditionSelect.prepend(choose);
        conditionSelectionSection.appendChild(searchH2);
        conditionSelectionSection.appendChild(conditionSelect);
        mainElement.appendChild(conditionSelectionSection);
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }
}

async function searchQueenSpotted() {
    const queenButtonRow = makeElement("section", "queen-button-row", "button-group-row", null);
    const spotted = createButton("Queen was spotted", "button", "queen-spotted-button", "button green full");
    spotted.addEventListener('click', async () => {
        queenButtonRow.remove();
        const inspectionsWhereQueenWasSpotted = await FilterQueenSpotted(1);
        if (inspectionsWhereQueenWasSpotted.length > 0) {
            storeInspectionIds(inspectionsWhereQueenWasSpotted);
            displayInspectionsList(inspectionsWhereQueenWasSpotted);
        }
        createMessage(`${inspectionsWhereQueenWasSpotted.length} inspections where the queen was spotted`, "main-message", "info");
    });
    queenButtonRow.appendChild(spotted);
    const notSpotted = createButton("Queen wasn't spotted", "button", "queen-spotted-button", "button red full");
    notSpotted.addEventListener('click', async () => {
        queenButtonRow.remove();
        const inspectionsWhereQueenWasNotSpotted = await FilterQueenSpotted(0);
        if (inspectionsWhereQueenWasNotSpotted.length > 0) {
            storeInspectionIds(inspectionsWhereQueenWasNotSpotted);
            displayInspectionsList(inspectionsWhereQueenWasNotSpotted);
        }
        createMessage(`${inspectionsWhereQueenWasNotSpotted.length} inspections where the queen wasn't spotted`, "main-message", "info");
    });
    queenButtonRow.appendChild(notSpotted);
    mainElement.appendChild(queenButtonRow);
}