const body = document.body;
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const themeToggle = document.getElementById("themeToggle");
const backTop = document.getElementById("backTop");
const siteSearch = document.getElementById("siteSearch");
const searchResults = document.getElementById("searchResults");

const savedTheme = localStorage.getItem("printpedia-theme");
if (savedTheme) body.dataset.theme = savedTheme;

themeToggle?.addEventListener("click", () => {
  body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("printpedia-theme", body.dataset.theme);
});

menuToggle?.addEventListener("click", () => {
  mobileNav?.classList.toggle("is-open");
});

document.querySelectorAll(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => mobileNav?.classList.remove("is-open"));
});

document.querySelectorAll(".desktop-nav").forEach((nav) => {
  const current = location.pathname.split("/").pop() || "index.html";
  const groups = [
    { label: "Inicio", href: "index.html" },
    {
      label: "Básico",
      items: [
        ["Aprende desde cero", "aprender.html"],
        ["Impresoras FDM", "fdm.html"],
        ["Materiales", "materiales.html"],
        ["Resina", "resina.html"],
        ["Mi primera pieza", "aprender.html#flujo-completo"]
      ]
    },
    {
      label: "Diseño y tests",
      items: [
        ["Diseño 3D", "diseno.html"],
        ["Slicers", "slicers.html"],
        ["Tests de impresora", "tests.html"]
      ]
    },
    {
      label: "Resolver",
      items: [
        ["Problemas", "problemas.html"],
        ["Mantenimiento", "mantenimiento.html"],
        ["Seguridad", "seguridad.html"]
      ]
    },
    {
      label: "Recursos",
      items: [
        ["Herramientas", "herramientas.html"],
        ["Guías", "guias.html"],
        ["Calculadoras", "calculadoras.html"],
        ["Glosario", "glosario.html"],
        ["Secado de filamento", "secado-filamento.html"]
      ]
    }
  ];

  nav.innerHTML = "";

  groups.forEach((group) => {
    if (group.href) {
      const link = document.createElement("a");
      link.href = group.href;
      link.textContent = group.label;
      link.classList.toggle("active", current === group.href);
      nav.appendChild(link);
      return;
    }

    const details = document.createElement("details");
    details.className = "nav-group-menu";
    if (group.items.some(([, href]) => href === current)) details.classList.add("active");

    const summary = document.createElement("summary");
    summary.textContent = group.label;

    const menu = document.createElement("div");
    menu.className = "nav-group-panel";

    group.items.forEach(([label, href]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      link.classList.toggle("active", current === href);
      menu.appendChild(link);
    });

    details.append(summary, menu);
    nav.appendChild(details);

    document.addEventListener("click", (event) => {
      if (!details.contains(event.target)) details.removeAttribute("open");
    });
  });
});

const onScroll = () => {
  const scrolled = window.scrollY > 30;
  header?.classList.toggle("is-scrolled", scrolled);
  backTop?.classList.toggle("is-visible", window.scrollY > 700);
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll(".first-piece-scroll").forEach((section) => {
  const steps = [...section.querySelectorAll(".piece-step")];
  if (!steps.length) return;

  const setPieceStage = (activeStep) => {
    const index = Number(activeStep.dataset.pieceStep || 0);
    section.dataset.pieceStage = String(index);
    section.style.setProperty("--piece-stage", index);
    section.style.setProperty("--piece-progress", `${((index + 1) / steps.length) * 100}%`);
    steps.forEach((step) => step.classList.toggle("is-active", step === activeStep));
  };

  setPieceStage(steps[0]);

  if (prefersReducedMotion) return;

  const pieceObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setPieceStage(visible.target);
    },
    { threshold: [0.25, 0.45, 0.65], rootMargin: "-18% 0px -28% 0px" }
  );

  steps.forEach((step) => pieceObserver.observe(step));
});

document.querySelectorAll('[data-filter-group="materials"] .chip').forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter-group="materials"] .chip').forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".material-card").forEach((card) => {
      const types = card.dataset.type || "";
      card.classList.toggle("is-hidden", filter !== "all" && !types.includes(filter));
    });
  });
});

