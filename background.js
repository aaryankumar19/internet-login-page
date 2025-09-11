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
 

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // URL pattern matching
    if (shouldCloseTab(tab.url)) {
      chrome.tabs.remove(tabId, () => {
        if (chrome.runtime.lastError) {
          console.error('Error closing tab:', chrome.runtime.lastError);
        } 
      });
    }
  }
});

// Listen for new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  // URL patterns
  if (tab.url && shouldCloseTab(tab.url)) {
    chrome.tabs.remove(tab.id, () => {
      if (chrome.runtime.lastError) {
        console.error('Error closing new tab:', chrome.runtime.lastError);
      } else {
        console.log('Closed new tab with URL:', tab.url);
      }
    });
  }
});

//check if the annoyingg tab should be closed
function shouldCloseTab(url) {
  if (url.includes('24online/webpages/waitrequest.jsp')) {
    return true;
  }
  
  return false;
}

