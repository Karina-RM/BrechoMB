const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let assignmentLookup = {};

async function loadHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    document.getElementById("backend-status").textContent = "backend: " + data.status;
  } catch {
    document.getElementById("backend-status").textContent = "backend unreachable";
  }
}

async function loadAssignments() {
  const [owners, suppliers] = await Promise.all([
    fetch("/api/owners").then((r) => r.json()),
    fetch("/api/suppliers").then((r) => r.json()),
  ]);

  const ownerById = Object.fromEntries(owners.map((o) => [o.id, o]));
  const select = document.getElementById("assignment");
  select.innerHTML = "";
  assignmentLookup = {};

  for (const owner of owners) {
    const opt = document.createElement("option");
    opt.value = `owner:${owner.id}`;
    opt.textContent = `${owner.name} (garimpada)`;
    select.appendChild(opt);
    assignmentLookup[`owner:${owner.id}`] = owner.name;
  }

  for (const supplier of suppliers) {
    const owner = ownerById[supplier.owner_id];
    const opt = document.createElement("option");
    opt.value = `supplier:${supplier.id}`;
    opt.textContent = `${supplier.name} (${owner ? owner.name : "?"})`;
    select.appendChild(opt);
    assignmentLookup[`supplier:${supplier.id}`] = supplier.name;
  }
}

function describeItem(item) {
  if (item.owner_id != null) {
    return assignmentLookup[`owner:${item.owner_id}`] || `owner #${item.owner_id}`;
  }
  return assignmentLookup[`supplier:${item.supplier_id}`] || `supplier #${item.supplier_id}`;
}

async function loadInventory() {
  const status = document.getElementById("status-filter").value;
  const url = status ? `/api/items?status=${status}` : "/api/items";
  const items = await fetch(url).then((r) => r.json());

  const body = document.getElementById("inventory-body");
  const empty = document.getElementById("inventory-empty");
  body.innerHTML = "";

  if (items.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const item of items) {
    const tr = document.createElement("tr");
    if (item.status === "withdrawn") tr.classList.add("withdrawn");
    tr.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.category ?? "—"}</td>
      <td>${item.size ?? "—"}</td>
      <td>${item.condition ?? "—"}</td>
      <td>${currency.format(item.price)}</td>
      <td>${describeItem(item)}</td>
      <td><span class="status-badge ${item.status}">${item.status.replace("_", " ")}</span></td>
    `;
    body.appendChild(tr);
  }
}

function setFormMessage(text, kind) {
  const el = document.getElementById("form-message");
  el.textContent = text;
  el.className = "form-message" + (kind ? " " + kind : "");
}

async function handleSubmit(event) {
  event.preventDefault();
  const assignment = document.getElementById("assignment").value;
  const [kind, id] = assignment.split(":");

  const formData = new FormData();
  formData.append(kind === "owner" ? "owner_id" : "supplier_id", id);
  formData.append("price", document.getElementById("price").value);

  const category = document.getElementById("category").value;
  const size = document.getElementById("size").value;
  const condition = document.getElementById("condition").value;
  const override = document.getElementById("commission_override").value;
  if (category) formData.append("category", category);
  if (size) formData.append("size", size);
  if (condition) formData.append("condition", condition);
  if (override) formData.append("commission_pct_override", override);

  for (const file of document.getElementById("photos").files) {
    formData.append("photos", file);
  }

  setFormMessage("Saving…", "");
  try {
    const res = await fetch("/api/items", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "failed to save item");
    }
    const item = await res.json();
    setFormMessage(`Added ${item.sku}`, "success");
    event.target.reset();
    loadInventory();
  } catch (err) {
    setFormMessage(err.message, "error");
  }
}

document.getElementById("item-form").addEventListener("submit", handleSubmit);
document.getElementById("status-filter").addEventListener("change", loadInventory);

loadHealth();
loadAssignments().then(loadInventory);