function bindFilterGroup(groupName, itemSelector) {
  document.querySelectorAll(`[data-filter-group="${groupName}"] .chip`).forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll(`[data-filter-group="${groupName}"] .chip`).forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      document.querySelectorAll(itemSelector).forEach((item) => {
        const types = item.dataset.type || "";
        item.classList.toggle("is-hidden", filter !== "all" && !types.includes(filter));
      });
    });
  });
}

bindFilterGroup("problems", ".problem-card");
bindFilterGroup("guides", ".guide-card");
bindFilterGroup("glossary", ".glossary-item");

const siteIndex = [
  ["Inicio", "index.html", "Portada, rutas, diagnóstico rápido y recursos destacados."],
  ["Aprende", "aprender.html", "Mi primera pieza, flujo de trabajo, tecnologías, Benchy y primera impresión."],
  ["FDM", "fdm.html", "Impresoras FDM, anatomía, hotend, extrusor, cama, movimiento y electrónica."],
  ["Materiales", "materiales.html", "PLA, PETG, ABS, ASA, TPU, nylon, PC, resinas y abrasivos."],
  ["Secado", "secado-filamento.html", "Humedad, stringing, burbujas, secador, dry box y almacenamiento."],
  ["Tests de impresora", "tests.html", "Velocidad, color, flujo volumétrico, temperatura, retracción, tolerancias, Benchy, PA e input shaping."],
  ["Problemas", "problemas.html", "Warping, stringing, heat creep, layer shifting, blobs y diagnóstico."],
  ["Mantenimiento", "mantenimiento.html", "Limpieza, cama, hotend, boquilla, PTFE, correas, lubricación y firmware."],
  ["Slicers", "slicers.html", "Cura, PrusaSlicer, OrcaSlicer, Bambu Studio, Lychee, Chitubox y perfiles."],
  ["Resina", "resina.html", "SLA, MSLA, DLP, seguridad, VAT, FEP, lavado, curado y soportes."],
  ["Diseño", "diseno.html", "Tolerancias, orientación, anisotropía, inserts, snap fits y resistencia."],
  ["Seguridad", "seguridad.html", "Riesgos térmicos, eléctricos, humos, resina, filtros y checklists."],
  ["Herramientas", "herramientas.html", "Kit básico, avanzado, resina, repuestos, secador y protección."],
  ["Calculadoras", "calculadoras.html", "Costes, gramos, metros, venta, velocidad volumétrica, E-steps y amortización."],
  ["Glosario", "glosario.html", "Términos FDM, resina, slicer, firmware, materiales y problemas."],
  ["Guías", "guias.html", "Recetas prácticas para comprar, imprimir, calibrar y resolver fallos."]
];

siteSearch?.addEventListener("input", () => {
  const query = siteSearch.value.trim().toLowerCase();
  if (!searchResults) return;
  if (!query) {
    searchResults.classList.remove("is-open");
    searchResults.innerHTML = "";
    return;
  }
  const matches = siteIndex.filter((item) => item.join(" ").toLowerCase().includes(query)).slice(0, 7);
  searchResults.innerHTML = matches.length
    ? matches.map(([title, href, desc]) => `<a href="${href}"><strong>${title}</strong>${desc}</a>`).join("")
    : `<a href="glosario.html"><strong>Sin coincidencias exactas</strong>Prueba en el glosario completo.</a>`;
  searchResults.classList.add("is-open");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".global-search") && !event.target.closest(".search-results")) {
    searchResults?.classList.remove("is-open");
  }
});

