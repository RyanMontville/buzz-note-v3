import { initializeApp } from "./main";
import type { Box, Hive } from "./models";
import { navigateTo } from "./modules/navigate";
import { closeModal, createButton, createCheckbox, createInput, createListTable, createMessage, createRowForListTable, makeElement, openModal, storeMessage } from "./modules/utils";
import { addBox, getBoxesForHiveID, getBoxForBoxId, updateBox } from "./services/boxService";
import { getHiveForID, updateHive } from "./services/hiveService";

const loading = document.getElementById("loading") as HTMLHtmlElement;
const mainElement = document.querySelector('main') as HTMLElement;
const backButton = document.getElementById("back-button") as HTMLElement;

initializeApp("Loading").then(async () => {
    try {
        backButton.addEventListener('click', () => navigateTo('/hives/'));
        const urlParams = new URLSearchParams(window.location.search);
        const hiveId = urlParams.get('hiveId');
        if (hiveId) {
            const hiveData = await getHiveForID(parseInt(hiveId));
            document.title = `Manage ${hiveData['hive_name']} - Buzznote`;
            const pageHeader = makeElement("section", null, "button-group-row", null);
            const pageHeading = makeElement("H2", 'page-heading', null, `${hiveData['hive_name']} (${hiveData['active'] ? 'Active' : 'Not Active'})`);
            pageHeader.appendChild(pageHeading);
            const editHiveButton = createButton("Edit Hive", "button", "edit-hive", "button orange", "edit");
            if (hiveData['hive_id']) {
                const hiveID = hiveData['hive_id'];
                editHiveButton.addEventListener('click', () => openEditHiveModal(hiveID));
            }
            pageHeader.appendChild(editHiveButton);
            mainElement.appendChild(pageHeader);
            const boxesForHive = await getBoxesForHiveID(parseInt(hiveId), false);
            if (boxesForHive.length > 0) {
                const columnHeaders = ['box_name', 'num_frames', 'overwinter', 'active', 'box_type', 'edit'];
                const boxesTable = createListTable(boxesForHive, columnHeaders, 'box_id');
                boxesTable.setAttribute("id", "boxes-table");
                const rows = boxesTable.querySelectorAll('tr');
                rows.forEach(row => {
                    row.addEventListener('click', async () => {
                        await openModalForBox(parseInt(hiveId), parseInt(row.id));
                    });
                });
                mainElement.appendChild(boxesTable);
            } else {
                const noBoxes = makeElement("h2", null, null, `No boxes for ${hiveData['hive_name']}`);
                mainElement.appendChild(noBoxes);
            }
            const addBoxButton = createButton("Add Box", "button", "add-box", "button blue", "add");
            addBoxButton.addEventListener('click', () => openModalForBox(parseInt(hiveId), null));
            mainElement.appendChild(addBoxButton);
        } else {
            throw new Error("Hive data not loaded. Please return to the previous page and try again.");
        }

    } catch (error: any) {
        createMessage(error, 'main-message', 'error');
    }
    loading.classList.add('hide');
    mainElement.classList.remove('hide');
});

