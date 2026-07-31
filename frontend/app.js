const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_LABELS = {
  in_stock: "em estoque",
  sold: "vendido",
  withdrawn: "retirado",
};

let assignmentLookup = {};
let saleItemsById = {};
let ownerAName = "Dona A";
let ownerBName = "Dona B";
let ownerById = {};
let currentSupplierDetailId = null;

function formatDate(sqliteTimestamp) {
  const date = new Date(sqliteTimestamp.replace(" ", "T") + "Z");
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

async function loadHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    document.getElementById("backend-status").textContent =
      data.status === "ok" ? "conectado" : "sistema indisponível";
  } catch {
    document.getElementById("backend-status").textContent = "sistema indisponível";
  }
}

async function loadAssignments() {
  const [owners, suppliers] = await Promise.all([
    fetch("/api/owners").then((r) => r.json()),
    fetch("/api/suppliers").then((r) => r.json()),
  ]);

  ownerById = Object.fromEntries(owners.map((o) => [o.id, o]));
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

  const supplierOwnerSelect = document.getElementById("supplier-owner");
  supplierOwnerSelect.innerHTML = "";
  for (const owner of owners) {
    const opt = document.createElement("option");
    opt.value = owner.id;
    opt.textContent = owner.name;
    supplierOwnerSelect.appendChild(opt);
  }

  const ownerA = owners.find((o) => o.is_cut_owner);
  const ownerB = owners.find((o) => !o.is_cut_owner);
  if (ownerA) {
    ownerAName = ownerA.name;
    document.getElementById("owner-a-header").textContent = ownerA.name;
  }
  if (ownerB) {
    ownerBName = ownerB.name;
    document.getElementById("owner-b-header").textContent = ownerB.name;
  }

  return loadSuppliers();
}

function describeItem(item) {
  if (item.owner_id != null) {
    return assignmentLookup[`owner:${item.owner_id}`] || `proprietária #${item.owner_id}`;
  }
  return assignmentLookup[`supplier:${item.supplier_id}`] || `fornecedora #${item.supplier_id}`;
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
  } else {
    empty.hidden = true;
    for (const item of items) {
      const tr = document.createElement("tr");
      if (item.status === "withdrawn") tr.classList.add("withdrawn");
      const canWithdraw = item.status === "in_stock" && item.supplier_id != null;
      tr.innerHTML = `
        <td>${item.sku}</td>
        <td>${item.category ?? "—"}</td>
        <td>${item.size ?? "—"}</td>
        <td>${item.condition ?? "—"}</td>
        <td>${currency.format(item.price)}</td>
        <td>${describeItem(item)}</td>
        <td><span class="status-badge ${item.status}">${STATUS_LABELS[item.status] || item.status}</span></td>
        <td>${canWithdraw ? `<button type="button" class="btn-small btn-danger" onclick="handleWithdraw(${item.id})">Retirar</button>` : "—"}</td>
      `;
      body.appendChild(tr);
    }
  }

  return loadSaleItems();
}

async function loadSaleItems() {
  const items = await fetch("/api/items?status=in_stock").then((r) => r.json());
  saleItemsById = Object.fromEntries(items.map((i) => [i.id, i]));

  const select = document.getElementById("sale-item");
  const previous = select.value;
  select.innerHTML = "";

  if (items.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "nenhuma peça em estoque";
    select.appendChild(opt);
    document.getElementById("sale-price").value = "";
    return;
  }

  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.sku} — ${item.category ?? "peça"} — ${currency.format(item.price)}`;
    select.appendChild(opt);
  }

  select.value = saleItemsById[previous] ? previous : items[0].id;
  updateSalePricePlaceholder();
}

function updateSalePricePlaceholder() {
  const selected = saleItemsById[document.getElementById("sale-item").value];
  if (selected) {
    document.getElementById("sale-price").value = selected.price;
  }
}

async function loadSales() {
  const sales = await fetch("/api/sales").then((r) => r.json());

  const body = document.getElementById("sales-body");
  const empty = document.getElementById("sales-empty");
  body.innerHTML = "";

  if (sales.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const sale of sales) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${sale.sku}</td>
      <td>${formatDate(sale.sale_date)}</td>
      <td>${currency.format(sale.sale_price)}</td>
      <td>${currency.format(sale.split.owner_a)}</td>
      <td>${currency.format(sale.split.owner_b)}</td>
      <td>${currency.format(sale.split.supplier)}</td>
    `;
    body.appendChild(tr);
  }
}

async function loadSuppliers() {
  const suppliers = await fetch("/api/suppliers").then((r) => r.json());

  const body = document.getElementById("suppliers-body");
  const empty = document.getElementById("suppliers-empty");
  body.innerHTML = "";

  if (suppliers.length === 0) {
    empty.hidden = false;
  } else {
    empty.hidden = true;
    for (const supplier of suppliers) {
      const owner = ownerById[supplier.owner_id];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${supplier.name}</td>
        <td>${owner ? owner.name : "—"}</td>
        <td>
          <div class="row-actions">
            <input type="number" class="commission-input" id="commission-input-${supplier.id}"
                   value="${supplier.commission_pct}" step="0.1" min="0" max="100" />
            <button type="button" class="btn-small" onclick="handleCommissionSave(${supplier.id})">Salvar</button>
          </div>
        </td>
        <td><button type="button" class="btn-small btn-secondary" onclick="showSupplierDetail(${supplier.id})">Detalhes</button></td>
      `;
      body.appendChild(tr);
    }
  }

  if (currentSupplierDetailId) {
    await showSupplierDetail(currentSupplierDetailId);
  }
}

async function handleCommissionSave(supplierId) {
  const input = document.getElementById(`commission-input-${supplierId}`);
  const commission_pct = Number(input.value);
  try {
    const res = await fetch(`/api/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission_pct }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "não foi possível salvar a comissão");
    }
    loadSuppliers();
  } catch (err) {
    alert(err.message);
  }
}