const diagnosis = [
  {
    title: "La pieza se despega",
    short: "Warping o mala adhesión",
    probable: "Cama sucia, Z-offset alto, temperatura de cama baja o corrientes de aire.",
    quick: "Lava la cama, ajusta Z-offset, añade brim y sube ligeramente la cama.",
    advanced: "Usa cámara, adhesivo adecuado, superficie correcta y reduce ventilación inicial."
  },
  {
    title: "Salen hilos",
    short: "Stringing",
    probable: "Filamento húmedo, temperatura alta o retracción mal ajustada.",
    quick: "Baja 5-10 °C y seca el filamento.",
    advanced: "Haz torre de retracción, ajusta velocidad de viaje y revisa pressure advance."
  },
  {
    title: "No sale filamento",
    short: "Atasco o extrusor saltando",
    probable: "Boquilla obstruida, PTFE dañado, temperatura baja o engranaje lleno de polvo.",
    quick: "Sube temperatura, limpia boquilla y revisa que el extrusor empuje.",
    advanced: "Cold pull, cambio de boquilla, revisión de PTFE y calibración de tensión."
  },
  {
    title: "Primera capa mal",
    short: "Z-offset o nivelación",
    probable: "Cama desnivelada, offset incorrecto o superficie contaminada.",
    quick: "Repite nivelación y ajusta el Z en vivo.",
    advanced: "Malla de cama, compensación térmica y prueba de primera capa completa."
  },
  {
    title: "Capas se mueven",
    short: "Layer shifting",
    probable: "Correas flojas, poleas sueltas, aceleración alta o golpes mecánicos.",
    quick: "Baja velocidad y revisa tensión de correas.",
    advanced: "Aprieta poleas, revisa roces, corriente de motores e input shaping."
  },
  {
    title: "Pieza débil",
    short: "Mala adhesión entre capas",
    probable: "Temperatura baja, ventilador alto, pocas paredes o mala orientación.",
    quick: "Sube temperatura y aumenta paredes.",
    advanced: "Rediseña orientación de capas y usa material más adecuado."
  },
  {
    title: "Marcas en superficie",
    short: "Ghosting, blobs o costura",
    probable: "Vibración, presión mal compensada, humedad o costura visible.",
    quick: "Baja aceleración y seca filamento.",
    advanced: "Configura input shaping, pressure advance y posición de costura."
  },
  {
    title: "Soportes muy pegados",
    short: "Interfaz demasiado agresiva",
    probable: "Distancia Z baja, densidad alta o patrón inadecuado.",
    quick: "Aumenta distancia Z de soporte.",
    advanced: "Usa soportes árbol, interfaz controlada o material soluble."
  },
  {
    title: "Boquilla hace clics",
    short: "Presión excesiva",
    probable: "Atasco parcial, velocidad alta, temperatura baja o retracción excesiva.",
    quick: "Sube temperatura y baja velocidad.",
    advanced: "Limpia hotend, revisa extrusor y calibra flujo."
  },
  {
    title: "Burbujas o vapor",
    short: "Filamento húmedo",
    probable: "El material absorbió humedad, especialmente PETG, TPU, nylon o PC.",
    quick: "Seca la bobina.",
    advanced: "Guarda en caja hermética con desecante e imprime desde drybox."
  },
  {
    title: "Esquinas levantadas",
    short: "Contracción térmica",
    probable: "Material técnico, cama fría o ventilación excesiva.",
    quick: "Añade brim y reduce ventilador.",
    advanced: "Cámara cerrada, ASA/ABS bien ventilado y control térmico."
  },
  {
    title: "La pieza no encaja",
    short: "Tolerancias o flujo",
    probable: "Agujeros pequeños, sobreextrusión o contracción del material.",
    quick: "Añade holgura de 0.2-0.4 mm.",
    advanced: "Calibra flujo, expansion horizontal y crea test de tolerancias."
  }
];

const diagnosisGrid = document.getElementById("diagnosisGrid");
const diagnosisResult = document.getElementById("diagnosisResult");

if (diagnosisGrid) {
  diagnosis.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "diagnosis-card";
    button.type = "button";
    button.innerHTML = `<strong>${item.title}</strong><span>${item.short}</span>`;
    button.addEventListener("click", () => {
      document.querySelectorAll(".diagnosis-card").forEach((card) => card.classList.remove("active"));
      button.classList.add("active");
      if (diagnosisResult) {
        diagnosisResult.innerHTML = `
          <strong>${item.short}</strong>
          <p><b>Problema probable:</b> ${item.probable}</p>
          <p><b>Solución rápida:</b> ${item.quick}</p>
          <p><b>Solución avanzada:</b> ${item.advanced}</p>
        `;
      }
    });
    diagnosisGrid.appendChild(button);
    if (index === 0) button.click();
  });
}

const numberValue = (id) => Number(document.getElementById(id)?.value || 0);
const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.innerHTML = value;
};