async function submitData(formData: FormData, hiveId: number, boxId: number | null) {
    try {
        const newBox: Box = {
            box_id: boxId ? boxId : 0,
            hive_id: hiveId,
            box_name: "",
            box_type: "",
            num_frames: 0,
            active: false,
            overwinter: false
        }
        const boxNameInput = formData.get('box-name-input');
        if (boxNameInput === null || boxNameInput.toString().trim() === "") {
            createMessage("Please enter a name for the box", "manage-hive-message", "error");
            return;
        } else {
            newBox['box_name'] = boxNameInput.toString();
        }
        const numFrameInput = formData.get('num-frames-input');
        if (numFrameInput === null || numFrameInput.toString().trim() === "") {
            createMessage("Please enter the number of frames", "manage-hive-message", "error");
            return;
        } else {
            if (parseInt(numFrameInput.toString()) < 1) {
                createMessage("# of frames should be greater than 0", "manage-hive-message", "error");
                return;
            } else {
                newBox['num_frames'] = parseInt(numFrameInput.toString());
            }
        }
        const boxTypeInput = formData.get('box-type-input');
        if (boxTypeInput === null || boxTypeInput.toString().trim() === "") {
            createMessage("Please enter the box type", "manage-hive-message", "error");
            return;
        } else {
            newBox['box_type'] = boxTypeInput.toString();
        }
        const statusCheckbox = formData.get('status-checkbox') !== null;
        if (statusCheckbox) {
            newBox['active'] = statusCheckbox;
        }
        const overwinteredCheckbox = formData.get('overwintered-checkbox') !== null;
        if (overwinteredCheckbox) {
            newBox['overwinter'] = overwinteredCheckbox;
        }
        const columnHeaders = ['box_name', 'num_frames', 'overwinter', 'active', 'box_type', 'edit'];
        if (!boxId) {
            const response = await addBox(newBox);
            let newBoxId: number = 0;
            if (response['box_id']) newBoxId = parseInt(response['box_id']);
            newBox['box_id'] = newBoxId;
            closeModal('manage-hive-backdrop');
            const newBoxRow = createRowForListTable(newBox, columnHeaders, newBox['box_id'].toString());
            const boxesTable = document.getElementById('boxes-table');
            const hiveData: Hive = await getHiveForID(hiveId);
            hiveData['num_boxes'] += 1;
            await updateHive(hiveData);
            if (boxesTable) {
                const tbody = boxesTable.querySelector('tbody') as HTMLElement;
                tbody.appendChild(newBoxRow);
                createMessage(response['message'], "main-message", "check_circle");
                const editButton = newBoxRow.querySelector('button') as HTMLElement;
                editButton.addEventListener('click', () => openModalForBox(hiveId, newBoxId));
            } else {
                window.location.reload();
            }
        } else {
            await updateBox(boxId, newBox);
            closeModal('manage-hive-backdrop');
            storeMessage("Box updated successfully", "main-message", "check_circle");
            window.location.reload();
        }
        closeModal('manage-hive-backdrop');
    } catch (error: any) {
        createMessage(error, "main-message", "error");
        closeModal('manage-hive-backdrop');
    }
}

async function updateTheHive(formData: FormData, hiveData: Hive) {
    try {
        let updatedHive: Hive = {
            hive_id: hiveData['hive_id'],
            hive_name: hiveData['hive_name'],
            num_boxes: hiveData['num_boxes'],
            active: hiveData['active']
        }
        const newHiveName = formData.get('hive-name-input');
        if (newHiveName === null || newHiveName.toString().trim() === "") {
            createMessage("Please enter a name for the new hive", "add-hive-message", "error");
            return;
        } else {
            updatedHive['hive_name'] = newHiveName.toString();
        }
        const status = formData.get('status-checkbox') !== null;
        if (status) {
            updatedHive['active'] = 1;
        } else {
            updatedHive['active'] = 0;
        }
        await updateHive(updatedHive);
        createMessage("Hive updated successfully", "main-message", "check_circle");
        const pageHeading = document.getElementById('page-heading') as HTMLElement;
        pageHeading.textContent = `${updatedHive['hive_name']} (${updatedHive['active'] ? 'Active' : 'Not Active'})`
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }
    closeModal('manage-hive-backdrop');
}