async function showSupplierDetail(supplierId) {
  currentSupplierDetailId = supplierId;
  const supplier = await fetch(`/api/suppliers/${supplierId}`).then((r) => r.json());

  const panel = document.getElementById("supplier-detail");
  panel.hidden = false;
  document.getElementById("supplier-detail-title").textContent = `Detalhes — ${supplier.name}`;
  document.getElementById("supplier-detail-owed").textContent =
    `total a repassar: ${currency.format(supplier.total_owed)}`;

  const itemsBody = document.getElementById("supplier-items-body");
  itemsBody.innerHTML = supplier.items.length
    ? supplier.items
        .map(
          (item) => `
        <tr>
          <td>${item.sku}</td>
          <td>${item.category ?? "—"}</td>
          <td>${currency.format(item.price)}</td>
          <td><span class="status-badge ${item.status}">${STATUS_LABELS[item.status] || item.status}</span></td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="4" class="empty-state">Nenhuma peça fornecida ainda.</td></tr>`;

  const withdrawalsBody = document.getElementById("supplier-withdrawals-body");
  const withdrawalsEmpty = document.getElementById("supplier-withdrawals-empty");
  withdrawalsBody.innerHTML = "";
  if (supplier.withdrawals.length === 0) {
    withdrawalsEmpty.hidden = false;
  } else {
    withdrawalsEmpty.hidden = true;
    withdrawalsBody.innerHTML = supplier.withdrawals
      .map(
        (w) => `
      <tr>
        <td>${w.sku}</td>
        <td>${formatDate(w.intake_date)}</td>
        <td>${formatDate(w.withdrawn_date)}</td>
        <td>${w.days_in_store}</td>
      </tr>
    `
      )
      .join("");
  }
}

async function handleWithdraw(itemId) {
  if (!confirm("Confirmar retirada desta peça pela fornecedora?")) return;
  try {
    const res = await fetch(`/api/items/${itemId}/withdraw`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "não foi possível registrar a retirada");
    }
    await loadInventory();
    if (currentSupplierDetailId) await showSupplierDetail(currentSupplierDetailId);
  } catch (err) {
    alert(err.message);
  }
}

function setFormMessage(elementId, text, kind) {
  const el = document.getElementById(elementId);
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

  setFormMessage("form-message", "Salvando…", "");
  try {
    const res = await fetch("/api/items", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "não foi possível salvar a peça");
    }
    const item = await res.json();
    setFormMessage("form-message", `Peça ${item.sku} adicionada`, "success");
    event.target.reset();
    loadInventory();
  } catch (err) {
    setFormMessage("form-message", err.message, "error");
  }
}

async function handleSaleSubmit(event) {
  event.preventDefault();
  const itemId = Number(document.getElementById("sale-item").value);
  const salePrice = Number(document.getElementById("sale-price").value);
  if (!itemId) {
    setFormMessage("sale-message", "não há peça em estoque para vender", "error");
    return;
  }

  setFormMessage("sale-message", "Registrando…", "");
  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId, sale_price: salePrice }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "não foi possível registrar a venda");
    }
    const sale = await res.json();
    setFormMessage(
      "sale-message",
      `Venda de ${sale.sku} registrada: ` +
        `${ownerAName} ${currency.format(sale.split.owner_a)}, ` +
        `${ownerBName} ${currency.format(sale.split.owner_b)}, ` +
        `Fornecedora ${currency.format(sale.split.supplier)}`,
      "success"
    );
    await loadInventory();
    await loadSales();
  } catch (err) {
    setFormMessage("sale-message", err.message, "error");
  }
}

async function handleSupplierSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("supplier-name").value;
  const owner_id = Number(document.getElementById("supplier-owner").value);
  const commission_pct = Number(document.getElementById("supplier-commission").value);

  setFormMessage("supplier-message", "Salvando…", "");
  try {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, owner_id, commission_pct }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "não foi possível salvar a fornecedora");
    }
    const supplier = await res.json();
    setFormMessage("supplier-message", `Fornecedora ${supplier.name} adicionada`, "success");
    event.target.reset();
    await loadAssignments();
  } catch (err) {
    setFormMessage("supplier-message", err.message, "error");
  }
}

document.getElementById("item-form").addEventListener("submit", handleSubmit);
document.getElementById("status-filter").addEventListener("change", loadInventory);
document.getElementById("sale-form").addEventListener("submit", handleSaleSubmit);
document.getElementById("sale-item").addEventListener("change", updateSalePricePlaceholder);
document.getElementById("supplier-form").addEventListener("submit", handleSupplierSubmit);

loadHealth();
loadAssignments().then(loadInventory);
loadSales();
