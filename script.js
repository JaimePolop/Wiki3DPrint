const body = document.body;
const sidebar = document.getElementById("sidebar");
const themeToggle = document.getElementById("themeToggle");
const openSidebar = document.getElementById("openSidebar");
const closeSidebar = document.getElementById("closeSidebar");
const searchInputs = document.querySelectorAll("[data-search-input]");
const navGroups = document.querySelectorAll("[data-group]");
const searchableItems = document.querySelectorAll("[data-searchable]");
const tableOfContents = document.getElementById("tableOfContents");
const docRoot = document.querySelector("[data-doc]");
const feedbackButtons = document.querySelectorAll(".feedback-button");
const diagnosisButtons = document.querySelectorAll(".diagnosis-option");
const diagnosisResult = document.getElementById("diagnosisResult");

const savedTheme = localStorage.getItem("wiki3dprint-theme");
if (savedTheme) {
  body.dataset.theme = savedTheme;
}
syncThemeLabel();

themeToggle?.addEventListener("click", () => {
  body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("wiki3dprint-theme", body.dataset.theme);
  syncThemeLabel();
});

function syncThemeLabel() {
  if (!themeToggle) return;
  themeToggle.textContent = body.dataset.theme === "dark" ? "Modo claro" : "Modo oscuro";
}

navGroups.forEach((group) => {
  const button = group.querySelector(".nav-group-toggle");
  if (!button) return;

  if (button.getAttribute("aria-expanded") === "false") {
    group.classList.add("is-collapsed");
  }

  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    group.classList.toggle("is-collapsed", isExpanded);
  });
});

function applySearch(query) {
  const term = query.trim().toLowerCase();

  searchableItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle("search-match-hidden", term !== "" && !text.includes(term));
  });

  navGroups.forEach((group) => {
    const visibleLink = [...group.querySelectorAll("[data-searchable]")].some(
      (link) => !link.classList.contains("search-match-hidden")
    );
    group.classList.toggle("search-match-hidden", term !== "" && !visibleLink);
  });
}

searchInputs.forEach((input) => {
  input.addEventListener("input", (event) => {
    const value = event.target.value;
    searchInputs.forEach((other) => {
      if (other !== input) other.value = value;
    });
    applySearch(value);
  });
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const primarySearch = document.querySelector("[data-search-input]");
    primarySearch?.focus();
  }
});

openSidebar?.addEventListener("click", () => {
  sidebar?.classList.add("is-open");
});

closeSidebar?.addEventListener("click", () => {
  sidebar?.classList.remove("is-open");
});

document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    sidebar?.classList.remove("is-open");
  });
});

function buildToc() {
  if (!tableOfContents || !docRoot) return;

  const headings = docRoot.querySelectorAll("section h2, section h3");
  const links = [];

  headings.forEach((heading) => {
    const section = heading.closest("section");
    if (!section?.id) return;

    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = heading.textContent;
    link.className = heading.tagName === "H3" ? "toc-h3" : "toc-h2";
    tableOfContents.appendChild(link);
    links.push({ link, section });
  });

  const seenSections = [...new Set(links.map((item) => item.section))];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = links.find((item) => item.section === entry.target);
        if (!match) return;
        links.forEach((item) => item.link.classList.remove("is-active"));
        match.link.classList.add("is-active");
      });
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: 0.1 }
  );

  seenSections.forEach((section) => observer.observe(section));
}

buildToc();

feedbackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    feedbackButtons.forEach((item) => item.classList.remove("is-current"));
    button.classList.add("is-current");
  });
});