function updateCalculators() {
  const gramsUsed = numberValue("gramsUsed");
  const spoolPrice = numberValue("spoolPrice");
  const spoolWeight = numberValue("spoolWeight");
  const printHours = numberValue("printHours");
  const powerKw = numberValue("powerKw");
  const kwhPrice = numberValue("kwhPrice");
  const materialCost = spoolWeight > 0 ? (gramsUsed / spoolWeight) * spoolPrice : 0;
  const electricCost = printHours * powerKw * kwhPrice;
  setText(
    "costResult",
    `Material: €${materialCost.toFixed(2)}<br />Electricidad: €${electricCost.toFixed(2)}<br />Total estimado: €${(materialCost + electricCost).toFixed(2)}`
  );

  const grams = numberValue("gmGrams");
  const diameter = numberValue("gmDiameter");
  const density = numberValue("gmDensity");
  const area = Math.PI * Math.pow(diameter / 2, 2);
  const volumeMm3 = density > 0 ? (grams / density) * 1000 : 0;
  const meters = area > 0 ? volumeMm3 / area / 1000 : 0;
  setText("gramsMetersResult", `${grams.toFixed(1)} g ≈ ${meters.toFixed(1)} m`);

  const metersValue = numberValue("metersValue");
  const metersDiameter = numberValue("metersDiameter");
  const metersDensity = numberValue("metersDensity");
  const metersArea = Math.PI * Math.pow(metersDiameter / 2, 2);
  const gramsFromMeters = metersValue * 1000 * metersArea * metersDensity / 1000;
  setText("metersGramsResult", `${metersValue.toFixed(1)} m ≈ ${gramsFromMeters.toFixed(1)} g`);

  const baseSale = numberValue("saleCost") + numberValue("saleHours") * numberValue("saleRate");
  const salePrice = baseSale * (1 + numberValue("saleMargin") / 100);
  setText("saleResult", `Precio recomendado: €${salePrice.toFixed(2)}`);

  const volumetric = numberValue("lineWidth") * numberValue("layerHeight") * numberValue("printSpeed");
  setText("volumetricResult", `${volumetric.toFixed(2)} mm³/s`);

  const requested = numberValue("estepsRequested");
  const actual = numberValue("estepsActual");
  const newEsteps = actual > 0 ? numberValue("estepsCurrent") * (requested / actual) : 0;
  setText("estepsResult", `Nuevo valor: ${newEsteps.toFixed(2)} E-steps/mm`);

  const remaining = Math.max(numberValue("spoolCurrent") - numberValue("emptySpool"), 0);
  const pieces = numberValue("pieceWeight") > 0 ? remaining / numberValue("pieceWeight") : 0;
  setText("spoolResult", `${remaining.toFixed(0)} g restantes · ${Math.floor(pieces)} piezas aprox.`);

  const hourlyMachine = numberValue("printerHours") > 0 ? numberValue("printerCost") / numberValue("printerHours") : 0;
  const machinePiece = hourlyMachine * numberValue("machinePieceHours");
  setText("machineResult", `Coste máquina: €${hourlyMachine.toFixed(2)}/h · Pieza: €${machinePiece.toFixed(2)}`);
}

document.querySelectorAll(".calc-card input").forEach((input) => input.addEventListener("input", updateCalculators));
document.querySelectorAll(".calc-run").forEach((button) => button.addEventListener("click", updateCalculators));
document.querySelectorAll(".calc-clear").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest(".calc-card");
    form?.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
    updateCalculators();
  });
});
updateCalculators();

