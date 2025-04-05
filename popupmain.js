document.addEventListener("DOMContentLoaded", () => {
    const saveSection = document.getElementById("save-section");
    const resetSection = document.getElementById("reset-section");
    const status = document.getElementById("status");
    const regIdInput = document.getElementById("reg_id");
    const pwdInput = document.getElementById("pwd");
    const themeToggle = document.getElementById("themeToggle");
  
    // Check stored credentials
    chrome.storage.local.get(["id", "password", "themeEnabled"], (result) => {
      if (result.id && result.password) {
        resetSection.style.display = "block";
      } else {
        saveSection.style.display = "block";
      }
  
      // Set theme toggle state
      themeToggle.checked = result.themeEnabled === true;
    });
  
    // Save credentials
    document.getElementById("saveBtn").addEventListener("click", () => {
      const id = regIdInput.value;
      const password = pwdInput.value;
  
      if (!id || !password) {
        status.textContent = "Please enter both fields.";
        return;
      }
  
      chrome.storage.local.set({
        id: btoa(id),
        password: btoa(password)
      }, () => {
        status.textContent = "Credentials saved!";
        saveSection.style.display = "none";
        resetSection.style.display = "block";
      });
    });
  
    // Reset credentials
    document.getElementById("resetBtn").addEventListener("click", () => {
      chrome.storage.local.remove(["id", "password"], () => {
        status.textContent = "Credentials have been reset!";
        resetSection.style.display = "none";
        saveSection.style.display = "block";
      });
    });
  
    // Theme toggle
    themeToggle.addEventListener("change", () => {
      chrome.storage.local.set({ themeEnabled: themeToggle.checked });
    });
  });
  