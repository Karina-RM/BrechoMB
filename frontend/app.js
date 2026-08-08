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
    view: "reports",
    label: "Relatórios",
    path: `<path d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" stroke-linecap="round" stroke-linejoin="round" /><path d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" stroke-linecap="round" stroke-linejoin="round" />`,
  },
  {
    view: "settings",
    label: "Configurações",
    path: `<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.28c-.062-.374-.312-.687-.644-.87a6.52 6.52 0 0 1-.22-.128c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" stroke-linecap="round" stroke-linejoin="round" /><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke-linecap="round" stroke-linejoin="round" />`,
  },
];

const VIEW_TITLES = {
  inventory: "Estoque",
  "item-detail": "Estoque",
  sales: "Vendas",
  suppliers: "Fornecedoras",
  "supplier-detail": "Fornecedoras",
  reports: "Relatórios",
  settings: "Configurações",
};

let assignmentLookup = {};
let ownerAName = "Dona A";
let ownerBName = "Dona B";
let ownerById = {};
let currentSupplierDetailId = null;
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
function parseDecimal(value) {
  // Brazilian notation uses "." as the thousands separator and "," as the decimal
  // point (e.g. "1.500,00") — strip the former before converting the latter, or a
  // value like "1.500,00" becomes the unparseable "1.500.00".
  const normalized = String(value ?? "").trim().replace(/\./g, "").replace(",", ".");
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
          ? `<p class="max-w-64 text-xs text-gray-400 dark:text-gray-500">Esqueceu o PIN? Clique em "Trocar", entre com o PIN da outra dona e redefina o seu em Configurações — não é preciso saber o PIN atual.</p>`
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

async function loadSettings() {
  const owners = await fetch("/api/owners").then((r) => r.json());
  const container = document.getElementById("settings-owners");
  container.innerHTML = owners
    .map(
      (o) => `
    <div class="rounded-lg bg-white p-6 shadow-xs inset-ring inset-ring-gray-200 dark:bg-white/5 dark:inset-ring-white/10">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">${o.name}</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">${o.has_pin ? "PIN já cadastrado" : "Nenhum PIN cadastrado ainda"}</p>
      <button type="button" data-reset-pin="${o.id}" class="mt-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:inset-ring-white/5 dark:hover:bg-white/20">Redefinir PIN</button>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-reset-pin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pinBuffer = [];
      pinConfirmValue = null;
      showLockScreen("create-pin", Number(btn.dataset.resetPin), true);
    });
  });
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
  else if (resolvedView === "reports") await loadReports();
  else if (resolvedView === "settings") await loadSettings();
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

  const reportOwnerSelect = document.getElementById("report-owner-filter");
  reportOwnerSelect.innerHTML = '<option value="">Ambas as donas</option>';
  for (const owner of owners) {
    const opt = document.createElement("option");
    opt.value = owner.id;
    opt.textContent = owner.name;
    reportOwnerSelect.appendChild(opt);
  }

  const reportSupplierSelect = document.getElementById("report-supplier-filter");
  reportSupplierSelect.innerHTML = '<option value="">Todas as fornecedoras</option>';
  for (const supplier of suppliers) {
    const opt = document.createElement("option");
    opt.value = supplier.id;
    opt.textContent = supplier.name;
    reportSupplierSelect.appendChild(opt);
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
    populateSelect(`sell-payment-${sellingItemId}`, PAYMENT_METHODS, "Selecione a forma de pagamento");
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
              <label for="cart-price-${itemId}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Preço de venda (R$)</label>
              <input type="text" inputmode="decimal" id="cart-price-${itemId}" data-catalog-price="${item.price}" value="${String(entry.price).replace(".", ",")}" readonly class="mt-1 block w-full rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 read-only:cursor-not-allowed read-only:bg-gray-50 read-only:text-gray-500 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:read-only:bg-white/[0.02] dark:read-only:text-gray-400" />
            </div>
            <div>
              <label for="cart-discount-${itemId}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Motivo do desconto (opcional)</label>
              <input type="text" id="cart-discount-${itemId}" value="${entry.discountReason}" disabled placeholder="ex: mancha encontrada na hora da venda" class="mt-1 block w-full rounded-md bg-white px-2 py-1 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:disabled:bg-white/[0.02] dark:disabled:text-gray-500" />
            </div>
          </div>
        </div>
      `;
    })
    .join("");
  populateSelect("cart-payment-method", PAYMENT_METHODS, "Selecione a forma de pagamento");
  setFormMessage("cart-message", "", "");
}

