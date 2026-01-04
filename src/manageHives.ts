import { initializeApp } from "./main";
import { closeModal, createButton, createCheckbox, createInput, createListTable, createMessage, createRowForListTable, makeElement, openModal } from "./modules/utils";
import { addNewHive, getAllHives } from "./services/hiveService";
import { Hive } from "./models";
import { navigateTo } from "./modules/navigate";

const loading = document.getElementById("loading") as HTMLHtmlElement;
const mainElement = document.querySelector('main') as HTMLElement;
const backButton = document.getElementById("back-button") as HTMLElement;

initializeApp("Manage Hives").then(async () => {
    try {
        backButton.addEventListener('click', () => navigateTo('/'));
        const hives: Hive[] = await getAllHives(false);
        if (hives.length > 0) {
            const pageHeading = makeElement("h2", null, null, "Selecte a hive to manage:");
            mainElement.appendChild(pageHeading);
            const columnHeaders = ['hive_name', 'num_boxes', 'active'];
            const hivesTable = createListTable(hives, columnHeaders, 'hive_id');
            hivesTable.setAttribute('id', 'hives-table');
            hivesTable.classList.add('table-clickable');
            const rows = hivesTable.querySelectorAll('tr');
            rows.forEach(row => {
                row.addEventListener('click', () => navigateTo("/hives/manage", { params: {hiveId: row.id}}));
            });
            mainElement.appendChild(hivesTable);
        } else {
            const pageHeading = makeElement("h2", null, null, "No hives to manage");
            mainElement.appendChild(pageHeading);
        }
        const openAddModal = createButton("Add Hive", "button", "open-add-modal", "button blue", "add");
        openAddModal.addEventListener('click', () => {
            showAddHivesModal();
        });
        mainElement.appendChild(openAddModal);
        loading.remove();
        mainElement.classList.remove('hide');
    } catch (error: any) {
        createMessage(error, 'main-message', 'error');
    }
});

async function addHive(formData: FormData) {
    try {
        let newHive: Hive = {
            hive_name: "",
            num_boxes: 0,
            active: 0
        }
        const newHiveName = formData.get('hive-name-input');
        if (newHiveName === null || newHiveName.toString().trim() === "") {
            createMessage("Please enter a name for the new hive", "add-hive-message", "error");
            return;
        } else {
            newHive['hive_name'] = newHiveName.toString();
        }
        const status = formData.get('status-checkbox') !== null;
        if (status) {
            newHive['active'] = status? 1 : 0;
        }
        const response = await addNewHive(newHive);
        newHive['hive_id'] = parseInt(response['hive_id']);
        const columnHeaders = ['hive_name', 'num_boxes', 'active'];
        const newHiveRow = createRowForListTable(newHive, columnHeaders, newHive['hive_id'].toString());
        const hivesTable = document.getElementById('hives-table');
        if (hivesTable) {
            const tbody = hivesTable.querySelector('tbody') as HTMLElement;
            tbody.appendChild(newHiveRow);
            createMessage(response['message'], "main-message", "check_circle");
            newHiveRow.addEventListener('click', () => navigateTo("/hives/manage", { params: {hiveId: newHiveRow.id}}));
        } else {
            window.location.reload();
        }
    } catch (error: any) {
        createMessage(error, "main-message", "error");
    }
    closeModal('add-hive-backdrop');
}

async function showAddHivesModal() {
    const addHiveModalBackdrop = document.getElementById('add-hive-backdrop') as HTMLElement;
    const addHiveModal = document.getElementById('add-hive-modal') as HTMLFormElement;
    addHiveModal.innerHTML = '';
    const formTitle = makeElement("h2", null, null, "Enter the details for the new hive");
    addHiveModal.appendChild(formTitle);
    const hiveNameInput = createInput("text", "hive-name-input", "Hive Name:", "form-row");
    addHiveModal.appendChild(hiveNameInput);
    const checkboxRow = makeElement("section", null, "form-row", null);
    const statusP = makeElement("p", null, null, "status:");
    checkboxRow.appendChild(statusP);
    const statusCheckbox = createCheckbox("Active", "Not Active", "status-checkbox", false, false);
    checkboxRow.appendChild(statusCheckbox);
    addHiveModal.appendChild(checkboxRow);
    const actionButtonRow = makeElement("section", null, "button-group-row", null);
    const closeButton = createButton("Close", "button", "close-button", "button red");
    closeButton.addEventListener('click', () => closeModal('add-hive-backdrop'));
    actionButtonRow.appendChild(closeButton);
    const submitButton = createButton("Submit", "submit", "submit-button", "button green");
    actionButtonRow.appendChild(submitButton);
    addHiveModal.appendChild(actionButtonRow);
    addHiveModal.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addHiveModal);
        addHive(formData);
    });
    openModal(addHiveModalBackdrop, addHiveModal, 'hive-name-input');
}