async function openModalForBox(hiveId: number, boxId: number | null) {
    const manageHiveBackdrop = document.getElementById('manage-hive-backdrop') as HTMLElement;
    const manageHiveModal = document.getElementById('manage-box-modal') as HTMLFormElement;
    manageHiveModal.innerHTML = '';
    let boxToEdit: Box | null = null;
    if (boxId !== null) {
        boxToEdit = await getBoxForBoxId(boxId);
        const formTitle = makeElement("h2", null, null, `Edit the details for ${boxToEdit['box_name']}`);
        manageHiveModal.appendChild(formTitle);
    } else {
        const formTitle = makeElement("h2", null, null, "Enter the details for the new box");
        manageHiveModal.appendChild(formTitle);
    }
    const boxName = createInput("text", "box-name-input", "Box Name:", "form-row");
    manageHiveModal.appendChild(boxName);
    const numFrames = createInput("number", "num-frames-input", "# of Frames", "form-row");
    manageHiveModal.appendChild(numFrames);
    const boxType = createInput("text", "box-type-input", "Box Type:", "form-row");
    manageHiveModal.appendChild(boxType);
    const checkboxRow = makeElement("section", null, "form-row", null);
    const statusP = makeElement("p", null, null, "status:");
    checkboxRow.appendChild(statusP);
    const statusCheckbox = createCheckbox("Active", "Not Active", "status-checkbox", false, false);
    checkboxRow.appendChild(statusCheckbox);
    const overwinteredCheckbox = createCheckbox("Overwintered", "Not Overwintered", "overwintered-checkbox", false, false);
    checkboxRow.appendChild(overwinteredCheckbox);
    manageHiveModal.appendChild(checkboxRow);
    //Set values if editing
    if (boxToEdit) {
        const boxNameInput = boxName.querySelector('input') as HTMLInputElement;
        boxNameInput.value = boxToEdit['box_name'];
        const numFramesInput = numFrames.querySelector('input') as HTMLInputElement;
        numFramesInput.value = boxToEdit['num_frames'].toString();
        const boxTypeInput = boxType.querySelector('input') as HTMLInputElement;
        boxTypeInput.value = boxToEdit['box_type'];
        const statusInput = statusCheckbox.querySelector('input') as HTMLInputElement;
        const statusLabel = statusCheckbox.querySelector('label') as HTMLElement;
        statusInput.checked = boxToEdit['active']
        if (boxToEdit['active']) {
            statusLabel.textContent = "Active";
            statusLabel.classList.remove('red');
            statusLabel.classList.add('green');
        }
        const overwinteredInput = overwinteredCheckbox.querySelector('input') as HTMLInputElement;
        const overwinteredLabel = overwinteredCheckbox.querySelector('label') as HTMLElement;
        overwinteredInput.checked = boxToEdit['overwinter'];
        if (boxToEdit['overwinter']) {
            overwinteredLabel.textContent = "Overwintered";
            overwinteredLabel.classList.remove('red');
            overwinteredLabel.classList.add('green');
        }
    }
    const actionButtonRow = makeElement("section", null, "button-group-row", null);
    const closeButton = createButton("Close", "button", "close-button", "button red");
    closeButton.addEventListener('click', () => closeModal('manage-hive-backdrop'));
    actionButtonRow.appendChild(closeButton);
    const submitButton = createButton("Submit", "submit", "submit-button", "button green");
    actionButtonRow.appendChild(submitButton);
    manageHiveModal.appendChild(actionButtonRow);
    let boxToSendBack: Box | null = null;
    manageHiveModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData: FormData = new FormData(manageHiveModal);
        if (boxToEdit) {
            await submitData(formData, hiveId, boxId);
        } else {
            await submitData(formData, hiveId, null);
        }
    });
    openModal(manageHiveBackdrop, manageHiveModal, 'box-name-input');
    return boxToSendBack;
}

async function openEditHiveModal(hiveId :number) {
    const hiveData = await getHiveForID(hiveId);
    const manageHiveBackdrop = document.getElementById('manage-hive-backdrop') as HTMLElement;
    const manageHiveModal = document.getElementById('manage-box-modal') as HTMLFormElement;
    manageHiveModal.innerHTML = '';
    const formTitle = makeElement("h2", null, null, "Edit hive details");
    manageHiveModal.appendChild(formTitle);
    const hiveNameInput = createInput("text", "hive-name-input", "Hive Name:", "form-row");
    const inputElement = hiveNameInput.querySelector('input') as HTMLInputElement;
    inputElement.value = hiveData['hive_name'];
    manageHiveModal.appendChild(hiveNameInput);
    const checkboxRow = makeElement("section", null, "form-row", null);
    const statusP = makeElement("p", null, null, "status:");
    checkboxRow.appendChild(statusP);
    
    const statusCheckbox = createCheckbox("Active", "Not Active", "status-checkbox", false, hiveData['active']? true : false);
    const checkbox = statusCheckbox.querySelector('input') as HTMLInputElement;
    const label = statusCheckbox.querySelector('label') as HTMLElement;
    if (hiveData['active']) {
        label.textContent = "Active";
        label.classList.remove('red');
        label.classList.add('green');
        checkbox.checked = true;
    }
    checkboxRow.appendChild(statusCheckbox);
    manageHiveModal.appendChild(checkboxRow);
    const actionButtonRow = makeElement("section", null, "button-group-row", null);
    const closeButton = createButton("Close", "button", "close-button", "button red");
    closeButton.addEventListener('click', () => closeModal('manage-hive-backdrop'));
    actionButtonRow.appendChild(closeButton);
    const submitButton = createButton("Submit", "submit", "submit-button", "button green");
    actionButtonRow.appendChild(submitButton);
    manageHiveModal.appendChild(actionButtonRow);
    manageHiveModal.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData: FormData = new FormData(manageHiveModal);
        updateTheHive(formData, hiveData);
    });
    openModal(manageHiveBackdrop, manageHiveModal, 'box-name-input');
}