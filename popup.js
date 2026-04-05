const CLEANING_STORAGE_KEY = 'researchFocusCleaningEnabled';
const toggleButton = document.getElementById('toggleButton');
const statusText = document.getElementById('statusText');

function updateUi(enabled) {
  toggleButton.textContent = enabled ? 'Disable Cleaning Mode' : 'Enable Cleaning Mode';
  statusText.textContent = enabled ? 'Cleaning mode is ON.' : 'Cleaning mode is OFF.';
}

function setCleaningMode(enabled) {
  chrome.storage.local.set({ [CLEANING_STORAGE_KEY]: enabled }, () => {
    updateUi(enabled);
  });
}

toggleButton.addEventListener('click', () => {
  chrome.storage.local.get({ [CLEANING_STORAGE_KEY]: true }, result => {
    const currentEnabled = result[CLEANING_STORAGE_KEY];
    setCleaningMode(!currentEnabled);
  });
});

chrome.storage.local.get({ [CLEANING_STORAGE_KEY]: true }, result => {
  updateUi(result[CLEANING_STORAGE_KEY]);
});
