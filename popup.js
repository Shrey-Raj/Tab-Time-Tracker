chrome.storage.local.get(["urls"], (result) => {
  const storedUrls = result.urls;
  const urlList = document.getElementById("urlList");

  for (const url in storedUrls) {
    const urlInfo = storedUrls[url];
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `<strong>${url}</strong> - Total Time: ${urlInfo.totalTime / 1000} sec`;
    urlList.appendChild(li);
  }
});




