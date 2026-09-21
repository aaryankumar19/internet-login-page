// ===== Multi-account storage helpers =====

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

function addAccount(idRaw, pwdRaw, cb) {
  getAccounts((accounts) => {
    const idEnc = btoa(idRaw);
    if (accounts.some(a => a.id === idEnc)) {
      showToast("This ID is already saved.");
      cb && cb(accounts);
      return;
    }
    accounts.push({ id: idEnc, password: btoa(pwdRaw), isDefault: accounts.length === 0 });
    saveAccounts(accounts, () => cb && cb(accounts));
  });
}

function setDefaultAccount(idEnc, cb) {
  getAccounts((accounts) => {
    accounts.forEach(a => { a.isDefault = (a.id === idEnc); });
    saveAccounts(accounts, () => cb && cb(accounts));
  });
}

function deleteAccount(idEnc, cb) {
  getAccounts((accounts) => {
    accounts = accounts.filter(a => a.id !== idEnc);
    if (accounts.length === 1) accounts[0].isDefault = true;
    saveAccounts(accounts, () => cb && cb(accounts));
  });
}

// ===== Login action (fills the LPU form for the given account) =====

function autoSignIn(account) {
  if (!account || !account.id || !account.password) {
    showToast("Error: ID or Password is missing in storage!");
    return;
  }

  const usernameField = document.querySelector('input[name="username"]');
  if (usernameField) usernameField.value = parseInt(atob(account.id));

  const passwordField = document.querySelector('input[name="password"]');
  if (passwordField) passwordField.value = atob(account.password);

  const policyBox = document.getElementById("agreepolicy");
  if (policyBox) policyBox.click();

  const loginButton = document.getElementById("loginbtn");
  if (loginButton) loginButton.click();
}

// ===== Panel UI (injected only on the login page) =====

let panelMode = "manage"; // "manage" | "picker"

function isLoginPage() {
  return !!document.querySelector('input[name="username"]');
}

function injectPanelCSS() {
  const style = document.createElement("style");
  style.textContent = `
    #ml-fab {
      position: fixed; top: 16px; right: 16px; z-index: 999998;
      width: 44px; height: 44px; border-radius: 50%;
      background: #007bff; color: #fff; border: none;
      font-size: 20px; cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,.25);
    }
    #ml-fab:hover { background: #0056b3; }

    #ml-panel {
      position: fixed; top: 70px; right: 16px; z-index: 999999;
      width: 300px; max-height: 72vh; overflow-y: auto;
      background: #fff; color: #212529; border: 1px solid #dee2e6;
      border-radius: 12px; padding: 16px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,.15);
    }
    #ml-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
    }
    #ml-header h3 { margin: 0; font-size: 16px; color: #343a40; }
    #ml-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #6c757d; }
    #ml-close:hover { color: #343a40; }

    #ml-panel input {
      display: block; width: 100%; box-sizing: border-box;
      margin: 6px 0; padding: 9px; font-size: 13px;
      border: 1px solid #ccc; border-radius: 6px;
    }
    #ml-panel .ml-btn {
      margin: 4px; padding: 6px 10px; font-size: 12px; cursor: pointer;
      border: none; border-radius: 6px; color: #fff; font-family: Arial, sans-serif;
    }
    .ml-save { background: #007bff; width: 100%; margin-left: 0; }
    .ml-save:hover { background: #0056b3; }
    .ml-login { background: #28a745; }
    .ml-login:hover { background: #218838; }
    .ml-default { background: #ffc107; color: #212529; }
    .ml-default:hover { background: #e0a800; }
    .ml-del { background: #6c757d; }
    .ml-del:hover { background: #5a6268; }

    #ml-list .ml-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px; margin: 6px 0; background: #f1f3f5; border-radius: 6px;
    }
    #ml-list .ml-id { font-size: 13px; font-weight: bold; color: #212529; }
    .ml-empty { text-align: center; color: #868e96; font-size: 13px; padding: 12px 0; }
    .ml-badge {
      background: #28a745; color: #fff; padding: 2px 8px;
      border-radius: 10px; font-size: 10px; margin-left: 6px;
    }

    #ml-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      z-index: 999999; background: #343a40; color: #fff;
      padding: 10px 16px; border-radius: 8px; font-size: 13px;
      box-shadow: 0 2px 10px rgba(0,0,0,.3); display: none;
    }
  `;
  document.head.appendChild(style);
}

function showToast(msg) {
  let t = document.getElementById("ml-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "ml-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = "none"; }, 2500);
}

