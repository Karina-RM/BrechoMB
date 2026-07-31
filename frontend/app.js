const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_LABELS = {
  in_stock: "em estoque",
  sold: "vendido",
  withdrawn: "retirado",
};

const STATUS_DOT_COLOR = {
  in_stock: "fill-green-500 dark:fill-green-400",
  sold: "fill-blue-500 dark:fill-blue-400",
  withdrawn: "fill-red-500 dark:fill-red-400",
};

// Kept in sync with backend/enums.py — controlled vocabularies so free-text intake
// doesn't fragment inventory data (e.g. "vestido" vs "Vestido" vs "vestido floral").
const ITEM_DEPARTMENTS = ["Roupas e Acessórios", "Casa e Decoração", "Eletrônicos e Eletrodomésticos", "Livros e Mídia", "Brinquedos e Jogos", "Outros"];

// Mirrors backend/enums.py DEPARTMENT_CATEGORIES — which categories show up once a
// department is chosen, so the category dropdown stays short instead of listing
// every category from every department at once.
const DEPARTMENT_CATEGORIES = {
  "Roupas e Acessórios": ["Vestido", "Blusa", "Camisa", "Saia", "Calça", "Short", "Casaco", "Jaqueta", "Moletom", "Macacão", "Conjunto", "Acessório", "Calçado", "Bolsa", "Outro"],
  "Casa e Decoração": ["Móveis", "Decoração", "Iluminação", "Cama, mesa e banho", "Cortinas e tapetes", "Utensílios de cozinha", "Louças e vidros", "Outro"],
  "Eletrônicos e Eletrodomésticos": ["Eletrodoméstico", "Eletrônico", "Informática", "Outro"],
  "Livros e Mídia": ["Livro", "Mídia (CD/DVD/vinil)", "Revista", "Outro"],
  "Brinquedos e Jogos": ["Brinquedo", "Jogo", "Outro"],
  Outros: ["Outro"],
};

// Tamanho only makes sense inside Roupas e Acessórios — hidden for every other department.
const SIZE_APPLICABLE_DEPARTMENT = "Roupas e Acessórios";

// Within that department, which size vocabulary applies per category. Categories not
// listed here (Vestido, Blusa, Calça, ...) default to ordinary clothing sizing.
// Mirrors backend/enums.py SHOE_SIZE_CATEGORIES / SIZELESS_CATEGORIES.
const SHOE_SIZE_CATEGORIES = new Set(["Calçado"]);
const SIZELESS_CATEGORIES = new Set(["Acessório", "Bolsa"]);

const ITEM_SIZES = ["PP", "P", "M", "G", "GG", "XG", "Único"];
const SHOE_SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "Único"];
const ITEM_CONDITIONS = ["Novo com etiqueta", "Novo sem etiqueta", "Seminovo", "Usado"];

function populateSelect(id, options, placeholder) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${placeholder}</option>` + options.map((o) => `<option value="${o}">${o}</option>`).join("");
}

function updateSizeField(department, category) {
  const sizeField = document.getElementById("size-field");
  if (department !== SIZE_APPLICABLE_DEPARTMENT || SIZELESS_CATEGORIES.has(category)) {
    sizeField.hidden = true;
    // Clear any size picked before switching away, so a stale value (e.g. a shoe
    // number left over from Calçado) never gets submitted for an unrelated category.
    document.getElementById("size").value = "";
    return;
  }
  sizeField.hidden = false;
  if (SHOE_SIZE_CATEGORIES.has(category)) {
    populateSelect("size", SHOE_SIZES, "Selecione o tamanho (numeração BR)");
  } else {
    populateSelect("size", ITEM_SIZES, "Selecione o tamanho");
  }
}

function updateCategoryOptions(department) {
  const categorySelect = document.getElementById("category");
  if (!department) {
    categorySelect.innerHTML = '<option value="">Selecione o departamento primeiro</option>';
    categorySelect.disabled = true;
    updateSizeField(department, "");
    return;
  }
  categorySelect.disabled = false;
  populateSelect("category", DEPARTMENT_CATEGORIES[department] || [], "Selecione a categoria");
  updateSizeField(department, "");
}

const NAV_ITEMS = [
  {
    view: "inventory",
    label: "Estoque",
    path: `<path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" stroke-linecap="round" stroke-linejoin="round" />`,
  },
  {
    view: "sales",
    label: "Vendas",
    path: `<path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke-linecap="round" stroke-linejoin="round" />`,
  },
  {
    view: "suppliers",
    label: "Fornecedoras",
    path: `<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" stroke-linecap="round" stroke-linejoin="round" />`,
  },
  {
    view: "reports",
    label: "Relatórios",
    path: `<path d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" stroke-linecap="round" stroke-linejoin="round" /><path d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" stroke-linecap="round" stroke-linejoin="round" />`,
  },
];

