// --- Tema (claro/escuro) ------------------------------------------------------
// index.html's <head> already set data-theme synchronously before first paint (from
// localStorage, or the system preference if nothing's saved yet) — this just wires up
// the toggle button and keeps following the system live for as long as the owner
// hasn't explicitly picked one herself.
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  document.documentElement.dataset.theme = next;
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (localStorage.getItem("theme")) return;
  document.documentElement.dataset.theme = e.matches ? "dark" : "light";
});

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

const ITEM_EDIT_FIELD_LABELS = {
  size: "Tamanho",
  condition: "Condição",
  department: "Departamento",
  category: "Categoria",
  brand: "Marca",
  color: "Cor / Estampa",
  material: "Material",
  observations: "Observações",
  price: "Preço",
  commission_pct_override: "Comissão específica",
};

// Visual fallback for an item with no photo yet — closely related categories share one
// glyph rather than one bespoke drawing per category (30 of them), same approach any
// icon system uses for a large taxonomy. Heroicons-outline style, 24x24, matches every
// other icon already used in this app.
const CATEGORY_ICON_PATHS = {
  shirt: `<path d="M8 3 4 7l2 2v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9l2-2-4-4-2 2h-4L8 3Z" stroke-linecap="round" stroke-linejoin="round" />`,
  trousers: `<path d="M6 3h12l1 18h-4l-1-9-1 9H9L6 3Z" stroke-linecap="round" stroke-linejoin="round" />`,
  skirt: `<path d="M9 3h6l3 17H6L9 3Z" stroke-linecap="round" stroke-linejoin="round" />`,
  shoe: `<path d="M2 18v-3l6-1 3-3h6c2 0 5 1 5 4v3H2Z" stroke-linecap="round" stroke-linejoin="round" />`,
  bag: `<path d="M6.75 7.5V6a5.25 5.25 0 0 1 10.5 0v1.5M3.75 7.5h16.5l-1.393 12.542A2.25 2.25 0 0 1 16.62 21.75H7.38a2.25 2.25 0 0 1-2.237-1.708L3.75 7.5Z" stroke-linecap="round" stroke-linejoin="round" />`,
  chair: `<path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M3 12h18v6a1 1 0 0 1-1 1h-1v2h-2v-2H7v2H5v-2H4a1 1 0 0 1-1-1v-6Z" stroke-linecap="round" stroke-linejoin="round" />`,
  sparkles: `<path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 0 0 2.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" stroke-linecap="round" stroke-linejoin="round" />`,
  bulb: `<path d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" stroke-linecap="round" stroke-linejoin="round" />`,
  bed: `<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 18v2M21 18v2M5 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke-linecap="round" stroke-linejoin="round" />`,
  window: `<path d="M4 4h16v16H4V4Zm0 8h16M12 4v16" stroke-linecap="round" stroke-linejoin="round" />`,
  utensils: `<path d="M8 3v6a2 2 0 0 0 4 0V3M10 9v12M16 3c-1.2 0-2 2-2 4s.8 4 2 4v10" stroke-linecap="round" stroke-linejoin="round" />`,
  cup: `<path d="M6 3h12l-1 12a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4L6 3ZM4 3h16" stroke-linecap="round" stroke-linejoin="round" />`,
  plug: `<path d="M9 3v4M15 3v4M6 7h12l-1 5a5 5 0 0 1-5 4h0a5 5 0 0 1-5-4L6 7ZM12 16v5" stroke-linecap="round" stroke-linejoin="round" />`,
  device: `<path d="M3 5h18v12H3V5Zm6 16h6M12 17v4" stroke-linecap="round" stroke-linejoin="round" />`,
  laptop: `<path d="M3.75 3.75h16.5v10.5H3.75V3.75ZM4.5 21h15M9.75 18.75v2.25h4.5v-2.25" stroke-linecap="round" stroke-linejoin="round" />`,
  book: `<path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" stroke-linecap="round" stroke-linejoin="round" />`,
  blocks: `<path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke-linecap="round" stroke-linejoin="round" />`,
  dice: `<path d="M4 4h16v16H4V4Z" stroke-linecap="round" stroke-linejoin="round" /><path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01M12 12h.01" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`,
  tag: `<path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM7 6.5h.008v.008H7V6.5Z" stroke-linecap="round" stroke-linejoin="round" />`,
};

// Mirrors backend/enums.py ItemCategory — every category resolves to a deliberately
// chosen glyph above; anything missing (or category === null on an older item) falls
// back to "tag" in renderPhotoOrIcon.
const CATEGORY_ICON_KEY = {
  Vestido: "shirt",
  Blusa: "shirt",
  Camisa: "shirt",
  Casaco: "shirt",
  Jaqueta: "shirt",
  Moletom: "shirt",
  Macacão: "shirt",
  Conjunto: "shirt",
  Calça: "trousers",
  Short: "trousers",
  Saia: "skirt",
  Calçado: "shoe",
  Acessório: "bag",
  Bolsa: "bag",
  Móveis: "chair",
  Decoração: "sparkles",
  Iluminação: "bulb",
  "Cama, mesa e banho": "bed",
  "Cortinas e tapetes": "window",
  "Utensílios de cozinha": "utensils",
  "Louças e vidros": "cup",
  Eletrodoméstico: "plug",
  Eletrônico: "device",
  Informática: "laptop",
  Livro: "book",
  "Mídia (CD/DVD/vinil)": "book",
  Revista: "book",
  Brinquedo: "blocks",
  Jogo: "dice",
  Outro: "tag",
};

function renderPhotoOrIcon(item) {
  const photo = item.photo_paths[0];
  if (photo) {
    return `<img src="${photo}" loading="lazy" class="size-full object-cover" />`;
  }
  const iconKey = CATEGORY_ICON_KEY[item.category] || "tag";
  return `
    <div class="flex size-full items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-1/3 text-gray-300 dark:text-gray-600">
        ${CATEGORY_ICON_PATHS[iconKey]}
      </svg>
    </div>
  `;
}

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
const PAYMENT_METHODS = ["Dinheiro", "Cartão", "Pix"];

function populateSelect(id, options, placeholder) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${placeholder}</option>` + options.map((o) => `<option value="${o}">${o}</option>`).join("");
}

// --- Split payments (a sale can be paid across 2-3 methods at once, e.g. part cash,
// part card, part Pix) — shared between the cart checkout drawer and the single-item
// quick-sell card, each of which keeps its own `rows` array of {method, amount}. -------

function paymentRowsSum(rows) {
  return rows.reduce((sum, r) => sum + (Number(parseDecimal(r.amount)) || 0), 0);
}

function paymentRowsHint(rows, target) {
  // Checked before the sum, not just at submit time — otherwise a still-incomplete
  // row (no method chosen yet, R$0) can coincidentally leave the sum matching and
  // flash a false "confere" while the row genuinely isn't ready.
  if (rows.length === 0 || rows.some((r) => !r.method || !(Number(parseDecimal(r.amount)) > 0))) {
    return { text: "Preencha a forma e o valor de cada pagamento.", ok: false };
  }
  const diff = Math.round((target - paymentRowsSum(rows)) * 100) / 100;
  if (Math.abs(diff) < 0.01) return { text: "Total dos pagamentos confere.", ok: true };
  if (diff > 0) return { text: `Faltam ${currency.format(diff)} para completar o total.`, ok: false };
  return { text: `Passou ${currency.format(-diff)} do total da venda.`, ok: false };
}

function paymentRowsValid(rows, target) {
  return paymentRowsHint(rows, target).ok;
}

// `changeFn`/`removeFn` are the names of the caller's own state-mutating functions
// (e.g. "setCartPaymentField") — plain global-function-by-name wiring, same pattern
// already used for every other onclick/onchange in this file.
function renderPaymentRowsInto(containerId, rows, changeFn, removeFn) {
  const container = document.getElementById(containerId);
  container.innerHTML = rows
    .map(
      (row, idx) => `
      <div class="flex items-end gap-2">
        <div class="grid flex-1 grid-cols-1">
          <select id="${containerId}-method-${idx}" onchange="${changeFn}(${idx}, 'method', this.value)" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800"></select>
        </div>
        <input type="text" inputmode="decimal" value="${row.amount}" oninput="${changeFn}(${idx}, 'amount', this.value)" placeholder="0,00" class="block w-24 rounded-md bg-white px-2 py-1.5 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:bg-white/5 dark:text-white dark:outline-white/10" />
        ${
          rows.length > 1
            ? `<button type="button" onclick="${removeFn}(${idx})" aria-label="Remover forma de pagamento" class="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"><svg viewBox="0 0 20 20" fill="currentColor" class="size-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg></button>`
            : ""
        }
      </div>
    `
    )
    .join("");
  rows.forEach((row, idx) => {
    const selectId = `${containerId}-method-${idx}`;
    populateSelect(selectId, PAYMENT_METHODS, "Forma de pagamento");
    document.getElementById(selectId).value = row.method;
  });
}

function formatPaymentMethods(paymentMethods) {
  if (!paymentMethods || paymentMethods.length === 0) return "—";
  return paymentMethods.map((p) => `${p.payment_method} (${currency.format(p.amount)})`).join(", ");
}

// prefix lets the item-detail edit form (§6.3) reuse this same cascade against its own
// "edit-department"/"edit-category"/"edit-size" fields instead of duplicating the logic.
//
// Both functions preserve the current selection across a repopulate when it's still
// valid for the new department/category — e.g. switching the department dropdown to a
// different value and then back to the original must not silently drop the category
// (and, transitively, the size) that was already correctly set. Only a selection that's
// genuinely no longer valid gets cleared.
function updateSizeField(department, category, prefix = "") {
  const sizeSelect = document.getElementById(`${prefix}size`);
  const previousSize = sizeSelect.value;
  const sizeField = document.getElementById(`${prefix}size-field`);
  if (department !== SIZE_APPLICABLE_DEPARTMENT || SIZELESS_CATEGORIES.has(category)) {
    sizeField.hidden = true;
    // Clear any size picked before switching away, so a stale value (e.g. a shoe
    // number left over from Calçado) never gets submitted for an unrelated category.
    sizeSelect.value = "";
    return;
  }
  sizeField.hidden = false;
  const sizeOptions = SHOE_SIZE_CATEGORIES.has(category) ? SHOE_SIZES : ITEM_SIZES;
  const placeholder = SHOE_SIZE_CATEGORIES.has(category) ? "Selecione o tamanho (numeração BR)" : "Selecione o tamanho";
  populateSelect(`${prefix}size`, sizeOptions, placeholder);
  sizeSelect.value = sizeOptions.includes(previousSize) ? previousSize : "";
}

function updateCategoryOptions(department, prefix = "") {
  const categorySelect = document.getElementById(`${prefix}category`);
  const previousCategory = categorySelect.value;
  if (!department) {
    categorySelect.innerHTML = '<option value="">Selecione o departamento primeiro</option>';
    categorySelect.disabled = true;
    updateSizeField(department, "", prefix);
    return;
  }
  categorySelect.disabled = false;
  const categoriesForDept = DEPARTMENT_CATEGORIES[department] || [];
  populateSelect(`${prefix}category`, categoriesForDept, "Selecione a categoria");
  const restoredCategory = categoriesForDept.includes(previousCategory) ? previousCategory : "";
  categorySelect.value = restoredCategory;
  updateSizeField(department, restoredCategory, prefix);
}

// The Estoque category filter has no paired size field, so it can't reuse
// updateCategoryOptions above (which always drives a size-field cascade too) — a
// standalone populate instead, and it stays enabled with no department chosen (unlike
// the create/edit forms) since "all categories" is a meaningful, useful filter state.
function updateCategoryFilterOptions(department) {
  if (!department) {
    const allCategories = [...new Set(Object.values(DEPARTMENT_CATEGORIES).flat())];
    populateSelect("category-filter", allCategories, "Todas as categorias");
    return;
  }
  populateSelect("category-filter", DEPARTMENT_CATEGORIES[department] || [], "Todas as categorias");
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
    view: "settings",
    label: "Proprietárias",
    path: `<path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" stroke-linecap="round" stroke-linejoin="round" />`,
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
  settings: "Proprietárias",
};

