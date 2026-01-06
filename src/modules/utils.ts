import { Average, AverageDetail, Box, Frame, FramePair, Hive, Inspection, InspectionListItem, Message } from "../models";
import { db } from '../services/db';

export function createButton(
  buttonText: string,
  buttonType: string,
  buttonId: string,
  buttonClass: string,
  icon?: string,
): HTMLElement {
  const newButton = document.createElement("button");
  newButton.setAttribute("type", buttonType);
  newButton.setAttribute("id", buttonId);
  newButton.setAttribute("class", buttonClass);
  if (icon) {
    const buttonIconSpan = document.createElement("span");
    buttonIconSpan.setAttribute("class", "material-symbols-outlined");
    const buttonIcon = document.createTextNode(icon);
    buttonIconSpan.appendChild(buttonIcon);
    newButton.appendChild(buttonIconSpan);
  }
  const buttonTextElm = document.createTextNode(buttonText);
  newButton.appendChild(buttonTextElm);
  return newButton;
}

export function createLink(linkText: string, linkHref: string, external: boolean, linkClass: string | null, icon: string | null) {
  const newLink = document.createElement('a');
  newLink.setAttribute('href', linkHref);
  if (external) {
    newLink.setAttribute('target', '_blank');
  }
  if (linkClass) {
    newLink.setAttribute('class', linkClass);
  }
  if (icon) {
    const buttonIconSpan = document.createElement("span");
    buttonIconSpan.setAttribute("class", "material-symbols-outlined");
    const linkIcon = document.createTextNode(icon);
    buttonIconSpan.appendChild(linkIcon);
    newLink.appendChild(linkIcon);
  }
  newLink.textContent = linkText;
  return newLink;
}

export function createMessage(message: string, location: string, type: string) {
  clearMessages();
  const messageWrapper = document.getElementById(location) as HTMLElement;
  const messageDiv = document.createElement("div");
  if (type === "check_circle") {
    messageDiv.setAttribute("class", "success message");
    messageDiv.setAttribute("aria-live", "polite");
  } else if (type === "error") {
    messageDiv.setAttribute("class", "error message");
    messageDiv.setAttribute("role", "alert");
    console.error(message);
  } else if (type === "delete" || type === "warn") {
    messageDiv.setAttribute("class", "warn message");
    messageDiv.setAttribute("aria-live", "polite");
    console.warn(message);
  } else {
    messageDiv.setAttribute("class", "info message");
    messageDiv.setAttribute("aria-live", "polite");
  }
  const icon = document.createElement("span");
  icon.setAttribute("class", "material-symbols-outlined");
  const iconName = document.createTextNode(type);
  icon.appendChild(iconName);
  messageDiv.appendChild(icon);
  const messageText = document.createTextNode(message);
  messageDiv.appendChild(messageText);
  const closeButton = createButton("", "button", "closeButton", "", "close");
  closeButton.addEventListener("click", () => (messageWrapper.innerHTML = ""));
  messageDiv.appendChild(closeButton);
  messageWrapper.appendChild(messageDiv);
}

export function clearMessages() {
  const messageWrappers = document.getElementsByClassName("message-wrapper");
  for (const messageWrapper of messageWrappers) {
    messageWrapper.innerHTML = "";
  }
}

export function storeMessage(
  message: string,
  messageContainer: string,
  icon: string,
) {
  clearMessages();
  const messageToStore = new Message(message, messageContainer, icon);
  sessionStorage.setItem("message", JSON.stringify(messageToStore));
}

export function makeElement(elementType: string, elementId: string | null, elementClass: string | null, elementText: string | null) {
  const newElement = document.createElement(elementType);
  if (elementId) newElement.setAttribute('id', elementId);
  if (elementClass) {
    newElement.setAttribute('class', elementClass);
  }
  if (elementText) newElement.textContent = elementText;
  return newElement;
}