const VIEW_TITLES = {
  inventory: "Estoque",
  "item-detail": "Estoque",
  sales: "Vendas",
  suppliers: "Fornecedoras",
  "supplier-detail": "Fornecedoras",
  reports: "Relatórios",
};

let assignmentLookup = {};
let saleItemsById = {};
let ownerAName = "Dona A";
let ownerBName = "Dona B";
let ownerById = {};
let currentSupplierDetailId = null;
let currentItemDetailId = null;

function formatDate(sqliteTimestamp) {
  const date = new Date(sqliteTimestamp.replace(" ", "T") + "Z");
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Brazilian number notation uses "," as the decimal separator (e.g. "100,00"), which
// native <input type="number"> silently rejects — the browser sanitizes the value to ""
// without any visible error, so a field that looks filled submits as empty. These
// currency/percentage fields are plain text inputs instead; this normalizes either
// notation to a value Number()/parseFloat() can read. Returns "" if nothing usable.
function parseDecimal(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  return normalized === "" || Number.isNaN(Number(normalized)) ? "" : normalized;
}

// FastAPI's own validation errors (missing/invalid Form fields) return `detail` as a
// list of {loc, msg} objects rather than a string — our own HTTPException calls always
// use a plain string. Handle both so a validation failure never renders as "[object
// Object]" in the UI.
function describeApiError(err, fallback) {
  const detail = err && err.detail;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((e) => {
        const field = Array.isArray(e?.loc) ? e.loc[e.loc.length - 1] : null;
        return field ? `${field}: ${e.msg}` : e?.msg || fallback;
      })
      .join("; ");
  }
  return fallback;
}

function statusBadge(status) {
  const dot = STATUS_DOT_COLOR[status] || "fill-gray-400";
  return `
    <span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">
      <svg viewBox="0 0 6 6" aria-hidden="true" class="size-1.5 ${dot}"><circle r="3" cx="3" cy="3" /></svg>
      ${STATUS_LABELS[status] || status}
    </span>
  `;
}

