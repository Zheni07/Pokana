(function () {
  "use strict";

  const config = window.INVITATION_CONFIG;
  if (!config) return;

  applyConfig(config);
  initParticles();
  initScrollReveal();
  initCountdown(config.countdown.targetDate);
  initGallery(config.gallery.images);
  initNavigation(config.map, config.navigation);
  initMusic(config.music);
  initLightbox();
  initMobileUX();
})();

function initMobileUX() {
  const sticky = document.getElementById("navSticky");
  const navSection = document.getElementById("navigation");
  if (!sticky || !navSection) return;

  const mq = window.matchMedia("(max-width: 767px)");
  let observer;

  function setupObserver() {
    observer?.disconnect();
    if (!mq.matches) {
      sticky.classList.remove("nav-sticky--hidden");
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        sticky.classList.toggle("nav-sticky--hidden", entry.isIntersecting);
      },
      { root: null, threshold: 0.35, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(navSection);
  }

  setupObserver();
  mq.addEventListener("change", setupObserver);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function applyConfig(config) {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    const key = el.getAttribute("data-edit");
    const value = getNestedValue(config, key);
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll("[data-edit-src]").forEach((el) => {
    const key = el.getAttribute("data-edit-src");
    const value = getNestedValue(config, key);
    if (value) el.src = value;
  });

  document.querySelectorAll("[data-edit-href]").forEach((el) => {
    const key = el.getAttribute("data-edit-href");
    const value = getNestedValue(config, key);
    if (value) el.href = value;
  });

  const audio = document.getElementById("ambientAudio");
  if (audio && config.music?.src) {
    audio.querySelector("source")?.setAttribute("src", config.music.src);
    audio.load();
  }

  const heroPhoto = document.getElementById("heroPhoto");
  if (heroPhoto && config.hero?.showPhoto) {
    heroPhoto.hidden = false;
  }
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function initParticles() {
  const container = document.getElementById("particles");
  if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const count = window.innerWidth < 480 ? 8 : window.innerWidth < 768 ? 14 : 28;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    const size = 2 + Math.random() * 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${12 + Math.random() * 18}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(p);
  }
}

function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
}

function initCountdown(targetIso) {
  const target = new Date(targetIso).getTime();
  const units = ["days", "hours", "minutes", "seconds"];
  const prev = {};

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    const values = { days: pad(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };

    units.forEach((unit) => {
      const el = document.querySelector(`[data-unit="${unit}"]`);
      if (!el) return;
      if (prev[unit] !== values[unit]) {
        el.textContent = values[unit];
        el.classList.remove("tick");
        void el.offsetWidth;
        el.classList.add("tick");
        prev[unit] = values[unit];
      }
    });
  }

  tick();
  setInterval(tick, 1000);
}

function initGallery(images) {
  const grid = document.getElementById("galleryGrid");
  if (!grid || !images?.length) return;

  images.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item reveal";
    figure.dataset.index = String(index);

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || `Снимка ${index + 1}`;
    img.loading = "lazy";

    figure.appendChild(img);
    figure.addEventListener("click", () => openLightbox(index));
    grid.appendChild(figure);
  });

  requestAnimationFrame(() => initScrollReveal());
}