export function createCheckbox(labelTextTrue: string, labelTextFalse: string, checkboxId: string, checked: boolean, full: boolean) {
  const checkBoxContainer = document.createElement("div");
  checkBoxContainer.setAttribute('class', "button-group-row");
  if (full) checkBoxContainer.classList.add("full");
  const checkboxLabel = document.createElement("label");
  checkboxLabel.setAttribute("for", checkboxId);
  if (checked) {
    checkboxLabel.textContent = labelTextTrue;
    checkboxLabel.setAttribute('class', 'button green');
  } else {
    checkboxLabel.textContent = labelTextFalse;
    checkboxLabel.setAttribute('class', 'button red');
  }

  if (full) checkboxLabel.classList.add("full");
  checkBoxContainer.appendChild(checkboxLabel);
  const checkboxInput = document.createElement('input') as HTMLInputElement;
  checkboxInput.setAttribute('type', 'checkbox');
  checkboxInput.setAttribute("id", checkboxId);
  checkboxInput.setAttribute("name", checkboxId);
  checkboxInput.checked = checked;
  checkboxInput.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    if (isChecked) {
      checkboxLabel.textContent = labelTextTrue;
      checkboxLabel.classList.remove('red');
      checkboxLabel.classList.add('green');
    } else {
      checkboxLabel.textContent = labelTextFalse;
      checkboxLabel.classList.remove('green');
      checkboxLabel.classList.add('red');
    }
  });
  checkBoxContainer.appendChild(checkboxInput);
  return checkBoxContainer;
}

export function createCheckboxRow(checkboxName: string, framePair: FramePair) {
  const idName = checkboxName.toLowerCase().replace(" ", "_");
  const checkboxContainer = document.createElement('div');
  const divH3 = makeElement('h3', null, 'center', checkboxName);
  checkboxContainer.appendChild(divH3);
  const buttonRow = makeElement("div", `${checkboxName}-checkboxes`, 'button-group-row', null);
  const sideACheckbox = createCheckbox("Side A", "Side A", `${idName}-a`, framePair['sideA'], true);
  buttonRow.appendChild(sideACheckbox);
  const sideBCheckbox = createCheckbox("Side B", "Side B", `${idName}-b`, framePair['sideB'], true);
  buttonRow.appendChild(sideBCheckbox);
  checkboxContainer.appendChild(buttonRow);
  return checkboxContainer;
}

export async function loadData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error Fetching ${url}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(error);
  }
}