function alertBlock(message, kind) {
  const isError = kind === "error";
  const bg = isError ? "bg-red-50 dark:bg-red-500/10 dark:outline dark:outline-red-500/20" : "bg-green-50 dark:bg-green-500/10 dark:outline dark:outline-green-500/20";
  const iconColor = isError ? "text-red-400" : "text-green-400";
  const textColor = isError ? "text-red-800 dark:text-red-300" : "text-green-800 dark:text-green-300";
  const btnColor = isError
    ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
    : "bg-green-50 text-green-500 hover:bg-green-100 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-500/10";
  const icon = isError
    ? `<path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-1-5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm.25-6.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Z" clip-rule="evenodd" fill-rule="evenodd" />`
    : `<path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />`;
  return `
    <div class="rounded-md ${bg} p-4">
      <div class="flex">
        <div class="shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5 ${iconColor}">${icon}</svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium ${textColor}">${message}</p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button type="button" onclick="this.closest('[data-alert]').remove()" class="inline-flex rounded-md ${btnColor} p-1.5 focus-visible:outline-hidden">
              <span class="sr-only">Dispensar</span>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showAlert(slotId, message, kind) {
  const slot = document.getElementById(slotId);
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-alert", "");
  wrapper.innerHTML = alertBlock(message, kind);
  slot.innerHTML = "";
  slot.appendChild(wrapper);
}

// --- Navigation / routing -------------------------------------------------

function renderNav() {
  const html = `
    <ul role="list" class="flex flex-1 flex-col gap-y-7">
      <li>
        <ul role="list" class="-mx-2 space-y-1">
          ${NAV_ITEMS.map(
            (item) => `
            <li>
              <a href="#${item.view}" data-nav="${item.view}" class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-pink-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-pink-600 dark:group-hover:text-white">
                  ${item.path}
                </svg>
                ${item.label}
              </a>
            </li>
          `
          ).join("")}
        </ul>
      </li>
    </ul>
  `;
  document.getElementById("mobile-nav").innerHTML = html;
  document.getElementById("desktop-nav").innerHTML = html;
}

function setActiveNav(view) {
  const activeClasses = ["bg-gray-50", "dark:bg-white/5", "text-pink-600", "dark:text-white"];
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const icon = link.querySelector("svg");
    if (link.dataset.nav === view) {
      link.classList.add(...activeClasses);
      icon.classList.add("text-pink-600", "dark:text-white");
    } else {
      link.classList.remove(...activeClasses);
      icon.classList.remove("text-pink-600", "dark:text-white");
    }
  });
}

function parseHash() {
  const hash = location.hash.replace(/^#/, "") || "inventory";
  const [view, id] = hash.split("/");
  return { view, id };
}

async function showView() {
  const { view, id } = parseHash();
  const knownViews = ["inventory", "sales", "suppliers", "reports"];
  const resolvedView =
    view === "suppliers" && id ? "supplier-detail" : view === "items" && id ? "item-detail" : knownViews.includes(view) ? view : "inventory";

  document.querySelectorAll("[data-view]").forEach((section) => {
    section.hidden = section.dataset.view !== resolvedView;
  });
  document.getElementById("page-title").textContent = VIEW_TITLES[resolvedView] || "Brechó";
  setActiveNav(resolvedView === "supplier-detail" ? "suppliers" : resolvedView === "item-detail" ? "inventory" : resolvedView);
  document.getElementById("mobile-sidebar").close();

  if (resolvedView === "inventory") await loadInventory();
  else if (resolvedView === "item-detail") await showItemDetail(Number(id));
  else if (resolvedView === "sales") await loadSales();
  else if (resolvedView === "suppliers") await loadSuppliers();
  else if (resolvedView === "supplier-detail") await showSupplierDetail(Number(id));
  else if (resolvedView === "reports") await loadReports();
}

// --- Data loading -----------------------------------------------------------

async function loadHealth() {
  const pill = document.getElementById("backend-status");
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    const ok = data.status === "ok";
    pill.innerHTML = `
      <svg viewBox="0 0 6 6" aria-hidden="true" class="size-1.5 ${ok ? "fill-green-500 dark:fill-green-400" : "fill-red-500 dark:fill-red-400"}"><circle r="3" cx="3" cy="3" /></svg>
      ${ok ? "conectado" : "sistema indisponível"}
    `;
  } catch {
    pill.innerHTML = `
      <svg viewBox="0 0 6 6" aria-hidden="true" class="size-1.5 fill-red-500 dark:fill-red-400"><circle r="3" cx="3" cy="3" /></svg>
      sistema indisponível
    `;
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
}

function describeItem(item) {
  if (item.owner_id != null) {
    return assignmentLookup[`owner:${item.owner_id}`] || `proprietária #${item.owner_id}`;
  }
  return assignmentLookup[`supplier:${item.supplier_id}`] || `fornecedora #${item.supplier_id}`;
}

