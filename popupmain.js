const ACCOUNTS_KEY = "accounts";

function getAccounts(cb) {
  chrome.storage.local.get([ACCOUNTS_KEY, "id", "password"], (result) => {
    let accounts = Array.isArray(result[ACCOUNTS_KEY]) ? result[ACCOUNTS_KEY] : [];
    // Migrate the legacy single-account keys into the accounts list.
    if (result.id && result.password && !accounts.some(a => a.id === result.id)) {
      accounts.push({ id: result.id, password: result.password, isDefault: accounts.length === 0 });
      chrome.storage.local.set({ [ACCOUNTS_KEY]: accounts });
    }
    // Keep at most one default account.
    let seenDefault = false;
    accounts.forEach(a => {
      if (a.isDefault && seenDefault) a.isDefault = false;
      if (a.isDefault) seenDefault = true;
    });
    cb(accounts);
  });
}

function saveAccounts(accounts, cb) {
  chrome.storage.local.set({ [ACCOUNTS_KEY]: accounts }, cb);
}

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("account-list");
  const emptyEl = document.getElementById("empty");
  const status = document.getElementById("status");
  const regIdInput = document.getElementById("reg_id");
  const pwdInput = document.getElementById("pwd");

  function render() {
    getAccounts((accounts) => {
      if (!accounts.length) {
        emptyEl.style.display = "block";
        listEl.innerHTML = "";
        return;
      }
      emptyEl.style.display = "none";
      listEl.innerHTML = accounts.map((a, i) => {
        const id = atob(a.id);
        return `<div class="row">
          <span class="id">${id}${a.isDefault ? ' <span class="badge">Default</span>' : ""}</span>
          <span class="actions">
            <button class="btn-default" data-i="${i}" title="Set as default">${a.isDefault ? "★" : "☆"}</button>
            <button class="btn-del" data-i="${i}" data-action="delete" title="Delete">✕</button>
          </span>
        </div>`;
      }).join("");
    });
  }

  render();

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const action = btn.dataset.action;
    getAccounts((accounts) => {
      const acc = accounts[i];
      if (!acc) return;
      if (action === "delete") {
        if (confirm(`Delete ID ${atob(acc.id)}?`)) {
          accounts = accounts.filter((_, idx) => idx !== i);
          if (accounts.length === 1) accounts[0].isDefault = true;
          saveAccounts(accounts, render);
        }
      } else {
        accounts.forEach(a => { a.isDefault = (a.id === acc.id); });
        saveAccounts(accounts, render);
      }
    });
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    const id = regIdInput.value.trim();
    const password = pwdInput.value;
    if (!id || !password) {
      status.textContent = "Please enter both fields.";
      status.style.color = "#dc3545";
      return;
    }
    getAccounts((accounts) => {
      const idEnc = btoa(id);
      if (accounts.some(a => a.id === idEnc)) {
        status.textContent = "This ID is already saved.";
        status.style.color = "#dc3545";
        return;
      }
      accounts.push({ id: idEnc, password: btoa(password), isDefault: accounts.length === 0 });
      saveAccounts(accounts, () => {
        status.textContent = "Account added!";
        status.style.color = "#28a745";
        regIdInput.value = "";
        pwdInput.value = "";
        render();
      });
    });
  });
});