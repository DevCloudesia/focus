const appUrlInput = document.getElementById("appUrl");
const secretInput = document.getElementById("secret");
const status = document.getElementById("status");

chrome.storage.sync.get(["appUrl", "extensionSecret"], (data) => {
  if (data.appUrl) appUrlInput.value = data.appUrl;
  if (data.extensionSecret) secretInput.value = data.extensionSecret;
});

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set(
    { appUrl: appUrlInput.value.trim(), extensionSecret: secretInput.value.trim() },
    () => {
      status.textContent = "Saved.";
      setTimeout(() => (status.textContent = ""), 2000);
    }
  );
});