async function loadInventory() {
  const status = document.getElementById("status-filter").value;
  const department = document.getElementById("department-filter").value;
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (department) params.set("department", department);
  const query = params.toString();
  const items = await fetch(`/api/items${query ? `?${query}` : ""}`).then((r) => r.json());

  const body = document.getElementById("inventory-body");
  const empty = document.getElementById("inventory-empty");
  body.innerHTML = "";

  if (items.length === 0) {
    empty.hidden = false;
  } else {
    empty.hidden = true;
    for (const item of items) {
      const tr = document.createElement("tr");
      if (item.status === "withdrawn") tr.classList.add("opacity-50");
      const canWithdraw = item.status === "in_stock" && item.supplier_id != null;
      const canDelete = item.status === "in_stock";
      tr.innerHTML = `
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${item.sku}</td>
        <td class="extra-col px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.department ?? "—"}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.category ?? "—"}</td>
        <td class="extra-col px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.brand ?? "—"}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.size ?? "—"}</td>
        <td class="extra-col px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.condition ?? "—"}</td>
        <td class="extra-col px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.color ?? "—"}</td>
        <td class="extra-col px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.material ?? "—"}</td>
        <td class="extra-col max-w-40 truncate px-3 py-4 text-sm text-gray-500 dark:text-gray-400" title="${item.observations ?? ""}">${item.observations ?? "—"}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(item.price)}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${describeItem(item)}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap">${statusBadge(item.status)}</td>
        <td class="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
          <div class="flex justify-end gap-4">
            <a href="#items/${item.id}" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Detalhes</a>
            ${
              canWithdraw
                ? `<button type="button" onclick="handleWithdraw(${item.id})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Retirar</button>`
                : ""
            }
            ${
              canDelete
                ? `<button type="button" onclick="handleDeleteItem(${item.id})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>`
                : ""
            }
          </div>
        </td>
      `;
      body.appendChild(tr);
    }
  }

  await loadSaleItems();
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
    document.getElementById("sale-price").value = String(selected.price).replace(".", ",");
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
      <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${sale.sku}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(sale.sale_date)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.sale_price)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.owner_a)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.owner_b)}</td>
      <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap text-gray-500 sm:pr-0 dark:text-gray-400">${currency.format(sale.split.supplier)}</td>
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
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${supplier.name}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${owner ? owner.name : "—"}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap">
          <div class="flex items-center gap-2">
            <input type="text" inputmode="decimal" id="commission-input-${supplier.id}" value="${String(supplier.commission_pct).replace(".", ",")}"
              class="w-20 rounded-md bg-white px-2 py-1 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:bg-white/5 dark:text-white dark:outline-white/10" />
            <button type="button" onclick="handleCommissionSave(${supplier.id})" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Salvar</button>
          </div>
        </td>
        <td class="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
          <a href="#suppliers/${supplier.id}" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Detalhes</a>
        </td>
      `;
      body.appendChild(tr);
    }
  }
}

