import {
    createButton,
    makeElement,
    getFormattedDate,
    getStartTime,
    createMessage
} from "./modules/utils";
import { getAllHives } from "./services/hiveService";
import type { Hive } from "./models";
import { initializeApp } from "./main";
import { getCurrentWeather } from "./services/weatherService";
import { navigateTo } from "./modules/navigate";

const mainElement = document.querySelector('main') as HTMLElement;
const pageWrapper = document.getElementById('page-wrapper') as HTMLElement;
const loading = document.getElementById('loading') as HTMLElement;

initializeApp("Select Hive").then(async () => {
    try {
        const hives: Hive[] = await getAllHives(true);
        console.log(hives)
        const mainElement = document.createElement('main');
        const pageTile = makeElement("h2", null, null, "Select a hive");
        mainElement.appendChild(pageTile);
        const buttonGroup = hives.reduce((acc: HTMLElement, currentHive: Hive) => {
            const newButton = createButton(currentHive['hive_name'], 'button', currentHive['hive_id']!.toString(), 'button white large full');
            newButton.addEventListener('click', async () => {
                sessionStorage.setItem('hiveId', JSON.stringify(currentHive['hive_id']));
                sessionStorage.setItem('hiveName', currentHive['hive_name']);
                sessionStorage.setItem('date', getFormattedDate());
                sessionStorage.setItem('time', getStartTime());
                const weather = await getCurrentWeather();
                sessionStorage.setItem('weather', JSON.stringify(weather));
                navigateTo('/frames');
            });
            acc.appendChild(newButton);
            return acc;
        }, document.createElement('section'))
        buttonGroup.setAttribute('class', "button-group-column");
        mainElement.appendChild(buttonGroup);
        const oldMain = pageWrapper.querySelector('main');
        if (oldMain) oldMain.remove();
        pageWrapper.appendChild(mainElement);
    } catch (error: any) {
        createMessage(error, 'main-message', 'error');
    }
    loading.classList.add('hide');
    mainElement.classList.remove('hide');
});