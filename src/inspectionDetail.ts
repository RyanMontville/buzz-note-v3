import { initializeApp } from "./main";
import {
    createMessage,
    createItemTable,
    makeElement,
    createButton,
    formatDateTime,
    formatDate,
    createListTable,
    createLink,
    closeModal,
    openModal
} from "./modules/utils";
import { getInspectionForId, updateInspection } from "./services/inspectionService";
import { Frame, Inspection } from "./models";
import { getAverageForId } from "./services/averageService";
import { getFramesForInspectionIDAndBoxName } from "./services/frameService";

const mainElement = document.querySelector('main') as HTMLElement;
const backButton = document.getElementById('back-button') as HTMLElement;
const loading = document.getElementById('loading') as HTMLElement;

function setBackHref(sentFrom: string, year: string | null) {
    switch (sentFrom) {
        case "search":
            backButton.setAttribute('href', "/search");
            break;
        default:
            if (year) {
                backButton.setAttribute('href', `/past/?year=${year}`);
            } else {
                backButton.setAttribute('href', '/past/');
            }
            break;
    }
}

async function submitData(formData: FormData, inspeciton: Inspection) {
    try {
        const updatedNotes = formData.get('textAreaInput');
        if (updatedNotes === null || updatedNotes.toString().trim() === "") {
            throw new Error("Please do not leave the notes empty");
        }
        const now = new Date();
        const formatedDateTime = formatDateTime(now);
        inspeciton['notes'] = updatedNotes.toString();
        inspeciton['last_updated'] = formatedDateTime;
        const response = await updateInspection(inspeciton);
        displayNotes(response);
        createMessage("Updated notes successfully.", "main-message", "check_circle");
    } catch (error: any) {
        createMessage(error, 'edit-message', 'error');
    }
    closeModal('notes-backdrop');
}

function displayNotes(inspeciton: Inspection) {
    let inspecitonHasNotes: boolean = false;
    const editNotesForm = document.getElementById('edit-notes-form');
    if (editNotesForm) editNotesForm.remove();
    const previousNotes = document.getElementById('notes-display');
    if (previousNotes) previousNotes.remove();
    const notesDiv = makeElement("div", 'notes-display', null, null);
    if (!inspeciton['notes'] || inspeciton['notes'].toString().trim() === "") {
        const notesHeading = makeElement("h2", null, null, "No Notes");
        notesDiv.appendChild(notesHeading);
    } else {
        inspecitonHasNotes = true;
        const notesHeading = makeElement("h2", null, null, "Notes");
        notesDiv.appendChild(notesHeading);
        const notesP = document.createElement('p');
        notesP.innerHTML = inspeciton['notes'].replace(/\n/g, "<br/>");
        notesDiv.appendChild(notesP);
    }
    if (inspeciton['last_updated']) {
        const lastUpdatedP = document.createElement('p');
        const updatedKey = makeElement('b', null, null, "Last Updated: ");
        lastUpdatedP.appendChild(updatedKey);
        const updatedValue = makeElement('span', null, null, formatDate(inspeciton['last_updated'].toString()));
        lastUpdatedP.appendChild(updatedValue);
        notesDiv.appendChild(lastUpdatedP);
    }
    if (inspecitonHasNotes) {
        const editNotesButton = createButton("Edit Notes", 'button', 'edit-button', 'button white', "edit");
        editNotesButton.addEventListener('click', () => displayEditNotesForm(inspeciton, inspecitonHasNotes));
        notesDiv.appendChild(editNotesButton);
    } else {
        const addNotesButton = createButton("Add Notes", 'button', 'edit-button', 'button white', "add");
        addNotesButton.addEventListener('click', () => displayEditNotesForm(inspeciton, inspecitonHasNotes));
        notesDiv.appendChild(addNotesButton);
    }
    mainElement.appendChild(notesDiv);
}