async function handleCommissionSave(supplierId) {
  const input = document.getElementById(`commission-input-${supplierId}`);
  const commission_pct = Number(parseDecimal(input.value));
  try {
    const res = await fetch(`/api/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission_pct }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível salvar a comissão"));
    }
    await loadSuppliers();
    showAlert("suppliers-alert-slot", "Comissão atualizada.", "success");
  } catch (err) {
    showAlert("suppliers-alert-slot", err.message, "error");
  }
}

async function showSupplierDetail(supplierId) {
  currentSupplierDetailId = supplierId;
  const supplier = await fetch(`/api/suppliers/${supplierId}`).then((r) => r.json());

  document.getElementById("supplier-detail-title").textContent = supplier.name;
  document.getElementById("supplier-detail-name").textContent = supplier.name;
  document.getElementById("supplier-detail-owed").textContent = `total a repassar: ${currency.format(supplier.total_owed)}`;

  const itemsBody = document.getElementById("supplier-items-body");
  itemsBody.innerHTML = supplier.items.length
    ? supplier.items
        .map(
          (item) => `
        <tr>
          <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${item.sku}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.category ?? "—"}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(item.price)}</td>
          <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap sm:pr-0">${statusBadge(item.status)}</td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="4" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma peça fornecida ainda.</td></tr>`;

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
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${w.sku}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(w.intake_date)}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(w.withdrawn_date)}</td>
        <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap text-gray-500 sm:pr-0 dark:text-gray-400">${w.days_in_store}</td>
      </tr>
    `
      )
      .join("");
  }
}

function detailRow(label, value) {
  return `
    <div class="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt class="text-sm font-medium text-gray-900 dark:text-gray-100">${label}</dt>
      <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">${value}</dd>
    </div>
  `;
}

async function showItemDetail(itemId) {
  const item = await fetch(`/api/items/${itemId}`).then((r) => r.json());
  currentItemDetailId = itemId;

  document.getElementById("item-detail-sku").textContent = item.sku;
  document.getElementById("item-detail-title").textContent = item.sku;
  document.getElementById("item-detail-status").innerHTML = statusBadge(item.status);
  document.getElementById("item-detail-delete").hidden = item.status !== "in_stock";

  const photosEl = document.getElementById("item-detail-photos");
  photosEl.innerHTML = item.photo_paths
    .map(
      (p) =>
        `<img src="${p}" class="aspect-square w-full rounded-lg bg-gray-100 object-cover outline outline-gray-200 dark:bg-gray-800 dark:outline-white/10" />`
    )
    .join("");

  const fields = [
    ["Pertence a", describeItem(item)],
    ["Departamento", item.department ?? "—"],
    ["Categoria", item.category ?? "—"],
    ["Marca", item.brand ?? "—"],
    ["Tamanho", item.size ?? "—"],
    ["Condição", item.condition ?? "—"],
    ["Cor / Estampa", item.color ?? "—"],
    ["Material", item.material ?? "—"],
    ["Observações", item.observations ?? "—"],
    ["Preço", currency.format(item.price)],
    ["Data de entrada", formatDate(item.intake_date)],
  ];
  document.getElementById("item-detail-fields").innerHTML = fields.map(([l, v]) => detailRow(l, v)).join("");

  const saleSection = document.getElementById("item-detail-sale");
  saleSection.hidden = !item.sale;
  if (item.sale) {
    const saleFields = [
      ["Data da venda", formatDate(item.sale.sale_date)],
      ["Preço de venda", currency.format(item.sale.sale_price)],
      [ownerAName, currency.format(item.sale.split.owner_a)],
      [ownerBName, currency.format(item.sale.split.owner_b)],
      ["Fornecedora", currency.format(item.sale.split.supplier)],
    ];
    document.getElementById("item-detail-sale-fields").innerHTML = saleFields.map(([l, v]) => detailRow(l, v)).join("");
  }

  const withdrawalSection = document.getElementById("item-detail-withdrawal");
  withdrawalSection.hidden = !item.withdrawn_date;
  if (item.withdrawn_date) {
    const withdrawalFields = [
      ["Data de entrada", formatDate(item.intake_date)],
      ["Data da retirada", formatDate(item.withdrawn_date)],
    ];
    document.getElementById("item-detail-withdrawal-fields").innerHTML = withdrawalFields.map(([l, v]) => detailRow(l, v)).join("");
  }
}

async function handleWithdraw(itemId) {
  if (!confirm("Confirmar retirada desta peça pela fornecedora?")) return;
  try {
    const res = await fetch(`/api/items/${itemId}/withdraw`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar a retirada"));
    }
    await loadInventory();
    if (currentSupplierDetailId) await showSupplierDetail(currentSupplierDetailId);
  } catch (err) {
    showAlert("inventory-alert-slot", err.message, "error");
  }
}

async function handleDeleteItem(itemId) {
  if (!confirm("Excluir esta peça? Essa ação não pode ser desfeita.")) return;
  const onDetailView = location.hash.startsWith(`#items/${itemId}`);
  try {
    const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível excluir a peça"));
    }
    if (onDetailView) {
      location.hash = "#inventory";
    } else {
      await loadInventory();
    }
  } catch (err) {
    showAlert(onDetailView ? "item-detail-alert-slot" : "inventory-alert-slot", err.message, "error");
  }
}

