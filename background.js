let urls = {};
let currentTabInfo = {};

chrome.runtime.onStartup.addListener(() => {
  saveUrlsToStorage().then(() => {
    console.log(
      "Extension loaded during browser startup. AND Urls and currentTabInfo saved "
    );
  });
});

const saveUrlsToStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ urls }, () => {
      console.log("urls object stored in local storage");
      resolve(); // Resolve the promise to indicate completion
    });
  });
};

const initializeTab = (url, tabId) => {
  console.log("initialization for : ", url);

  const newTab = {
    startTime: Date.now(),
    totalTime: 0,
    tabId: tabId,
  };
  urls[url] = newTab;

  saveUrlsToStorage().then(() => {
    console.log("after updating the object ", urls);
  });
};

const saveCurrentTabInfo = (currentTabInfo) => {
  return new Promise((resolve) => {
    // Store the current tab information
    chrome.storage.local.set({ currentTabInfo }, () => {
      console.log("currentTabInfo object stored in local storage");
      resolve();
    });
  });
};

let activeTabId;
let activeTabUrl;

const getCurrentTab = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
    activeTabUrl = currentTab.url;
    activeTabId = currentTab.id;

    console.log(`URL of active tab: ${activeTabUrl}`);
    console.log(`ID of active tab: ${activeTabId}`);
  });

  return activeTabUrl;
};
getCurrentTab();

//----------------------------------
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const newTabUrl = tab.url;
    const newTabId = tab.id;

    console.log("\nTab loaded:", newTabUrl);

    // Check if the new tab URL is not already present in the urls object
    if (!urls || !urls[newTabUrl]) {
      console.log("\n\nNew tab created and not existing:\nURL:", tab, "\n\n");
      initializeTab(newTabUrl, newTabId);

      const currentTabInfo = {
        url: newTabUrl,
        tabId: newTabId,
        startTime: Date.now(),
      };

      saveCurrentTabInfo(currentTabInfo).then(()=>{
        console.log("New tab entered and CurrentInfoObj Updated") ;
      })
     
    }
  }
});


chrome.tabs.onActivated.addListener((activeInfo) => {
  // chrome.tabs.sendMessage(activeInfo.tabId, { action: "tabSwitched" });
  console.log("Tab Switched");

  const activeTabId = activeInfo.tabId;

  // Retrieve the information of the previously active tab
  chrome.storage.local.get(["currentTabInfo"], (result) => {
    const previousTabInfo = result.currentTabInfo;

    if (previousTabInfo) {
      console.log("Fetched Info : \n", previousTabInfo);
      const prevTabId = previousTabInfo.tabId;
      const prevTabUrl = previousTabInfo.url;

      // Update the time spent for the previous tab
      chrome.storage.local.get(["urls"], (result) => {
        urls = result.urls;

        console.log("checking if the tab alr exits : ", urls);

        if (!urls || !urls[prevTabUrl]) {
          // dikkat isi line mein h :
          console.log("new tab found");
          console.log("And current URLs object : ", urls);
          initializeTab(prevTabUrl, prevTabId);
        }

        const timeSpent = Date.now() - previousTabInfo.startTime;
        urls[prevTabUrl].totalTime += timeSpent;
        urls[prevTabUrl].startTime = Date.now();

        saveUrlsToStorage().then(() => {
          console.log("Urls saved after updating for existing tab");
        });
      });
    }
  });

  // Get information about the currently active tab
  chrome.tabs.get(activeTabId, (activeTab) => {
    const currentTabInfo = {
      url: activeTab.url,
      tabId: activeTabId,
      startTime: Date.now(),
    };

    // Store the current tab information
    saveCurrentTabInfo(currentTabInfo).then(()=>{
      console.log("New tab entered and CurrentInfoObj Updated") ;
    })
  });
});


