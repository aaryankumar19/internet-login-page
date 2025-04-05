chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('id', (result) => {
      if (!result.id) {
        chrome.windows.create({
          url: chrome.runtime.getURL("popup.html"),
          type: "popup",
          width: 400,
          height: 360,
          top: 100,
          left: 100,
          focused: true
        });
      }
    });
  });
  