async function loadReportSummary() {
  const summary = await fetch("/api/reports/summary").then((r) => r.json());
  const stats = [
    { label: "Total de vendas", value: String(summary.total_sales) },
    { label: "Receita total", value: currency.format(summary.total_revenue) },
    { label: summary.owner_a_name, value: currency.format(summary.owner_a_earnings) },
    { label: summary.owner_b_name, value: currency.format(summary.owner_b_earnings) },
    { label: "Pago a fornecedoras", value: currency.format(summary.supplier_payouts) },
  ];
  document.getElementById("report-stats").innerHTML = stats
    .map(
      (s) => `
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6 dark:bg-gray-800/75 dark:inset-ring dark:inset-ring-white/10">
        <dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">${s.label}</dt>
        <dd class="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">${s.value}</dd>
      </div>
    `
    )
    .join("");
}

async function loadReportByCategory() {
  const rows = await fetch("/api/reports/by-category").then((r) => r.json());
  const body = document.getElementById("report-category-body");
  const empty = document.getElementById("report-category-empty");
  body.innerHTML = "";
  if (rows.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${r.category ?? "sem categoria"}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${r.count}</td>
        <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap text-gray-500 sm:pr-0 dark:text-gray-400">${currency.format(r.total_revenue)}</td>
      </tr>
    `
    )
    .join("");
}

async function loadReportBySupplier() {
  const rows = await fetch("/api/reports/by-supplier").then((r) => r.json());
  const body = document.getElementById("report-supplier-body");
  const empty = document.getElementById("report-supplier-empty");
  body.innerHTML = "";
  if (rows.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${r.supplier_name}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${r.owner_name}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${r.count}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(r.total_revenue)}</td>
        <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap text-gray-500 sm:pr-0 dark:text-gray-400">${currency.format(r.total_commission)}</td>
      </tr>
    `
    )
    .join("");
}

