const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");
const heroSearch = document.getElementById("heroSearch");
const tableOfContents = document.getElementById("tableOfContents");
const article = document.getElementById("mantenimiento-fdm");
const sidebar = document.getElementById("sidebar");
const openSidebar = document.getElementById("openSidebar");
const closeSidebar = document.getElementById("closeSidebar");
const navGroups = document.querySelectorAll("[data-group]");
const searchableItems = document.querySelectorAll(".sidebar a, .nav-card, .mini-panel");
const diagnosisButtons = document.querySelectorAll(".diagnosis-option");
const diagnosisResult = document.getElementById("diagnosisResult");

const savedTheme = localStorage.getItem("nexolayers-theme");
if (savedTheme) {
  body.dataset.theme = savedTheme;
  syncThemeLabel();
}

themeToggle.addEventListener("click", () => {
  body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("nexolayers-theme", body.dataset.theme);
  syncThemeLabel();
});

function syncThemeLabel() {
  themeToggle.textContent = body.dataset.theme === "dark" ? "Modo claro" : "Modo oscuro";
}

navGroups.forEach((group) => {
  const button = group.querySelector(".nav-group-toggle");
  if (button.getAttribute("aria-expanded") === "false") {
    group.classList.add("is-collapsed");
  }

  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    group.classList.toggle("is-collapsed", isExpanded);
  });
});

function buildToc() {
  const headings = article.querySelectorAll("section h2, section h3");
  const links = [];

  headings.forEach((heading) => {
    const section = heading.closest("section");
    if (!section?.id) return;

    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = heading.textContent;
    link.className = heading.tagName === "H3" ? "toc-h3" : "toc-h2";
    tableOfContents.appendChild(link);
    links.push({ link, section, level: heading.tagName });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const active = links.find((item) => item.section === entry.target);
        if (!active) return;
        if (entry.isIntersecting) {
          links.forEach((item) => item.link.classList.remove("is-active"));
          active.link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: 0.1 }
  );

  const uniqueSections = [...new Set(links.map((item) => item.section))];
  uniqueSections.forEach((section) => observer.observe(section));
}

buildToc();

function applySearch(query) {
  const term = query.trim().toLowerCase();

  searchableItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle("search-match-hidden", term !== "" && !text.includes(term));
  });

  navGroups.forEach((group) => {
    const matches = [...group.querySelectorAll("a")].some(
      (link) => !link.classList.contains("search-match-hidden")
    );
    group.classList.toggle("search-match-hidden", term !== "" && !matches);
  });
}

function bindSharedSearch(source, mirror) {
  source.addEventListener("input", (event) => {
    const { value } = event.target;
    mirror.value = value;
    applySearch(value);
  });
}

bindSharedSearch(searchInput, heroSearch);
bindSharedSearch(heroSearch, searchInput);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

openSidebar?.addEventListener("click", () => {
  sidebar.classList.add("is-open");
});

closeSidebar?.addEventListener("click", () => {
  sidebar.classList.remove("is-open");
});

document.querySelectorAll('.sidebar a, .nav-card, .pager-link').forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
  });
});

document.querySelectorAll(".feedback-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".feedback-button").forEach((item) => item.classList.remove("is-current"));
    button.classList.add("is-current");
    button.textContent = button.textContent === "Si" ? "Gracias por tu feedback" : "Tomamos nota";
  });
});

const calculatorBindings = [
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

function valueOf(id) {
  return Number(document.getElementById(id)?.value || 0);
}

function updateCalculators() {
  const costWeight = valueOf("costWeight");
  const costSpoolPrice = valueOf("costSpoolPrice");
  const costSpoolWeight = valueOf("costSpoolWeight");
  const costPower = valueOf("costPower");
  const materialCost = costSpoolWeight > 0 ? (costWeight / costSpoolWeight) * costSpoolPrice : 0;
  document.getElementById("costResult").textContent = `€${(materialCost + costPower).toFixed(2)}`;

  const filamentMass = valueOf("filamentVolume") * valueOf("filamentDensity");
  document.getElementById("filamentResult").textContent = `${filamentMass.toFixed(1)} g`;

  const timeSecondsBase = valueOf("timeFlow") > 0 ? valueOf("timeVolume") / valueOf("timeFlow") : 0;
  const timeSeconds = timeSecondsBase * (1 + valueOf("timeOverhead") / 100);
  const hours = Math.floor(timeSeconds / 3600);
  const minutes = Math.round((timeSeconds % 3600) / 60);
  document.getElementById("timeResult").textContent = `${hours} h ${minutes} min`;

  const diameter = valueOf("gramsDiameter");
  const density = valueOf("gramsDensity");
  const grams = valueOf("gramsValue");
  const area = Math.PI * Math.pow(diameter / 2, 2);
  const volumeMm3 = density > 0 ? (grams / density) * 1000 : 0;
  const meters = area > 0 ? volumeMm3 / area / 1000 : 0;
  document.getElementById("gramsResult").textContent = `${meters.toFixed(1)} m`;

  const shrinkCompensation = valueOf("shrinkDimension") * (1 + valueOf("shrinkMaterial"));
  document.getElementById("shrinkResult").textContent = `${shrinkCompensation.toFixed(2)} mm`;

  const linearSpeed = valueOf("flowWidth") * valueOf("flowHeight");
  const maxSpeed = linearSpeed > 0 ? valueOf("flowMax") / linearSpeed : 0;
  document.getElementById("flowResult").textContent = `${maxSpeed.toFixed(1)} mm/s`;
}

calculatorBindings.forEach((id) => {
  document.getElementById(id)?.addEventListener("input", updateCalculators);
});

updateCalculators();

const diagnosisMap = {
  despega:
    "Empieza por superficie, temperatura de cama, Z-offset y limpieza. Si solo fallan esquinas grandes, revisa warping, corrientes de aire y adhesion segun material.",
  hilos:
    "Revisa secado del filamento, temperatura de nozzle, retraccion y movimientos de viaje. En PETG y TPU, el filamento humedo es una causa muy frecuente.",
  capas:
    "Inspecciona tension de correas, fijacion de poleas, rozamientos en ejes y aceleraciones excesivas. Si ocurre en una altura concreta, busca obstaculos mecanicos.",
  debil:
    "Comprueba flujo real, temperatura insuficiente, ventilacion excesiva entre capas y numero de perimetros. Tambien revisa humedad del material y orientacion de la pieza.",
  "no-extruye":
    "Mira boquilla obstruida, engranaje del extrusor, PTFE deformado, temperatura real y estado del filamento. Si el motor salta pasos, no fuerces la extrusion.",
  "primera-capa":
    "La ruta corta es limpiar cama, recalibrar Z-offset, confirmar nivelacion y observar el ancho de linea real. No cambies varios parametros a la vez."
};

diagnosisButtons.forEach((button) => {
  button.addEventListener("click", () => {
    diagnosisButtons.forEach((item) => item.classList.remove("is-current"));
    button.classList.add("is-current");
    diagnosisResult.textContent = diagnosisMap[button.dataset.diagnosis] || "Problema no reconocido.";
  });
});