function toggleCartDiscount(itemId) {
  const checked = document.getElementById(`cart-discount-toggle-${itemId}`).checked;
  const priceInput = document.getElementById(`cart-price-${itemId}`);
  const reasonInput = document.getElementById(`cart-discount-${itemId}`);
  priceInput.readOnly = !checked;
  reasonInput.disabled = !checked;
  if (checked) {
    priceInput.focus();
  } else {
    priceInput.value = String(priceInput.dataset.catalogPrice).replace(".", ",");
    reasonInput.value = "";
  }
}

async function confirmCheckout() {
  const paymentMethod = document.getElementById("cart-payment-method").value;
  if (!paymentMethod) {
    setFormMessage("cart-message", "selecione a forma de pagamento", "error");
    return;
  }

  const items = Object.keys(cart).map((itemId) => ({
    item_id: Number(itemId),
    sale_price: Number(parseDecimal(document.getElementById(`cart-price-${itemId}`).value)),
    discount_reason: document.getElementById(`cart-discount-${itemId}`).value.trim() || null,
  }));

  setFormMessage("cart-message", "Registrando…", "");
  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, payment_method: paymentMethod, sold_by_owner_id: session.ownerId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(describeApiError(err, "não foi possível registrar a venda"));
    }
    const sales = await res.json();
    const total = sales.reduce((sum, s) => sum + s.sale_price, 0);
    cart = {};
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
          <input type="text" inputmode="decimal" id="sell-price-${item.id}" data-catalog-price="${item.price}" value="${String(item.price).replace(".", ",")}" readonly class="mt-1 block w-full rounded-md bg-white px-3 py-2 text-xl font-bold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 read-only:cursor-not-allowed read-only:bg-gray-50 read-only:text-gray-500 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:read-only:bg-white/[0.02] dark:read-only:text-gray-400" />
        </div>
        <div>
          <label for="sell-payment-${item.id}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Forma de pagamento</label>
          <div class="mt-1 grid grid-cols-1">
            <select id="sell-payment-${item.id}" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800"></select>
          </div>
        </div>
        <div>
          <label for="sell-discount-${item.id}" class="block text-xs font-medium text-gray-500 dark:text-gray-400">Motivo do desconto (opcional)</label>
          <input type="text" id="sell-discount-${item.id}" disabled placeholder="ex: mancha encontrada na hora da venda" class="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:disabled:bg-white/[0.02] dark:disabled:text-gray-500" />
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
  priceInput.readOnly = !checked;
  reasonInput.disabled = !checked;
  if (checked) {
    priceInput.focus();
  } else {
    priceInput.value = String(priceInput.dataset.catalogPrice).replace(".", ",");
    reasonInput.value = "";
  }
}

function startSellCard(itemId) {
  sellingItemId = itemId;
  renderInventoryGrid();
  document.getElementById(`sell-price-${itemId}`).focus();
}

function cancelSellCard(itemId) {
  sellingItemId = null;
  renderInventoryGrid();
}

async function confirmSellCard(itemId) {
  const salePrice = Number(parseDecimal(document.getElementById(`sell-price-${itemId}`).value));
  const paymentMethod = document.getElementById(`sell-payment-${itemId}`).value;
  const discountReason = document.getElementById(`sell-discount-${itemId}`).value.trim();
  if (!paymentMethod) {
    setFormMessage(`sell-message-${itemId}`, "selecione a forma de pagamento", "error");
    return;
  }

  setFormMessage(`sell-message-${itemId}`, "Registrando…", "");
  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ item_id: itemId, sale_price: salePrice, discount_reason: discountReason || null }],
        payment_method: paymentMethod,
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
    if (sale.voided_at) tr.className = "opacity-50";
    const action = sale.voided_at
      ? `<span class="text-gray-400 dark:text-gray-500">Estornada</span>`
      : `<button type="button" onclick="handleVoidSale(${sale.id})" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Estornar</button>`;
    tr.innerHTML = `
      <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${sale.sku}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">#${sale.receipt_id}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(sale.sale_date)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.sale_price)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.owner_a)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.owner_b)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(sale.split.supplier)}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${sale.sold_by_owner_name ?? "—"}</td>
      <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${sale.payment_method ?? "—"}</td>
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

  const payoutsBody = document.getElementById("supplier-payouts-body");
  const payoutsEmpty = document.getElementById("supplier-payouts-empty");
  payoutsBody.innerHTML = "";
  if (supplier.payout_sales.length === 0) {
    payoutsEmpty.hidden = false;
  } else {
    payoutsEmpty.hidden = true;
    payoutsBody.innerHTML = supplier.payout_sales
      .map((p) => {
        const status = p.paid_at
          ? `<span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">Pago em ${formatDate(p.paid_at)}</span>`
          : `<span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 inset-ring inset-ring-gray-200 dark:text-white dark:inset-ring-white/10">Pendente</span>`;
        const action = p.paid_at
          ? `<button type="button" onclick="handleTogglePayout(${p.sale_id}, true)" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Desfazer</button>`
          : `<button type="button" onclick="handleTogglePayout(${p.sale_id}, false)" class="text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300">Marcar como pago</button>`;
        return `
        <tr>
          <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">${p.sku}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${formatDate(p.sale_date)}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">${currency.format(p.supplier_amount)}</td>
          <td class="px-3 py-4 text-sm whitespace-nowrap">${status}</td>
          <td class="py-4 pr-4 pl-3 text-sm font-medium whitespace-nowrap sm:pr-0">${action}</td>
        </tr>
      `;
      })
      .join("");
  }

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