let assignmentLookup = {};
let ownerAName = "Dona A";
let ownerBName = "Dona B";
let ownerById = {};
let currentSupplierDetailId = null;
let currentSupplierPayoutSales = [];
let selectedSupplierPayoutSaleIds = new Set();
let currentItemDetailId = null;
let currentItemDetailData = null;

function formatDate(sqliteTimestamp) {
  const date = new Date(sqliteTimestamp.replace(" ", "T") + "Z");
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Brazilian number notation uses "," as the decimal separator (e.g. "100,00"), which
// native <input type="number"> silently rejects — the browser sanitizes the value to ""
// without any visible error, so a field that looks filled submits as empty. These
// currency/percentage fields are plain text inputs instead; this normalizes either
// notation to a value Number()/parseFloat() can read. Returns "" if nothing usable.
// Standard locale-ambiguous decimal parsing: since every price/percent field here
// accepts free-form typing, "." can't be blindly treated as a BR thousands separator
// — someone typing US-style "10.50" would silently become 1050 (a real bug this once
// was). The rules, in order:
//   1. Both "," and "." present → whichever comes LAST is the decimal point; the
//      other is a thousands separator, stripped. Covers "1.234,56" and "1,234.56".
//   2. One separator repeated (e.g. "1.234.567") → always thousands grouping.
//   3. One separator, appearing once, followed by exactly 3 digits (e.g. "1.234")
//      → thousands grouping — a price never legitimately has 3 decimal places, so a
//      lone trailing group of exactly 3 is far more likely "one thousand, X hundred"
//      than a fractional amount.
//   4. Anything else (1-2 or 4+ digits after a lone separator) → decimal point.
function parseDecimal(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return "";

  const commaCount = (raw.match(/,/g) || []).length;
  const dotCount = (raw.match(/\./g) || []).length;
  let normalized;
  if (commaCount > 0 && dotCount > 0) {
    normalized = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  } else if (commaCount > 1 || dotCount > 1) {
    normalized = raw.replace(/[.,]/g, "");
  } else if (commaCount === 1 || dotCount === 1) {
    const sep = commaCount === 1 ? "," : ".";
    const digitsAfter = raw.length - raw.lastIndexOf(sep) - 1;
    normalized = digitsAfter === 3 ? raw.replace(sep, "") : raw.replace(sep, ".");
  } else {
    normalized = raw;
  }

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

// WKWebView (the engine behind the desktop pywebview shell on macOS) has a long-standing
// bug where a FormData body containing a File/Blob part can silently end up empty on the
// wire — the request reaches the server with no fields at all, so only the fields with no
// server-side default (e.g. department, price) surface as "Field required". This isn't
// fetch()-specific (XHR hits it too), so the actual fix is avoiding File/Blob parts
// entirely: photos travel as base64 strings (see readFileAsDataURL) instead. XHR is kept
// here mainly because it's already proven to work for this request.
function postFormData(url, formData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response body — callers that need it will just see null
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, json: async () => body });
    };
    xhr.onerror = () => reject(new Error("falha de rede"));
    xhr.send(formData);
  });
}

// Converts a picked photo to a base64 data URL so it can travel as a plain FormData
// string field instead of a File/Blob part (see postFormData above for why that matters).
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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

// --- Autenticação por PIN e trava de inatividade (roadmap.md §6.5) ----------
// Não é um sistema de segurança contra invasores — serve para identificar qual
// dona está usando o sistema (privacidade entre as duas + atribuição limpa no
// histórico) e para dificultar que uma cliente veja o PIN de relance, daí o
// teclado embaralhado a cada exibição.

const INACTIVITY_MS = 10 * 60 * 1000; // sugestão do roadmap: 10 min, ajustável aqui

let session = { ownerId: null, ownerName: null };
let lockedOwnerId = null; // dona pré-selecionada ao retomar de uma trava por inatividade
let inactivityTimer = null;
let pinBuffer = [];
let pinConfirmValue = null; // primeiro PIN digitado no modo "criar", aguardando confirmação

function shuffledDigits() {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

function keypadHtml(digits) {
  const digitButtons = digits
    .map(
      (d) => `
    <button type="button" data-pin-digit="${d}" class="rounded-md bg-gray-100 py-4 text-xl font-semibold text-gray-900 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">${d}</button>
  `
    )
    .join("");
  return `
    <div class="grid w-full max-w-[280px] grid-cols-3 gap-2">
      ${digitButtons}
      <button type="button" data-pin-clear class="rounded-md bg-gray-50 py-4 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:bg-white/[0.02] dark:text-gray-400 dark:hover:bg-white/5">Limpar</button>
      <button type="button" data-pin-backspace class="rounded-md bg-gray-50 py-4 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:bg-white/[0.02] dark:text-gray-400 dark:hover:bg-white/5">⌫</button>
    </div>
  `;
}

function updatePinDots() {
  const dotsEl = document.getElementById("pin-dots");
  if (!dotsEl) return;
  dotsEl.innerHTML = pinBuffer.map(() => `<span class="size-3 rounded-full bg-pink-600 dark:bg-pink-400"></span>`).join("");
  const submit = document.getElementById("pin-submit");
  if (submit) submit.disabled = pinBuffer.length < 4;
}

async function renderLockScreen(mode, ownerId, message, fromSettings) {
  const container = document.getElementById("lock-screen");

  if (mode === "choose") {
    let owners = [];
    try {
      owners = await fetch("/api/owners").then((r) => r.json());
    } catch {
      owners = [];
    }
    container.innerHTML = `
      <div class="flex flex-col items-center gap-8 px-6 text-center">
        <span class="text-2xl font-bold text-pink-600 dark:text-pink-400">Brechó</span>
        <p class="text-sm text-gray-500 dark:text-gray-400">${message || "Quem está usando o sistema?"}</p>
        <div class="flex flex-wrap justify-center gap-4">
          ${owners
            .filter((o) => o.active)
            .map(
              (o) => `
            <button type="button" data-choose-owner="${o.id}" data-has-pin="${o.has_pin}" class="rounded-lg bg-pink-600 px-8 py-6 text-lg font-semibold text-white shadow-xs hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400">${o.name}</button>
          `
            )
            .join("")}
        </div>
      </div>
    `;
    container.querySelectorAll("[data-choose-owner]").forEach((btn) => {
      btn.addEventListener("click", () => {
        pinBuffer = [];
        pinConfirmValue = null;
        renderLockScreen(btn.dataset.hasPin === "true" ? "pin" : "create-pin", Number(btn.dataset.chooseOwner));
      });
    });
    return;
  }

  const isCreate = mode === "create-pin";
  const defaultMessage = !isCreate ? "Digite seu PIN" : pinConfirmValue === null ? "Crie um PIN (4 a 6 dígitos)" : "Digite novamente para confirmar";
  const submitLabel = !isCreate ? "Entrar" : pinConfirmValue === null ? "Continuar" : "Confirmar";
  const backLabel = fromSettings ? "Cancelar" : "Trocar";

  container.innerHTML = `
    <div class="flex flex-col items-center gap-6 px-6 text-center">
      <span class="text-2xl font-bold text-pink-600 dark:text-pink-400">Brechó</span>
      <p id="lock-screen-message" class="text-sm text-gray-500 dark:text-gray-400">${message || defaultMessage}</p>
      <div id="pin-dots" class="flex h-3 gap-2"></div>
      ${keypadHtml(shuffledDigits())}
      <div class="flex items-center gap-4">
        <button type="button" id="pin-submit" disabled class="rounded-md bg-pink-600 px-6 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 disabled:opacity-40 dark:bg-pink-500 dark:hover:bg-pink-400">${submitLabel}</button>
        <button type="button" id="pin-back" class="text-sm text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-white">${backLabel}</button>
      </div>
      ${
        !isCreate && !fromSettings
          ? `<p class="max-w-64 text-xs text-gray-400 dark:text-gray-500">Esqueceu o PIN? Clique em "Trocar", entre com o PIN da outra dona e redefina o seu em Proprietárias — não é preciso saber o PIN atual.</p>`
          : ""
      }
    </div>
  `;
  wirePinScreen(ownerId, mode, fromSettings);
}

function wirePinScreen(ownerId, mode, fromSettings) {
  pinBuffer = [];
  updatePinDots();

  document.querySelectorAll("[data-pin-digit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (pinBuffer.length >= 6) return;
      pinBuffer.push(btn.dataset.pinDigit);
      updatePinDots();
    });
  });
  document.querySelector("[data-pin-clear]").addEventListener("click", () => {
    pinBuffer = [];
    updatePinDots();
  });
  document.querySelector("[data-pin-backspace]").addEventListener("click", () => {
    pinBuffer.pop();
    updatePinDots();
  });
  document.getElementById("pin-back").addEventListener("click", () => {
    pinBuffer = [];
    pinConfirmValue = null;
    if (fromSettings) hideLockScreen();
    else renderLockScreen("choose");
  });
  document.getElementById("pin-submit").addEventListener("click", () => handlePinSubmit(ownerId, mode, fromSettings));
}

