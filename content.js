const CLEANING_STORAGE_KEY = 'researchFocusCleaningEnabled';
const HIDDEN_MARKER = 'data-researchfocus-hidden';
const STYLE_ID = 'researchfocus-cleaner-style';

const selectors = [
  '.sidebar',
  '#sidebar',
  '.side-bar',
  '[aria-label="Related content"]',
  '.most-read',
  '.recommended',
  '.recommended-for-you',
  '.trending',
  '.related-content',
  '.related-articles',
  '.nw-c-related',
  '.related',
  '.recommended-list',
  '[aria-label*="Recommended"]',
  '[aria-label*="Trending"]'
];

let observer = null;
let cleaningEnabled = true;

function applyHide(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node;
  if (element.matches(selectors.join(','))) {
    element.style.setProperty('display', 'none', 'important');
    element.setAttribute(HIDDEN_MARKER, 'true');
  }
}

function hideMatchingElements(root = document) {
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      if (element.getAttribute(HIDDEN_MARKER) !== 'true') {
        element.style.setProperty('display', 'none', 'important');
        element.setAttribute(HIDDEN_MARKER, 'true');
      }
    });
  });

  if (root !== document) {
    if (root.matches) applyHide(root);
    root.querySelectorAll(selectors.join(',')).forEach(applyHide);
  }
}

function removeHiddenStyles() {
  document.querySelectorAll('[' + HIDDEN_MARKER + '="true"]').forEach(element => {
    element.style.removeProperty('display');
    element.removeAttribute(HIDDEN_MARKER);
  });
}

function injectStylesheet() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles.css');
  document.head?.appendChild(link);
}

function removeStylesheet() {
  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) {
    styleEl.remove();
  }
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          hideMatchingElements(node);
        }
      });
    });
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
}

function stopObserver() {
  if (!observer) return;
  observer.disconnect();
  observer = null;
}

function enableCleaning() {
  cleaningEnabled = true;
  injectStylesheet();
  hideMatchingElements();
  startObserver();
}

function disableCleaning() {
  cleaningEnabled = false;
  stopObserver();
  removeStylesheet();
  removeHiddenStyles();
}

function getSelectedText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

function formatBlockquote(text, url) {
  const quoted = text
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n');
  return `${quoted}\n\n${url}`;
}

window.addEventListener('keydown', event => {
  if (event.altKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyC') {
    const selectedText = getSelectedText();
    if (!selectedText) return;
    const blockquote = formatBlockquote(selectedText, window.location.href);
    console.log('Blockquote for WordPress:');
    console.log(blockquote);
  }
});

chrome.storage.local.get({ [CLEANING_STORAGE_KEY]: true }, result => {
  if (result[CLEANING_STORAGE_KEY]) {
    enableCleaning();
  } else {
    disableCleaning();
  }
});

chrome.storage.onChanged.addListener(changes => {
  if (CLEANING_STORAGE_KEY in changes) {
    const newValue = changes[CLEANING_STORAGE_KEY].newValue;
    if (newValue) {
      enableCleaning();
    } else {
      disableCleaning();
    }
  }
});