function displayEditNotesForm(inspeciton: Inspection, inspecitonHasNotes: boolean) {
    const notesBackdrop = document.getElementById('notes-backdrop') as HTMLElement;
    const notesModal = document.getElementById('notes-modal') as HTMLFormElement;
    notesModal.innerHTML = '';
    let formHeading = makeElement("h2", null, null, null);
    if (inspecitonHasNotes) {
        formHeading.textContent = "Edit Notes:"
    } else {
        formHeading.textContent = "Add Notes:"
    }
    notesModal.appendChild(formHeading);
    const textAreaInput: HTMLTextAreaElement = document.createElement('textarea');
    textAreaInput.id = 'textAreaInput';
    textAreaInput.name = 'textAreaInput';
    textAreaInput.value = inspeciton['notes'];
    notesModal.appendChild(textAreaInput);
    const actionButtonRow = makeElement("section", null, "button-group-row", null);
    const closeButton = createButton("Close", "button", "close-button", "button red");
    closeButton.addEventListener('click', () => closeModal('notes-backdrop'));
    actionButtonRow.appendChild(closeButton);
    const submitButton = createButton("Submit", "submit", "submit-button", "button green");
    actionButtonRow.appendChild(submitButton);
    notesModal.appendChild(actionButtonRow);
    notesModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData: FormData = new FormData(notesModal);
        await submitData(formData, inspeciton);
    });
    openModal(notesBackdrop, notesModal, "textAreaInput");
}

function getVisualClassesForFrameType(frame: Frame): string {
    if (frame.brood) {
        return "brood";
    } else if (frame.honey || frame.nectar) {
        return "honey";
    } else if (frame.drawn_comb) {
        return "draw-comb";
    } else {
        return "none";
    }
}

function makeLegendKey(frameType: string) {
    const newKeyDiv = makeElement("label", null, null, null);
    const keyDot = makeElement("span", null, frameType, null);
    newKeyDiv.appendChild(keyDot);
    const keyText = makeElement("p", null, null, frameType);
    newKeyDiv.appendChild(keyText);
    return newKeyDiv;
}

function makeLinkHref(id: number, sentFrom: string | null, year: string | null) {
    if (sentFrom && year) {
        return `inspectionDetail?sentFrom=${sentFrom}&year=${year}&inspectionId=${id}`;
    } else if (sentFrom) {
        return `inspectionDetail?sentFrom=${sentFrom}&inspectionId=${id}`;
    }
    return `inspectionDetail?inspectionId=${id}`;

}