function buildPanel() {
  const fab = document.createElement("button");
  fab.id = "ml-fab";
  fab.title = "Manage IDs";
  fab.textContent = "⚙";
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.id = "ml-panel";
  panel.style.display = "none";
  panel.innerHTML = `
    <div id="ml-header">
      <h3 id="ml-title">Manage IDs</h3>
      <button id="ml-close" title="Close">✕</button>
    </div>
    <div id="ml-form">
      <input type="number" id="ml-id" placeholder="Registration Number">
      <input type="password" id="ml-pwd" placeholder="Password">
      <button class="ml-btn ml-save" id="ml-save">Add Account</button>
    </div>
    <div id="ml-list"></div>
  `;
  document.body.appendChild(panel);

  fab.addEventListener("click", () => {
    panelMode = "manage";
    openPanel();
  });

  document.getElementById("ml-close").addEventListener("click", () => {
    panel.style.display = "none";
  });

  document.getElementById("ml-save").addEventListener("click", () => {
    const id = document.getElementById("ml-id").value.trim();
    const pwd = document.getElementById("ml-pwd").value;
    if (!id || !pwd) { showToast("Enter both ID and password."); return; }
    addAccount(id, pwd, (updated) => {
      document.getElementById("ml-id").value = "";
      document.getElementById("ml-pwd").value = "";
      showToast("Account added!");
      renderList(updated, panelMode);
    });
  });

  document.getElementById("ml-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    const action = btn.dataset.action;
    getAccounts((accounts) => {
      const acc = accounts[idx];
      if (!acc) return;
      if (action === "login") {
        autoSignIn(acc);
      } else if (action === "default") {
        setDefaultAccount(acc.id, () => renderListFromStorage());
      } else if (action === "delete") {
        if (confirm(`Delete ID ${atob(acc.id)}?`)) {
          deleteAccount(acc.id, () => renderListFromStorage());
        }
      }
    });
  });
}

function openPanel() {
  const panel = document.getElementById("ml-panel");
  document.getElementById("ml-title").textContent = panelMode === "picker" ? "Choose an ID to login" : "Manage IDs";
  document.getElementById("ml-form").style.display = panelMode === "picker" ? "none" : "block";
  panel.style.display = "block";
  renderListFromStorage();
}

function renderListFromStorage() {
  getAccounts((accounts) => renderList(accounts, panelMode));
}

function renderList(accounts, mode) {
  const listEl = document.getElementById("ml-list");
  if (!accounts.length) {
    listEl.innerHTML = '<div class="ml-empty">No IDs saved yet.</div>';
    return;
  }
  listEl.innerHTML = accounts.map((a, i) => {
    const id = atob(a.id);
    const defBtn = mode === "manage"
      ? `<button class="ml-btn ml-default" data-action="default" data-index="${i}" title="Set as default">${a.isDefault ? "★" : "☆"}</button>`
      : "";
    const delBtn = mode === "manage"
      ? `<button class="ml-btn ml-del" data-action="delete" data-index="${i}" title="Delete">✕</button>`
      : "";
    return `<div class="ml-row">
      <span class="ml-id">${id}${a.isDefault ? ' <span class="ml-badge">Default</span>' : ""}</span>
      <span>${defBtn}<button class="ml-btn ml-login" data-action="login" data-index="${i}">Login</button>${delBtn}</span>
    </div>`;
  }).join("");
}

// ===== Double-click: auto-login with default, else let the user choose =====

function handleDoubleClick() {
  getAccounts((accounts) => {
    if (accounts.length === 0) {
      showToast("No IDs saved. Open ⚙ to add one.");
      return;
    }
    const def = accounts.find(a => a.isDefault);
    if (def) { autoSignIn(def); return; }
    if (accounts.length === 1) { autoSignIn(accounts[0]); return; }
    panelMode = "picker";
    openPanel();
  });
}

// Trigger on double-click (login page only, ignore clicks inside the panel UI)
document.addEventListener("dblclick", (e) => {
  if (!isLoginPage()) return;
  if (e.target.closest("#ml-panel, #ml-fab")) return;
  handleDoubleClick();
});

// Boot the multi-login UI on the login page only
function boot() {
  if (!isLoginPage()) return;
  injectPanelCSS();
  buildPanel();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// Enable the portal's login buttons
const cls = document.getElementsByClassName("btn");
for (var i = 0; i < cls.length; i++) {
  cls[i].removeAttribute("disabled");
}