const glossaryTerms = [
  ["FDM", "Fabricación por deposición de material fundido capa a capa."],
  ["FFF", "Nombre abierto equivalente a FDM."],
  ["SLA", "Resina curada con láser o luz capa a capa."],
  ["MSLA", "Resina curada mediante pantalla LCD y matriz LED."],
  ["DLP", "Resina curada por proyección de luz."],
  ["STL", "Formato de malla 3D muy usado."],
  ["3MF", "Formato moderno que guarda más información que STL."],
  ["G-code", "Instrucciones que ejecuta la impresora."],
  ["Slicer", "Programa que convierte un modelo en G-code."],
  ["Hotend", "Conjunto que funde el filamento."],
  ["Extrusor", "Sistema que empuja el filamento."],
  ["Bowden", "Extrusor separado del hotend por tubo PTFE."],
  ["Direct drive", "Extrusor montado cerca del hotend."],
  ["Nozzle", "Boquilla por donde sale el plástico fundido."],
  ["PEI", "Superficie de impresión con buena adhesión."],
  ["Z-offset", "Distancia entre boquilla y cama en primera capa."],
  ["Retraction", "Retirada de filamento para reducir hilos."],
  ["Flow", "Porcentaje de material extruido."],
  ["E-steps", "Pasos del motor para extruir una longitud concreta."],
  ["Infill", "Relleno interior de la pieza."],
  ["Perimeters", "Paredes exteriores de la pieza."],
  ["Brim", "Ala de adhesión alrededor de la pieza."],
  ["Skirt", "Línea previa para purgar filamento."],
  ["Raft", "Base completa bajo la pieza."],
  ["Support", "Estructura temporal para voladizos."],
  ["Warping", "Levantamiento por contracción térmica."],
  ["Stringing", "Hilos finos entre movimientos."],
  ["Ghosting", "Ondas por vibración tras esquinas."],
  ["Ringing", "Patrón de vibración en la superficie."],
  ["Layer shifting", "Desplazamiento de capas."],
  ["Heat creep", "Calor subiendo por el disipador y ablandando filamento."],
  ["PID", "Control de temperatura del hotend o cama."],
  ["Pressure advance", "Compensación de presión en extrusión."],
  ["Input shaping", "Compensación de resonancias."],
  ["Klipper", "Firmware avanzado orientado a rendimiento."],
  ["Marlin", "Firmware clásico y muy extendido."],
  ["FEP", "Lámina transparente del tanque de resina."],
  ["VAT", "Tanque donde se coloca la resina."],
  ["Cure", "Curado UV de piezas de resina."],
  ["Wash", "Lavado de piezas de resina antes del curado."]
];

const glossaryGrid = document.getElementById("glossaryGrid");
const glossarySearch = document.getElementById("glossarySearch");

if (glossaryGrid && glossaryGrid.children.length === 0) {
  glossaryTerms.forEach(([term, definition]) => {
    const item = document.createElement("article");
    item.className = "glossary-item";
    item.dataset.search = `${term} ${definition}`.toLowerCase();
    item.innerHTML = `<strong>${term}</strong><span>${definition}</span>`;
    glossaryGrid.appendChild(item);
  });
}

glossarySearch?.addEventListener("input", () => {
  const query = glossarySearch.value.trim().toLowerCase();
  document.querySelectorAll(".glossary-item").forEach((item) => {
    item.classList.toggle("is-hidden", query !== "" && !item.dataset.search.includes(query));
  });
});

const problemSearch = document.getElementById("problemSearch");
problemSearch?.addEventListener("input", () => {
  const query = problemSearch.value.trim().toLowerCase();
  document.querySelectorAll(".problem-card").forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle("is-hidden", query !== "" && !text.includes(query));
  });
});

document.querySelectorAll(".copy-checklist").forEach((button) => {
  button.addEventListener("click", async () => {
    const card = button.closest(".checklist-copy");
    const title = card?.querySelector("h3")?.textContent || "Checklist";
    const items = [...(card?.querySelectorAll("label") || [])].map((label) => `- ${label.textContent.trim()}`);
    await navigator.clipboard?.writeText(`${title}\n${items.join("\n")}`);
    button.textContent = "Copiado";
    setTimeout(() => {
      button.textContent = "Copiar checklist";
    }, 1400);
  });
});

document.querySelectorAll(".copy-section").forEach((button) => {
  button.addEventListener("click", async () => {
    const section = button.closest(".content-section");
    const heading = section?.querySelector("h2[id]");
    if (!heading) return;
    const url = `${location.origin}${location.pathname}#${heading.id}`;
    await navigator.clipboard?.writeText(url);
    button.textContent = "✓";
    setTimeout(() => {
      button.textContent = "#";
    }, 1200);
  });
});