initializeApp("Loading").then(async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const idString = urlParams.get('inspectionId');
        const sentFrom = urlParams.get('sentFrom');
        const year = urlParams.get('year');
        if (sentFrom && year) {
            setBackHref(sentFrom, year);
        } else if (sentFrom) {
            setBackHref(sentFrom, null);
        }
        if (idString) {
            const inspectionId = parseInt(idString);
            const inspeciton = await getInspectionForId(inspectionId);
            document.title = `${formatDate(inspeciton['inspection_date'])} - Buzznote`;
            //Create the inspectino header including previous and next buttons
            const inspecitonIdArrayString = sessionStorage.getItem("inspectionIds");
            const inspecitonHeader = makeElement("section", "inspection-header", null, null);
            const inspectionHeading = makeElement("h2", null, null, `${inspeciton['hive_name']} | ${formatDate(inspeciton['inspection_date'])} | ${inspeciton['start_time']}`);
            inspecitonHeader.appendChild(inspectionHeading);
            if (inspecitonIdArrayString) {
                const inspecitonIdArray: number[] = JSON.parse(inspecitonIdArrayString);
                const currentIndex = inspecitonIdArray.findIndex(currID =>
                    currID.toString() === idString
                );
                if (currentIndex > 0) {
                    const previousLink = makeLinkHref(inspecitonIdArray[currentIndex - 1], sentFrom, year)
                    const previousButton = createLink("Previous", previousLink, false, "button white", null);
                    previousButton.setAttribute("id", "previous-button");
                    inspecitonHeader.appendChild(previousButton);

                }
                if (currentIndex < inspecitonIdArray.length - 1) {
                    const nextLink = makeLinkHref(inspecitonIdArray[currentIndex + 1], sentFrom, year);
                    const nextButton = createLink("Next", nextLink, false, "button white", null);
                    nextButton.setAttribute("id", "next-button");
                    inspecitonHeader.appendChild(nextButton);
                }
            }
            mainElement.appendChild(inspecitonHeader);
            //Display the inspection details
            const inspectionColumnHeaders: string[] = [
                'weather',
                'bee_population',
                'drone_population',
                'laying_pattern',
                'hive_beetles',
                'other_pests',
                'brood'
            ]
            const overviewTable = createItemTable(inspeciton, inspectionColumnHeaders, 'inspection_id');
            mainElement.appendChild(overviewTable);
            const averages = await getAverageForId(parseInt(idString));
            if (averages) {
                //Display averages (accordian with all frames)
                const averagesHeading = makeElement("h2", null, null, "Box Averages");
                mainElement.appendChild(averagesHeading);

                const averagesColumnHeaders = ['box_name', 'num_frames', 'honey', 'nectar', 'brood', 'queen_cells', 'drawn_comb', 'queen_spotted', 'expand'];
                for (const currentAverage of averages) {
                    const newAverageTable = createItemTable(currentAverage, averagesColumnHeaders, 'average_id');
                    mainElement.appendChild(newAverageTable);

                    const frames: Frame[] = await getFramesForInspectionIDAndBoxName(
                        parseInt(idString),
                        currentAverage['box_name']
                    );

                    const framesColumnHeaders: string[] = ['frame_number', 'honey', 'nectar', 'brood', 'queen_cells', 'drawn_comb']
                    const framesTable = createListTable(frames, framesColumnHeaders, 'frame_id');
                    mainElement.appendChild(framesTable);
                    framesTable.classList.add('hide');
                    // mainElement.appendChild(framesTable);
                    const expandButton = newAverageTable.querySelector('button') as HTMLElement;
                    expandButton.addEventListener('click', () => {
                        console.log(`Expand button for ${currentAverage['box_name']} clicked - ${currentAverage['showFrames']}`)
                        // Toggle all frames table using the 'frames' array
                        framesTable.classList.toggle('hide');
                        if (currentAverage['showFrames'] === true) {
                            currentAverage['showFrames'] = false;
                            expandButton.textContent = "expand_all";
                        } else {
                            currentAverage['showFrames'] = true;
                            expandButton.textContent = "collapse_all";
                        }
                    });

                    const boxContainer = makeElement("div", null, "box-container", null);
                    frames.forEach(frame => {
                        const classesForFrame: string = `frame-container ${getVisualClassesForFrameType(frame)}`;
                        const frameContainer = makeElement("div", null, classesForFrame, null);
                        const containerText = `${frame['frame_number']} ${currentAverage['queen_spotted'] === frame['frame_number'] ? 'Queen Spotted ' : ''} ${frame.queen_cells ? 'Queen Cells' : ''}`;
                        const containerP = makeElement("p", null, "frame-text", containerText);
                        frameContainer.appendChild(containerP);
                        boxContainer.appendChild(frameContainer);
                    });
                    mainElement.appendChild(boxContainer);
                }
                const visualFieldset = makeElement("fieldset", "visual-legend", null, null);
                const legendTitle = makeElement("legend", null, null, "Legend");
                visualFieldset.appendChild(legendTitle);
                const honeyKey = makeLegendKey("honey");
                visualFieldset.appendChild(honeyKey);
                const nectarKey = makeLegendKey("nectar");
                visualFieldset.appendChild(nectarKey);
                const drawKey = makeLegendKey("draw-comb");
                visualFieldset.appendChild(drawKey);
                const broodKey = makeLegendKey("brood");
                visualFieldset.appendChild(broodKey);
                const noneKey = makeLegendKey("none");
                visualFieldset.appendChild(noneKey);
                mainElement.appendChild(visualFieldset);
            } else {
                const noFrames = makeElement("h2", "no-frames", null, "No frames recorded");
                mainElement.appendChild(noFrames);
            }
            //Display notes
            displayNotes(inspeciton);
            mainElement.classList.remove('hide');
            loading.classList.add('hide');
        } else {
            throw new Error("Could not load inspection details. Please return to the previous page and try again");
        }
    } catch (error: any) {
        createMessage(error, 'main-message', 'error');
        loading.classList.add('hide');
    }

})