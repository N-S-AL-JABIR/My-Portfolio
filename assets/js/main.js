(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  /* ---------- Media helpers ---------- */

  function mediaInfo(key) {
    const m = MEDIA[key];
    if (!m) throw new Error(`Unknown media: ${key}`);
    const [kind, id] = key.split(":");
    const isCert = kind === "cert";
    const dir = isCert ? "assets/img/certificates" : "assets/img/photos";
    const large = isCert ? 1800 : 1600;
    return {
      ...m,
      key,
      isCert,
      thumb: `${dir}/${id}-640.webp`,
      full: `${dir}/${id}-${large}.webp`,
    };
  }

  function img(key, { sizes = "(max-width: 640px) 100vw, 640px", eager = false, cls = "" } = {}) {
    const m = mediaInfo(key);
    // Thumbnails are bounded to 640px on their longest side.
    const scale = 640 / Math.max(m.w, m.h);
    const tw = Math.round(m.w * scale);
    const th = Math.round(m.h * scale);
    return `<img class="${cls}" src="${m.thumb}" srcset="${m.thumb} ${tw}w, ${m.full} ${m.w}w"
      sizes="${sizes}" width="${tw}" height="${th}" alt="${esc(m.alt)}"
      ${eager ? "" : 'loading="lazy"'} decoding="async">`;
  }

  // Buttons that open supporting photos / certificates in the lightbox.
  function evidenceButtons(keys) {
    if (!keys || !keys.length) return "";
    return `<div class="evidence">${keys
      .map((k) => {
        const m = mediaInfo(k);
        return `<button type="button" class="chip" data-lightbox="${esc(k)}" data-group="${esc(keys.join(","))}">
          ${icon(m.isCert ? "doc" : "image")}${m.isCert ? "Certificate" : "Photo"}</button>`;
      })
      .join("")}</div>`;
  }

  /* ---------- Projects ---------- */

  function projectMedia(p, cls) {
    if (p.media.length) return img(p.media[0], { sizes: "(max-width: 760px) 100vw, 400px", cls });
    return `<div class="${cls} media-icon">${icon(p.icon || "image")}<span class="mono">${esc(p.category)}</span></div>`;
  }

  function renderProjects() {
    // In the two-column grid, a lone last card is laid out full-width instead.
    const regular = PROJECTS.filter((p) => !p.featured).length;
    $("#projects-list").innerHTML = PROJECTS.map(
      (p, i) => `
      <article class="project reveal${p.featured ? " project--featured" : ""}${
        !p.featured && i === PROJECTS.length - 1 && regular % 2 ? " project--row" : ""
      }">
        <button type="button" class="project__media" data-project="${p.id}" aria-label="Open details for ${esc(p.title)}">
          ${projectMedia(p, "project__img")}
        </button>
        <div class="project__body">
          <p class="project__meta"><span class="mono">${String(i + 1).padStart(2, "0")}</span>${esc(p.category)}</p>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <ul class="tags">${p.tech.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>
          <button type="button" class="link project__more" data-project="${p.id}">
            View details ${icon("arrow")}
          </button>
        </div>
      </article>`
    ).join("");
  }

  const projectModal = $("#project-modal");

  function openProject(id, opener) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    const gallery = p.video
      ? `<video controls preload="none" playsinline ${p.media[0] ? `poster="${mediaInfo(p.media[0]).full}"` : ""}>
           <source src="${esc(p.video)}" type="video/mp4">Your browser cannot play this video.</video>`
      : "";
    const photos = p.media
      .map(
        (k) => `<li><button type="button" class="thumb" data-lightbox="${k}" data-group="${p.media.join(",")}">
          ${img(k, { sizes: "(max-width: 640px) 50vw, 260px" })}</button></li>`
      )
      .join("");
    $("#project-modal-body").innerHTML = `
      <p class="project__meta"><span class="mono">Project</span>${esc(p.category)}</p>
      <h2 id="project-modal-title">${esc(p.title)}</h2>
      <h3 class="modal__h">Overview</h3>
      <p>${esc(p.summary)}</p>
      <h3 class="modal__h">Technology</h3>
      <ul class="tags">${p.tech.map((t) => `<li class="tag tag--accent">${esc(t)}</li>`).join("")}</ul>
      <h3 class="modal__h">Key Features</h3>
      <ul class="bullets">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      ${
        gallery || photos
          ? `<h3 class="modal__h">Gallery</h3>${gallery}${photos ? `<ul class="thumbs">${photos}</ul>` : ""}`
          : ""
      }`;
    projectModal.returnFocusTo = opener;
    projectModal.showModal();
    projectModal.querySelector(".modal__inner").scrollTop = 0;
  }

  /* ---------- Experience, leadership, achievements ---------- */

  function renderWork() {
    $("#work-list").innerHTML = WORK.map(
      (w) => `
      <article class="timeline__item reveal">
        <p class="timeline__period mono">${esc(w.period)}</p>
        <div class="card">
          <h3>${esc(w.role)}</h3>
          <p class="card__org">${esc(w.org)}</p>
          <ul class="bullets">${w.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
      </article>`
    ).join("");
  }

  function renderLeadership() {
    $("#leadership-list").innerHTML = LEADERSHIP.map(
      (r) => `
      <article class="card role reveal">
        <p class="role__period mono">${esc(r.period)}</p>
        <h3>${esc(r.role)}</h3>
        <p class="card__org">${esc(r.org)}</p>
        <ul class="bullets">${r.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        ${evidenceButtons(r.evidence)}
      </article>`
    ).join("");
  }

  function renderAchievements() {
    $("#achievements-list").innerHTML = ACHIEVEMENTS.map(
      (a) => `
      <article class="card achievement reveal">
        <p class="card__kicker mono">${esc(a.kind)}</p>
        ${
          a.metric
            ? `<p class="achievement__metric">${esc(a.metric)}<span>${esc(a.metricLabel)}</span></p>`
            : ""
        }
        <h3>${esc(a.title)}</h3>
        <p class="card__org">${esc(a.org)}</p>
        <p>${esc(a.text)}</p>
        ${evidenceButtons(a.evidence)}
      </article>`
    ).join("");
  }

  function renderActivities() {
    $("#activities-list").innerHTML = ACTIVITIES.map(
      (g) => `
      <div class="activity-group reveal">
        <h3 class="activity-group__title">${esc(g.label)}</h3>
        <ul class="activity-list">
          ${g.items
            .map(
              (it) => `
            <li class="activity">
              <div class="activity__head">
                <h4>${esc(it.title)}</h4>
                ${it.date ? `<span class="activity__date mono">${esc(it.date)}</span>` : ""}
              </div>
              <p class="card__org">${esc(it.org)}</p>
              ${it.text ? `<p>${esc(it.text)}</p>` : ""}
              ${evidenceButtons(it.evidence)}
            </li>`
            )
            .join("")}
        </ul>
      </div>`
    ).join("");
  }

  /* ---------- Filters (gallery + documents) ---------- */

  function setupFilter(container, categories, onChange) {
    const all = ["All", ...categories];
    container.innerHTML = all
      .map(
        (c, i) =>
          `<button type="button" class="filter" aria-pressed="${i === 0}" data-filter="${esc(c)}">${esc(c)}</button>`
      )
      .join("");
    container.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      $$("[data-filter]", container).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      onChange(b.dataset.filter);
    });
  }

  function applyFilter(items, value) {
    items.forEach((el) => {
      el.hidden = !(value === "All" || el.dataset.category === value);
    });
  }

  function renderGallery() {
    const grid = $("#gallery-grid");
    grid.innerHTML = GALLERY.map(
      (g) => `
      <li class="gallery__item${g.feature ? " gallery__item--feature" : ""}" data-category="${esc(g.category)}">
        <button type="button" class="thumb" data-lightbox="${g.media}" data-group="gallery">
          ${img(g.media, {
            sizes: g.feature
              ? "(max-width: 600px) 100vw, (max-width: 960px) 66vw, 600px"
              : "(max-width: 600px) 50vw, (max-width: 960px) 33vw, 300px",
          })}
          <span class="gallery__cap">${esc(mediaInfo(g.media).caption)}</span>
        </button>
      </li>`
    ).join("");
    setupFilter($("#gallery-filters"), GALLERY_CATEGORIES, (v) => applyFilter($$(".gallery__item", grid), v));
  }

  function renderDocuments() {
    const grid = $("#doc-grid");
    grid.innerHTML = DOCUMENTS.map((d) => {
      const m = mediaInfo(d.media);
      const ext = m.file.split(".").pop().toLowerCase();
      return `
      <li class="doc" data-category="${esc(d.category)}">
        <button type="button" class="doc__preview" data-lightbox="${d.media}" data-group="documents" aria-label="View ${esc(d.title)}">
          ${img(d.media, { sizes: "(max-width: 560px) 100vw, 320px" })}
        </button>
        <div class="doc__body">
          <p class="doc__type mono">${esc(d.type)}</p>
          <h3>${esc(d.title)}</h3>
          <p class="card__org">${esc(d.org)}</p>
          ${d.date ? `<p class="doc__date mono">${esc(d.date)}</p>` : ""}
          <div class="doc__actions">
            <button type="button" class="btn btn--sm" data-lightbox="${d.media}" data-group="documents">${icon("eye")}View</button>
            <a class="btn btn--sm" href="${esc(m.file)}" download="Al_Jabir_${esc(d.title.replace(/[^a-z0-9]+/gi, "_"))}.${ext}">${icon("download")}Download</a>
          </div>
        </div>
      </li>`;
    }).join("");
    setupFilter($("#doc-filters"), DOCUMENT_CATEGORIES, (v) => applyFilter($$(".doc", grid), v));
  }

  /* ---------- Lightbox ---------- */

  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  let lbList = [];
  let lbIndex = 0;

  function groupKeys(trigger) {
    const g = trigger.dataset.group;
    if (g === "gallery") return $$(".gallery__item:not([hidden]) [data-lightbox]").map((b) => b.dataset.lightbox);
    if (g === "documents") return $$(".doc:not([hidden]) .doc__preview").map((b) => b.dataset.lightbox);
    return g ? g.split(",") : [trigger.dataset.lightbox];
  }

  function showLightbox(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    const m = mediaInfo(lbList[lbIndex]);
    lb.classList.toggle("lightbox--doc", m.isCert);
    lbImg.removeAttribute("src");
    lbImg.src = m.full;
    lbImg.alt = m.alt;
    $(".lightbox__caption", lb).textContent = m.caption;
    $(".lightbox__count", lb).textContent = lbList.length > 1 ? `${lbIndex + 1} / ${lbList.length}` : "";
    $$(".lightbox__nav", lb).forEach((b) => (b.hidden = lbList.length < 2));
  }

  function openLightbox(trigger) {
    lbList = groupKeys(trigger);
    const start = Math.max(0, lbList.indexOf(trigger.dataset.lightbox));
    lb.returnFocusTo = trigger;
    showLightbox(start);
    if (!lb.open) lb.showModal();
  }

  $(".lightbox__nav--prev", lb).addEventListener("click", () => showLightbox(lbIndex - 1));
  $(".lightbox__nav--next", lb).addEventListener("click", () => showLightbox(lbIndex + 1));
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });

  /* ---------- Dialog plumbing ---------- */

  for (const d of [lb, projectModal]) {
    // Click on the backdrop closes the dialog.
    d.addEventListener("click", (e) => {
      if (e.target === d || e.target.closest("[data-close]")) d.close();
    });
    d.addEventListener("close", () => {
      document.documentElement.classList.toggle("is-locked", lb.open || projectModal.open);
      d.returnFocusTo?.focus?.();
    });
  }

  document.addEventListener("click", (e) => {
    const lbTrigger = e.target.closest("[data-lightbox]");
    if (lbTrigger) {
      openLightbox(lbTrigger);
      document.documentElement.classList.add("is-locked");
      return;
    }
    const pTrigger = e.target.closest("[data-project]");
    if (pTrigger) {
      openProject(pTrigger.dataset.project, pTrigger);
      document.documentElement.classList.add("is-locked");
    }
  });

  /* ---------- Navigation ---------- */

  function setupNav() {
    const toggle = $(".nav__toggle");
    const menu = $("#nav-menu");
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
      $(".site-header").classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    const header = $(".site-header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Highlight the section currently in view.
    const links = new Map($$(".nav__list a").map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a) => a.removeAttribute("aria-current"));
          links.get(en.target.id)?.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function setupReveal() {
    const els = $$(".reveal");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Back to top ---------- */

  function setupToTop() {
    const btn = $(".to-top");
    const ring = $(".to-top__progress", btn);
    const len = 2 * Math.PI * 24;
    ring.style.strokeDasharray = len;
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
      ring.style.strokeDashoffset = len * (1 - progress);
      btn.classList.toggle("is-visible", scrollY > innerHeight * 0.6);
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      $(".nav__brand").focus({ preventScroll: true });
    });
  }

  /* ---------- Init ---------- */

  // Static evidence placeholders in index.html.
  $$("[data-evidence]").forEach((el) => {
    el.outerHTML = evidenceButtons(el.dataset.evidence.split(","));
  });

  renderProjects();
  renderWork();
  renderLeadership();
  renderAchievements();
  renderActivities();
  renderGallery();
  renderDocuments();
  setupNav();
  setupToTop();
  document.documentElement.classList.add("js");
  setupReveal();
})();
