/* ─────────────────────────────────────────────
   script.js  —  Покана за абитуриентски бал
   ───────────────────────────────────────────── */

/* ── 1. Помощ: прилага стойности от config ── */
function applyConfig(cfg) {
  // data-edit текстове
  document.querySelectorAll("[data-edit]").forEach((el) => {
    const path = el.dataset.edit.split(".");
    let val = cfg;
    for (const k of path) val = val?.[k];
    if (val !== undefined) el.textContent = val;
  });
  // data-edit-src атрибути (img src)
  document.querySelectorAll("[data-edit-src]").forEach((el) => {
    const path = el.dataset.editSrc.split(".");
    let val = cfg;
    for (const k of path) val = val?.[k];
    if (val) el.src = val;
  });
  // data-edit-href атрибути (a href)
  document.querySelectorAll("[data-edit-href]").forEach((el) => {
    const path = el.dataset.editHref.split(".");
    let val = cfg;
    for (const k of path) val = val?.[k];
    if (val) el.href = val;
  });
}

/* ── 2. Частици ── */
function initParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 12 : 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${8 + Math.random() * 12}s;
      animation-delay:${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}

/* ── 3. Scroll reveal ── */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* ── 4. Музика ── */
function initMusic(musicCfg) {
  const btn = document.getElementById("musicToggle");
  const audio = document.getElementById("ambientAudio");
  if (!btn || !audio) return;
  if (musicCfg?.src) audio.src = musicCfg.src;
  let playing = !!musicCfg?.enabledByDefault;
  btn.classList.toggle("is-muted", !playing);
  btn.classList.toggle("is-playing", playing);
  if (playing) audio.play().catch(() => {});
  btn.addEventListener("click", () => {
    playing = !playing;
    playing ? audio.play().catch(() => {}) : audio.pause();
    btn.classList.toggle("is-muted", !playing);
    btn.classList.toggle("is-playing", playing);
  });
}