async function handlePinSubmit(ownerId, mode, fromSettings) {
  const pin = pinBuffer.join("");

  if (mode === "pin") {
    try {
      const res = await fetch(`/api/owners/${ownerId}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        pinBuffer = [];
        renderLockScreen("pin", ownerId, "PIN incorreto — tente novamente");
        return;
      }
      const owners = await fetch("/api/owners").then((r) => r.json());
      const owner = owners.find((o) => o.id === ownerId);
      completeLogin(ownerId, owner ? owner.name : "");
    } catch {
      renderLockScreen("pin", ownerId, "não foi possível verificar o PIN — tente novamente");
    }
    return;
  }

  // create-pin: primeiro toque grava pinConfirmValue e pede confirmação; segundo compara.
  if (pinConfirmValue === null) {
    pinConfirmValue = pin;
    pinBuffer = [];
    renderLockScreen("create-pin", ownerId, null, fromSettings);
    return;
  }
  if (pin !== pinConfirmValue) {
    pinConfirmValue = null;
    pinBuffer = [];
    renderLockScreen("create-pin", ownerId, "os PINs não coincidiram — comece de novo", fromSettings);
    return;
  }

  try {
    const res = await fetch(`/api/owners/${ownerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    pinConfirmValue = null;
    if (!res.ok) {
      const err = await res.json();
      pinBuffer = [];
      renderLockScreen("create-pin", ownerId, describeApiError(err, "não foi possível salvar o PIN"), fromSettings);
      return;
    }
    const owner = await res.json();
    if (fromSettings) {
      hideLockScreen();
      await loadSettings();
      showAlert("settings-alert-slot", `PIN de ${owner.name} atualizado.`, "success");
    } else {
      completeLogin(ownerId, owner.name);
    }
  } catch {
    renderLockScreen("create-pin", ownerId, "não foi possível salvar o PIN — tente novamente", fromSettings);
  }
}

function completeLogin(ownerId, ownerName) {
  const isDifferentOwner = session.ownerId !== null && session.ownerId !== ownerId;
  session = { ownerId, ownerName };
  lockedOwnerId = ownerId;
  pinBuffer = [];
  pinConfirmValue = null;
  updateSessionIndicator();
  hideLockScreen();

  if (isDifferentOwner) {
    // "Outra pessoa loga, inicia sessão nova do zero" — fecha qualquer formulário em
    // andamento da dona anterior e volta para a tela inicial.
    ["item-drawer", "supplier-drawer", "cart-drawer"].forEach((id) => {
      const dialog = document.getElementById(id);
      if (dialog?.open) dialog.close();
    });
    location.hash = "#inventory";
  }
}

function updateSessionIndicator() {
  const el = document.getElementById("session-indicator");
  if (!el) return;
  el.innerHTML = session.ownerName
    ? `Sessão: ${session.ownerName} · <button type="button" id="switch-session" class="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400">Trocar</button>`
    : "";
  document.getElementById("switch-session")?.addEventListener("click", () => showLockScreen("choose"));
}

function showLockScreen(mode, ownerId, fromSettings) {
  clearTimeout(inactivityTimer);
  document.getElementById("lock-screen").hidden = false;
  renderLockScreen(mode, ownerId, undefined, fromSettings);
}

function hideLockScreen() {
  document.getElementById("lock-screen").hidden = true;
  resetInactivityTimer();
}

function lockSession() {
  if (!session.ownerId) return;
  showLockScreen("pin", lockedOwnerId);
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  if (!session.ownerId) return;
  inactivityTimer = setTimeout(lockSession, INACTIVITY_MS);
}

// One dona's card (cadastro + repasses) shown at a time, picked via the selector
// below — with many pending repasses, showing both stacked meant Dona B's whole
// section could sit a long scroll below Dona A's table. The selector buttons mirror
// the login screen's owner picker (same big pink pills), so the interaction is
// already familiar rather than a new pattern to learn.
let currentDonaId = null;
let settingsOwnersCache = [];

// forcedOwnerId lets a deep link (e.g. the "Ver detalhamento" shortcuts on Relatórios,
// #settings/{id}) land straight on that dona's tab instead of whichever one was last open.
async function loadSettings(forcedOwnerId) {
  const owners = await fetch("/api/owners").then((r) => r.json());
  settingsOwnersCache = owners;
  if (forcedOwnerId && owners.some((o) => o.id === forcedOwnerId)) {
    currentDonaId = forcedOwnerId;
  } else if (!owners.some((o) => o.id === currentDonaId)) {
    currentDonaId = owners.some((o) => o.id === session.ownerId) ? session.ownerId : (owners[0]?.id ?? null);
  }
  renderDonaSelector();
  await renderDonaDetail();
}

function renderDonaSelector() {
  const container = document.getElementById("settings-dona-selector");
  container.innerHTML = settingsOwnersCache
    .map(
      (o) => `
      <button type="button" onclick="selectDona(${o.id})" class="rounded-lg px-8 py-4 text-lg font-semibold shadow-xs ${
        o.id === currentDonaId
          ? "bg-pink-600 text-white hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400"
          : "bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20"
      }">${o.name}</button>
    `
    )
    .join("");
}

async function selectDona(ownerId) {
  currentDonaId = ownerId;
  renderDonaSelector();
  await renderDonaDetail();
}

async function renderDonaDetail() {
  const container = document.getElementById("dona-detail");
  const owner = settingsOwnersCache.find((o) => o.id === currentDonaId);
  if (!owner) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `
    <div class="rounded-lg bg-white p-6 shadow-xs inset-ring inset-ring-gray-200 dark:bg-white/5 dark:inset-ring-white/10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${owner.name}</h3>
        <div class="text-right">
          <p class="text-sm text-gray-500 dark:text-gray-400">${owner.has_pin ? "PIN já cadastrado" : "Nenhum PIN cadastrado ainda"}</p>
          <button type="button" data-reset-pin="${owner.id}" class="mt-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20">Redefinir PIN</button>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white">Desempenho</h4>
        <div class="grid grid-cols-1">
          <select id="dona-report-preset-${owner.id}" onchange="handleDonaReportDatePresetChange(${owner.id})" class="col-start-1 row-start-1 w-44 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800">
            <option value="all">Todo período</option>
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="month">Este mês</option>
            <option value="custom">Personalizado</option>
          </select>
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500 dark:text-gray-400">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
          </svg>
        </div>
      </div>
      <div id="dona-report-date-custom-${owner.id}" hidden class="mt-3 flex items-center gap-2">
        <input type="date" id="dona-report-start-${owner.id}" onchange="loadDonaReports(${owner.id})" class="rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10" />
        <span class="text-sm text-gray-500 dark:text-gray-400">até</span>
        <input type="date" id="dona-report-end-${owner.id}" onchange="loadDonaReports(${owner.id})" class="rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10" />
      </div>

      <div id="dona-report-stats-${owner.id}" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>

      <h5 class="mt-6 text-sm font-semibold text-gray-900 dark:text-white">Vendas por fornecedora</h5>
      <div id="dona-report-supplier-chart-${owner.id}" class="mt-3"></div>
      <div class="mt-3 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300 dark:divide-white/15">
              <thead>
                <tr>
                  <th scope="col" class="py-3 pr-3 pl-4 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:pl-0 dark:text-gray-400">Fornecedora</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Peças vendidas</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Receita</th>
                  <th scope="col" class="py-3 pr-4 pl-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:pr-0 dark:text-gray-400">Comissão paga</th>
                </tr>
              </thead>
              <tbody id="dona-report-supplier-body-${owner.id}" class="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-900"></tbody>
            </table>
            <p id="dona-report-supplier-empty-${owner.id}" hidden class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma venda de peça de fornecedora registrada ainda.</p>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white">Repasses</h4>
        <div class="flex items-center gap-3">
          <button type="button" id="owner-payouts-register-selected-${owner.id}" onclick="handleRegisterSelectedOwnerPayouts(${owner.id})" hidden class="rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 dark:bg-pink-500 dark:hover:bg-pink-400">Registrar repasse dos selecionados</button>
          <div class="grid grid-cols-1">
            <select id="owner-payouts-status-filter-${owner.id}" onchange="renderOwnerPayoutsTable(${owner.id})" class="col-start-1 row-start-1 w-40 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800">
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500 dark:text-gray-400">
              <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div class="mt-4 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300 dark:divide-white/15">
              <thead>
                <tr>
                  <th scope="col" class="py-3 pr-3 pl-4 sm:pl-0"><input type="checkbox" id="owner-payouts-select-all-${owner.id}" onchange="toggleAllOwnerPayoutSelection(${owner.id}, this.checked)" class="size-3.5 rounded border-gray-300 text-pink-600 focus:ring-pink-600 dark:border-white/20 dark:bg-white/10" /></th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">SKU</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Data da venda</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Comissão</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Status</th>
                  <th scope="col" class="py-3 pr-4 pl-3 sm:pr-0"><span class="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody id="owner-payouts-body-${owner.id}" class="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-900"></tbody>
            </table>
            <p id="owner-payouts-empty-${owner.id}" hidden class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma venda registrada ainda.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-reset-pin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pinBuffer = [];
      pinConfirmValue = null;
      showLockScreen("create-pin", Number(btn.dataset.resetPin), true);
    });
  });

  await Promise.all([loadDonaReports(owner.id), loadOwnerPayouts(owner.id)]);
}

// Per-dona breakdown (Proprietárias) — the identity-linked counterpart to the
// shop-wide Relatórios landing page. Always scoped to this one owner via owner_id,
// so a dona only ever sees her own earnings and her own suppliers' numbers here;
// the other dona's figures require switching to her tab, same as the rest of this page.
function handleDonaReportDatePresetChange(ownerId) {
  const preset = document.getElementById(`dona-report-preset-${ownerId}`).value;
  document.getElementById(`dona-report-date-custom-${ownerId}`).hidden = preset !== "custom";
  loadDonaReports(ownerId);
}

function getDonaReportFilterParams(ownerId) {
  const params = resolveDateRangeParams(`dona-report-preset-${ownerId}`, `dona-report-start-${ownerId}`, `dona-report-end-${ownerId}`);
  params.set("owner_id", ownerId);
  return params;
}

async function loadDonaReports(ownerId) {
  const params = getDonaReportFilterParams(ownerId);
  await Promise.all([loadDonaReportSummary(ownerId, params), loadDonaReportBySupplier(ownerId, params)]);
}

async function loadDonaReportSummary(ownerId, params) {
  const summary = await fetch(`/api/reports/summary?${params}`).then((r) => r.json());
  const owner = settingsOwnersCache.find((o) => o.id === ownerId);
  const myEarnings = owner?.is_cut_owner ? summary.owner_a_earnings : summary.owner_b_earnings;
  const stats = [
    { label: "Peças vendidas", value: String(summary.total_sales) },
    { label: "Receita gerada", value: currency.format(summary.total_revenue) },
    { label: "Meus ganhos", value: currency.format(myEarnings) },
    { label: "Comissão de fornecedoras", value: currency.format(summary.supplier_commission_total) },
    { label: "Pago a fornecedoras", value: currency.format(summary.supplier_commission_paid) },
    { label: "Ainda a pagar", value: currency.format(summary.supplier_commission_pending) },
  ];
  document.getElementById(`dona-report-stats-${ownerId}`).innerHTML = stats
    .map(
      (s) => `
      <div class="overflow-hidden rounded-lg bg-white px-4 py-4 shadow-sm inset-ring inset-ring-gray-200 dark:bg-white/5 dark:inset-ring-white/10">
        <dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">${s.label}</dt>
        <dd class="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">${s.value}</dd>
      </div>
    `
    )
    .join("");
}

async function loadDonaReportBySupplier(ownerId, params) {
  const rows = await fetch(`/api/reports/by-supplier?${params}`).then((r) => r.json());
  document.getElementById(`dona-report-supplier-chart-${ownerId}`).innerHTML = renderHorizontalBarChart(
    rows,
    "supplier_name",
    "total_revenue",
    (v) => currency.format(v)
  );

  const body = document.getElementById(`dona-report-supplier-body-${ownerId}`);
  const empty = document.getElementById(`dona-report-supplier-empty-${ownerId}`);
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
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${r.count}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(r.total_revenue)}</td>
        <td class="py-4 pr-4 pl-3 text-sm whitespace-nowrap text-gray-500 sm:pr-0 dark:text-gray-400">${currency.format(r.total_commission)}</td>
      </tr>
    `
    )
    .join("");
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
  const knownViews = ["inventory", "sales", "suppliers", "reports", "settings"];
  const resolvedView =
    view === "suppliers" && id ? "supplier-detail" : view === "items" && id ? "item-detail" : knownViews.includes(view) ? view : "inventory";

  document.querySelectorAll("[data-view]").forEach((section) => {
    section.hidden = section.dataset.view !== resolvedView;
  });
  // A success/error banner from the previous view must not linger once you've
  // navigated away — otherwise it resurfaces stale (e.g. "Peça atualizada.")
  // next time that view or a similarly-slotted one is shown.
  document.querySelectorAll('[id$="-alert-slot"]').forEach((slot) => {
    slot.innerHTML = "";
  });
  document.getElementById("page-title").textContent = VIEW_TITLES[resolvedView] || "Brechó";
  setActiveNav(resolvedView === "supplier-detail" ? "suppliers" : resolvedView === "item-detail" ? "inventory" : resolvedView);
  document.getElementById("mobile-sidebar").close();

  if (resolvedView === "inventory") await loadInventory();
  else if (resolvedView === "item-detail") await showItemDetail(Number(id));
  else if (resolvedView === "sales") await loadSales();
  else if (resolvedView === "suppliers") await loadSuppliers();
  else if (resolvedView === "supplier-detail") await showSupplierDetail(Number(id));
  else if (resolvedView === "reports") {
    reportPayoutsMasked = true;
    await loadReports();
  }
  else if (resolvedView === "settings") await loadSettings(id ? Number(id) : null);
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
  // No option defaults to selected — owners split commission very differently, so an
  // absent-minded submit must not silently misattribute a piece to whichever owner
  // happened to be listed first. required (on the <select> itself) blocks submission
  // while this placeholder is still selected, same as department's own placeholder.
  select.innerHTML = '<option value="">Selecione a proprietária ou fornecedora</option>';
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

let currentInventoryItems = [];
let sellingItemId = null;
let cartMode = false;
let cart = {};
let cartPayments = [];
let sellPayments = [];
// A card grid of ~500 photographed pieces is a lot of DOM/image weight at once — list
// view (denser, thumbnail-sized) plus pagination are the standard mechanics for that.
let inventoryView = localStorage.getItem("inventoryView") === "list" ? "list" : "grid";
let inventoryPage = 1;
let inventorySearch = "";
const INVENTORY_PAGE_SIZE = 60;

async function loadInventory() {
  const status = document.getElementById("status-filter").value;
  const department = document.getElementById("department-filter").value;
  const category = document.getElementById("category-filter").value;
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (department) params.set("department", department);
  if (category) params.set("category", category);
  const query = params.toString();
  currentInventoryItems = await fetch(`/api/items${query ? `?${query}` : ""}`).then((r) => r.json());
  inventoryPage = 1;
  renderInventoryGrid();
}

function handleInventorySearch(value) {
  inventorySearch = value.trim().toLowerCase();
  inventoryPage = 1;
  renderInventoryGrid();
}

function matchesInventorySearch(item) {
  if (!inventorySearch) return true;
  const haystack = [item.sku, item.brand, item.category, item.color, item.material, item.observations]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(inventorySearch);
}

function toggleInventoryView() {
  inventoryView = inventoryView === "grid" ? "list" : "grid";
  localStorage.setItem("inventoryView", inventoryView);
  inventoryPage = 1;
  document.getElementById("inventory-view-toggle-label").textContent = inventoryView === "grid" ? "Ver em lista" : "Ver em grade";
  document.getElementById("inventory-columns-toggle").hidden = inventoryView !== "list";
  renderInventoryGrid();
}

function toggleInventoryColumns() {
  const collapsed = document.getElementById("inventory-list-table").classList.toggle("cols-collapsed");
  document.getElementById("inventory-columns-toggle-label").textContent = collapsed ? "Mostrar mais colunas" : "Mostrar menos colunas";
}

function changeInventoryPage(delta) {
  const visible = currentInventoryItems.filter(matchesInventorySearch);
  const totalPages = Math.max(1, Math.ceil(visible.length / INVENTORY_PAGE_SIZE));
  inventoryPage = Math.min(totalPages, Math.max(1, inventoryPage + delta));
  renderInventoryGrid();
}

function renderInventoryGrid() {
  const gridEl = document.getElementById("inventory-grid");
  const listWrapper = document.getElementById("inventory-list-wrapper");
  const empty = document.getElementById("inventory-empty");
  const pagination = document.getElementById("inventory-pagination");
  gridEl.hidden = inventoryView !== "grid";
  listWrapper.hidden = inventoryView !== "list";

  const visible = currentInventoryItems.filter(matchesInventorySearch);

  if (visible.length === 0) {
    empty.hidden = false;
    gridEl.innerHTML = "";
    document.getElementById("inventory-list-body").innerHTML = "";
    pagination.hidden = true;
    renderCartBar();
    return;
  }
  empty.hidden = true;

  const totalPages = Math.max(1, Math.ceil(visible.length / INVENTORY_PAGE_SIZE));
  if (inventoryPage > totalPages) inventoryPage = totalPages;
  const start = (inventoryPage - 1) * INVENTORY_PAGE_SIZE;
  const pageItems = visible.slice(start, start + INVENTORY_PAGE_SIZE);

  if (inventoryView === "grid") {
    gridEl.innerHTML = pageItems.map(renderInventoryCard).join("");
  } else {
    document.getElementById("inventory-list-body").innerHTML = pageItems.map(renderInventoryListRow).join("");
  }
  if (sellingItemId != null && pageItems.some((i) => i.id === sellingItemId)) {
    renderSellPayments(sellingItemId);
  }

  pagination.hidden = totalPages <= 1;
  document.getElementById("inventory-pagination-label").textContent = `Página ${inventoryPage} de ${totalPages}`;

  renderCartBar();
}

function renderInventoryListRow(item) {
  if (item.id === sellingItemId) {
    return `<tr><td colspan="13" class="p-2">${renderSellCard(item)}</td></tr>`;
  }

  const canSell = item.status === "in_stock";
  const inCart = item.id in cart;
  let action = "";
  if (cartMode && canSell) {
    action = `<button type="button" onclick="toggleCartItem(${item.id})" class="rounded-md px-3 py-1.5 text-sm font-semibold ${
      inCart
        ? "bg-pink-600 text-white hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400"
        : "bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20"
    }">${inCart ? "✓ Selecionada" : "Adicionar"}</button>`;
  } else if (canSell) {
    action = `<button type="button" onclick="startSellCard(${item.id})" class="rounded-md bg-pink-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400">Vender</button>`;
  }

  return `
    <tr class="${item.status === "withdrawn" ? "opacity-50" : ""}">
      <td class="py-2 pr-3 pl-4 sm:pl-0">
        <a href="#items/${item.id}" class="block size-10 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">${renderPhotoOrIcon(item)}</a>
      </td>
      <td class="px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
        <a href="#items/${item.id}" class="hover:text-pink-600 dark:hover:text-pink-400">${item.sku}</a>
      </td>
      <td class="extra-col px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.department ?? "—"}</td>
      <td class="px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.category ?? "—"}${item.size ? ` · ${item.size}` : ""}</td>
      <td class="extra-col px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.brand ?? "—"}</td>
      <td class="extra-col px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.condition ?? "—"}</td>
      <td class="extra-col px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.color ?? "—"}</td>
      <td class="extra-col px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${item.material ?? "—"}</td>
      <td class="extra-col max-w-40 truncate px-3 py-2 text-sm text-gray-500 dark:text-gray-400" title="${item.observations ?? ""}">${item.observations ?? "—"}</td>
      <td class="px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(item.price)}</td>
      <td class="px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${describeItem(item)}</td>
      <td class="px-3 py-2 text-sm whitespace-nowrap">${statusBadge(item.status)}</td>
      <td class="py-2 pr-4 pl-3 text-right sm:pr-0">${action}</td>
    </tr>
  `;
}

function renderInventoryCard(item) {
  if (item.id === sellingItemId) return renderSellCard(item);

  const canSell = item.status === "in_stock";
  const inCart = item.id in cart;
  const ring = inCart
    ? "inset-ring-2 inset-ring-pink-600 dark:inset-ring-pink-400"
    : "inset-ring inset-ring-gray-200 dark:inset-ring-white/10";

  let actionHtml = "";
  if (cartMode && canSell) {
    actionHtml = `
      <div class="p-3 pt-0">
        <button type="button" onclick="toggleCartItem(${item.id})" class="w-full rounded-md px-3 py-2 text-sm font-semibold shadow-xs ${
          inCart
            ? "bg-pink-600 text-white hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400"
            : "bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20"
        }">${inCart ? "✓ Selecionada" : "Adicionar"}</button>
      </div>
    `;
  } else if (canSell) {
    actionHtml = `<div class="p-3 pt-0"><button type="button" onclick="startSellCard(${item.id})" class="w-full rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400">Vender</button></div>`;
  }

  return `
    <div class="overflow-hidden rounded-lg bg-white shadow-xs ${ring} dark:bg-white/5 ${item.status === "withdrawn" ? "opacity-50" : ""}">
      <a href="#items/${item.id}" class="block aspect-square bg-gray-100 dark:bg-gray-800">
        ${renderPhotoOrIcon(item)}
      </a>
      <div class="space-y-1 p-3">
        <div class="flex items-center justify-between gap-2">
          <a href="#items/${item.id}" class="truncate font-semibold text-gray-900 hover:text-pink-600 dark:text-white dark:hover:text-pink-400">${item.sku}</a>
          ${statusBadge(item.status)}
        </div>
        <p class="truncate text-sm text-gray-500 dark:text-gray-400">${item.category ?? "—"}${item.size ? ` · ${item.size}` : ""}</p>
        <p class="text-lg font-bold text-gray-900 dark:text-white">${currency.format(item.price)}</p>
        <p class="truncate text-xs text-gray-400 dark:text-gray-500">${describeItem(item)}</p>
      </div>
      ${actionHtml}
    </div>
  `;
}

function toggleCartMode() {
  cartMode = !cartMode;
  if (!cartMode) cart = {};
  sellingItemId = null;
  inventoryPage = 1;
  document.getElementById("cart-mode-toggle-label").textContent = cartMode ? "Sair do modo carrinho" : "Modo carrinho";
  renderInventoryGrid();
}

function toggleCartItem(itemId) {
  if (cart[itemId]) {
    delete cart[itemId];
  } else {
    const item = currentInventoryItems.find((i) => i.id === itemId);
    cart[itemId] = { price: item.price, discountReason: "" };
  }
  renderInventoryGrid();
}

function clearCart() {
  cart = {};
  renderInventoryGrid();
}

function renderCartBar() {
  const bar = document.getElementById("cart-bar");
  const count = Object.keys(cart).length;
  if (!cartMode || count === 0) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  const total = Object.values(cart).reduce((sum, entry) => sum + entry.price, 0);
  document.getElementById("cart-bar-summary").textContent =
    count === 1 ? `1 peça selecionada · ${currency.format(total)}` : `${count} peças selecionadas · ${currency.format(total)}`;
}

function openCartDrawer() {
  const container = document.getElementById("cart-drawer-items");
  container.innerHTML = Object.entries(cart)
    .map(([itemId, entry]) => {
      const item = currentInventoryItems.find((i) => i.id === Number(itemId));
      return `
        <div class="flex gap-3 rounded-md bg-gray-50 p-3 dark:bg-white/5">
          <div class="size-16 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
            ${renderPhotoOrIcon(item)}
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">${item.sku}</p>
              <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <input type="checkbox" id="cart-discount-toggle-${itemId}" onchange="toggleCartDiscount(${itemId})" class="size-3.5 rounded border-gray-300 text-pink-600 focus:ring-pink-600 dark:border-white/20 dark:bg-white/10" />
                Desconto
              </label>
            </div>
            <div>
              <div class="flex items-center justify-between gap-2">
                <label for="cart-price-${itemId}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Preço de venda (R$)</label>
                <span class="text-xs text-gray-400 dark:text-gray-500">de tabela: ${currency.format(item.price)}</span>
              </div>
              <input type="text" inputmode="decimal" id="cart-price-${itemId}" data-catalog-price="${item.price}" value="${String(entry.price).replace(".", ",")}" oninput="updateCartPaymentHint()" readonly class="mt-1 block w-full rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 read-only:cursor-not-allowed read-only:bg-gray-50 read-only:text-gray-500 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:read-only:bg-white/[0.02] dark:read-only:text-gray-400" />
            </div>
            <div id="cart-discount-wrapper-${itemId}" hidden>
              <label for="cart-discount-${itemId}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Motivo do desconto (opcional)</label>
              <input type="text" id="cart-discount-${itemId}" value="${entry.discountReason}" placeholder="ex: mancha encontrada na hora da venda" class="mt-1 block w-full rounded-md bg-white px-2 py-1 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500" />
            </div>
          </div>
        </div>
      `;
    })
    .join("");
  cartPayments = [{ method: "", amount: cartTotal() > 0 ? String(cartTotal().toFixed(2)).replace(".", ",") : "" }];
  renderCartPayments();
  setFormMessage("cart-message", "", "");
}

function cartTotal() {
  return Object.keys(cart).reduce((sum, itemId) => {
    const priceInput = document.getElementById(`cart-price-${itemId}`);
    const price = priceInput ? Number(parseDecimal(priceInput.value)) || 0 : cart[itemId].price;
    return sum + price;
  }, 0);
}

function renderCartPayments() {
  renderPaymentRowsInto("cart-payments-list", cartPayments, "setCartPaymentField", "removeCartPaymentRow");
  updateCartPaymentHint();
}

function updateCartPaymentHint() {
  const hint = paymentRowsHint(cartPayments, cartTotal());
  const el = document.getElementById("cart-payment-hint");
  el.textContent = hint.text;
  el.className = `mt-1 text-xs ${hint.ok ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`;
}

function addCartPaymentRow() {
  const remaining = Math.max(0, cartTotal() - paymentRowsSum(cartPayments));
  cartPayments.push({ method: "", amount: remaining > 0 ? String(remaining.toFixed(2)).replace(".", ",") : "" });
  renderCartPayments();
}

function removeCartPaymentRow(idx) {
  cartPayments.splice(idx, 1);
  renderCartPayments();
}

function setCartPaymentField(idx, field, value) {
  cartPayments[idx][field] = value;
  updateCartPaymentHint();
}

function toggleCartDiscount(itemId) {
  const checked = document.getElementById(`cart-discount-toggle-${itemId}`).checked;
  const priceInput = document.getElementById(`cart-price-${itemId}`);
  const reasonInput = document.getElementById(`cart-discount-${itemId}`);
  document.getElementById(`cart-discount-wrapper-${itemId}`).hidden = !checked;
  priceInput.readOnly = !checked;
  if (checked) {
    priceInput.focus();
  } else {
    priceInput.value = String(priceInput.dataset.catalogPrice).replace(".", ",");
    reasonInput.value = "";
  }
  updateCartPaymentHint();
}

async function confirmCheckout() {
  const cartSaleTotal = cartTotal();
  if (!paymentRowsValid(cartPayments, cartSaleTotal)) {
    setFormMessage("cart-message", paymentRowsHint(cartPayments, cartSaleTotal).text, "error");
    return;
  }

  const items = Object.keys(cart).map((itemId) => ({
    item_id: Number(itemId),
    sale_price: Number(parseDecimal(document.getElementById(`cart-price-${itemId}`).value)),
    discount_reason: document.getElementById(`cart-discount-${itemId}`).value.trim() || null,
  }));
  const payments = cartPayments.map((p) => ({ payment_method: p.method, amount: Number(parseDecimal(p.amount)) }));

  setFormMessage("cart-message", "Registrando…", "");
  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, payments, sold_by_owner_id: session.ownerId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar a venda"));
    }
    const sales = await res.json();
    const total = sales.reduce((sum, s) => sum + s.sale_price, 0);
    cart = {};
    cartPayments = [];
    cartMode = false;
    document.getElementById("cart-mode-toggle-label").textContent = "Modo carrinho";
    document.getElementById("cart-drawer").close();
    await loadInventory();
    await loadReports();
    showAlert(
      "inventory-alert-slot",
      `Venda registrada: ${sales.length} peça${sales.length > 1 ? "s" : ""}, total ${currency.format(total)}.`,
      "success"
    );
  } catch (err) {
    setFormMessage("cart-message", err.message, "error");
  }
}

function renderSellCard(item) {
  return `
    <div class="overflow-hidden rounded-lg bg-white shadow-xs inset-ring-2 inset-ring-pink-600 dark:bg-white/5 dark:inset-ring-pink-400">
      <div class="aspect-square bg-gray-100 dark:bg-gray-800">
        ${renderPhotoOrIcon(item)}
      </div>
      <div class="space-y-3 p-3">
        <p class="truncate font-semibold text-gray-900 dark:text-white">${item.sku}</p>
        <div>
          <div class="flex items-center justify-between">
            <label for="sell-price-${item.id}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Preço de venda (R$)</label>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <input type="checkbox" id="sell-discount-toggle-${item.id}" onchange="toggleSellDiscount(${item.id})" class="size-3.5 rounded border-gray-300 text-pink-600 focus:ring-pink-600 dark:border-white/20 dark:bg-white/10" />
              Dar desconto
            </label>
          </div>
          <p class="text-xs text-gray-400 dark:text-gray-500">de tabela: ${currency.format(item.price)}</p>
          <input type="text" inputmode="decimal" id="sell-price-${item.id}" data-catalog-price="${item.price}" value="${String(item.price).replace(".", ",")}" oninput="updateSellPaymentHint(${item.id})" readonly class="mt-1 block w-full rounded-md bg-white px-3 py-2 text-xl font-bold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 read-only:cursor-not-allowed read-only:bg-gray-50 read-only:text-gray-500 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:read-only:bg-white/[0.02] dark:read-only:text-gray-400" />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Forma de pagamento</label>
            <button type="button" onclick="addSellPaymentRow(${item.id})" class="text-xs font-semibold text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300">+ Adicionar</button>
          </div>
          <div id="sell-payments-list-${item.id}" class="mt-1 space-y-2"></div>
          <p id="sell-payment-hint-${item.id}" class="mt-1 text-xs text-gray-500 dark:text-gray-400"></p>
        </div>
        <div id="sell-discount-wrapper-${item.id}" hidden>
          <label for="sell-discount-${item.id}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Motivo do desconto (opcional)</label>
          <input type="text" id="sell-discount-${item.id}" placeholder="ex: mancha encontrada na hora da venda" class="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500" />
        </div>
        <p id="sell-message-${item.id}" class="text-sm"></p>
        <div class="flex gap-2">
          <button type="button" onclick="cancelSellCard(${item.id})" class="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20">Cancelar</button>
          <button type="button" onclick="confirmSellCard(${item.id})" class="flex-1 rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400">Confirmar venda</button>
        </div>
      </div>
    </div>
  `;
}

function toggleSellDiscount(itemId) {
  const checked = document.getElementById(`sell-discount-toggle-${itemId}`).checked;
  const priceInput = document.getElementById(`sell-price-${itemId}`);
  const reasonInput = document.getElementById(`sell-discount-${itemId}`);
  document.getElementById(`sell-discount-wrapper-${itemId}`).hidden = !checked;
  priceInput.readOnly = !checked;
  if (checked) {
    priceInput.focus();
  } else {
    priceInput.value = String(priceInput.dataset.catalogPrice).replace(".", ",");
    reasonInput.value = "";
  }
  updateSellPaymentHint(itemId);
}

function startSellCard(itemId) {
  sellingItemId = itemId;
  const item = currentInventoryItems.find((i) => i.id === itemId);
  sellPayments = [{ method: "", amount: item ? String(item.price.toFixed(2)).replace(".", ",") : "" }];
  renderInventoryGrid();
  document.getElementById(`sell-price-${itemId}`).focus();
}

function cancelSellCard(itemId) {
  sellingItemId = null;
  sellPayments = [];
  renderInventoryGrid();
}

function renderSellPayments(itemId) {
  renderPaymentRowsInto(`sell-payments-list-${itemId}`, sellPayments, "setSellPaymentField", "removeSellPaymentRow");
  updateSellPaymentHint(itemId);
}

function removeSellPaymentRow(idx) {
  sellPayments.splice(idx, 1);
  renderSellPayments(sellingItemId);
}

function updateSellPaymentHint(itemId) {
  const salePrice = Number(parseDecimal(document.getElementById(`sell-price-${itemId}`).value)) || 0;
  const hint = paymentRowsHint(sellPayments, salePrice);
  const el = document.getElementById(`sell-payment-hint-${itemId}`);
  if (!el) return;
  el.textContent = hint.text;
  el.className = `mt-1 text-xs ${hint.ok ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`;
}

function addSellPaymentRow(itemId) {
  const salePrice = Number(parseDecimal(document.getElementById(`sell-price-${itemId}`).value)) || 0;
  const remaining = Math.max(0, salePrice - paymentRowsSum(sellPayments));
  sellPayments.push({ method: "", amount: remaining > 0 ? String(remaining.toFixed(2)).replace(".", ",") : "" });
  renderSellPayments(itemId);
}

function setSellPaymentField(idx, field, value) {
  sellPayments[idx][field] = value;
  updateSellPaymentHint(sellingItemId);
}

async function confirmSellCard(itemId) {
  const salePrice = Number(parseDecimal(document.getElementById(`sell-price-${itemId}`).value));
  const discountReason = document.getElementById(`sell-discount-${itemId}`).value.trim();
  if (!paymentRowsValid(sellPayments, salePrice)) {
    setFormMessage(`sell-message-${itemId}`, paymentRowsHint(sellPayments, salePrice).text, "error");
    return;
  }
  const payments = sellPayments.map((p) => ({ payment_method: p.method, amount: Number(parseDecimal(p.amount)) }));

  setFormMessage(`sell-message-${itemId}`, "Registrando…", "");
  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ item_id: itemId, sale_price: salePrice, discount_reason: discountReason || null }],
        payments,
        sold_by_owner_id: session.ownerId,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar a venda"));
    }
    const [sale] = await res.json();
    sellingItemId = null;
    await loadInventory();
    await loadReports();
    showAlert(
      "inventory-alert-slot",
      `Venda de ${sale.sku} registrada: ${ownerAName} ${currency.format(sale.split.owner_a)}, ` +
        `${ownerBName} ${currency.format(sale.split.owner_b)}, Fornecedora ${currency.format(sale.split.supplier)}`,
      "success"
    );
  } catch (err) {
    setFormMessage(`sell-message-${itemId}`, err.message, "error");
  }
}

