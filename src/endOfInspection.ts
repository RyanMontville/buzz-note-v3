import { initializeApp } from "./main";
import { Inspection, type Average, type Frame, type RadioGroupConfig, type TempAndCondition } from "./models";
import { clearMessages, createButton, createCheckbox, createItemTable, createListTable, createMessage, createRadioGroup, makeElement, storeMessage } from "./modules/utils";
import { addAverage } from "./services/averageService";
import { addNewFrame } from "./services/frameService";
import { createInspection } from "./services/inspectionService";

const loading = document.getElementById('loading') as HTMLElement;
const mainElement = document.querySelector('main') as HTMLElement;

initializeApp("End of Inspection").then(() => {
    try {
        const date = sessionStorage.getItem('date');
        const time = sessionStorage.getItem('time');
        const hiveIdString = sessionStorage.getItem('hiveId');
        const hiveName = sessionStorage.getItem('hiveName');
        const weatherString = sessionStorage.getItem('weather');
        const averagesString = sessionStorage.getItem('averages');
        const framesString = sessionStorage.getItem('frames');
        if (date && time && hiveIdString && hiveName && weatherString && averagesString && framesString) {
            const hiveId: number = JSON.parse(hiveIdString);
            const weather: TempAndCondition = JSON.parse(weatherString);
            const averages = JSON.parse(averagesString);
            const newInspection: Inspection = new Inspection(
                hiveId,
                date,
                hiveName,
                time,
                weather['temp'],
                weather['condition'],
                "",
                "",
                "",
                "",
                "",
                "",
                false,
                false,
                false,
                false,
                "",
                ""
            );
            averages.forEach((average: Average) => {
                if (average['queen_spotted'] !== "Not Spotted") {
                    newInspection['queen_spotted'] = true;
                }
            });
            loadEndOfInspectionForm(newInspection);
            loading.classList.add('hide');
            mainElement.classList.remove('hide');
        } else {
            mainElement.classList.add('hide');
            throw new Error("Inspection data is missing. Please start the inspection over");
        }
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }
});

function submitEndOfInspectionData(formData: FormData, inspection: Inspection) {
    clearMessages();
    let updatedInspection = inspection;
    const keys = ["bee-temperament", "bee-population", "drone-population", "laying-pattern", "hive-beetles", "other-pests"];
    let errorValues: string[] = [];
    keys.forEach(key => {
        const value = formData.get(key);
        const readableKey = key.split('-')
            .map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(" ");
        if (value === null) {
            errorValues.push(readableKey);
        } else {
            (inspection as any)[key.replace("-", "_")] = value;
        }
    });
    const broodEggsValue = formData.get('brood-eggs');
    if (broodEggsValue) updatedInspection['brood_eggs'] = true;
    const broodLarvaValue = formData.get('brood-larva');
    if (broodLarvaValue) updatedInspection['brood_larva'] = true;
    const broodCappedValue = formData.get('brood-capped');
    if (broodCappedValue) updatedInspection['brood_capped'] = true;

    if (errorValues.length > 0) {
        const message = `The following values need to be set: ` + errorValues.join(", ");
        createMessage(message, "main-message", "error");
        return;
    }
    reviewData(updatedInspection);
    const endForm = document.getElementById('end-form');
    if (endForm) endForm.remove();
}

function loadEndOfInspectionForm(inspection: Inspection) {
    const endForm = makeElement("form", "end-form", null, null) as HTMLFormElement;
    const radioGroups: RadioGroupConfig[] = [
        { label: "Bee Temperament", options: ["Calm", "Nervous", "Angry", "Crazy"], colors: ["green", "yellow", "orange", "red"] },
        { label: "Bee Population", options: ["Low", "Normal", "Crowded"], colors: ["yellow", "green", "yellow"] },
        { label: "Drone Population", options: ["Low", "Normal", "Crowded"], colors: ["yellow", "green", "yellow"] },
        { label: "Laying Pattern", options: ["Good", "Spotty"], colors: ["green", "yellow"] },
        { label: "Hive Beetles", options: ["None", "Few", "Lots"], colors: ["green", "yellow", "red"] },
        { label: "Other Pests", options: ["None", "Few", "Lots"], colors: ["green", "yellow", "red"] },
    ];
    radioGroups.forEach(group => {
        endForm.appendChild(createRadioGroup(group.label, group.options, group.colors));
    });
    const broodRow = makeElement("div", null, "button-group-row", null);
    const broodTypes = ["Eggs", "Larva", "Capped"];
    broodTypes.forEach(type => {
        const checkbox = createCheckbox(`Brood ${type}`, `Brood ${type}`, `brood-${type.toLowerCase()}`, false, true);
        broodRow.appendChild(checkbox);
    });
    endForm.appendChild(broodRow);
    const submitButton = createButton("Submit", "submit", "submit-button", "button green");
    endForm.appendChild(submitButton);

    endForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(endForm);
        submitEndOfInspectionData(formData, inspection);
    });
    mainElement.appendChild(endForm);
}