/* ── 5. Countdown ── */
function initCountdown(targetDateStr) {
  const timer = document.getElementById("countdownTimer");
  if (!timer || !targetDateStr) return;
  const target = new Date(targetDateStr).getTime();
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { timer.innerHTML = "<p style='font-size:1.5rem;color:var(--brown)'>🎉 Денят е днес!</p>"; return; }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    [["days", d], ["hours", h], ["minutes", m], ["seconds", s]].forEach(([u, v]) => {
      const el = timer.querySelector(`[data-unit="${u}"]`);
      if (!el) return;
      const str = String(v).padStart(2, "0");
      if (el.textContent !== str) { el.textContent = str; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ── 6. Галерия + lightbox ── */
function initGallery(images) {
  const grid = document.getElementById("galleryGrid");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbClose = document.getElementById("lightboxClose");
  const lbPrev = document.getElementById("lightboxPrev");
  const lbNext = document.getElementById("lightboxNext");
  if (!grid || !images?.length) return;

  let current = 0;
  images.forEach((img, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item reveal";
    const el = document.createElement("img");
    el.src = img.src; el.alt = img.alt || ""; el.loading = "lazy";
    item.appendChild(el);
    item.addEventListener("click", () => openLightbox(i));
    grid.appendChild(item);
  });

  function openLightbox(i) {
    current = i;
    lbImg.src = images[i].src; lbImg.alt = images[i].alt || "";
    lightbox.hidden = false; lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    setTimeout(() => { lightbox.hidden = true; document.body.style.overflow = ""; }, 400);
  }
  function showAdj(d) { openLightbox((current + d + images.length) % images.length); }

  lbClose?.addEventListener("click", closeLightbox);
  lbPrev?.addEventListener("click", () => showAdj(-1));
  lbNext?.addEventListener("click", () => showAdj(1));
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (lightbox?.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showAdj(-1);
    if (e.key === "ArrowRight") showAdj(1);
  });
}

/* ── 7. Снимка в hero ── */
function initHeroPhoto(heroCfg) {
  if (!heroCfg?.showPhoto) return;
  const section = document.getElementById("heroPhoto");
  if (section) section.hidden = false;
}

/* ── 8. Sticky nav bar видимост ── */
function initStickyNav() {
  const bar = document.getElementById("navSticky");
  if (!bar) return;
  const hero = document.getElementById("hero");
  const io = new IntersectionObserver(
    ([e]) => bar.classList.toggle("nav-sticky--hidden", e.isIntersecting),
    { threshold: 0.1 }
  );
  if (hero) io.observe(hero);
}

/* ── 9. НАВИГАЦИЯ (основна логика) ── */
function initNavigation(map, navTexts) {
  const iframe    = document.getElementById("mapEmbed");
  const navBtn    = document.getElementById("navigateBtn");
  const navWaze   = document.getElementById("navigateWaze");
  const statusEl  = document.getElementById("navStatus");
  const distWrap  = document.getElementById("navDistance");
  const distValue = document.getElementById("navDistanceValue");

  const destLat = map?.latitude;
  const destLng = map?.longitude;
  const hasCoords = Number.isFinite(destLat) && Number.isFinite(destLng);

  /* Адрес за fallback */
  const destAddress =
    map?.destination ||
    map?.addressFull ||
    "Балкански кът, кв. Гачевци, с. Мечковица, 5300 Габрово, България";
  const destEncoded = encodeURIComponent(destAddress);

  /* Google Maps embed в iframe */
  if (iframe) {
    iframe.src = hasCoords
      ? `https://maps.google.com/maps?q=${destLat},${destLng}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${destEncoded}&z=15&output=embed`;
  }

  /* Статичен бутон "Виж само дестинацията" */
  const viewOnlyUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`
    : `https://www.google.com/maps/search/?api=1&query=${destEncoded}`;

  if (navBtn) navBtn.href = viewOnlyUrl;

  /* Waze */
  const wazeUrl = hasCoords
    ? `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`
    : `https://waze.com/ul?q=${destEncoded}&navigate=yes`;
  if (navWaze) { navWaze.href = wazeUrl; navWaze.hidden = false; }

  /* Начален статус */
  setStatus(navTexts?.statusIdle || "Готови сме да маршрутираме.", "");

  /* ─ помощни ─ */
  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "nav-panel__status";
    if (type) statusEl.classList.add(`is-${type}`);
  }

  function setLoading(on) {
    document.querySelectorAll("[data-nav-start]").forEach((b) => {
      b.classList.toggle("is-loading", on);
      b.disabled = on;
    });
  }

  function haversineKm(la1, lo1, la2, lo2) {
    const R = 6371, dLa = ((la2 - la1) * Math.PI) / 180, dLo = ((lo2 - lo1) * Math.PI) / 180;
    const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function fmtDist(km) { return km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(km<10?1:0)} km`; }

  /* ─ главна функция при клик ─ */
  function startNav() {
    if (!navigator.geolocation) {
      setStatus(navTexts?.statusUnavailable || "GPS не се поддържа.", "error");
      /* fallback — отвори само дестинацията */
      window.open(viewOnlyUrl, "_blank", "noopener");
      return;
    }

    setStatus(navTexts?.statusLoading || "Определяме локацията…", "loading");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        /* Покажи разстояние */
        if (hasCoords && distWrap && distValue) {
          distWrap.hidden = false;
          distValue.textContent = fmtDist(haversineKm(lat, lng, destLat, destLng));
        }

        setStatus(navTexts?.statusSuccess || "Отваряме Google Maps…", "success");
        setLoading(false);

        /* ── Построй URL с origin + destination ── */
        const origin = `${lat},${lng}`;
        const dest   = hasCoords ? `${destLat},${destLng}` : destEncoded;
        const mapsUrl = `https://www.google.com/maps/dir/?api=1` +
                        `&origin=${encodeURIComponent(origin)}` +
                        `&destination=${dest}` +
                        `&travelmode=driving`;

        window.location.href = mapsUrl;
      },
      (err) => {
        setLoading(false);
        const msg = err.code === 1
          ? (navTexts?.statusDenied    || "Достъпът до GPS е отказан.")
          : (navTexts?.statusUnavailable || "Локацията не е налична.");
        setStatus(msg, "error");
        /* fallback */
        window.location.href = viewOnlyUrl;
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  /* Закачи към всички бутони с data-nav-start */
  document.querySelectorAll("[data-nav-start]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); startNav(); });
  });
}

/* ══════════════════════════════════════════════
   INIT — стартира всичко след зареждане на DOM
   ══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.INVITATION_CONFIG || {};

  applyConfig(cfg);
  initParticles();
  initReveal();
  initMusic(cfg.music);
  initCountdown(cfg.countdown?.targetDate);
  initGallery(cfg.gallery?.images);
  initHeroPhoto(cfg.hero);
  initStickyNav();
  initNavigation(cfg.map, cfg.navigation);
});