function handleSalesDatePresetChange() {
  const preset = document.getElementById("sales-date-preset").value;
  document.getElementById("sales-date-custom").hidden = preset !== "custom";
  loadSales();
}

function getSalesFilterParams() {
  const params = new URLSearchParams();
  const preset = document.getElementById("sales-date-preset").value;
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  if (preset === "today") {
    params.set("start_date", iso(today));
    params.set("end_date", iso(today));
  } else if (preset === "7d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    params.set("start_date", iso(start));
    params.set("end_date", iso(today));
  } else if (preset === "30d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    params.set("start_date", iso(start));
    params.set("end_date", iso(today));
  } else if (preset === "month") {
    params.set("start_date", iso(new Date(today.getFullYear(), today.getMonth(), 1)));
    params.set("end_date", iso(today));
  } else if (preset === "custom") {
    const start = document.getElementById("sales-start-date").value;
    const end = document.getElementById("sales-end-date").value;
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
  }
  return params;
}

async function loadSales() {
  const params = getSalesFilterParams();
  const sales = await fetch(`/api/sales?${params}`).then((r) => r.json());

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
    if (sale.voided_at) tr.className = "opacity-50";
    const action = sale.voided_at
      ? `<span class="text-gray-400 dark:text-gray-500">Estornada</span>`
      : `<button type="button" onclick="handleVoidSale(${sale.id})" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Estornar</button>`;
    tr.innerHTML = `
      <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-0"><a href="#items/${sale.item_id}" class="text-gray-900 hover:text-pink-600 dark:text-white dark:hover:text-pink-400">${sale.sku}</a></td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">#${sale.receipt_id}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(sale.sale_date)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.sale_price)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.owner_a)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.owner_b)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.supplier)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${sale.sold_by_owner_name ?? "—"}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatPaymentMethods(sale.payment_methods)}</td>
      <td class="py-4 pr-4 pl-3 text-sm font-medium whitespace-nowrap sm:pr-0">${action}</td>
    `;
    body.appendChild(tr);
  }
}