async function handleRegisterPayout(supplierId) {
  const supplier = await fetch(`/api/suppliers/${supplierId}`).then((r) => r.json());
  if (supplier.total_owed <= 0) return;
  if (!confirm(`Registrar repasse de ${currency.format(supplier.total_owed)} para ${supplier.name}?`)) return;
  try {
    const res = await fetch(`/api/suppliers/${supplierId}/payouts`, { method: "POST" });
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
      ["Forma de pagamento", item.sale.payment_method ?? "—"],
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
      <div>
        <label for="edit-commission_override" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">Comissão específica (%)</label>
        <div class="mt-2">
          <input type="text" inputmode="decimal" id="edit-commission_override" value="${item.commission_pct_override != null ? String(item.commission_pct_override).replace(".", ",") : ""}" placeholder="usa o padrão da fornecedora" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pink-600 disabled:bg-gray-50 disabled:text-gray-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:disabled:bg-white/[0.02] dark:disabled:text-gray-500" />
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
  const commissionInput = parseDecimal(document.getElementById("edit-commission_override").value);
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
    commission_pct_override: commissionInput === "" ? null : Number(commissionInput),
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

// Shared by every /api/reports/* fetch — one date-range/department/owner/supplier
// filter set slices all four reports together, matching the filter bar above them.
function getReportFilterParams() {
  const params = new URLSearchParams();
  const preset = document.getElementById("report-date-preset").value;
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
    const start = document.getElementById("report-start-date").value;
    const end = document.getElementById("report-end-date").value;
    if (start) params.set("start_date", start);
    if (end) params.set("end_date", end);
  }

  const department = document.getElementById("report-department-filter").value;
  const owner = document.getElementById("report-owner-filter").value;
  const supplier = document.getElementById("report-supplier-filter").value;
  if (department) params.set("department", department);
  if (owner) params.set("owner_id", owner);
  if (supplier) params.set("supplier_id", supplier);
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

async function loadReportSummary(params) {
  const summary = await fetch(`/api/reports/summary?${params}`).then((r) => r.json());
  const stats = [
    { label: "Total de vendas", value: String(summary.total_sales) },
    { label: "Receita total", value: currency.format(summary.total_revenue) },
    { label: summary.owner_a_name, value: currency.format(summary.owner_a_earnings) },
    { label: summary.owner_b_name, value: currency.format(summary.owner_b_earnings) },
    { label: "Comissão de fornecedoras", value: currency.format(summary.supplier_commission_total) },
    { label: "Pago a fornecedoras", value: currency.format(summary.supplier_commission_paid) },
    { label: "Ainda a pagar", value: currency.format(summary.supplier_commission_pending) },
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

async function loadReportBySupplier(params) {
  const rows = await fetch(`/api/reports/by-supplier?${params}`).then((r) => r.json());
  document.getElementById("report-supplier-chart").innerHTML = renderHorizontalBarChart(rows, "supplier_name", "total_revenue", (v) =>
    currency.format(v)
  );

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
  await Promise.all([
    loadReportSummary(params),
    loadReportByCategory(params),
    loadReportBySupplier(params),
    loadReportTimeline(params),
  ]);
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
document.getElementById("report-date-preset").addEventListener("change", handleReportDatePresetChange);
document.getElementById("report-start-date").addEventListener("change", loadReports);
document.getElementById("report-end-date").addEventListener("change", loadReports);
document.getElementById("report-department-filter").addEventListener("change", loadReports);
document.getElementById("report-owner-filter").addEventListener("change", loadReports);
document.getElementById("report-supplier-filter").addEventListener("change", loadReports);
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
