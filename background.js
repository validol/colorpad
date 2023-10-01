let rule1 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        schemes: [
          'http',
          'https'
        ]
      },
    })
  ],
  actions: [new chrome.declarativeContent.ShowAction()]
};

chrome.runtime.onInstalled.addListener(() => {
  initStorage();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([rule1]);
  });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.clear) {
    chrome.storage.local.set({ colors: [] });
  }

  if (request.picked) {
    updateStorage(request.picked);
  }

  if (request.removed) {
    editStorage(request.removed);
  }

  if (request.sorted) {
    chrome.storage.local.set({ colors: request.sorted });
  }
});

function updateStorage(newColor) {
  chrome.storage.local.get(["colors"])
    .then((result) => {
      chrome.storage.local.set({ colors: [newColor, ...result.colors] });
    });
}

function editStorage(newColor) {
  chrome.storage.local.get(["colors"])
    .then((result) => {
      chrome.storage.local.set({ colors: result.colors.filter(color => color !== newColor) });
    });
}

function initStorage() {
  chrome.storage.local.get(["colors"])
    .then((result) => {
      if (!Object.keys(result).length) {
        chrome.storage.local.set({
          colors: [],
          copyas: 'array'
        });
      }
    })
    .catch((err) => {
      console.log("Storage:", err);
    });

}