async function handleVoidSale(saleId) {
  if (!confirm("Estornar esta venda? A peça volta para o estoque.")) return;
  try {
    const res = await fetch(`/api/sales/${saleId}/void`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível estornar a venda"));
    }
    await loadInventory();
    await loadSales();
    await loadReports();
    showAlert("sales-alert-slot", "Venda estornada — a peça voltou para o estoque.", "success");
  } catch (err) {
    showAlert("sales-alert-slot", err.message, "error");
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
  document.getElementById("supplier-detail-owed").textContent = `a repassar: ${currency.format(supplier.total_owed)}`;
  document.getElementById("supplier-detail-paid").textContent = `já repassado: ${currency.format(supplier.total_paid)}`;
  document.getElementById("supplier-detail-register-payout").disabled = supplier.total_owed <= 0;
  document.getElementById("supplier-detail-register-payout").classList.toggle("opacity-50", supplier.total_owed <= 0);

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

  currentSupplierPayoutSales = supplier.payout_sales;
  selectedSupplierPayoutSaleIds = new Set();
  renderSupplierPayoutsTable();

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

// Shared by both the supplier payouts table and the two owner payout tables on
// Relatórios — each keeps its own selection Set and list, but the filter/select/render
// logic is identical, so it's factored out instead of tripled.
function filterPayoutRows(rows, statusFilterId) {
  const status = document.getElementById(statusFilterId).value;
  if (status === "pending") return rows.filter((r) => !r.paid_at);
  if (status === "paid") return rows.filter((r) => r.paid_at);
  return rows;
}

function renderSupplierPayoutsTable() {
  const payoutsBody = document.getElementById("supplier-payouts-body");
  const payoutsEmpty = document.getElementById("supplier-payouts-empty");
  const visible = filterPayoutRows(currentSupplierPayoutSales, "supplier-payouts-status-filter");

  if (currentSupplierPayoutSales.length === 0) {
    payoutsEmpty.hidden = false;
    payoutsBody.innerHTML = "";
  } else {
    payoutsEmpty.hidden = true;
    payoutsBody.innerHTML = visible
      .map((p) => {
        const status = p.paid_at
          ? `<span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">Pago em ${formatDate(p.paid_at)}</span>`
          : `<span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">Pendente</span>`;
        const action = p.paid_at
          ? `<button type="button" onclick="handleTogglePayout(${p.sale_id}, true)" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Desfazer</button>`
          : `<button type="button" onclick="handleTogglePayout(${p.sale_id}, false)" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Marcar como pago</button>`;
        return `
        <tr>
          <td class="py-4 pr-3 pl-4 sm:pl-0">${
            p.paid_at ? "" : `<input type="checkbox" onchange="toggleSupplierPayoutSelection(${p.sale_id}, this.checked)" ${selectedSupplierPayoutSaleIds.has(p.sale_id) ? "checked" : ""} class="size-3.5 rounded border-gray-300 text-pink-600 focus:ring-pink-600 dark:border-white/20 dark:bg-white/10" />`
          }</td>
          <td class="px-3 py-4 text-sm font-medium whitespace-nowrap"><a href="#items/${p.item_id}" class="text-gray-900 hover:text-pink-600 dark:text-white dark:hover:text-pink-400">${p.sku}</a></td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(p.sale_date)}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(p.supplier_amount)}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap">${status}</td>
          <td class="py-4 pr-4 pl-3 text-sm font-medium whitespace-nowrap sm:pr-0">${action}</td>
        </tr>
      `;
      })
      .join("");
  }

  const selectAll = document.getElementById("supplier-payouts-select-all");
  const pendingVisible = visible.filter((p) => !p.paid_at);
  selectAll.checked = pendingVisible.length > 0 && pendingVisible.every((p) => selectedSupplierPayoutSaleIds.has(p.sale_id));
  selectAll.disabled = pendingVisible.length === 0;

  const registerButton = document.getElementById("supplier-payouts-register-selected");
  registerButton.hidden = selectedSupplierPayoutSaleIds.size === 0;
}

function toggleSupplierPayoutSelection(saleId, checked) {
  if (checked) selectedSupplierPayoutSaleIds.add(saleId);
  else selectedSupplierPayoutSaleIds.delete(saleId);
  renderSupplierPayoutsTable();
}

function toggleAllSupplierPayoutSelection(checked) {
  const visible = filterPayoutRows(currentSupplierPayoutSales, "supplier-payouts-status-filter").filter((p) => !p.paid_at);
  for (const p of visible) {
    if (checked) selectedSupplierPayoutSaleIds.add(p.sale_id);
    else selectedSupplierPayoutSaleIds.delete(p.sale_id);
  }
  renderSupplierPayoutsTable();
}

async function handleRegisterSelectedSupplierPayouts() {
  const saleIds = [...selectedSupplierPayoutSaleIds];
  if (saleIds.length === 0) return;
  const total = currentSupplierPayoutSales
    .filter((p) => saleIds.includes(p.sale_id))
    .reduce((sum, p) => sum + p.supplier_amount, 0);
  if (!confirm(`Registrar repasse de ${currency.format(total)} (${saleIds.length} venda${saleIds.length > 1 ? "s" : ""})?`)) return;
  try {
    const res = await fetch(`/api/suppliers/${currentSupplierDetailId}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sale_ids: saleIds }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar o repasse"));
    }
    await showSupplierDetail(currentSupplierDetailId);
    showAlert("supplier-detail-alert-slot", "Repasse registrado.", "success");
  } catch (err) {
    showAlert("supplier-detail-alert-slot", err.message, "error");
  }
}

async function handleRegisterPayout(supplierId) {
  const supplier = await fetch(`/api/suppliers/${supplierId}`).then((r) => r.json());
  if (supplier.total_owed <= 0) return;
  if (!confirm(`Registrar repasse de ${currency.format(supplier.total_owed)} para ${supplier.name}?`)) return;
  try {
    const res = await fetch(`/api/suppliers/${supplierId}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar o repasse"));
    }
    await showSupplierDetail(supplierId);
    showAlert("supplier-detail-alert-slot", "Repasse registrado.", "success");
  } catch (err) {
    showAlert("supplier-detail-alert-slot", err.message, "error");
  }
}

async function handleTogglePayout(saleId, currentlyPaid) {
  try {
    const res = await fetch(`/api/sales/${saleId}/payout/${currentlyPaid ? "mark-unpaid" : "mark-paid"}`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível atualizar o repasse"));
    }
    if (currentSupplierDetailId) await showSupplierDetail(currentSupplierDetailId);
  } catch (err) {
    showAlert("supplier-detail-alert-slot", err.message, "error");
  }
}

// --- Repasses às donas (página Donas) ----------------------------------------
// Each owner gets her own table/selection state, scoped by ownerId in every element
// id and function call — unlike the supplier table (one supplier at a time), both
// owners' tables are visible on the page simultaneously.

let ownerPayoutSalesByOwner = {};
let selectedOwnerPayoutSaleIdsByOwner = {};

async function loadOwnerPayouts(ownerId) {
  const sales = await fetch(`/api/owners/${ownerId}/payouts`).then((r) => r.json());
  ownerPayoutSalesByOwner[ownerId] = sales;
  selectedOwnerPayoutSaleIdsByOwner[ownerId] = new Set();
  renderOwnerPayoutsTable(ownerId);
}

function renderOwnerPayoutsTable(ownerId) {
  const sales = ownerPayoutSalesByOwner[ownerId] || [];
  const selected = selectedOwnerPayoutSaleIdsByOwner[ownerId] || new Set();
  const body = document.getElementById(`owner-payouts-body-${ownerId}`);
  const empty = document.getElementById(`owner-payouts-empty-${ownerId}`);
  const visible = filterPayoutRows(sales, `owner-payouts-status-filter-${ownerId}`);

  if (sales.length === 0) {
    empty.hidden = false;
    body.innerHTML = "";
  } else {
    empty.hidden = true;
    body.innerHTML = visible
      .map((p) => {
        const status = p.paid_at
          ? `<span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">Pago em ${formatDate(p.paid_at)}</span>`
          : `<span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">Pendente</span>`;
        const action = p.paid_at
          ? `<button type="button" onclick="handleToggleOwnerPayout(${ownerId}, ${p.sale_id}, true)" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Desfazer</button>`
          : `<button type="button" onclick="handleToggleOwnerPayout(${ownerId}, ${p.sale_id}, false)" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Marcar como pago</button>`;
        return `
        <tr>
          <td class="py-4 pr-3 pl-4 sm:pl-0">${
            p.paid_at ? "" : `<input type="checkbox" onchange="toggleOwnerPayoutSelection(${ownerId}, ${p.sale_id}, this.checked)" ${selected.has(p.sale_id) ? "checked" : ""} class="size-3.5 rounded border-gray-300 text-pink-600 focus:ring-pink-600 dark:border-white/20 dark:bg-white/10" />`
          }</td>
          <td class="px-3 py-4 text-sm font-medium whitespace-nowrap"><a href="#items/${p.item_id}" class="text-gray-900 hover:text-pink-600 dark:text-white dark:hover:text-pink-400">${p.sku}</a></td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(p.sale_date)}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(p.amount)}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap">${status}</td>
          <td class="py-4 pr-4 pl-3 text-sm font-medium whitespace-nowrap sm:pr-0">${action}</td>
        </tr>
      `;
      })
      .join("");
  }

  const selectAll = document.getElementById(`owner-payouts-select-all-${ownerId}`);
  const pendingVisible = visible.filter((p) => !p.paid_at);
  selectAll.checked = pendingVisible.length > 0 && pendingVisible.every((p) => selected.has(p.sale_id));
  selectAll.disabled = pendingVisible.length === 0;

  const registerButton = document.getElementById(`owner-payouts-register-selected-${ownerId}`);
  registerButton.hidden = selected.size === 0;
}

function toggleOwnerPayoutSelection(ownerId, saleId, checked) {
  const selected = selectedOwnerPayoutSaleIdsByOwner[ownerId];
  if (checked) selected.add(saleId);
  else selected.delete(saleId);
  renderOwnerPayoutsTable(ownerId);
}

function toggleAllOwnerPayoutSelection(ownerId, checked) {
  const visible = filterPayoutRows(ownerPayoutSalesByOwner[ownerId] || [], `owner-payouts-status-filter-${ownerId}`).filter(
    (p) => !p.paid_at
  );
  const selected = selectedOwnerPayoutSaleIdsByOwner[ownerId];
  for (const p of visible) {
    if (checked) selected.add(p.sale_id);
    else selected.delete(p.sale_id);
  }
  renderOwnerPayoutsTable(ownerId);
}

async function handleToggleOwnerPayout(ownerId, saleId, currentlyPaid) {
  const side = ownerById[ownerId].is_cut_owner ? "a" : "b";
  try {
    const res = await fetch(`/api/sales/${saleId}/owner-payout/${side}/${currentlyPaid ? "mark-unpaid" : "mark-paid"}`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível atualizar o repasse"));
    }
    await loadOwnerPayouts(ownerId);
  } catch (err) {
    showAlert("settings-alert-slot", err.message, "error");
  }
}

async function handleRegisterSelectedOwnerPayouts(ownerId) {
  const saleIds = [...(selectedOwnerPayoutSaleIdsByOwner[ownerId] || [])];
  if (saleIds.length === 0) return;
  const total = (ownerPayoutSalesByOwner[ownerId] || [])
    .filter((p) => saleIds.includes(p.sale_id))
    .reduce((sum, p) => sum + p.amount, 0);
  if (!confirm(`Registrar repasse de ${currency.format(total)} (${saleIds.length} venda${saleIds.length > 1 ? "s" : ""})?`)) return;
  try {
    const res = await fetch(`/api/owners/${ownerId}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sale_ids: saleIds }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar o repasse"));
    }
    await loadOwnerPayouts(ownerId);
    showAlert("settings-alert-slot", "Repasse registrado.", "success");
  } catch (err) {
    showAlert("settings-alert-slot", err.message, "error");
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
  currentItemDetailData = item;

  document.getElementById("item-detail-sku").textContent = item.sku;
  document.getElementById("item-detail-title").textContent = item.sku;
  document.getElementById("item-detail-status").innerHTML = statusBadge(item.status);
  document.getElementById("item-detail-edit").hidden = item.status !== "in_stock";
  document.getElementById("item-detail-delete").hidden = item.status !== "in_stock";
  document.getElementById("item-detail-withdraw").hidden = !(item.status === "in_stock" && item.supplier_id != null);

  const photosEl = document.getElementById("item-detail-photos");
  photosEl.innerHTML = item.photo_paths
    .map(
      (p) =>
        `<img src="${p}" class="aspect-square w-full rounded-lg bg-gray-100 object-cover outline outline-gray-200 dark:bg-gray-800 dark:outline-white/10" />`
    )
    .join("");

  const fields = [
    ["Vinculada a", describeItem(item)],
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
      ...(item.sale.voided_at ? [["Estornada em", formatDate(item.sale.voided_at)]] : []),
      ["Data da venda", formatDate(item.sale.sale_date)],
      ["Preço de venda", currency.format(item.sale.sale_price)],
      ["Vendida por", item.sale.sold_by_owner_name ?? "—"],
      ["Forma de pagamento", formatPaymentMethods(item.sale.payment_methods)],
      ...(item.sale.discount_reason ? [["Motivo do desconto", item.sale.discount_reason]] : []),
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

  const editsSection = document.getElementById("item-detail-edits");
  editsSection.hidden = item.edits.length === 0;
  if (item.edits.length > 0) {
    const editRows = item.edits.map((e) => {
      const label = ITEM_EDIT_FIELD_LABELS[e.field] || e.field;
      const format = e.field === "price" ? formatEditPrice : e.field === "commission_pct_override" ? formatEditPercent : (v) => v ?? "—";
      return [
        `${label} · ${e.edited_by_owner_name ?? "—"} · ${formatDate(e.edited_at)}`,
        `${format(e.old_value)} → ${format(e.new_value)}`,
      ];
    });
    document.getElementById("item-detail-edits-fields").innerHTML = editRows.map(([l, v]) => detailRow(l, v)).join("");
  }
}

function formatEditPrice(value) {
  if (value === null || value === undefined) return "—";
  return currency.format(Number(value));
}

function formatEditPercent(value) {
  if (value === null || value === undefined) return "usa o padrão da fornecedora";
  return `${String(value).replace(".", ",")}%`;
}

function renderItemEditForm(item) {
  return `
    <form id="item-edit-form" class="space-y-6 p-6">
      <div>
        <label for="edit-department" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Departamento <span class="text-red-600 dark:text-red-400">*</span></label>
        <div class="mt-2 grid grid-cols-1">
          <select id="edit-department" required class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800"></select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="edit-category" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Categoria</label>
          <div class="mt-2 grid grid-cols-1">
            <select id="edit-category" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800"></select>
          </div>
        </div>
        <div id="edit-size-field">
          <label for="edit-size" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Tamanho</label>
          <div class="mt-2 grid grid-cols-1">
            <select id="edit-size" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800"></select>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="edit-condition" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Condição</label>
          <div class="mt-2 grid grid-cols-1">
            <select id="edit-condition" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800"></select>
          </div>
        </div>
        <div>
          <label for="edit-price" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Preço (R$) <span class="text-red-600 dark:text-red-400">*</span></label>
          <div class="mt-2">
            <input type="text" inputmode="decimal" id="edit-price" value="${String(item.price).replace(".", ",")}" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 disabled:bg-gray-50 disabled:text-gray-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:disabled:bg-white/[0.02] dark:disabled:text-gray-500" />
          </div>
        </div>
      </div>
      <div>
        <label for="edit-brand" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Marca</label>
        <div class="mt-2">
          <input type="text" id="edit-brand" value="${item.brand ?? ""}" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="edit-color" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Cor / Estampa</label>
          <div class="mt-2">
            <input type="text" id="edit-color" value="${item.color ?? ""}" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10" />
          </div>
        </div>
        <div>
          <label for="edit-material" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Material</label>
          <div class="mt-2">
            <input type="text" id="edit-material" value="${item.material ?? ""}" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10" />
          </div>
        </div>
      </div>
      <div>
        <label for="edit-observations" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Observações</label>
        <div class="mt-2">
          <textarea id="edit-observations" rows="3" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10">${item.observations ?? ""}</textarea>
        </div>
      </div>
      <p id="item-edit-message" class="text-sm"></p>
      <div class="flex justify-end gap-3">
        <button type="button" onclick="showItemDetail(currentItemDetailId)" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20">Cancelar</button>
        <button type="submit" class="inline-flex justify-center rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 dark:bg-pink-500 dark:hover:bg-pink-400">Salvar</button>
      </div>
    </form>
  `;
}

function enterItemEditMode() {
  const item = currentItemDetailData;
  if (!item) return;
  document.getElementById("item-detail-fields").innerHTML = renderItemEditForm(item);

  populateSelect("edit-department", ITEM_DEPARTMENTS, "Selecione o departamento");
  document.getElementById("edit-department").value = item.department ?? "";
  updateCategoryOptions(item.department ?? "", "edit-");
  document.getElementById("edit-category").value = item.category ?? "";
  updateSizeField(item.department ?? "", item.category ?? "", "edit-");
  document.getElementById("edit-size").value = item.size ?? "";
  populateSelect("edit-condition", ITEM_CONDITIONS, "Selecione a condição");
  document.getElementById("edit-condition").value = item.condition ?? "";

  // Anchored to the item's actual saved department/category/size (not just the select's
  // immediately-prior value) so that switching the department dropdown away and back —
  // however many times, in whatever order — always restores the real values instead of
  // losing them after the first hop away.
  document.getElementById("edit-department").addEventListener("change", (e) => {
    const newDepartment = e.target.value;
    updateCategoryOptions(newDepartment, "edit-");
    if (newDepartment === (item.department ?? "")) {
      document.getElementById("edit-category").value = item.category ?? "";
      updateSizeField(newDepartment, item.category ?? "", "edit-");
      document.getElementById("edit-size").value = item.size ?? "";
    }
  });
  document.getElementById("edit-category").addEventListener("change", (e) =>
    updateSizeField(document.getElementById("edit-department").value, e.target.value, "edit-")
  );

  document.getElementById("item-edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleItemEditSave(currentItemDetailId);
  });
}

async function handleItemEditSave(itemId) {
  const payload = {
    department: document.getElementById("edit-department").value || null,
    category: document.getElementById("edit-category").value || null,
    size: document.getElementById("edit-size").value || null,
    condition: document.getElementById("edit-condition").value || null,
    brand: document.getElementById("edit-brand").value || null,
    color: document.getElementById("edit-color").value || null,
    material: document.getElementById("edit-material").value || null,
    observations: document.getElementById("edit-observations").value || null,
    price: Number(parseDecimal(document.getElementById("edit-price").value)),
    edited_by_owner_id: session.ownerId,
  };

  setFormMessage("item-edit-message", "Salvando…", "");
  try {
    const res = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível salvar as alterações"));
    }
    await showItemDetail(itemId);
    await loadInventory();
    showAlert("item-detail-alert-slot", "Peça atualizada.", "success");
  } catch (err) {
    setFormMessage("item-edit-message", err.message, "error");
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
    if (currentItemDetailId === itemId) await showItemDetail(itemId);
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

function handleReportDatePresetChange() {
  const preset = document.getElementById("report-date-preset").value;
  document.getElementById("report-date-custom").hidden = preset !== "custom";
  loadReports();
}

// Shared by every /api/reports/* fetch on the Relatórios landing page — this tier is
// shop-wide and identity-free by design (no owner/supplier breakdown), so anyone
// glancing at the screen only ever sees aggregate numbers. Per-dona and per-fornecedora
// breakdowns live one level deeper, in Proprietárias (see getDonaReportFilterParams).
function getReportFilterParams() {
  const params = resolveDateRangeParams("report-date-preset", "report-start-date", "report-end-date");
  const department = document.getElementById("report-department-filter").value;
  if (department) params.set("department", department);
  return params;
}

// Shared date-preset-to-range logic for both the Relatórios landing page and the
// per-dona report block in Proprietárias.
function resolveDateRangeParams(presetId, startId, endId) {
  const params = new URLSearchParams();
  const preset = document.getElementById(presetId).value;
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  if (preset === "today") {
    params.set("start_date", iso(today));
    params.set("end_date", iso(today));
  } else if (preset === "7d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    params.set("start_date", iso(start));
    params.set("end_date", iso(today));
  } else if (preset === "30d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    params.set("start_date", iso(start));
    params.set("end_date", iso(today));
  } else if (preset === "month") {
    params.set("start_date", iso(new Date(today.getFullYear(), today.getMonth(), 1)));
    params.set("end_date", iso(today));
  } else if (preset === "custom") {
    const start = document.getElementById(startId).value;
    const end = document.getElementById(endId).value;
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
  }
  return params;
}

// Single validated blue (frontend/src/input.css .viz-root --viz-series-1) — magnitude
// is already encoded by bar length, so every bar shares one color rather than a
// per-category hue, which would imply an identity distinction that isn't there.
function renderHorizontalBarChart(rows, labelKey, valueKey, formatValue) {
  if (rows.length === 0) {
    return `<p class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Sem dados no período selecionado.</p>`;
  }
  const max = Math.max(...rows.map((r) => r[valueKey]), 0.01);
  return `
    <div class="viz-root space-y-2">
      ${rows
        .map((r) => {
          const pct = Math.max((r[valueKey] / max) * 100, 2);
          const label = r[labelKey] ?? "sem categoria";
          return `
        <div class="flex items-center gap-3" title="${label}: ${formatValue(r[valueKey])}">
          <span class="w-32 shrink-0 truncate text-xs" style="color: var(--viz-text-secondary)">${label}</span>
          <div class="h-2 flex-1 rounded-full" style="background: var(--viz-gridline)">
            <div class="h-2 rounded-full" style="width: ${pct}%; background: var(--viz-series-1)"></div>
          </div>
          <span class="w-24 shrink-0 text-right text-xs font-medium" style="color: var(--viz-text-secondary)">${formatValue(r[valueKey])}</span>
        </div>
      `;
        })
        .join("")}
    </div>
  `;
}

function renderVerticalBarChart(rows, labelKey, valueKey, formatValue) {
  if (rows.length === 0) {
    return `<p class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Sem dados no período selecionado.</p>`;
  }
  const max = Math.max(...rows.map((r) => r[valueKey]), 0.01);
  const labelStep = Math.max(1, Math.ceil(rows.length / 12));
  return `
    <div class="viz-root">
      <div class="flex h-48 items-end gap-1 border-b" style="border-color: var(--viz-baseline)">
        ${rows
          .map((r) => {
            const pct = Math.max((r[valueKey] / max) * 100, 2);
            return `
          <div class="flex h-full flex-1 flex-col items-center justify-end" title="${r[labelKey]}: ${formatValue(r[valueKey])}">
            <div class="w-full min-w-[2px] rounded-t-sm" style="height: ${pct}%; background: var(--viz-series-1)"></div>
          </div>
        `;
          })
          .join("")}
      </div>
      <div class="mt-1 flex gap-1">
        ${rows
          .map(
            (r, i) =>
              `<span class="flex-1 truncate text-center text-[10px]" style="color: var(--viz-text-muted)">${i % labelStep === 0 ? r[labelKey] : ""}</span>`
          )
          .join("")}
      </div>
    </div>
  `;
}

// Whether the Repasses cards are blurred. Defaults to masked and resets to masked
// every time Relatórios is (re)entered via navigation (see showView) — a dona who
// reveals it, then walks away from the counter, shouldn't leave it exposed for
// whoever looks next. Filter changes within the same visit don't re-mask (see
// loadReportSummary), so studying your own numbers isn't interrupted by a re-blur.
let reportPayoutsMasked = true;

// Shop-wide only — deliberately excludes per-dona earnings and per-fornecedora
// commission, which are identity-linked and belong one level deeper in Proprietárias
// (loadDonaReportSummary). The payout totals below are safe to compute here because
// they're combined across both donas / all fornecedoras — no single person's number
// is exposed — but they're still money figures visible to anyone at the counter, so
// they're blurred by default (see reportPayoutsMasked).
async function loadReportSummary(params) {
  const summary = await fetch(`/api/reports/summary?${params}`).then((r) => r.json());
  const stats = [
    { label: "Total de vendas", value: String(summary.total_sales) },
    { label: "Receita total", value: currency.format(summary.total_revenue) },
  ];
  document.getElementById("report-stats").innerHTML = renderStatCards(stats);

  const payoutStats = [
    { label: "Repasse às donas (total)", value: currency.format(summary.owner_payout_total) },
    { label: "Já repassado às donas", value: currency.format(summary.owner_payout_paid) },
    { label: "Ainda a repassar às donas", value: currency.format(summary.owner_payout_pending) },
    { label: "Comissão de fornecedoras (total)", value: currency.format(summary.supplier_commission_total) },
    { label: "Já pago a fornecedoras", value: currency.format(summary.supplier_commission_paid) },
    { label: "Ainda a pagar a fornecedoras", value: currency.format(summary.supplier_commission_pending) },
  ];
  document.getElementById("report-payout-stats").innerHTML = renderStatCards(payoutStats, reportPayoutsMasked);

  document.getElementById("report-owner-shortcuts").innerHTML = Object.values(ownerById)
    .map(
      (owner) => `
      <a href="#settings/${owner.id}" class="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20">${owner.name}</a>
    `
    )
    .join("");
}

function toggleReportPayoutsMask() {
  reportPayoutsMasked = !reportPayoutsMasked;
  document.querySelectorAll("#report-payout-stats .payout-stat-value").forEach((dd) => {
    dd.classList.toggle("blur-sm", reportPayoutsMasked);
    dd.classList.toggle("select-none", reportPayoutsMasked);
  });
  document.getElementById("report-payouts-eye-closed").classList.toggle("hidden", !reportPayoutsMasked);
  document.getElementById("report-payouts-eye-open").classList.toggle("hidden", reportPayoutsMasked);
  document
    .getElementById("report-payouts-mask-toggle")
    .setAttribute("aria-label", reportPayoutsMasked ? "Mostrar valores de repasses" : "Ocultar valores de repasses");
}

function renderStatCards(stats, masked = false) {
  return stats
    .map(
      (s) => `
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6 dark:bg-gray-800/75 dark:inset-ring dark:inset-ring-white/10">
        <dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">${s.label}</dt>
        <dd class="payout-stat-value mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white ${masked ? "blur-sm select-none" : ""}">${s.value}</dd>
      </div>
    `
    )
    .join("");
}

async function loadReportByCategory(params) {
  const rows = await fetch(`/api/reports/by-category?${params}`).then((r) => r.json());
  document.getElementById("report-category-chart").innerHTML = renderHorizontalBarChart(rows, "category", "total_revenue", (v) =>
    currency.format(v)
  );

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

async function loadReportTimeline(params) {
  const granularity = document.getElementById("timeline-granularity").value;
  const rows = await fetch(`/api/reports/timeline?granularity=${granularity}&${params}`).then((r) => r.json());
  document.getElementById("report-timeline-chart").innerHTML = renderVerticalBarChart(rows, "period", "total_revenue", (v) => currency.format(v));

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
  const params = getReportFilterParams();
  await Promise.all([loadReportSummary(params), loadReportByCategory(params), loadReportTimeline(params)]);
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
  if (department) formData.append("department", department);
  if (category) formData.append("category", category);
  if (brand) formData.append("brand", brand);
  if (size) formData.append("size", size);
  if (condition) formData.append("condition", condition);
  if (color) formData.append("color", color);
  if (material) formData.append("material", material);
  if (observations) formData.append("observations", observations);

  setFormMessage("form-message", "Salvando…", "");
  try {
    const res = await postFormData("/api/items", formData);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível salvar a peça"));
    }
    const item = await res.json();

    // One request per photo, sent only after the piece itself is safely saved — a
    // large Photos-library original (routinely several MB once base64-encoded)
    // shares no request with department/price, so it can't take them down too
    // (see postFormData above).
    let photoFailures = 0;
    for (const file of document.getElementById("photos").files) {
      try {
        const photoFormData = new FormData();
        photoFormData.append("photo_base64", await readFileAsDataURL(file));
        const photoRes = await postFormData(`/api/items/${item.id}/photos`, photoFormData);
        if (!photoRes.ok) throw new Error();
      } catch {
        photoFailures++;
      }
    }

    event.target.reset();
    updateCategoryOptions("");
    await loadInventory();
    document.getElementById("item-drawer").close();
    setFormMessage("form-message", "", "");
    showAlert(
      "inventory-alert-slot",
      photoFailures > 0
        ? `Peça ${item.sku} adicionada — ${photoFailures} foto(s) não puderam ser enviadas.`
        : `Peça ${item.sku} adicionada.`,
      photoFailures > 0 ? "error" : "success"
    );
  } catch (err) {
    setFormMessage("form-message", err.message, "error");
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

// Wired to both the X button and Cancelar on each drawer. The Tailwind Plus dialog
// polyfill (frontend/vendor/elements.js) handles command="close" itself without ever
// dispatching the native <dialog> "close" event, so a close-event listener never fires
// here — resetting explicitly on click is the reliable way to clear a stale field
// value (e.g. an invalid price from a prior attempt) before the drawer is reopened.
function resetItemDrawer() {
  document.getElementById("item-form").reset();
  updateCategoryOptions("");
  setFormMessage("form-message", "", "");
}

function resetSupplierDrawer() {
  document.getElementById("supplier-form").reset();
  setFormMessage("supplier-message", "", "");
}

function resetCartDrawer() {
  setFormMessage("cart-message", "", "");
}

document.getElementById("item-form").addEventListener("submit", handleSubmit);
document.getElementById("status-filter").addEventListener("change", loadInventory);
document.getElementById("department-filter").addEventListener("change", (e) => {
  updateCategoryFilterOptions(e.target.value);
  loadInventory();
});
document.getElementById("category-filter").addEventListener("change", loadInventory);
document.getElementById("inventory-search").addEventListener("input", (e) => handleInventorySearch(e.target.value));
document.getElementById("department").addEventListener("change", (e) => updateCategoryOptions(e.target.value));
document.getElementById("category").addEventListener("change", (e) => updateSizeField(document.getElementById("department").value, e.target.value));
document.getElementById("supplier-form").addEventListener("submit", handleSupplierSubmit);
document.getElementById("timeline-granularity").addEventListener("change", () => loadReportTimeline(getReportFilterParams()));
document.getElementById("sales-date-preset").addEventListener("change", handleSalesDatePresetChange);
document.getElementById("sales-start-date").addEventListener("change", loadSales);
document.getElementById("sales-end-date").addEventListener("change", loadSales);
document.getElementById("report-date-preset").addEventListener("change", handleReportDatePresetChange);
document.getElementById("report-start-date").addEventListener("change", loadReports);
document.getElementById("report-end-date").addEventListener("change", loadReports);
document.getElementById("report-department-filter").addEventListener("change", loadReports);
window.addEventListener("hashchange", showView);
["mousedown", "keydown", "touchstart"].forEach((evt) => window.addEventListener(evt, resetInactivityTimer));

renderNav();
populateSelect("department", ITEM_DEPARTMENTS, "Selecione o departamento");
populateSelect("department-filter", ITEM_DEPARTMENTS, "Todos os departamentos");
populateSelect("report-department-filter", ITEM_DEPARTMENTS, "Todos os departamentos");
updateCategoryOptions("");
updateCategoryFilterOptions("");
populateSelect("size", ITEM_SIZES, "Selecione o tamanho");
populateSelect("condition", ITEM_CONDITIONS, "Selecione a condição");
document.getElementById("inventory-view-toggle-label").textContent = inventoryView === "grid" ? "Ver em lista" : "Ver em grade";
document.getElementById("inventory-columns-toggle").hidden = inventoryView !== "list";
loadHealth();
showLockScreen("choose");
loadAssignments().then(showView);