export function getFormattedDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStartTime() {
  const today = new Date();
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function createTableHead(columnHeaders: string[]) {
  const tableHead = columnHeaders.reduce(
    (acc: HTMLElement, currentColumnHeader: string) => {
      const newColumnHeader = document.createElement("th");
      const readableKey = currentColumnHeader.split('_')
        .map(word => {
          if (word.length === 0) return '';
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .map(word => {
          if (word === "Num") {
            return "# of";
          } else if (word === "Active") {
            return "Status";
          } else {
            return word;
          }
        })
        .join(' ');
      const columnHeaderName = document.createTextNode(readableKey);
      newColumnHeader.appendChild(columnHeaderName);
      acc.appendChild(newColumnHeader);
      return acc;
    }, document.createElement("thead"));
  return tableHead;
}

type TableItem = InspectionListItem | AverageDetail | Frame | Hive | Box | Average | {};

export function createRowForListTable(item: TableItem, columnHeaders: string[], itemId: string) {
  const newRow = document.createElement('tr');
  newRow.setAttribute('id', itemId);
  for (const key of columnHeaders) {
    const newCell = document.createElement("td");
    const itemValue = (item as any)[key];
    let valueString: string = "";
    if (key === 'active') {
      valueString = itemValue === 1 ? 'Active' : 'Not Active';
    } else if (key === 'overwinter') {
      valueString = itemValue === 1 ? 'Overwintered' : 'Not Overwintered';
    } else if (key === "edit") {
      const editButton = createButton("", "button", itemId, "", "edit");
      newCell.appendChild(editButton);
    } else if (key === "inspection_date") {
      valueString = formatDate(itemValue);
    } else {
      valueString = itemValue?.toString() || ""
    }
    if (key !== "edit") newCell.textContent = valueString;
    newRow.appendChild(newCell);
  }
  return newRow;
}

export function createListTable(itemsArray: InspectionListItem[] | AverageDetail[] | Average[] | Frame[] | Hive[] | Box[], columnHeaders: string[], primaryIdKeyName: string) {
  const tableContainer = makeElement("div", null, "table-container", null);
  const table = makeElement("table", null, null, null);
  const tableHead = createTableHead(columnHeaders);
  table.appendChild(tableHead);
  const tableBody = itemsArray.reduce((acc: HTMLElement, currentItem: TableItem) => {
    const itemId = (currentItem as any)[primaryIdKeyName]?.toString() || "";
    const newRow = createRowForListTable(currentItem, columnHeaders, itemId);
    acc.appendChild(newRow);
    return acc;
  }, document.createElement('tbody'));
  table.appendChild(tableBody);
  tableContainer.appendChild(table);
  return tableContainer;
}

export function createItemTable(item: Inspection | AverageDetail, columnHeaders: string[], primaryIdKeyName: string) {
  const tableContainer = makeElement("div", null, "table-container", null);
  const table = makeElement("table", null, null, null);
  const tableHead = createTableHead(columnHeaders);
  table.appendChild(tableHead);
  const tableBody = document.createElement('tbody');
  const newRow = columnHeaders.reduce((acc: HTMLElement, key: string) => {
    const newCell = document.createElement('td');
    if (primaryIdKeyName === "inspection_id") {
      const inspectionItem = item as Inspection;
      if (key === "weather") {
        const weather = document.createTextNode(`${inspectionItem['weather_temp']}°F ${inspectionItem['weather_condition']}`);
        newCell.appendChild(weather);
      } else if (key === "brood") {
        const broodArray = [];
        if (inspectionItem['brood_eggs']) broodArray.push("Eggs");
        if (inspectionItem['brood_larva']) broodArray.push("Larva");
        if (inspectionItem['brood_capped']) broodArray.push("Capped");
        newCell.innerHTML = broodArray.join("<br/>");
      } else {
        const itemValue = (item as any)[key];
        const valueString = document.createTextNode(itemValue?.toString() || "");
        newCell.appendChild(valueString);
      }
    } else if (key === "expand") {
      const expandButton = createButton("expand_all", 'button', `expand-${primaryIdKeyName}`, 'material-symbols-outlined');
      newCell.appendChild(expandButton);
    } else {
      const itemValue = (item as any)[key];
      const valueString = document.createTextNode(itemValue?.toString() || "");
      newCell.appendChild(valueString);
    }
    acc.appendChild(newCell);
    return acc;
  }, document.createElement('tr'));
  tableBody.appendChild(newRow);
  table.appendChild(tableBody);
  tableContainer.appendChild(table)
  return tableContainer;
}

export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDate(dateString: string) {
  const dateTimeArray = dateString.split(" ");
  if (dateTimeArray.length > 1) {
    const date = dateTimeArray[0];
    const time = dateTimeArray[1];
    //Format Date
    const dateParts = date.split("-");
    let formatted = dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
    return formatted + " " + time;
  } else {
    const dateParts = dateString.split("-");
    return dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
  }

}

export function createInput(inputType: string, name: string, labelText: string | null, dvivClass: string | null) {
  const newInput = makeElement("input", name, null, null);
  newInput.setAttribute("type", inputType);
  newInput.setAttribute("name", name);
  if (labelText) {
    const containerDiv = makeElement("div", null, dvivClass, null);
    const label = document.createElement('label');
    label.setAttribute("for", name);
    label.textContent = labelText;
    containerDiv.appendChild(label);
    containerDiv.appendChild(newInput);
    return containerDiv;
  } else {
    return newInput
  }
}

export function createRadioGroup(heading: string, options: string[], buttonColors: string[]) {
  const containerID = heading
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  const containerDivId = containerID + "-div";
  const radioContainer = makeElement("div", containerDivId, null, null);
  const headingH2 = makeElement("h2", null, null, heading);
  headingH2.setAttribute('class', 'center');
  radioContainer.appendChild(headingH2);
  const randioGroup = options.reduce((acc: HTMLElement, currentOption: string, index) => {
    const newInput = document.createElement("input");
    newInput.setAttribute('type', 'radio');
    newInput.setAttribute('id', `${currentOption}-${containerID}`);
    newInput.setAttribute('name', containerID);
    newInput.setAttribute('value', currentOption);
    const newLabel = document.createElement('label');
    newLabel.setAttribute('for', `${currentOption}-${containerID}`);
    newLabel.setAttribute('class', `button full half ${buttonColors[index]}`);
    newLabel.textContent = currentOption;
    acc.appendChild(newInput);
    acc.appendChild(newLabel)
    return acc;
  }, document.createElement("div"));
  randioGroup.setAttribute('class', "button-group-row");
  radioContainer.appendChild(randioGroup);
  return radioContainer;

}

export function storeInspectionIds(inspectionList: InspectionListItem[]) {
  const inspectionIds: number[] = inspectionList.reduce((acc: number[], currentInspection: InspectionListItem) => {
    acc.push(currentInspection['inspection_id']);
    return acc;
  }, []);
  sessionStorage.setItem("inspectionIds", JSON.stringify(inspectionIds));
}

export function openModal(
  modalBackdrop: HTMLElement,
  modal: HTMLElement,
  firstFocusElementId: string,
) {
  //Prevent the page from scrolling
  const body = document.querySelector("body") as HTMLElement;
  body.classList.add("noScroll");
  //Display the modal by changing the display of the modal backdrop
  modalBackdrop.classList.remove('hide');
  //Change the modal's aria attribute
  modal.setAttribute("aria-modal", "true");
  //Trap keyboard focus on the first input or button
  const firstFocusElement = document.getElementById(firstFocusElementId);
  if (firstFocusElement) {
    firstFocusElement.focus();
  }
  //Set up the keyboard trap for all focusable elements
  trapFocus(modal, modalBackdrop);
}

export function closeModal(modalBackdropId: string) {
  const modalBackdrop = document.getElementById(modalBackdropId) as HTMLElement;
  const modal = modalBackdrop.getElementsByClassName("modal");
  //Change the modal's aria attribute
  if (modal) {
    modal[0].setAttribute("aria-modal", "false");
  }
  //Hide the modal by changing the display of the backdrop
  modalBackdrop.classList.add('hide');
  //Remove the noScroll class to let the page scroll again
  const body = document.querySelector("body") as HTMLElement;
  body.classList.remove("noScroll");
}

export function trapFocus(modal: HTMLElement, backdrop: HTMLElement) {
  const focusableElements = modal.querySelectorAll(
    "button, [href], input, select, textarea, input:checked + label",
  ) as NodeListOf<HTMLElement>;
  //Don't trap focus if the modal/backdrop isn't open
  if (backdrop.style.display === "none") {
    return;
  }
  //Warn if no focusable elements in modal
  if (!focusableElements.length) {
    console.warn(
      "trapFocus Function called on modal with no focusable elements",
    );
    return;
  }
  const firstFocusableElement: HTMLElement = focusableElements[0];
  const lastFocusableElement: HTMLElement =
    focusableElements[focusableElements.length - 1];
  document.addEventListener("keydown", (e) => {
    //Let user tab through only the elements in the modal
    if (e.key === "Tab") {
      if (e.shiftKey) {
        //If at first element, loop back to last element
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        //If at last element, loop to first element
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}

export async function deleteEntireDatabase() {
  try {
    await db.delete();
    storeMessage("Database reset successful", "main-message", "delete");
    window.location.reload()
    console.log("Database deleted successfully.");
    // Note: You will need to refresh or re-instantiate your DB class 
    // to use it again after this.
  } catch (error) {
    console.error("Could not delete database:", error);
  }
}