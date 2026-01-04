import { makeElement, createLink } from "./modules/utils";
import { initializeApp } from "./main";

const pageWrapper = document.getElementById('page-wrapper') as HTMLElement;
const loading = document.getElementById('loading');

initializeApp("").then(async () => {
  const mainElement = document.createElement('main');
  const buttonGroup = makeElement('section', 'options', 'button-group-column', null);
  const startNewInspection = createLink("Start New Inspection", "selectHive", false, 'large full button green', null)
  buttonGroup.appendChild(startNewInspection);
  const manageHives = createLink("Manage Hives", 'hives/', false, 'large full button purple', null);
  buttonGroup.appendChild(manageHives);
  const viewPastInspections = createLink("View Past Inspections", "past/", false, 'large full button orange', null)
  buttonGroup.appendChild(viewPastInspections);
  const search = createLink("Search", "search", false, "large full button blue", null);
  buttonGroup.appendChild(search)
  mainElement.appendChild(buttonGroup);
  const oldMain = pageWrapper.querySelector('main') as HTMLElement;
  pageWrapper.replaceChild(mainElement, oldMain);
  if (loading) loading.classList.add('hide');
  mainElement.classList.remove('hide');
});