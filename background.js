// Pop up window for saving id/pass when the extension is loaded firsttime
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
 

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (shouldCloseTab(tab.url)) {
      closeTab(tabId, tab.url);
      chrome.tabs.create({ url: "chrome://newtab/" }, () => {
        closeAllLpuTabs();
      });
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url && shouldCloseTab(tab.url)) {
    closeTab(tab.id, tab.url);
    chrome.tabs.create({ url: "chrome://newtab/" }, () => {
      closeAllLpuTabs();
    });
  }
});

function closeTab(tabId, url = null) {
  chrome.tabs.remove(tabId, () => {
    if (chrome.runtime.lastError) {
      console.error('Error closing tab:', chrome.runtime.lastError);
    } else if (url) {
      console.log('Closed tab with URL:', url);
    }
  });
}

function shouldCloseTab(url) {
  return url.includes('24online/webpages/waitrequest.jsp');
}

function closeAllLpuTabs() {
  chrome.tabs.query({}, (tabs) => {
    const lpuTabs = tabs.filter(t => t.url && t.url.includes('internet.lpu.in'));
    lpuTabs.forEach(t => closeTab(t.id, t.url));
  });
}
