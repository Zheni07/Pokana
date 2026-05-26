function initNavigation(map, navTexts) {
  const iframe = document.getElementById("mapEmbed");
  const navBtn = document.getElementById("navigateBtn");
  const navWaze = document.getElementById("navigateWaze");
  const statusEl = document.getElementById("navStatus");
  const distanceWrap = document.getElementById("navDistance");
  const distanceValue = document.getElementById("navDistanceValue");

  const destAddress =
    map?.destination ||
    map?.addressFull ||
    "къща за гости Балкански кът, кв. Гачевци, с. Мечковица, 5300 Габрово, България";
  const destEncoded = encodeURIComponent(destAddress);

  const destLat = map?.latitude;
  const destLng = map?.longitude;
  const hasCoords = Number.isFinite(destLat) && Number.isFinite(destLng);

  if (iframe) {
    iframe.src = `https://maps.google.com/maps?q=${destEncoded}&z=15&output=embed`;
  }

  const destinationUrl = `https://www.google.com/maps/dir/?api=1&destination=${destEncoded}&travelmode=driving`;
  const viewOnlyUrl = `https://www.google.com/maps/search/?api=1&query=${destEncoded}`;
  const wazeUrl = hasCoords
    ? `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`
    : `https://waze.com/ul?q=${destEncoded}&navigate=yes`;

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
    const origin = `${originLat},${originLng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destEncoded}&travelmode=driving`;
  }

  function openExternal(url) {
    window.location.href = url;
  }

  function openDirections(originLat, originLng) {
    openExternal(buildDirectionsUrl(originLat, originLng));
  }

  function setLoading(isLoading) {
    document.querySelectorAll("[data-nav-start]").forEach((btn) => {
      btn.classList.toggle("is-loading", isLoading);
      btn.disabled = isLoading;
    });
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

    setNavStatus(statusEl, navTexts?.statusLoading || "Определяме локацията…", "loading");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        if (hasCoords && distanceWrap && distanceValue) {
          distanceWrap.hidden = false;
          distanceValue.textContent = formatDistance(haversineKm(lat, lng, destLat, destLng));
        }

        setNavStatus(statusEl, navTexts?.statusSuccess || "Отваряме Google Maps…", "success");
        setLoading(false);
        openDirections(lat, lng);
      },
      (err) => {
        setLoading(false);

        const msg =
          err.code === 1 ? navTexts?.statusDenied : navTexts?.statusUnavailable;
        setNavStatus(statusEl, msg || "Грешка при локация.", "error");
        openExternal(destinationUrl);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  document.querySelectorAll("[data-nav-start]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      startNavigationFromHere();
    });
  });
}
