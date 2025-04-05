document.getElementById("saveCredentials").addEventListener("click", async function(){
    const reg_id = document.getElementById("reg_id").value;
    const pwd = document.getElementById("pwd").value;

    if (!reg_id || !pwd) {
        alert("Please enter both credentials.");
        return;
    }

    chrome.storage.local.set({
        "id": btoa(reg_id),
        "password": btoa(pwd)
    }, function(){
        if (chrome.runtime.lastError) {
            console.error("Error saving data:", chrome.runtime.lastError);
        } else {
            console.log("Credentials saved securely.");
        }
    });
    window.close();
});