async function loadReportTimeline() {
  const granularity = document.getElementById("timeline-granularity").value;
  const rows = await fetch(`/api/reports/timeline?granularity=${granularity}`).then((r) => r.json());
  const body = document.getElementById("report-timeline-body");
  const empty = document.getElementById("report-timeline-empty");
  body.innerHTML = "";
  if (rows.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${r.period}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${r.count}</td>
        <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap text-gray-500 sm:pr-0 dark:text-gray-400">${currency.format(r.total_revenue)}</td>
      </tr>
    `
    )
    .join("");
}

async function loadReports() {
  await Promise.all([loadReportSummary(), loadReportByCategory(), loadReportBySupplier(), loadReportTimeline()]);
}

function setFormMessage(elementId, text, kind) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = "text-sm" + (kind === "success" ? " text-green-600 dark:text-green-400" : kind === "error" ? " text-red-600 dark:text-red-400" : " text-gray-500 dark:text-gray-400");
}

async function handleSubmit(event) {
  event.preventDefault();
  const assignment = document.getElementById("assignment").value;
  const [kind, id] = assignment.split(":");

  const formData = new FormData();
  formData.append(kind === "owner" ? "owner_id" : "supplier_id", id);
  formData.append("price", parseDecimal(document.getElementById("price").value));

  const department = document.getElementById("department").value;
  const category = document.getElementById("category").value;
  const brand = document.getElementById("brand").value;
  const size = document.getElementById("size").value;
  const condition = document.getElementById("condition").value;
  const color = document.getElementById("color").value;
  const material = document.getElementById("material").value;
  const observations = document.getElementById("observations").value;
  const override = parseDecimal(document.getElementById("commission_override").value);
  if (department) formData.append("department", department);
  if (category) formData.append("category", category);
  if (brand) formData.append("brand", brand);
  if (size) formData.append("size", size);
  if (condition) formData.append("condition", condition);
  if (color) formData.append("color", color);
  if (material) formData.append("material", material);
  if (observations) formData.append("observations", observations);
  if (override) formData.append("commission_pct_override", override);

  for (const file of document.getElementById("photos").files) {
    formData.append("photos", file);
  }

  setFormMessage("form-message", "Salvando…", "");
  try {
    const res = await fetch("/api/items", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível salvar a peça"));
    }
    const item = await res.json();
    setFormMessage("form-message", `Peça ${item.sku} adicionada`, "success");
    event.target.reset();
    updateCategoryOptions("");
    await loadInventory();
    document.getElementById("item-drawer").close();
    setFormMessage("form-message", "", "");
  } catch (err) {
    setFormMessage("form-message", err.message, "error");
  }
}

async function handleSaleSubmit(event) {
  event.preventDefault();
  const itemId = Number(document.getElementById("sale-item").value);
  const salePrice = Number(parseDecimal(document.getElementById("sale-price").value));
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
      throw new Error(describeApiError(err, "não foi possível registrar a venda"));
    }
    const sale = await res.json();
    await loadInventory();
    await loadSales();
    await loadReports();
    document.getElementById("sale-drawer").close();
    setFormMessage("sale-message", "", "");
    showAlert(
      "sales-alert-slot",
      `Venda de ${sale.sku} registrada: ${ownerAName} ${currency.format(sale.split.owner_a)}, ` +
        `${ownerBName} ${currency.format(sale.split.owner_b)}, Fornecedora ${currency.format(sale.split.supplier)}`,
      "success"
    );
  } catch (err) {
    setFormMessage("sale-message", err.message, "error");
  }
}

async function handleSupplierSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("supplier-name").value;
  const owner_id = Number(document.getElementById("supplier-owner").value);
  const commission_pct = Number(parseDecimal(document.getElementById("supplier-commission").value));

  setFormMessage("supplier-message", "Salvando…", "");
  try {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, owner_id, commission_pct }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível salvar a fornecedora"));
    }
    const supplier = await res.json();
    event.target.reset();
    await loadAssignments();
    await loadSuppliers();
    document.getElementById("supplier-drawer").close();
    setFormMessage("supplier-message", "", "");
    showAlert("suppliers-alert-slot", `Fornecedora ${supplier.name} adicionada.`, "success");
  } catch (err) {
    setFormMessage("supplier-message", err.message, "error");
  }
}

document.getElementById("item-form").addEventListener("submit", handleSubmit);
document.getElementById("status-filter").addEventListener("change", loadInventory);
document.getElementById("department-filter").addEventListener("change", loadInventory);
document.getElementById("columns-toggle").addEventListener("click", () => {
  const table = document.getElementById("inventory-table");
  const collapsed = table.classList.toggle("cols-collapsed");
  document.getElementById("columns-toggle-label").textContent = collapsed ? "Mostrar mais colunas" : "Mostrar menos colunas";
});
document.getElementById("department").addEventListener("change", (e) => updateCategoryOptions(e.target.value));
document.getElementById("category").addEventListener("change", (e) => updateSizeField(document.getElementById("department").value, e.target.value));
document.getElementById("sale-form").addEventListener("submit", handleSaleSubmit);
document.getElementById("sale-item").addEventListener("change", updateSalePricePlaceholder);
document.getElementById("supplier-form").addEventListener("submit", handleSupplierSubmit);
document.getElementById("timeline-granularity").addEventListener("change", loadReportTimeline);
window.addEventListener("hashchange", showView);

renderNav();
populateSelect("department", ITEM_DEPARTMENTS, "Selecione o departamento");
populateSelect("department-filter", ITEM_DEPARTMENTS, "Todos os departamentos");
updateCategoryOptions("");
populateSelect("size", ITEM_SIZES, "Selecione o tamanho");
populateSelect("condition", ITEM_CONDITIONS, "Selecione a condição");
loadHealth();
loadAssignments().then(showView);
