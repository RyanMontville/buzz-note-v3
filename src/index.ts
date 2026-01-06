import { makeElement, createButton, deleteEntireDatabase } from "./modules/utils";
import { initializeApp } from "./main";
import { navigateTo } from "./modules/navigate";
import { getLocalWeather, getUserLocationFromDB, setCurrentLocation } from "./services/weatherService";
import type { UserLocation } from "./models";

const pageWrapper = document.getElementById('page-wrapper') as HTMLElement;
const loading = document.getElementById('loading');

initializeApp("").then(async () => {
  const mainElement = document.createElement('main');
  const demoIntroSection = makeElement("section", "intro-section", null, null);
  const demoHeading = makeElement("h2", null, null, "This is a demo app");
  demoIntroSection.appendChild(demoHeading);
  const demoP1 = makeElement("p", null, null, "This is the demo version of BuzzNote. It saves data locally to indexedDB with the help of Dexie.js. The production version uses Firebase for user autheticatoin and FatFree (a php api) to communicate with a MySQL database.");
  demoIntroSection.appendChild(demoP1);
  const weatherP = makeElement("p", null, null, "This app records the current weather when starting a new inspection using the Open Metro API.");
  demoIntroSection.appendChild(weatherP);
  const usersLocation = await getUserLocationFromDB();
  if (!usersLocation) {
    const defaultLocationP = makeElement("p", "location-p", null, "You have not set your location, so it will default to Chagrin Falls, Oh (the location of Monte's Own.");
    demoIntroSection.appendChild(defaultLocationP);
  } else {
    const demoP2 = formatLocationP(usersLocation);
    demoIntroSection.appendChild(demoP2);
  }
  const buttons = makeElement("section", null, "form-row", null);
  const updateLocation = createButton("Update Location", "button", "update-location-button", "button blue", "location_on");
  updateLocation.addEventListener('click', async () => {
    buttons.remove();
    const updating = makeElement("p", null, null, "Updating Location...");
    demoIntroSection.appendChild(updating);
    await setCurrentLocation();
    window.location.reload();
  });
  buttons.appendChild(updateLocation);
  const resetDatabase = createButton("Reset Database", "button", "reset-db", "button red", "delete_forever");
  resetDatabase.addEventListener('click', async() => deleteEntireDatabase());
  buttons.appendChild(resetDatabase);
  demoIntroSection.appendChild(buttons);
  mainElement.appendChild(demoIntroSection);
  const buttonGroup = makeElement('section', 'options', 'button-group-column', null);
  const startNewInspection = createButton("Start New Inspection", "button", "new-inspection", "large full button green");
  startNewInspection.addEventListener('click', () => navigateTo('/selectHive'));
  buttonGroup.appendChild(startNewInspection);
  const manageHives = createButton("Manage Hives", "button", "manage-hives", "large full button purple");
  manageHives.addEventListener('click', () => navigateTo("/hives/"));
  buttonGroup.appendChild(manageHives);
  const viewPastInspections = createButton("Past Inspections", "button", "past-inspections", "large full button orange");
  viewPastInspections.addEventListener('click', () => navigateTo('/past/'));
  buttonGroup.appendChild(viewPastInspections);
  const search = createButton("Search", "button", "search-button", "large full button blue");
  search.addEventListener('click', () => navigateTo('/search'));
  buttonGroup.appendChild(search)
  mainElement.appendChild(buttonGroup);
  const oldMain = pageWrapper.querySelector('main') as HTMLElement;
  pageWrapper.replaceChild(mainElement, oldMain);
  if (loading) loading.classList.add('hide');
  mainElement.classList.remove('hide');
  await getLocalWeather();
});

function formatLocationP(userLocation: UserLocation | undefined) {
  const locationP = document.createElement("p");
  locationP.setAttribute("id", "location-p");
  if (userLocation) {
    let innnerHTML = "<strong>Your Location:</strong><br/><strong>Latitude:</strong> ";
    innnerHTML += userLocation['latitude'].toString();
    innnerHTML += "<br/><strong>Longitude:</strong> ";
    innnerHTML += userLocation['longitude'];
    innnerHTML +="<br/><strong>Accuracy:</strong> ";
    innnerHTML += userLocation['accuracy'];
    innnerHTML += "<br/><strong>Last Updated:</strong> ";
    innnerHTML += userLocation['timestamp'];
    locationP.innerHTML = innnerHTML;
  } else {
    locationP.textContent = "";
  }
  return locationP;
}