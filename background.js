chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('id', (result) => {
        if (!result.id) {
            chrome.windows.create({
                url: "popup.html",
                type: "popup",
                width: 400,
                height: 230
            });
        }
    });
  });
  