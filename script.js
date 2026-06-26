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

document.querySelectorAll(".desktop-nav, .mobile-nav").forEach((nav) => {
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
        ["Rellenos y paredes", "rellenos.html"],
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

document.querySelectorAll(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => mobileNav?.classList.remove("is-open"));
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

document.querySelectorAll("[data-flow-story]").forEach((section) => {
  const copies = [...section.querySelectorAll("[data-flow-copy]")];
  const dots = [...section.querySelectorAll("[data-flow-jump]")];
  const current = section.querySelector("[data-flow-current]");
  const canvas = section.querySelector("[data-print-canvas]");
  const ctx = canvas?.getContext("2d");
  const status = section.querySelector("[data-flow-status]");
  const hud = {
    material: section.querySelector('[data-flow-hud="material"]'),
    nozzle: section.querySelector('[data-flow-hud="nozzle"]'),
    layer: section.querySelector('[data-flow-hud="layer"]'),
    hotend: section.querySelector('[data-flow-hud="hotend"]'),
    bed: section.querySelector('[data-flow-hud="bed"]'),
    speed: section.querySelector('[data-flow-hud="speed"]'),
    fan: section.querySelector('[data-flow-hud="fan"]'),
    progress: section.querySelector('[data-flow-hud="progress"]')
  };
  const hudValues = [
    { material: "Archivo", nozzle: "STL/3MF", layer: "Wireframe", hotend: "24 °C", bed: "24 °C", speed: "0 mm/s", fan: "0%", progress: "0%", status: "Model check" },
    { material: "PLA", nozzle: "0.4 mm", layer: "0.20 mm", hotend: "24 °C", bed: "24 °C", speed: "Preview", fan: "0%", progress: "18%", status: "Slicing preview" },
    { material: "PLA", nozzle: "0.4 mm", layer: "0 / 186", hotend: "210 °C", bed: "60 °C", speed: "Homing", fan: "0%", progress: "32%", status: "Heating + homing" },
    { material: "PLA", nozzle: "0.4 mm", layer: "1 / 186", hotend: "210 °C", bed: "60 °C", speed: "25 mm/s", fan: "35%", progress: "48%", status: "First layer OK" },
    { material: "PLA", nozzle: "0.4 mm", layer: "78 / 186", hotend: "210 °C", bed: "60 °C", speed: "80 mm/s", fan: "100%", progress: "76%", status: "Printing..." },
    { material: "PLA", nozzle: "0.4 mm", layer: "186 / 186", hotend: "Cooling", bed: "38 °C", speed: "0 mm/s", fan: "40%", progress: "100%", status: "Completed" }
  ];
  let activeStep = -1;
  let ticking = false;
  let visualProgress = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  const motionOk = !prefersReducedMotion && window.matchMedia("(min-width: 761px)").matches;

  if (!copies.length) return;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (start, end, amount) => start + ((end - start) * amount);
  const ease = (value) => 1 - Math.pow(1 - clamp(value), 3);
  const localProgress = (progress, start, end) => clamp((progress - start) / (end - start));
  const roundedRect = (context, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  };

  const resizeCanvas = () => {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(320, Math.round(rect.width * dpr));
    const nextHeight = Math.max(320, Math.round(rect.height * dpr));
    if (nextWidth === canvasWidth && nextHeight === canvasHeight) return;
    canvasWidth = nextWidth;
    canvasHeight = nextHeight;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const bedPoint = (u, v, z = 0) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const topLeft = { x: w * 0.26, y: h * 0.58 };
    const topRight = { x: w * 0.76, y: h * 0.58 };
    const bottomLeft = { x: w * 0.16, y: h * 0.84 };
    const bottomRight = { x: w * 0.88, y: h * 0.84 };
    const left = { x: lerp(topLeft.x, bottomLeft.x, v), y: lerp(topLeft.y, bottomLeft.y, v) };
    const right = { x: lerp(topRight.x, bottomRight.x, v), y: lerp(topRight.y, bottomRight.y, v) };
    return { x: lerp(left.x, right.x, u), y: lerp(left.y, right.y, u) - z };
  };

  const makePrintPath = () => {
    const path = [];
    path.push({ type: "travel", u: 0.12, v: 0.12 });
    path.push({ type: "extrude", u: 0.16, v: 0.88, role: "purge" });
    path.push({ type: "travel", u: 0.3, v: 0.28 });
    const perimeter = [
      [0.3, 0.28], [0.72, 0.28], [0.78, 0.48], [0.7, 0.68],
      [0.32, 0.68], [0.24, 0.48], [0.3, 0.28]
    ];
    perimeter.slice(1).forEach(([u, v]) => path.push({ type: "extrude", u, v, role: "perimeter" }));
    for (let row = 0; row < 8; row += 1) {
      const v = 0.34 + row * 0.04;
      path.push({ type: "travel", u: row % 2 ? 0.67 : 0.33, v });
      path.push({ type: "extrude", u: row % 2 ? 0.34 : 0.68, v: v + 0.025, role: "infill" });
    }
    return path;
  };

  const printPath = makePrintPath();

  const drawSegmentedPath = (progress, z, alpha = 1) => {
    if (!ctx) return;
    const total = printPath.length - 1;
    const visible = progress * total;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let index = 1; index < printPath.length; index += 1) {
      const amount = clamp(visible - (index - 1), 0, 1);
      if (amount <= 0 || printPath[index].type !== "extrude") continue;
      const a = bedPoint(printPath[index - 1].u, printPath[index - 1].v, z);
      const b = bedPoint(printPath[index].u, printPath[index].v, z);
      const x = lerp(a.x, b.x, amount);
      const y = lerp(a.y, b.y, amount);
      const role = printPath[index].role;
      ctx.strokeStyle = role === "infill" ? `rgba(82, 220, 255, ${0.45 * alpha})` : `rgba(236, 72, 153, ${0.8 * alpha})`;
      ctx.lineWidth = role === "purge" ? 5 : 7;
      ctx.shadowColor = role === "infill" ? "rgba(56, 189, 248, 0.45)" : "rgba(236, 72, 153, 0.55)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const nozzlePosition = (progress, z) => {
    const total = printPath.length - 1;
    const index = Math.min(printPath.length - 2, Math.floor(progress * total));
    const amount = clamp((progress * total) - index);
    const a = bedPoint(printPath[index].u, printPath[index].v, z);
    const b = bedPoint(printPath[index + 1].u, printPath[index + 1].v, z);
    return { x: lerp(a.x, b.x, amount), y: lerp(a.y, b.y, amount), extruding: printPath[index + 1].type === "extrude" };
  };

  const drawPrinterFrame = (heat = 0, nozzle = null) => {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const p1 = bedPoint(0, 0);
    const p2 = bedPoint(1, 0);
    const p3 = bedPoint(1, 1);
    const p4 = bedPoint(0, 1);

    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.32, 20, w * 0.5, h * 0.48, w * 0.75);
    bg.addColorStop(0, "rgba(56, 189, 248, 0.2)");
    bg.addColorStop(0.55, "rgba(15, 23, 42, 0.05)");
    bg.addColorStop(1, "rgba(2, 6, 23, 0.12)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.32)";
    ctx.lineWidth = 7;
    ctx.shadowColor = "rgba(56, 189, 248, 0.25)";
    ctx.shadowBlur = 18;
    ctx.strokeRect(w * 0.18, h * 0.13, w * 0.64, h * 0.54);
    ctx.beginPath();
    ctx.moveTo(w * 0.22, h * 0.28);
    ctx.lineTo(w * 0.78, h * 0.28);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(15, 23, 42, 0.84)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.34)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.clip();
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.12 + heat * 0.25})`;
    ctx.lineWidth = 1;
    for (let i = 0.1; i < 1; i += 0.1) {
      const a = bedPoint(i, 0);
      const b = bedPoint(i, 1);
      const c = bedPoint(0, i);
      const d = bedPoint(1, i);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
    ctx.restore();

    if (heat > 0) {
      const glow = ctx.createRadialGradient(w * 0.52, h * 0.72, 10, w * 0.52, h * 0.72, w * 0.38);
      glow.addColorStop(0, `rgba(249, 115, 22, ${0.2 * heat})`);
      glow.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    const head = nozzle || { x: w * 0.5, y: h * 0.42 };
    ctx.save();
    ctx.strokeStyle = "rgba(96, 165, 250, 0.72)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, head.y - h * 0.16);
    ctx.lineTo(w * 0.8, head.y - h * 0.16);
    ctx.stroke();
    ctx.fillStyle = "rgba(236, 72, 153, 0.75)";
    ctx.beginPath();
    ctx.arc(w * 0.14, h * 0.2, 34, 0, Math.PI * 2);
    ctx.arc(w * 0.14, h * 0.2, 14, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
    ctx.strokeStyle = "rgba(236, 72, 153, 0.42)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.17, h * 0.22);
    ctx.quadraticCurveTo(w * 0.32, h * 0.2, head.x - 18, head.y - 55);
    ctx.stroke();
    ctx.restore();
  };

  const drawNozzle = (point, heat = 1) => {
    if (!ctx) return;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.38)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(2, 6, 23, 0.35)";
    ctx.beginPath();
    ctx.ellipse(point.x + 10, point.y + 42, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    const body = ctx.createLinearGradient(point.x - 42, point.y - 86, point.x + 42, point.y - 18);
    body.addColorStop(0, "#38bdf8");
    body.addColorStop(1, "#8b5cf6");
    ctx.fillStyle = body;
    ctx.fillRect(point.x - 42, point.y - 92, 84, 58);
    ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + heat * 0.5})`;
    ctx.fillRect(point.x - 34, point.y - 36, 68, 16);
    ctx.beginPath();
    ctx.moveTo(point.x - 15, point.y - 22);
    ctx.lineTo(point.x + 15, point.y - 22);
    ctx.lineTo(point.x + 4, point.y + 12);
    ctx.lineTo(point.x - 4, point.y + 12);
    ctx.closePath();
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.fillStyle = "rgba(255, 237, 213, 0.95)";
    ctx.beginPath();
    ctx.arc(point.x, point.y + 13, 3 + heat * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawModelPreview = (amount) => {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cx = w * 0.52;
    const cy = h * (0.42 + amount * 0.12);
    const size = Math.min(w, h) * 0.18;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(visualProgress * 7) * 0.08);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.88)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
    ctx.shadowBlur = 18;
    for (let i = 0; i < 8; i += 1) {
      const r = size * (0.54 + i * 0.035);
      ctx.strokeRect(-r, -r * 0.64, r * 2, r * 1.28);
    }
    ctx.strokeStyle = "rgba(167, 139, 250, 0.7)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, size * 0.5);
    ctx.lineTo(0, -size * 0.82);
    ctx.lineTo(size * 0.72, size * 0.5);
    ctx.stroke();
    ctx.restore();
  };

  const drawScene = (progress, step) => {
    if (!canvas || !ctx) return;
    resizeCanvas();
    const heat = localProgress(progress, 0.34, 0.5);
    const firstLayer = localProgress(progress, 0.5, 0.66);
    const print = localProgress(progress, 0.66, 0.88);
    const final = localProgress(progress, 0.88, 1);
    const activePrint = step >= 3 ? (step === 3 ? firstLayer : step === 4 ? print : 1) : 0;
    const z = step === 4 ? ease(print) * 88 : step === 5 ? 92 : 0;
    const nozzle = step <= 1
      ? null
      : step === 2
        ? bedPoint(lerp(0.14, 0.3, ease(heat)), lerp(0.12, 0.28, ease(heat)), 0)
        : step === 5
          ? bedPoint(0.86, 0.18, 100)
          : nozzlePosition(activePrint || 0.02, z);

    drawPrinterFrame(heat || (step > 2 ? 1 : 0.15), nozzle);

    if (step <= 1) drawModelPreview(step === 0 ? localProgress(progress, 0, 0.18) : 1);
    if (step === 1) {
      for (let i = 0; i < 16; i += 1) drawSegmentedPath(1, i * 3, 0.045);
      drawSegmentedPath(localProgress(progress, 0.18, 0.34), 62, 0.8);
    }
    if (step === 3) drawSegmentedPath(firstLayer, 0, 1);
    if (step === 4 || step === 5) {
      const layerCount = step === 5 ? 18 : Math.max(1, Math.floor(ease(print) * 18));
      for (let layer = 0; layer < layerCount; layer += 1) {
        drawSegmentedPath(1, layer * 5, 0.36 + layer / 32);
      }
      if (step === 4) drawSegmentedPath((print * 18) % 1, layerCount * 5, 1);
    }
    if (nozzle) drawNozzle(nozzle, heat || 1);

    if (step === 5) {
      const tags = [
        ["Adhesión OK", 0.2, 0.55],
        ["Capas alineadas", 0.62, 0.48],
        ["Superficie limpia", 0.64, 0.72],
        ["Medidas a revisar", 0.24, 0.76]
      ];
      const rect = canvas.getBoundingClientRect();
      ctx.save();
      ctx.font = "800 13px Inter, system-ui, sans-serif";
      tags.forEach(([text, x, y]) => {
        ctx.fillStyle = "rgba(2, 6, 23, 0.82)";
        ctx.strokeStyle = "rgba(34, 197, 94, 0.36)";
        ctx.lineWidth = 1;
        const px = rect.width * x;
        const py = rect.height * y;
        const width = ctx.measureText(text).width + 24;
        roundedRect(ctx, px, py, width, 34, 17);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(text, px + 12, py + 22);
      });
      ctx.restore();
    }
  };

  const setFlowStep = (index) => {
    const bounded = Math.max(0, Math.min(copies.length - 1, index));
    if (bounded === activeStep) return;
    activeStep = bounded;
    section.dataset.flowStep = String(bounded);
    section.style.setProperty("--flow-step", bounded);

    copies.forEach((copy, copyIndex) => copy.classList.toggle("is-active", copyIndex === bounded));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === bounded;
      dot.classList.toggle("is-active", isActive);
      if (isActive) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });

    if (current) current.textContent = String(bounded + 1).padStart(2, "0");
    const values = hudValues[bounded] || hudValues[0];
    Object.keys(hud).forEach((key) => {
      if (hud[key] && values[key]) hud[key].textContent = values[key];
    });
    if (status) status.textContent = values.status;
  };

  const updateFlow = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const maxScroll = Math.max(1, rect.height - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / maxScroll));
    const step = Math.min(copies.length - 1, Math.floor(progress * copies.length));
    visualProgress = progress;
    section.style.setProperty("--flow-progress", progress.toFixed(4));
    section.style.setProperty("--flow-percent", `${(progress * 100).toFixed(1)}%`);
    setFlowStep(step);
    drawScene(progress, step);
  };

  const requestFlowUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFlow);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.flowJump || 0);
      const rect = section.getBoundingClientRect();
      const target = window.scrollY + rect.top + ((section.offsetHeight - window.innerHeight) * (index / Math.max(1, copies.length - 1)));
      window.scrollTo({ top: target, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  setFlowStep(0);
  resizeCanvas();
  updateFlow();
  requestFlowUpdate();
  window.addEventListener("scroll", requestFlowUpdate, { passive: true });
  window.addEventListener("resize", requestFlowUpdate);
  if (document.readyState === "complete") {
    requestFlowUpdate();
  } else {
    window.addEventListener("load", requestFlowUpdate, { once: true });
  }
  if (document.fonts?.ready) {
    document.fonts.ready.then(requestFlowUpdate).catch(() => {});
  }
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
  ["Rellenos y paredes", "rellenos.html", "Infill, gyroid, cubic, grid, paredes, tapas, perímetros, resistencia y porcentaje de relleno."],
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