function initNavigation(map, navTexts) {
  const iframe = document.getElementById("mapEmbed");
  const navBtn = document.getElementById("navigateBtn");
  const navFromBtn = document.getElementById("navFromLocation");
  const navStickyBtn = document.getElementById("navStickyBtn");
  const navWaze = document.getElementById("navigateWaze");
  const statusEl = document.getElementById("navStatus");
  const distanceWrap = document.getElementById("navDistance");
  const distanceValue = document.getElementById("navDistanceValue");

  if (!map?.latitude || !map?.longitude) return;

  const dest = `${map.latitude},${map.longitude}`;
  const destQuery = encodeURIComponent(map.placeQuery || map.venueName || "Balkanski kat Mechkovitsa");

  if (iframe) {
    iframe.src = `https://maps.google.com/maps?q=${dest}&z=15&output=embed`;
  }

  const destinationUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=&travelmode=driving`;
  const viewOnlyUrl = `https://www.google.com/maps/search/?api=1&query=${destQuery}`;
  const wazeUrl = `https://waze.com/ul?ll=${map.latitude},${map.longitude}&navigate=yes`;

  if (navBtn) navBtn.href = viewOnlyUrl;
  if (navWaze) {
    navWaze.href = wazeUrl;
    navWaze.hidden = false;
  }

  setNavStatus(statusEl, navTexts?.statusIdle || "");

  function setNavStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove("is-loading", "is-error", "is-success");
    if (type) el.classList.add(`is-${type}`);
  }

  function buildDirectionsUrl(originLat, originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${dest}&travelmode=driving`;
  }

  function openExternal(url) {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function openDirections(originLat, originLng) {
    openExternal(buildDirectionsUrl(originLat, originLng));
  }

  function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(km < 10 ? 1 : 0)} km`;
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function startNavigationFromHere() {
    if (!navigator.geolocation) {
      setNavStatus(statusEl, navTexts?.statusUnavailable || "GPS не се поддържа.", "error");
      openExternal(destinationUrl);
      return;
    }

    setNavStatus(statusEl, navTexts?.statusLoading || "Зареждане…", "loading");
    navFromBtn?.classList.add("is-loading");
    navStickyBtn?.classList.add("is-loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const km = haversineKm(lat, lng, map.latitude, map.longitude);

        if (distanceWrap && distanceValue) {
          distanceWrap.hidden = false;
          distanceValue.textContent = formatDistance(km);
        }

        setNavStatus(statusEl, navTexts?.statusSuccess || "Отваряме картата…", "success");
        navFromBtn?.classList.remove("is-loading");
        navStickyBtn?.classList.remove("is-loading");

        openDirections(lat, lng);
      },
      (err) => {
        navFromBtn?.classList.remove("is-loading");
        navStickyBtn?.classList.remove("is-loading");

        const msg =
          err.code === 1
            ? navTexts?.statusDenied
            : navTexts?.statusUnavailable;
        setNavStatus(statusEl, msg || "Грешка при локация.", "error");
        openExternal(destinationUrl);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  navFromBtn?.addEventListener("click", startNavigationFromHere);
  navStickyBtn?.addEventListener("click", startNavigationFromHere);
}

function initMusic(music) {
  const btn = document.getElementById("musicToggle");
  const audio = document.getElementById("ambientAudio");
  if (!btn || !audio) return;

  let playing = false;

  btn.classList.add("is-muted");

  async function toggle() {
    if (playing) {
      audio.pause();
      playing = false;
      btn.classList.remove("is-playing");
      btn.classList.add("is-muted");
      return;
    }

    try {
      await audio.play();
      playing = true;
      btn.classList.add("is-playing");
      btn.classList.remove("is-muted");
    } catch {
      btn.classList.add("is-muted");
    }
  }

  btn.addEventListener("click", toggle);

  audio.addEventListener("ended", () => {
    playing = false;
    btn.classList.remove("is-playing");
    btn.classList.add("is-muted");
  });
}

let lightboxIndex = 0;
let lightboxImages = [];

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", () => navigateLightbox(-1));
  nextBtn?.addEventListener("click", () => navigateLightbox(1));

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });
}

function openLightbox(index) {
  const config = window.INVITATION_CONFIG;
  lightboxImages = config?.gallery?.images || [];
  lightboxIndex = index;

  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  if (!lightbox || !img || !lightboxImages.length) return;

  lightbox.hidden = false;
  requestAnimationFrame(() => {
    lightbox.classList.add("is-open");
    updateLightboxImage(img);
  });
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => {
    lightbox.hidden = true;
  }, 400);
}

function navigateLightbox(dir) {
  const img = document.getElementById("lightboxImg");
  if (!lightboxImages.length || !img) return;

  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  updateLightboxImage(img);
}

function updateLightboxImage(imgEl) {
  const item = lightboxImages[lightboxIndex];
  imgEl.src = item.src;
  imgEl.alt = item.alt || "";
}