function bindCalculators() {
  const calculatorIds = [
    "costWeight",
    "costSpoolPrice",
    "costSpoolWeight",
    "costPower",
    "filamentVolume",
    "filamentDensity",
    "timeVolume",
    "timeFlow",
    "timeOverhead",
    "gramsValue",
    "gramsDiameter",
    "gramsDensity",
    "shrinkMaterial",
    "shrinkDimension",
    "flowWidth",
    "flowHeight",
    "flowMax",
  ];

  const hasAnyCalculator = calculatorIds.some((id) => document.getElementById(id));
  if (!hasAnyCalculator) return;

  const get = (id) => Number(document.getElementById(id)?.value || 0);

  const update = () => {
    const spoolWeight = get("costSpoolWeight");
    const materialCost = spoolWeight > 0 ? (get("costWeight") / spoolWeight) * get("costSpoolPrice") : 0;
    const totalCost = materialCost + get("costPower");
    const costResult = document.getElementById("costResult");
    if (costResult) costResult.textContent = `€${totalCost.toFixed(2)}`;

    const filamentResult = document.getElementById("filamentResult");
    if (filamentResult) filamentResult.textContent = `${(get("filamentVolume") * get("filamentDensity")).toFixed(1)} g`;

    const flow = get("timeFlow");
    const baseSeconds = flow > 0 ? get("timeVolume") / flow : 0;
    const withOverhead = baseSeconds * (1 + get("timeOverhead") / 100);
    const hours = Math.floor(withOverhead / 3600);
    const minutes = Math.round((withOverhead % 3600) / 60);
    const timeResult = document.getElementById("timeResult");
    if (timeResult) timeResult.textContent = `${hours} h ${minutes} min`;

    const diameter = get("gramsDiameter");
    const density = get("gramsDensity");
    const area = Math.PI * Math.pow(diameter / 2, 2);
    const volumeMm3 = density > 0 ? (get("gramsValue") / density) * 1000 : 0;
    const meters = area > 0 ? volumeMm3 / area / 1000 : 0;
    const gramsResult = document.getElementById("gramsResult");
    if (gramsResult) gramsResult.textContent = `${meters.toFixed(1)} m`;

    const shrinkResult = document.getElementById("shrinkResult");
    if (shrinkResult) shrinkResult.textContent = `${(get("shrinkDimension") * (1 + get("shrinkMaterial"))).toFixed(2)} mm`;

    const sectionArea = get("flowWidth") * get("flowHeight");
    const maxSpeed = sectionArea > 0 ? get("flowMax") / sectionArea : 0;
    const flowResult = document.getElementById("flowResult");
    if (flowResult) flowResult.textContent = `${maxSpeed.toFixed(1)} mm/s`;
  };

  calculatorIds.forEach((id) => {
    document.getElementById(id)?.addEventListener("input", update);
  });

  update();
}

bindCalculators();

const diagnosisMap = {
  despega:
    "Empieza por cama, Z-offset, limpieza y corrientes de aire. Si se levantan solo las esquinas, la prioridad es warping, no la extrusión.",
  hilos:
    "Revisa secado del filamento, temperatura de boquilla y retracción. En PETG o TPU, un filamento húmedo suele ser más importante que la retracción pura.",
  capas:
    "Inspecciona correas, poleas, ruedas, aceleraciones y roces mecánicos. Si el salto ocurre siempre a la misma altura, busca interferencias físicas.",
  debil:
    "Comprueba temperatura insuficiente, poco flujo, ventilación excesiva, baja densidad de pared y mala orientación de la pieza.",
  "no-extruye":
    "Prioridad: nozzle atascado, engranaje del extrusor, PTFE deformado, temperatura real y estado del filamento antes de tocar el slicer.",
  "primera-capa":
    "La ruta corta es limpiar la superficie, verificar nivelación, corregir Z-offset y observar el patrón de línea durante los primeros minutos."
};

diagnosisButtons.forEach((button) => {
  button.addEventListener("click", () => {
    diagnosisButtons.forEach((item) => item.classList.remove("is-current"));
    button.classList.add("is-current");
    if (diagnosisResult) {
      diagnosisResult.textContent = diagnosisMap[button.dataset.diagnosis] || "Problema no reconocido.";
    }
  });
});
