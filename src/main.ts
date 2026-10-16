import "movi-player/element";
import { attachFullscreenWatermark } from "./utils/watermark";

type CodeTab = "iframe" | "url" | "sdk" | "base64";

interface PlayerConfigState {
  url: string;
  title: string;
  poster: string;
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  loop: boolean;
  ambient: boolean;
  theme: string;
  accent: string;
}

let activeTab: CodeTab = "iframe";
let activeMode: "url" | "api" = "url";
let modalMutedState = false;
let modalSpeedState = 1.0;

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

function detectFormat(url: string): string {
  if (!url) return "Auto-detect";
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".mkv")) return "MKV (Matroska)";
  if (lower.endsWith(".avi")) return "AVI (DivX / MPEG-4)";
  if (lower.endsWith(".mp4")) return "MP4 (H.264 / HEVC)";
  if (lower.endsWith(".webm")) return "WebM (VP9 / AV1)";
  if (lower.endsWith(".m3u8")) return "HLS (HTTP Live Streaming)";
  if (lower.endsWith(".mpd")) return "MPEG-DASH";
  if (lower.endsWith(".ts")) return "MPEG-TS (Broadcast Stream)";
  return "Stream";
}

function showToast(message: string): void {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function initStudio(): void {
  const mainPlayer = document.getElementById("main-stage-player") as any;
  if (mainPlayer) {
    attachFullscreenWatermark(mainPlayer);
  }
  const urlInput = document.getElementById("source-url-input") as HTMLInputElement;
  const loadBtn = document.getElementById("load-url-btn") as HTMLButtonElement;
  const fileInput = document.getElementById("local-file-input") as HTMLInputElement;
  const presetButtons = document.querySelectorAll<HTMLButtonElement>(".preset-chip-btn");
  const standbyOverlay = document.getElementById("stage-standby-overlay");

  const telemetryStatus = document.getElementById("telemetry-status") as HTMLElement;
  const telemetryFormat = document.getElementById("telemetry-format") as HTMLElement;
  const telemetryTime = document.getElementById("telemetry-time") as HTMLElement;
  const telemetryEngine = document.getElementById("telemetry-engine") as HTMLElement;

  const cfgAutoplay = document.getElementById("cfg-autoplay") as HTMLInputElement;
  const cfgMuted = document.getElementById("cfg-muted") as HTMLInputElement;
  const cfgControls = document.getElementById("cfg-controls") as HTMLInputElement;
  const cfgLoop = document.getElementById("cfg-loop") as HTMLInputElement;
  const cfgAmbient = document.getElementById("cfg-ambient") as HTMLInputElement;
  const cfgTheme = document.getElementById("cfg-theme") as HTMLSelectElement;
  const cfgTitle = document.getElementById("cfg-title") as HTMLInputElement;
  const cfgPoster = document.getElementById("cfg-poster") as HTMLInputElement;
  const cfgAccent = document.getElementById("cfg-accent") as HTMLInputElement;
  const cfgAccentText = document.getElementById("cfg-accent-text") as HTMLInputElement;
  const colorPresets = document.querySelectorAll<HTMLElement>(".color-dot-preset");

  const modePillUrl = document.getElementById("mode-pill-url") as HTMLButtonElement;
  const modePillApi = document.getElementById("mode-pill-api") as HTMLButtonElement;
  const codeTabs = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
  const codeDisplay = document.getElementById("generated-code-display") as HTMLElement;
  const copyBtn = document.getElementById("copy-code-btn") as HTMLButtonElement;
  const activeTabLabel = document.getElementById("active-tab-label") as HTMLElement;

  const sandboxModal = document.getElementById("sandbox-modal") as HTMLElement;
  const openSandboxBtn = document.getElementById("open-sandbox-modal-btn") as HTMLButtonElement;
  const closeSandboxBtn = document.getElementById("close-sandbox-modal-btn") as HTMLButtonElement;
  const modalIframe = document.getElementById("modal-sandbox-iframe") as HTMLIFrameElement;

  const modalPlay = document.getElementById("modal-ctrl-play") as HTMLButtonElement;
  const modalPause = document.getElementById("modal-ctrl-pause") as HTMLButtonElement;
  const modalFwd = document.getElementById("modal-ctrl-fwd") as HTMLButtonElement;
  const modalMute = document.getElementById("modal-ctrl-mute") as HTMLButtonElement;
  const modalSpeed = document.getElementById("modal-ctrl-speed") as HTMLButtonElement;

  function getConfig(): PlayerConfigState {
    return {
      url: urlInput ? urlInput.value.trim() : "",
      title: cfgTitle ? cfgTitle.value.trim() : "",
      poster: cfgPoster ? cfgPoster.value.trim() : "",
      autoplay: cfgAutoplay ? cfgAutoplay.checked : false,
      muted: cfgMuted ? cfgMuted.checked : false,
      controls: cfgControls ? cfgControls.checked : true,
      loop: cfgLoop ? cfgLoop.checked : false,
      ambient: cfgAmbient ? cfgAmbient.checked : true,
      theme: cfgTheme ? cfgTheme.value : "dark",
      accent: cfgAccentText ? cfgAccentText.value.trim() : "#6366f1"
    };
  }

  function buildEmbedUrl(config: PlayerConfigState): string {
    const origin = window.location.origin;
    const base = `${origin}/embed`;
    const params = new URLSearchParams();

    if (config.url) params.set("url", config.url);
    if (config.title) params.set("title", config.title);
    params.set("poster", config.poster || "/assets/img/image.png");
    if (config.autoplay) params.set("autoplay", "1");
    if (config.muted) params.set("muted", "1");
    if (!config.controls) params.set("controls", "0");
    if (config.loop) params.set("loop", "1");
    if (config.ambient) params.set("ambient", "1");
    if (config.theme && config.theme !== "dark") params.set("theme", config.theme);
    if (config.accent && config.accent !== "#6366f1") params.set("accent", config.accent);

    return `${base}?${params.toString()}`;
  }

  function buildBase64Url(config: PlayerConfigState): string {
    const origin = window.location.origin;
    const base = `${origin}/embed`;
    const payload = {
      url: config.url || undefined,
      title: config.title || undefined,
      poster: config.poster || "/assets/img/image.png",
      autoplay: config.autoplay || undefined,
      muted: config.muted || undefined,
      controls: config.controls,
      loop: config.loop || undefined,
      ambient: config.ambient || undefined,
      theme: config.theme,
      accent: config.accent
    };
    const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
    return `${base}?data=${encoded}`;
  }

  function buildIframeCode(config: PlayerConfigState): string {
    const embedUrl = buildEmbedUrl(config);
    return `<div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:12px;">\n  <iframe\n    src="${embedUrl}"\n    title="${config.title || 'VidEmbed Player'}"\n    style="width:100%;height:100%;border:none;"\n    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"\n    allowfullscreen>\n  </iframe>\n</div>`;
  }

  function buildSdkCode(config: PlayerConfigState): string {
    const origin = window.location.origin;
    const posterVal = config.poster || "/assets/img/image.png";
    return `<script src="${origin}/vidembed.js"></script>\n<div id="vidembed-root"></div>\n<script>\n  const player = VidEmbed.create('#vidembed-root', {\n    src: '${config.url}',\n    title: '${config.title}',\n    poster: '${posterVal}',\n    autoplay: ${config.autoplay},\n    muted: ${config.muted},\n    controls: ${config.controls},\n    loop: ${config.loop},\n    theme: '${config.theme}',\n    accent: '${config.accent}',\n    ambient: ${config.ambient}\n  });\n\n  player.on('play', () => console.log('Playing'));\n  player.on('pause', () => console.log('Paused'));\n  player.on('timeupdate', (e) => console.log(e.currentTime));\n</script>`;
  }

  function updateCode(): void {
    const config = getConfig();
    const embedUrl = buildEmbedUrl(config);

    if (modalIframe && sandboxModal && sandboxModal.classList.contains("active")) {
      if (modalIframe.src !== embedUrl) {
        modalIframe.src = embedUrl;
      }
    }

    if (codeDisplay) {
      if (activeTab === "iframe") {
        if (activeTabLabel) activeTabLabel.textContent = "Responsive Iframe Snippet";
        codeDisplay.textContent = buildIframeCode(config);
      } else if (activeTab === "url") {
        if (activeTabLabel) activeTabLabel.textContent = "Direct Shareable Player Link";
        codeDisplay.textContent = embedUrl;
      } else if (activeTab === "sdk") {
        if (activeTabLabel) activeTabLabel.textContent = "JavaScript Embed SDK Script";
        codeDisplay.textContent = buildSdkCode(config);
      } else if (activeTab === "base64") {
        if (activeTabLabel) activeTabLabel.textContent = "Base64 Compressed URL Parameter";
        codeDisplay.textContent = buildBase64Url(config);
      }
    }
  }

  function loadStream(url: string, title?: string, poster?: string): void {
    if (!url) return;
    if (urlInput) urlInput.value = url;
    if (title && cfgTitle) cfgTitle.value = title;
    if (poster && cfgPoster) cfgPoster.value = poster;

    if (standbyOverlay) {
      standbyOverlay.classList.add("hidden");
    }

    if (telemetryStatus) telemetryStatus.textContent = "Loading...";
    if (telemetryFormat) telemetryFormat.textContent = detectFormat(url);

    if (mainPlayer) {
      if (title) mainPlayer.setAttribute("title", title);
      const effectivePoster = poster || (cfgPoster && cfgPoster.value.trim()) || "/assets/img/image.png";
      mainPlayer.setAttribute("poster", effectivePoster);
      mainPlayer.src = url;
      mainPlayer.play().catch(() => {});
    }

    updateCode();
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", () => {
      const url = urlInput ? urlInput.value.trim() : "";
      if (!url) {
        if (urlInput) urlInput.focus();
        showToast("Please enter a video URL or click a sample preset");
        return;
      }
      loadStream(url, cfgTitle ? cfgTitle.value.trim() : undefined, cfgPoster ? cfgPoster.value.trim() : undefined);
    });
  }

  if (urlInput) {
    urlInput.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        loadStream(urlInput.value.trim());
      }
    });
    urlInput.addEventListener("input", updateCode);
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const file = files[0];
      const fileName = file.name;

      if (urlInput) urlInput.value = `[Local File]: ${fileName}`;
      if (cfgTitle) cfgTitle.value = fileName;
      if (standbyOverlay) standbyOverlay.classList.add("hidden");
      if (telemetryStatus) telemetryStatus.textContent = "Playing Local File";
      if (telemetryFormat) telemetryFormat.textContent = detectFormat(fileName);

      if (mainPlayer) {
        if (mainPlayer.setFile) {
          mainPlayer.setFile(file);
        } else {
          mainPlayer.src = file;
        }
        mainPlayer.setAttribute("title", fileName);
        mainPlayer.play().catch(() => {});
      }

      showToast(`Loaded local file: ${fileName}`);
    });
  }

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const u = btn.getAttribute("data-url") || "";
      const t = btn.getAttribute("data-title") || "";
      const p = btn.getAttribute("data-poster") || "";
      loadStream(u, t, p);
    });
  });

  const configInputs = [cfgAutoplay, cfgMuted, cfgControls, cfgLoop, cfgAmbient, cfgTheme, cfgTitle, cfgPoster];
  configInputs.forEach((input) => {
    if (input) {
      input.addEventListener("change", updateCode);
      input.addEventListener("input", updateCode);
    }
  });

  if (cfgAccent && cfgAccentText) {
    cfgAccent.addEventListener("input", () => {
      cfgAccentText.value = cfgAccent.value;
      updateCode();
    });
    cfgAccentText.addEventListener("input", () => {
      cfgAccent.value = cfgAccentText.value;
      updateCode();
    });
  }

  colorPresets.forEach((dot) => {
    dot.addEventListener("click", () => {
      const color = dot.getAttribute("data-color");
      if (color && cfgAccent && cfgAccentText) {
        cfgAccent.value = color;
        cfgAccentText.value = color;
        updateCode();
      }
    });
  });

  if (modePillUrl && modePillApi) {
    modePillUrl.addEventListener("click", () => {
      activeMode = "url";
      modePillUrl.classList.add("active");
      modePillApi.classList.remove("active");
      activeTab = "iframe";
      codeTabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === "iframe"));
      updateCode();
    });

    modePillApi.addEventListener("click", () => {
      activeMode = "api";
      modePillApi.classList.add("active");
      modePillUrl.classList.remove("active");
      activeTab = "sdk";
      codeTabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === "sdk"));
      updateCode();
    });
  }

  codeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      codeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = (tab.getAttribute("data-tab") as CodeTab) || "iframe";
      updateCode();
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = codeDisplay ? codeDisplay.textContent || "" : "";
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Code copied to clipboard!");
      }).catch(() => {
        showToast("Copy failed, please select manually");
      });
    });
  }

  const sendModalAction = (action: string, value?: any): void => {
    if (!modalIframe || !modalIframe.contentWindow) return;
    modalIframe.contentWindow.postMessage({
      source: "vidembed-host",
      action,
      value
    }, "*");
  };

  if (openSandboxBtn && sandboxModal && modalIframe) {
    openSandboxBtn.addEventListener("click", () => {
      const config = getConfig();
      modalIframe.src = buildEmbedUrl(config);
      sandboxModal.classList.add("active");
    });
  }

  if (closeSandboxBtn && sandboxModal && modalIframe) {
    closeSandboxBtn.addEventListener("click", () => {
      sandboxModal.classList.remove("active");
      modalIframe.src = "about:blank";
    });
  }

  if (modalPlay) {
    modalPlay.addEventListener("click", () => sendModalAction("play"));
  }
  if (modalPause) {
    modalPause.addEventListener("click", () => sendModalAction("pause"));
  }
  if (modalFwd) {
    modalFwd.addEventListener("click", () => {
      sendModalAction("seek", 15);
      showToast("Seeked to 00:15");
    });
  }
  if (modalMute) {
    modalMute.addEventListener("click", () => {
      modalMutedState = !modalMutedState;
      sendModalAction("setMuted", modalMutedState);
      showToast(modalMutedState ? "Audio muted" : "Audio unmuted");
    });
  }
  if (modalSpeed) {
    modalSpeed.addEventListener("click", () => {
      modalSpeedState = modalSpeedState === 1.0 ? 1.5 : 1.0;
      sendModalAction("setSpeed", modalSpeedState);
      modalSpeed.textContent = `${modalSpeedState}x Speed`;
      showToast(`Playback speed set to ${modalSpeedState}x`);
    });
  }

  if (mainPlayer) {
    mainPlayer.addEventListener("play", () => {
      if (telemetryStatus) telemetryStatus.textContent = "Playing";
    });
    mainPlayer.addEventListener("pause", () => {
      if (telemetryStatus) telemetryStatus.textContent = "Paused";
    });
    mainPlayer.addEventListener("waiting", () => {
      if (telemetryStatus) telemetryStatus.textContent = "Buffering";
    });
    mainPlayer.addEventListener("timeupdate", () => {
      if (telemetryTime) {
        const cur = mainPlayer.currentTime || 0;
        const dur = mainPlayer.duration || 0;
        telemetryTime.textContent = `${formatSeconds(cur)} / ${formatSeconds(dur)}`;
      }
    });
    mainPlayer.addEventListener("loadedmetadata", () => {
      if (telemetryEngine) telemetryEngine.textContent = "Hardware Accelerated";
    });
  }

  const infoModal = document.getElementById("info-modal");
  const infoModalTitle = document.getElementById("info-modal-title");
  const infoModalSubtitle = document.getElementById("info-modal-subtitle");
  const infoModalContent = document.getElementById("info-modal-content");
  const infoModalClose = document.getElementById("info-modal-close");
  const footerAboutLink = document.getElementById("footer-about-link");
  const footerPrivacyLink = document.getElementById("footer-privacy-link");
  const footerTermsLink = document.getElementById("footer-terms-link");

  function openInfoModal(title: string, subtitle: string, htmlContent: string): void {
    if (infoModalTitle) infoModalTitle.textContent = title;
    if (infoModalSubtitle) infoModalSubtitle.textContent = subtitle;
    if (infoModalContent) infoModalContent.innerHTML = htmlContent;
    if (infoModal) infoModal.classList.add("active");
  }

  function closeInfoModal(): void {
    if (infoModal) infoModal.classList.remove("active");
  }

  if (infoModalClose) {
    infoModalClose.addEventListener("click", closeInfoModal);
  }
  if (infoModal) {
    infoModal.addEventListener("click", (e) => {
      if (e.target === infoModal) closeInfoModal();
    });
  }

  if (footerAboutLink) {
    footerAboutLink.addEventListener("click", (e) => {
      e.preventDefault();
      openInfoModal(
        "About VidEmbed",
        "A SumanOnline Project • SumanOnline Web Services",
        `<p style="margin-bottom:12px;"><strong>VidEmbed</strong> is a cutting-edge, universal web video player engine designed and maintained by <strong>SumanOnline Web Services</strong> (<a href="https://sumanonline.com" target="_blank" rel="noopener" style="color:var(--accent-primary);">SumanOnline.Com</a>).</p>
         <p style="margin-bottom:12px;">Built upon modern WebCodecs hardware decoding and WebAssembly FFmpeg demuxing capabilities, VidEmbed effortlessly plays arbitrary media containers including MP4, MKV, WebM, AVI, HLS (.m3u8), and MPEG-DASH (.mpd) directly inside any modern web browser without requiring heavy server-side transcoding infrastructure.</p>
         <p style="margin-bottom:12px;">Key highlights include seamless standalone iframe embedding, dynamic JavaScript SDK integration, multi-track audio selection, configurable ambient glow effects, customizable visual watermarking, and responsive performance across mobile and desktop environments.</p>`
      );
    });
  }

  if (footerPrivacyLink) {
    footerPrivacyLink.addEventListener("click", (e) => {
      e.preventDefault();
      openInfoModal(
        "Privacy Policy",
        "Last updated: 2026 • SumanOnline Web Services",
        `<p style="margin-bottom:12px;">At <strong>VidEmbed</strong> (a project by SumanOnline Web Services), user privacy is fundamental to our architectural design:</p>
         <ul style="padding-left:20px; margin-bottom:12px; display:flex; flex-direction:column; gap:8px;">
           <li><strong>100% Client-Side Demuxing:</strong> Media parsing and playback occur entirely inside your browser sandbox via WebCodecs and WebAssembly. Your video streams are never routed through or stored on external servers by VidEmbed.</li>
           <li><strong>No Tracking Cookies:</strong> The player and embedding system operate without tracking cookies, third-party analytics trackers, or fingerprinting scripts.</li>
           <li><strong>Zero Data Collection:</strong> We do not harvest, monetize, or transmit your playback history, URLs, or personal identifiable information.</li>
         </ul>
         <p>For inquiries, contact us at <a href="https://sumanonline.com" target="_blank" rel="noopener" style="color:var(--accent-primary);">SumanOnline.Com</a>.</p>`
      );
    });
  }

  if (footerTermsLink) {
    footerTermsLink.addEventListener("click", (e) => {
      e.preventDefault();
      openInfoModal(
        "Terms & Conditions",
        "Usage Guidelines • SumanOnline Web Services",
        `<p style="margin-bottom:12px;">By accessing or embedding <strong>VidEmbed Player</strong>, you agree to the following terms provided by <strong>SumanOnline Web Services</strong> (<a href="https://sumanonline.com" target="_blank" rel="noopener" style="color:var(--accent-primary);">SumanOnline.Com</a>):</p>
         <ul style="padding-left:20px; margin-bottom:12px; display:flex; flex-direction:column; gap:8px;">
           <li><strong>Permitted Use:</strong> VidEmbed is provided for embedding, previewing, and playing legally compliant media assets across educational, commercial, and personal web applications.</li>
           <li><strong>Content Responsibility:</strong> Users are solely responsible for ensuring they possess necessary rights, licensing, and CORS permissions for the video streams loaded into the player.</li>
           <li><strong>Availability:</strong> The software and SDK are provided on an as-is basis with high-availability client-side execution.</li>
         </ul>
         <p>Maintained by SumanOnline Web Services.</p>`
      );
    });
  }

  const initialUrl = urlInput ? urlInput.value.trim() : "";
  if (initialUrl && mainPlayer) {
    if (standbyOverlay) standbyOverlay.classList.add("hidden");
    mainPlayer.src = initialUrl;
  } else {
    if (telemetryStatus) telemetryStatus.textContent = "Standby (Select video)";
    if (telemetryFormat) telemetryFormat.textContent = "—";
    if (telemetryTime) telemetryTime.textContent = "00:00 / 00:00";
  }
  updateCode();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudio);
} else {
  initStudio();
}
