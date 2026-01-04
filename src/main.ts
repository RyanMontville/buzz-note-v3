import { closeModal, createMessage } from "./modules/utils";
import type { Message } from "./models";

const headerTitle = document.getElementById('header-title') as HTMLElement;

export async function initializeApp(currentPage: string) {
  if (currentPage !== "") {
    // Set the page title
    document.title = `${currentPage} - Buzznote`;
  }
  //Wait for the DOM to load
  await new Promise<void>(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
  const storedMessageString = sessionStorage.getItem("message");
  if (storedMessageString) {
    const storedMessage: Message = JSON.parse(storedMessageString);
    createMessage(storedMessage['message'], storedMessage['messageContainer'], storedMessage['icon']);
    sessionStorage.removeItem("message");
  }

  headerTitle.addEventListener('click', () => window.location.href = 'buzz-note-v3/');

  //event listener for the user to press escape to close any modal that is open
  document.addEventListener("keydown", (e) => {
    let addHiveModalBackdrop = document.getElementById("add-hive-backdrop");
    let manageHiveBackdrop = document.getElementById("manage-hive-backdrop");
    let notesModalBackdrop = document.getElementById("notes-backdrop");
    if (e.key === "Escape") {
      e.preventDefault();
      if (
        addHiveModalBackdrop &&
        !addHiveModalBackdrop.classList.contains('hide')
      ) {
        closeModal("add-hive-backdrop");
      } else if (manageHiveBackdrop &&
        !manageHiveBackdrop.classList.contains('hide')
      ) {
        closeModal("manage-hive-backdrop");
      } else if (notesModalBackdrop && !notesModalBackdrop.classList.contains('hide')) {
        closeModal("notes-backdrop");
      } else {
        console.warn("Esc key pressed, but no modals are open");
      }
    }
  });
}