function reviewData(inspection: Inspection) {
    const averagesString = sessionStorage.getItem('averages');
    const framesString = sessionStorage.getItem('frames');
    if (averagesString && framesString) {
        const averages = JSON.parse(averagesString);
        const frames: Frame[] = JSON.parse(framesString);
        const pageHeading = makeElement("H2", null, null, "Data Review");
        mainElement.appendChild(pageHeading);
        const inspectionColumnHeaders: string[] = [
            'weather',
            'bee_population',
            'drone_population',
            'laying_pattern',
            'hive_beetles',
            'other_pests',
            'brood'
        ]
        const overviewTable = createItemTable(inspection, inspectionColumnHeaders, 'inspection_id');
        mainElement.appendChild(overviewTable);
        const averagesColumnHeaders = ['box_name', 'num_frames', 'honey', 'nectar', 'brood', 'queen_cells', 'drawn_comb', 'queen_spotted'];
        const averagesTable = createListTable(averages, averagesColumnHeaders, 'average_id');
        mainElement.appendChild(averagesTable);
        const sendInspectionDataButton = createButton("Send data to database", "button", "send-data", "button green");
        sendInspectionDataButton.addEventListener("click", async () => await sendData(frames, averages, inspection));
        mainElement.appendChild(sendInspectionDataButton);
    }
}

async function sendData(frames: Frame[], averages: Average[], inspeciton: Inspection) {
    try {
        loading.classList.remove('hide');
        mainElement.innerHTML = '';
        const startSendingP = makeElement("h2", null, null, "Sending data to database. Please do not leave this page.");
        mainElement.appendChild(startSendingP);
        const inspectionRespose = await createInspection(inspeciton);
        const createInspectionResponseP = makeElement("p", null, null, inspectionRespose['message']);
        mainElement.prepend(createInspectionResponseP);
        const submittingFramesP = makeElement("p", null, null, "Starting to send frames");
        mainElement.prepend(submittingFramesP);
        const inspection_id = inspectionRespose['inspection_id'];
        let numFramesSubmitted = 0;
        frames.forEach(async frame => {
            const oldP = document.getElementById('frame-num-added');
            frame['inspection_id'] = parseInt(inspection_id);
            await addNewFrame(frame);
            numFramesSubmitted += 1
            const addedFrameP = makeElement("p", "frame-num-added", null, `Submitted frames: ${numFramesSubmitted}`);
            if (oldP) {
                mainElement.replaceChild(addedFrameP, oldP);
            } else {
                mainElement.prepend(addedFrameP);
            }
        });
        const allFramesSubmittedP = makeElement("p", null, null, "All frames submitted");
        mainElement.prepend(allFramesSubmittedP);
        const submittingAveragesP = makeElement("p", null, null, "Submitting averages");
        mainElement.prepend(submittingAveragesP);
        let numAveragesSubmitted = 0;
        averages.forEach(async average => {
            const oldAP = document.getElementById("average-num-added");
            average['inspection_id'] = parseInt(inspection_id);
            await addAverage(average);
            numAveragesSubmitted += 1;
            const addedAverageP = makeElement("p", "average-num-added", null, `Added average #${numAveragesSubmitted}`);
            if (oldAP) {
                mainElement.replaceChild(addedAverageP, oldAP);
            } else {
                mainElement.prepend(addedAverageP);
            }
        });
        const doneP = makeElement("p", null, null, "All data submitted to database");
        mainElement.prepend(doneP);
        sessionStorage.removeItem('date');
        sessionStorage.removeItem('time');
        sessionStorage.removeItem('hiveId');
        sessionStorage.removeItem('hiveName');
        sessionStorage.removeItem('weather');
        sessionStorage.removeItem('averages');
        sessionStorage.removeItem('frames');
        storeMessage("All data submitted to database", "main-message", "check_circle");
        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
    } catch (error: any) {
        throw error;
    }
}