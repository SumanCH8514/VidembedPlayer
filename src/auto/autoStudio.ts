import { AutoPlayer } from "./autoPlayer";
import { AutoPlayerConfig, StreamSource } from "./types";
import {
  fetchMediaDetails,
  fetchStreamSources,
  fetchStreamHealth
} from "./services/streamApi";

(window as any).__VIDEMBED_AUTO_STUDIO__ = true;

const searchParams = new URLSearchParams(window.location.search);
const isEmbed = window.self !== window.top || searchParams.get("embed") === "1" || searchParams.get("plain") === "1";

if (isEmbed) {
  document.body.classList.add("is-embed-mode");
  const root = document.getElementById("auto-player-root");
  if (root) {
    document.body.appendChild(root);
    root.dataset.initialized = "true";
    new AutoPlayer(root);
  }
} else {
  initStudio();
}

function initStudio(): void {
  const root = document.getElementById("auto-player-root");
  if (!root) return;

  const urlParams = new URLSearchParams(window.location.search);
  let currentType: "movie" | "tv" = (urlParams.get("type") as "movie" | "tv") || (urlParams.get("s") ? "tv" : "movie");
  let currentId: string = urlParams.get("id") || urlParams.get("tmdb") || "";
  let currentSeason: number = parseInt(urlParams.get("s") || urlParams.get("season") || "1", 10);
  let currentEpisode: number = parseInt(urlParams.get("e") || urlParams.get("episode") || "1", 10);
  let currentBrand: string = urlParams.get("brand") || "SumanMovies";
  let currentColor: string = urlParams.get("color") ? `#${urlParams.get("color")!.replace("#", "")}` : "#06b6d4";
  let currentAutoplay: boolean = urlParams.get("autoplay") === "1";
  let currentMuted: boolean = urlParams.get("muted") === "1";
  let currentFit: "contain" | "cover" | "fill" = (urlParams.get("fit") as "contain" | "cover" | "fill") || "contain";
  let activeTab: "iframe" | "link" | "sdk" = "iframe";

  let activePlayer: AutoPlayer | null = null;

  const typeBtnMovie = document.getElementById("type-btn-movie") as HTMLButtonElement | null;
  const typeBtnTv = document.getElementById("type-btn-tv") as HTMLButtonElement | null;
  const idInput = document.getElementById("studio-id-input") as HTMLInputElement | null;
  const seasonGroup = document.getElementById("studio-season-group") as HTMLElement | null;
  const seasonInput = document.getElementById("studio-season-input") as HTMLInputElement | null;
  const episodeInput = document.getElementById("studio-episode-input") as HTMLInputElement | null;
  const fetchBtn = document.getElementById("studio-btn-fetch") as HTMLButtonElement | null;
  const presetChips = document.querySelectorAll<HTMLButtonElement>(".studio-preset-chip");

  const posterImg = document.getElementById("studio-poster-img") as HTMLImageElement | null;
  const posterPlaceholder = document.getElementById("studio-poster-placeholder") as HTMLElement | null;
  const titleEl = document.getElementById("studio-title") as HTMLElement | null;
  const yearEl = document.getElementById("studio-year") as HTMLElement | null;
  const ratingEl = document.getElementById("studio-rating") as HTMLElement | null;
  const contentRatingEl = document.getElementById("studio-content-rating") as HTMLElement | null;
  const durationEl = document.getElementById("studio-duration") as HTMLElement | null;
  const genresEl = document.getElementById("studio-genres") as HTMLElement | null;
  const overviewEl = document.getElementById("studio-overview") as HTMLElement | null;
  const healthServersEl = document.getElementById("studio-health-servers") as HTMLElement | null;
  const healthStreamEl = document.getElementById("studio-health-stream") as HTMLElement | null;

  const teleEngineEl = document.getElementById("studio-tele-engine") as HTMLElement | null;
  const teleServerEl = document.getElementById("studio-tele-server") as HTMLElement | null;
  const teleAudioEl = document.getElementById("studio-tele-audio") as HTMLElement | null;
  const teleAspectEl = document.getElementById("studio-tele-aspect") as HTMLElement | null;

  const cfgBrand = document.getElementById("cfg-brand") as HTMLInputElement | null;
  const cfgColorHex = document.getElementById("cfg-color-hex") as HTMLInputElement | null;
  const colorSwatches = document.querySelectorAll<HTMLButtonElement>(".studio-color-swatch");
  const cfgAutoplay = document.getElementById("cfg-autoplay") as HTMLInputElement | null;
  const cfgMuted = document.getElementById("cfg-muted") as HTMLInputElement | null;
  const cfgFit = document.getElementById("cfg-fit") as HTMLSelectElement | null;

  const tabIframe = document.getElementById("tab-code-iframe") as HTMLButtonElement | null;
  const tabLink = document.getElementById("tab-code-link") as HTMLButtonElement | null;
  const tabSdk = document.getElementById("tab-code-sdk") as HTMLButtonElement | null;
  const tabLabel = document.getElementById("studio-tab-label") as HTMLElement | null;
  const codeOutput = document.getElementById("studio-code-output") as HTMLElement | null;
  const copyBtn = document.getElementById("studio-btn-copy") as HTMLButtonElement | null;
  const sandboxBtn = document.getElementById("studio-btn-sandbox") as HTMLButtonElement | null;
  const launchBtn = document.getElementById("studio-btn-launch") as HTMLButtonElement | null;
  const navDirectCinema = document.getElementById("nav-btn-direct-cinema") as HTMLButtonElement | null;

  const sandboxModal = document.getElementById("studio-sandbox-modal") as HTMLElement | null;
  const sandboxFrame = document.getElementById("studio-sandbox-frame") as HTMLIFrameElement | null;
  const sandboxClose = document.getElementById("studio-sandbox-close") as HTMLButtonElement | null;

  const infoModal = document.getElementById("studio-info-modal") as HTMLElement | null;
  const infoTitle = document.getElementById("studio-info-title") as HTMLElement | null;
  const infoContent = document.getElementById("studio-info-content") as HTMLElement | null;
  const infoClose = document.getElementById("studio-info-close") as HTMLButtonElement | null;
  const toast = document.getElementById("studio-toast") as HTMLElement | null;
  const toastMsg = document.getElementById("studio-toast-msg") as HTMLElement | null;

  if (idInput) idInput.value = currentId;
  if (seasonInput) seasonInput.value = String(currentSeason);
  if (episodeInput) episodeInput.value = String(currentEpisode);
  if (cfgBrand) cfgBrand.value = currentBrand;
  if (cfgColorHex) cfgColorHex.value = currentColor;
  if (cfgAutoplay) cfgAutoplay.checked = currentAutoplay;
  if (cfgMuted) cfgMuted.checked = currentMuted;
  if (cfgFit) cfgFit.value = currentFit;

  function updateTypeUI(): void {
    if (currentType === "movie") {
      typeBtnMovie?.classList.add("active");
      typeBtnTv?.classList.remove("active");
      if (seasonGroup) seasonGroup.style.display = "none";
      if (idInput) idInput.placeholder = "Enter TMDB Movie ID (e.g. 1236045) or IMDb ID (e.g. tt1375666)...";
    } else {
      typeBtnTv?.classList.add("active");
      typeBtnMovie?.classList.remove("active");
      if (seasonGroup) seasonGroup.style.display = "flex";
      if (idInput) idInput.placeholder = "Enter TMDB TV ID (e.g. 94997) or IMDb ID...";
    }
  }

  function highlightPresetChip(): void {
    presetChips.forEach((chip) => {
      const pType = chip.getAttribute("data-type");
      const pId = chip.getAttribute("data-id");
      if (currentId && pType === currentType && pId === currentId) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }

  function getEmbedUrl(): string {
    const origin = window.location.origin;
    const cleanColor = currentColor.replace("#", "");
    const q = new URLSearchParams();
    q.set("type", currentType);
    q.set("id", currentId || "YOUR_ID");
    if (currentType === "tv") {
      q.set("s", String(currentSeason));
      q.set("e", String(currentEpisode));
    }
    if (currentBrand) q.set("brand", currentBrand);
    if (cleanColor) q.set("color", cleanColor);
    if (currentFit && currentFit !== "contain") q.set("fit", currentFit);
    if (currentAutoplay) q.set("autoplay", "1");
    if (currentMuted) q.set("muted", "1");
    q.set("embed", "1");
    return `${origin}/auto?${q.toString()}`;
  }

  function getDirectUrl(): string {
    return getEmbedUrl();
  }

  function renderCode(): void {
    if (!codeOutput) return;
    const embedUrl = getEmbedUrl();
    const directUrl = getDirectUrl();

    if (activeTab === "iframe") {
      if (tabLabel) tabLabel.textContent = "Responsive Iframe Snippet";
      codeOutput.textContent = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="100%"\n  frameborder="0"\n  scrolling="no"\n  allowfullscreen\n  allow="autoplay; encrypted-media; picture-in-picture">\n</iframe>`;
    } else if (activeTab === "link") {
      if (tabLabel) tabLabel.textContent = "Direct Player URL";
      codeOutput.textContent = directUrl;
    } else if (activeTab === "sdk") {
      if (tabLabel) tabLabel.textContent = "Modular JavaScript SDK";
      codeOutput.textContent = `<div id="auto-stream-container" style="width:100%;aspect-ratio:16/9;"></div>\n<script type="module">\n  import { AutoPlayer } from "${window.location.origin}/src/auto/autoPlayer.ts";\n  const player = new AutoPlayer(document.getElementById("auto-stream-container"), {\n    type: "${currentType}",\n    id: "${currentId}",${currentType === "tv" ? `\n    season: ${currentSeason},\n    episode: ${currentEpisode},` : ""}\n    brand: "${currentBrand}",\n    color: "${currentColor}",\n    fit: "${currentFit}",\n    autoplay: ${currentAutoplay},\n    muted: ${currentMuted}\n  });\n</script>`;
    }
  }

  function showToast(message: string): void {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  }

  function scrollToPlayer(): void {
    if (window.innerWidth > 840) return;
    const stage = document.querySelector(".studio-player-stage") || document.getElementById("auto-player-root");
    if (!stage) return;
    const navHeader = document.querySelector(".studio-nav-header") as HTMLElement | null;
    const navHeight = navHeader ? navHeader.offsetHeight : 0;
    const rect = stage.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - navHeight - 10;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth"
    });
  }

  async function loadStream(syncUrl: boolean = true, shouldScroll: boolean = false): Promise<void> {
    if (!currentId) {
      renderIdleState();
      return;
    }
    updateTypeUI();
    highlightPresetChip();

    if (syncUrl) {
      const cleanColor = currentColor.replace("#", "");
      const q = new URLSearchParams();
      q.set("type", currentType);
      q.set("id", currentId);
      if (currentType === "tv") {
        q.set("s", String(currentSeason));
        q.set("e", String(currentEpisode));
      }
      if (currentBrand) q.set("brand", currentBrand);
      if (cleanColor) q.set("color", cleanColor);
      if (currentFit && currentFit !== "contain") q.set("fit", currentFit);
      window.history.replaceState({}, "", `${window.location.pathname}?${q.toString()}`);
    }

    if (healthServersEl) healthServersEl.textContent = "Resolving servers...";
    if (healthStreamEl) healthStreamEl.textContent = "Checking edge latency...";

    const metaPromise = fetchMediaDetails(currentType, currentId, currentSeason, currentEpisode);
    const sourcesPromise = fetchStreamSources(currentType, currentId, currentSeason, currentEpisode);
    const healthPromise = fetchStreamHealth(currentType, currentId, currentSeason, currentEpisode);

    const [meta, sourcesRes, healthRes] = await Promise.all([metaPromise, sourcesPromise, healthPromise]);

    if (titleEl) titleEl.textContent = meta.title;
    if (yearEl) yearEl.textContent = meta.year || "2026";
    if (durationEl) durationEl.textContent = meta.duration || (currentType === "tv" ? "45m" : "1h 48m");
    if (ratingEl) ratingEl.textContent = `★ ${meta.rating || 8.0}/10`;
    if (contentRatingEl) contentRatingEl.textContent = meta.contentRating || (currentType === "tv" ? "TV-MA" : "PG-13");
    if (overviewEl) overviewEl.textContent = meta.overview || "High-speed multi-server streaming source ready for instant playback.";
    if (posterPlaceholder) posterPlaceholder.style.display = "none";
    if (posterImg && meta.posterUrl) {
      posterImg.style.display = "block";
      posterImg.src = meta.posterUrl;
      posterImg.alt = `${meta.title} Poster`;
    }

    if (genresEl) {
      genresEl.innerHTML = "";
      const genreList = meta.genres && meta.genres.length > 0 ? meta.genres : ["Action", "Drama"];
      genreList.forEach((g) => {
        const span = document.createElement("span");
        span.className = "studio-genre-chip";
        span.textContent = g;
        genresEl.appendChild(span);
      });
    }

    const sources = sourcesRes.sources || [];
    const healthList = healthRes.results || [];
    const reachableCount = healthList.filter((h) => h.reachable).length;

    if (healthServersEl) {
      healthServersEl.textContent = `${sources.length} Servers Available (${reachableCount || sources.length} Online)`;
    }

    const directCastle = sources.find((s) => s.id === "server-direct-castle");
    if (healthStreamEl) {
      if (directCastle) {
        healthStreamEl.textContent = "Primary: Castle (Direct HLS 1080p/720p)";
      } else if (sources.length > 0) {
        healthStreamEl.textContent = `Primary: ${sources[0].label || sources[0].name} (Fast Fallback)`;
      } else {
        healthStreamEl.textContent = "Searching failover nodes...";
      }
    }

    if (teleEngineEl) teleEngineEl.textContent = directCastle ? "Castle Native HLS" : "Multi-CDN Embed Engine";
    if (teleServerEl) teleServerEl.textContent = directCastle ? "Castle Server 1" : (sources[0]?.name || "Toulouse");
    if (teleAudioEl) {
      if (directCastle?.audioStreams && directCastle.audioStreams.length > 0) {
        teleAudioEl.textContent = directCastle.audioStreams.map((a) => a.label).join(", ");
      } else {
        teleAudioEl.textContent = "Original Multi-Channel Stereo";
      }
    }
    if (teleAspectEl) {
      teleAspectEl.textContent = currentFit === "cover" ? "Fill Screen (cover)" : currentFit === "fill" ? "Stretch (fill)" : "Fit (contain) [Default]";
    }

    if (activePlayer) {
      activePlayer.destroy();
      activePlayer = null;
    }

    const playerConfig: AutoPlayerConfig = {
      type: currentType,
      id: currentId,
      season: currentType === "tv" ? currentSeason : undefined,
      episode: currentType === "tv" ? currentEpisode : undefined,
      title: meta.title,
      brand: currentBrand,
      color: currentColor,
      autoplay: currentAutoplay,
      muted: currentMuted,
      fit: currentFit
    };

    const playerTarget = document.getElementById("auto-player-root");
    if (!playerTarget) return;
    playerTarget.dataset.initialized = "true";
    activePlayer = new AutoPlayer(playerTarget, playerConfig);

    renderCode();
    if (shouldScroll) {
      setTimeout(() => scrollToPlayer(), 120);
    }
  }

  function renderIdleState(): void {
    updateTypeUI();
    highlightPresetChip();
    if (activePlayer) {
      activePlayer.destroy();
      activePlayer = null;
    }
    const playerTarget = document.getElementById("auto-player-root");
    if (playerTarget) {
      playerTarget.innerHTML = `
        <div class="studio-stage-idle">
          <div class="studio-stage-idle-content">
            <div class="studio-stage-idle-icon">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <div class="studio-stage-idle-title">Select a Preset or Enter an ID</div>
            <div class="studio-stage-idle-sub">Click any Popular Preset chip above or enter a TMDB/IMDb ID to start streaming.</div>
            <div class="studio-stage-idle-badges">
              <span class="studio-idle-badge">Castle HLS 1080p</span>
              <span class="studio-idle-badge">Multi-Audio &amp; Subtitles</span>
              <span class="studio-idle-badge">Edge CDN Failover</span>
            </div>
          </div>
        </div>
      `;
    }
    if (posterPlaceholder) posterPlaceholder.style.display = "flex";
    if (posterImg) posterImg.style.display = "none";
    if (titleEl) titleEl.textContent = "Ready to Stream";
    if (yearEl) yearEl.textContent = "Multi-Server";
    if (ratingEl) ratingEl.textContent = "★ Adaptive HLS";
    if (contentRatingEl) contentRatingEl.textContent = "HD";
    if (durationEl) durationEl.textContent = "Standby";
    if (overviewEl) overviewEl.textContent = "Select any Popular Preset above or enter a TMDB / IMDb ID and click 'Fetch & Play' to preview live streaming sources with automated edge failover.";
    if (genresEl) {
      genresEl.innerHTML = `
        <span class="studio-genre-chip">TMDB / IMDb</span>
        <span class="studio-genre-chip">Multi-Audio</span>
        <span class="studio-genre-chip">Subtitles</span>
      `;
    }
    if (healthServersEl) healthServersEl.textContent = "12 CDN Edge Nodes Active";
    if (healthStreamEl) healthStreamEl.textContent = "Primary: Castle (Direct HLS 1080p)";
    if (teleEngineEl) teleEngineEl.textContent = "Castle Native HLS";
    if (teleServerEl) teleServerEl.textContent = "Edge Node Standby";
    if (teleAudioEl) teleAudioEl.textContent = "Original Multi-Channel Stereo";
    if (teleAspectEl) teleAspectEl.textContent = "Fit (contain) [Default]";
    renderCode();
  }

  typeBtnMovie?.addEventListener("click", () => {
    if (currentType === "movie") return;
    currentType = "movie";
    updateTypeUI();
    if (currentId) {
      loadStream(true);
    } else {
      renderIdleState();
    }
  });

  typeBtnTv?.addEventListener("click", () => {
    if (currentType === "tv") return;
    currentType = "tv";
    currentSeason = 1;
    currentEpisode = 1;
    if (seasonInput) seasonInput.value = "1";
    if (episodeInput) episodeInput.value = "1";
    updateTypeUI();
    if (currentId) {
      loadStream(true);
    } else {
      renderIdleState();
    }
  });

  fetchBtn?.addEventListener("click", () => {
    const val = idInput ? idInput.value.trim() : "";
    if (!val) {
      idInput?.focus();
      return;
    }
    currentId = val;
    if (seasonInput) currentSeason = parseInt(seasonInput.value, 10) || 1;
    if (episodeInput) currentEpisode = parseInt(episodeInput.value, 10) || 1;
    scrollToPlayer();
    loadStream(true, true);
  });

  idInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      fetchBtn?.click();
    }
  });

  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const pType = chip.getAttribute("data-type") as "movie" | "tv";
      const pId = chip.getAttribute("data-id");
      const pS = chip.getAttribute("data-season");
      const pE = chip.getAttribute("data-episode");
      if (pType) currentType = pType;
      if (pId) currentId = pId;
      if (pS) currentSeason = parseInt(pS, 10);
      if (pE) currentEpisode = parseInt(pE, 10);

      if (idInput) idInput.value = currentId;
      if (seasonInput && pS) seasonInput.value = pS;
      if (episodeInput && pE) episodeInput.value = pE;

      scrollToPlayer();
      loadStream(true, true);
    });
  });

  cfgBrand?.addEventListener("input", () => {
    currentBrand = cfgBrand.value.trim() || "SumanMovies";
    renderCode();
  });

  cfgColorHex?.addEventListener("input", () => {
    const val = cfgColorHex.value.trim();
    if (val) {
      currentColor = val.startsWith("#") ? val : `#${val}`;
      colorSwatches.forEach((s) => {
        if (s.getAttribute("data-color")?.toLowerCase() === currentColor.toLowerCase()) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
      renderCode();
    }
  });

  colorSwatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      colorSwatches.forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      const col = swatch.getAttribute("data-color");
      if (col) {
        currentColor = col;
        if (cfgColorHex) cfgColorHex.value = col;
        renderCode();
      }
    });
  });

  cfgAutoplay?.addEventListener("change", () => {
    currentAutoplay = !!cfgAutoplay.checked;
    renderCode();
  });

  cfgMuted?.addEventListener("change", () => {
    currentMuted = !!cfgMuted.checked;
    renderCode();
  });

  cfgFit?.addEventListener("change", () => {
    currentFit = (cfgFit.value as "contain" | "cover" | "fill") || "contain";
    if (teleAspectEl) {
      teleAspectEl.textContent = currentFit === "cover" ? "Fill Screen (cover)" : currentFit === "fill" ? "Stretch (fill)" : "Fit (contain) [Default]";
    }
    renderCode();
  });

  const tabButtons = [
    { btn: tabIframe, tab: "iframe" as const },
    { btn: tabLink, tab: "link" as const },
    { btn: tabSdk, tab: "sdk" as const }
  ];

  tabButtons.forEach(({ btn, tab }) => {
    btn?.addEventListener("click", () => {
      tabButtons.forEach((t) => t.btn?.classList.remove("active"));
      btn.classList.add("active");
      activeTab = tab;
      renderCode();
    });
  });

  copyBtn?.addEventListener("click", async () => {
    const text = codeOutput?.textContent || "";
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Code copied to clipboard!");
    } catch {
      showToast("Failed to copy code");
    }
  });

  sandboxBtn?.addEventListener("click", () => {
    if (!sandboxModal || !sandboxFrame) return;
    sandboxFrame.src = getEmbedUrl();
    sandboxModal.classList.add("visible");
  });

  sandboxClose?.addEventListener("click", () => {
    if (!sandboxModal || !sandboxFrame) return;
    sandboxModal.classList.remove("visible");
    sandboxFrame.src = "about:blank";
  });

  sandboxModal?.addEventListener("click", (e) => {
    if (e.target === sandboxModal) {
      sandboxModal.classList.remove("visible");
      if (sandboxFrame) sandboxFrame.src = "about:blank";
    }
  });

  launchBtn?.addEventListener("click", () => {
    window.open(getEmbedUrl(), "_blank", "noopener,noreferrer");
  });

  navDirectCinema?.addEventListener("click", () => {
    window.open(getEmbedUrl(), "_blank", "noopener,noreferrer");
  });

  function showLegalModal(title: string, html: string): void {
    if (!infoModal || !infoTitle || !infoContent) return;
    infoTitle.textContent = title;
    infoContent.innerHTML = html;
    infoModal.classList.add("visible");
  }

  infoClose?.addEventListener("click", () => {
    infoModal?.classList.remove("visible");
  });

  infoModal?.addEventListener("click", (e) => {
    if (e.target === infoModal) {
      infoModal.classList.remove("visible");
    }
  });

  document.getElementById("footer-about-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    showLegalModal(
      "About VidEmbed Auto Stream",
      `<p>VidEmbed Auto Stream is a production-grade multi-server streaming architecture engineered for developers, media hubs, and high-traffic portals.</p>
       <p style="margin-top:12px;">Featuring automatic failover across edge CDN nodes, HLS adaptive bitrate selection, multi-audio language switching, and instant embed code generation.</p>
       <p style="margin-top:12px;">All systems and codebases are built, designed, and maintained by <strong>SumanOnline Web Services</strong> (<a href="https://sumanonline.com" target="_blank" rel="noopener" style="color:#06b6d4;text-decoration:underline;">SumanOnline.Com</a>).</p>`
    );
  });

  document.getElementById("footer-privacy-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    showLegalModal(
      "Privacy Policy",
      `<p>VidEmbed respects user privacy. We do not track personal identifying information, store cookies for advertising, or log user browsing histories.</p>
       <p style="margin-top:12px;">All stream resolution queries are processed in-memory through anonymous edge routing.</p>
       <p style="margin-top:12px;">For compliance inquiries, contact <strong>SumanOnline Web Services</strong> via <a href="https://sumanonline.com" target="_blank" rel="noopener" style="color:#06b6d4;text-decoration:underline;">SumanOnline.Com</a>.</p>`
    );
  });

  document.getElementById("footer-terms-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    showLegalModal(
      "Terms & Conditions",
      `<p>By utilizing VidEmbed and AutoEmbed players, you agree to comply with international copyright laws and fair use regulations.</p>
       <p style="margin-top:12px;">VidEmbed acts as a distributed media indexing interface and does not host media files on its application servers.</p>
       <p style="margin-top:12px;">Maintained and licensed by <strong>SumanOnline Web Services</strong> (<a href="https://sumanonline.com" target="_blank" rel="noopener" style="color:#06b6d4;text-decoration:underline;">SumanOnline.Com</a>).</p>`
    );
  });

  if (currentId) {
    loadStream(false);
  } else {
    renderIdleState();
  }
}
