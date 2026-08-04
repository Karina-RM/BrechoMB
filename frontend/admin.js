// Standalone admin panel — deliberately not shared with app.js/app state. Full raw
// CRUD over every table (except admin_auth, which the backend hardcodes out of reach)
// for one-person, power-tool use: plain text inputs per column, no relation pickers.

let tables = {}; // table name -> column metadata (from GET /api/admin/tables)
let currentTable = null;

function showAlert(message, kind) {
  const slot = document.getElementById("alert-slot");
  const isError = kind === "error";
  slot.innerHTML = `
    <div class="mb-4 rounded-md ${isError ? "bg-red-50 dark:bg-red-400/10" : "bg-green-50 dark:bg-green-400/10"} p-4">
      <p class="text-sm font-medium ${isError ? "text-red-800 dark:text-red-400" : "text-green-800 dark:text-green-400"}">${message}</p>
    </div>
  `;
}

async function describeApiError(res, fallback) {
  try {
    const data = await res.json();
    return data.detail || fallback;
  } catch {
    return fallback;
  }
}

function showLogin(message) {
  document.getElementById("login-view").classList.remove("hidden");
  document.getElementById("panel-view").classList.add("hidden");
  document.getElementById("login-error").textContent = message || "";
}

function renderTabs() {
  const tabNav = document.getElementById("table-tabs");
  tabNav.innerHTML = Object.keys(tables)
    .map(
      (name) => `
      <button type="button" data-table="${name}"
        class="rounded-md px-3 py-2 text-left text-sm font-medium ${name === currentTable ? "bg-gray-100 text-pink-600 dark:bg-white/10 dark:text-white" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"}">${name}</button>
    `
    )
    .join("");
  tabNav.querySelectorAll("[data-table]").forEach((btn) => {
    btn.addEventListener("click", () => selectTable(btn.dataset.table));
  });
}

async function showPanel() {
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("panel-view").classList.remove("hidden");
  renderTabs();
  await selectTable(currentTable || Object.keys(tables)[0]);
}

async function checkSession() {
  const res = await fetch("/api/admin/tables");
  if (res.status === 401) {
    showLogin();
    return;
  }
  tables = await res.json();
  await showPanel();
}

async function selectTable(name) {
  currentTable = name;
  renderTabs();
  document.getElementById("table-title").textContent = name;
  document.getElementById("new-row-form-slot").innerHTML = "";
  document.getElementById("alert-slot").innerHTML = "";
  await loadRows();
}

async function loadRows() {
  const columns = tables[currentTable];
  const head = document.getElementById("table-head");
  head.innerHTML =
    columns.map((c) => `<th class="px-3 py-2 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">${c.name}</th>`).join("") +
    `<th class="px-3 py-2"></th>`;

  const res = await fetch(`/api/admin/tables/${currentTable}/rows`);
  if (res.status === 401) {
    showLogin();
    return;
  }
  const rows = await res.json();
  const body = document.getElementById("table-body");
  body.innerHTML = rows
    .map(
      (row) => `
    <tr data-row-id="${row.id}">
      ${columns
        .map(
          (c) => `
        <td class="px-3 py-2">
          <input type="text" data-field="${c.name}" value="${row[c.name] === null ? "" : String(row[c.name]).replace(/"/g, "&quot;")}"
            ${c.pk ? "readonly" : ""}
            class="w-36 rounded-md ${c.pk ? "bg-gray-100 dark:bg-white/10" : "bg-white dark:bg-white/5"} px-2 py-1 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:text-white dark:outline-white/10" />
        </td>
      `
        )
        .join("")}
      <td class="flex gap-3 px-3 py-2 whitespace-nowrap">
        <button type="button" onclick="handleSaveRow(${row.id})" class="text-sm font-semibold text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Salvar</button>
        <button type="button" onclick="handleDeleteRow(${row.id})" class="text-sm font-semibold text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
      </td>
    </tr>
  `
    )
    .join("");

  const addBtn = document.getElementById("add-row-btn");
  addBtn.onclick = () => showNewRowForm(columns);
}

function showNewRowForm(columns) {
  const slot = document.getElementById("new-row-form-slot");
  const editable = columns.filter((c) => !c.pk);
  slot.innerHTML = `
    <div class="rounded-lg bg-gray-50 p-4 dark:bg-white/5">
      <p class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Nova linha</p>
      <div class="flex flex-wrap gap-2">
        ${editable
          .map(
            (c) => `
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400">${c.name}</label>
            <input type="text" data-new-field="${c.name}"
              class="w-36 rounded-md bg-white px-2 py-1 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:bg-white/5 dark:text-white dark:outline-white/10" />
          </div>
        `
          )
          .join("")}
      </div>
      <div class="mt-3 flex gap-3">
        <button type="button" onclick="handleAddRow()" class="rounded-md bg-pink-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400">Criar</button>
        <button type="button" onclick="document.getElementById('new-row-form-slot').innerHTML = ''" class="text-sm text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-white">Cancelar</button>
      </div>
    </div>
  `;
}

function collectFields(container, selector) {
  const fields = {};
  container.querySelectorAll(selector).forEach((input) => {
    const key = input.dataset.field || input.dataset.newField;
    fields[key] = input.value === "" ? null : input.value;
  });
  return fields;
}

async function handleSaveRow(rowId) {
  const tr = document.querySelector(`tr[data-row-id="${rowId}"]`);
  const fields = collectFields(tr, "[data-field]");
  delete fields.id;
  try {
    const res = await fetch(`/api/admin/tables/${currentTable}/rows/${rowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error(await describeApiError(res, "não foi possível salvar"));
    showAlert("Linha atualizada.", "success");
    await loadRows();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function handleAddRow() {
  const slot = document.getElementById("new-row-form-slot");
  const fields = collectFields(slot, "[data-new-field]");
  try {
    const res = await fetch(`/api/admin/tables/${currentTable}/rows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error(await describeApiError(res, "não foi possível criar a linha"));
    slot.innerHTML = "";
    showAlert("Linha criada.", "success");
    await loadRows();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function handleDeleteRow(rowId) {
  if (!confirm(`Excluir a linha ${rowId} de ${currentTable}? Esta ação não pode ser desfeita.`)) return;
  try {
    const res = await fetch(`/api/admin/tables/${currentTable}/rows/${rowId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await describeApiError(res, "não foi possível excluir"));
    showAlert("Linha excluída.", "success");
    await loadRows();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("admin-password").value;
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error(await describeApiError(res, "senha incorreta"));
    document.getElementById("admin-password").value = "";
    await checkSession();
  } catch (err) {
    showLogin(err.message);
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  currentTable = null;
  showLogin();
});

checkSession();
