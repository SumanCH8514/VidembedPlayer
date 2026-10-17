import "movi-player/element";
import { attachFullscreenWatermark } from "./utils/watermark";
import { NativeCkinPlayer } from "./player/nativePlayer";

interface EmbedConfig {
  url?: string;
  src?: string;
  title?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  theme?: string;
  accent?: string;
  ambient?: boolean;
  starttime?: number;
  fit?: string;
  aspect?: string;
}

function parseParameters(): EmbedConfig {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");

  if (dataParam) {
    try {
      const decoded = decodeURIComponent(dataParam);
      const json = JSON.parse(atob(decoded));
      return json as EmbedConfig;
    } catch {
      return {};
    }
  }

  const parseBoolean = (val: string | null, defVal: boolean): boolean => {
    if (val === null) return defVal;
    return val === "1" || val === "true" || val === "";
  };

  const parseNumber = (val: string | null): number | undefined => {
    if (!val) return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  };

  const rawFit = params.get("fit") || params.get("aspect") || params.get("objectfit") || "contain";
  const normalizedFit = rawFit === "fit" ? "contain" : rawFit;

  return {
    url: params.get("url") || params.get("src") || undefined,
    title: params.get("title") || undefined,
    poster: params.get("poster") || "/assets/img/image.png",
    autoplay: parseBoolean(params.get("autoplay"), false),
    muted: parseBoolean(params.get("muted"), false),
    controls: parseBoolean(params.get("controls"), true),
    loop: parseBoolean(params.get("loop"), false),
    theme: params.get("theme") || "dark",
    accent: params.get("accent") || undefined,
    ambient: parseBoolean(params.get("ambient"), false),
    starttime: parseNumber(params.get("starttime")),
    fit: normalizedFit
  };
}

function initEmbedPlayer(): void {
  const wasmPlayer = document.getElementById("vidembed-wasm-player") as any;
  const nativeContainer = document.getElementById("player-container");
  const alertOverlay = document.getElementById("embed-alert");
  const alertTitle = document.getElementById("embed-alert-title");
  const alertDesc = document.getElementById("embed-alert-desc");
  const retryBtn = document.getElementById("embed-alert-retry");

  if (!wasmPlayer || !nativeContainer) return;

  const config = parseParameters();
  let targetUrl = config.url || config.src;
  let currentTitle = config.title;
  let currentPoster = config.poster || "/assets/img/image.png";

  if (config.accent) {
    document.documentElement.style.setProperty("--accent-color", config.accent);
    wasmPlayer.style.setProperty("--movi-primary-accent", config.accent);
  }

  if (config.theme === "light") {
    document.documentElement.style.setProperty("--bg-color", "#f8fafc");
    document.documentElement.style.setProperty("--text-color", "#0f172a");
    wasmPlayer.setAttribute("theme", "light");
  } else {
    wasmPlayer.setAttribute("theme", "dark");
  }

  const effectiveFit = config.fit === "fill" ? "fill" : config.fit === "cover" ? "cover" : config.fit === "zoom" ? "zoom" : "contain";
  wasmPlayer.setAttribute("objectfit", effectiveFit);
  wasmPlayer.setAttribute("posterfit", effectiveFit);

  let activeEngine: "wasm" | "native" = "wasm";
  let nativePlayer: NativeCkinPlayer | null = null;

  attachFullscreenWatermark(wasmPlayer);

  const postToParent = (event: string, payload?: any): void => {
    if (window.parent && window.parent !== window) {
      const activeObj = activeEngine === "native" && nativePlayer ? nativePlayer.video : wasmPlayer;
      window.parent.postMessage({
        source: "vidembed",
        event,
        payload: payload || {
          currentTime: activeObj?.currentTime || 0,
          duration: activeObj?.duration || 0,
          paused: activeObj?.paused ?? true,
          muted: activeObj?.muted ?? false,
          volume: activeObj?.volume ?? 1
        }
      }, "*");
    }
  };

  const switchToNativeFallback = (): void => {
    if (activeEngine === "native") return;
    activeEngine = "native";

    try { wasmPlayer.pause(); } catch {}
    wasmPlayer.style.display = "none";
    nativeContainer.style.display = "block";

    if (!nativePlayer) {
      nativePlayer = new NativeCkinPlayer(nativeContainer, {
        src: targetUrl,
        title: currentTitle,
        poster: currentPoster,
        autoplay: config.autoplay || true,
        muted: config.muted,
        controls: config.controls,
        loop: config.loop,
        ambient: config.ambient,
        accent: config.accent,
        starttime: config.starttime,
        fit: effectiveFit as any
      });

      nativePlayer.on("play", () => {
        if (alertOverlay) alertOverlay.classList.remove("visible");
        postToParent("play");
      });
      nativePlayer.on("pause", () => postToParent("pause"));
      nativePlayer.on("ended", () => postToParent("ended"));
      nativePlayer.on("timeupdate", (p) => {
        if (alertOverlay && nativePlayer && nativePlayer.video.currentTime > 0) {
          alertOverlay.classList.remove("visible");
        }
        postToParent("timeupdate", p);
      });
      nativePlayer.on("volumechange", (p) => postToParent("volumechange", p));

      nativePlayer.on("error", (err) => {
        if (nativePlayer && nativePlayer.video.currentTime > 0) return;
        if (alertOverlay && alertTitle && alertDesc) {
          alertTitle.textContent = "Playback Error";
          alertDesc.textContent = "Could not load video source. Verify the link and availability.";
          alertOverlay.classList.add("visible");
        }
        postToParent("error", err);
      });
    } else if (targetUrl) {
      nativePlayer.setPoster(currentPoster);
      nativePlayer.loadSource(targetUrl, currentTitle, config.starttime);
      nativePlayer.play();
    }
  };

  const loadSourceWithWasmPriority = (url: string, title?: string, poster?: string, starttime?: number): void => {
    if (alertOverlay) alertOverlay.classList.remove("visible");
    targetUrl = url;
    if (title !== undefined) currentTitle = title;
    if (poster !== undefined) currentPoster = poster;
    activeEngine = "wasm";

    if (nativePlayer) {
      try { nativePlayer.pause(); } catch {}
    }
    nativeContainer.style.display = "none";
    wasmPlayer.style.display = "block";

    if (currentTitle) wasmPlayer.setAttribute("title", currentTitle);
    wasmPlayer.setAttribute("poster", currentPoster);
    if (starttime && starttime > 0) {
      wasmPlayer.setAttribute("startat", String(starttime));
    }
    wasmPlayer.src = url;
    wasmPlayer.play().catch(() => {});
  };

  if (config.controls) {
    wasmPlayer.setAttribute("controls", "");
  } else {
    wasmPlayer.removeAttribute("controls");
  }

  if (config.autoplay) {
    wasmPlayer.setAttribute("autoplay", "");
    wasmPlayer.setAttribute("muted", "");
  }

  if (config.muted) {
    wasmPlayer.setAttribute("muted", "");
  }

  if (config.loop) {
    wasmPlayer.setAttribute("loop", "");
  }

  if (config.ambient) {
    wasmPlayer.setAttribute("ambientmode", "");
  }

  if (config.title) {
    wasmPlayer.setAttribute("title", config.title);
    wasmPlayer.setAttribute("showtitle", "");
  }

  wasmPlayer.setAttribute("poster", currentPoster);

  if (config.starttime && config.starttime > 0) {
    wasmPlayer.setAttribute("startat", String(config.starttime));
  }

  wasmPlayer.addEventListener("play", () => {
    if (alertOverlay) alertOverlay.classList.remove("visible");
    postToParent("play");
  });
  wasmPlayer.addEventListener("pause", () => postToParent("pause"));
  wasmPlayer.addEventListener("ended", () => postToParent("ended"));
  wasmPlayer.addEventListener("timeupdate", () => postToParent("timeupdate"));
  wasmPlayer.addEventListener("volumechange", () => postToParent("volumechange"));

  wasmPlayer.addEventListener("error", () => {
    switchToNativeFallback();
  });

  wasmPlayer.addEventListener("errordisplay", () => {
    switchToNativeFallback();
  });

  if (targetUrl) {
    wasmPlayer.src = targetUrl;
    wasmPlayer.play().catch(() => {});
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      if (alertOverlay) alertOverlay.classList.remove("visible");
      if (targetUrl) {
        loadSourceWithWasmPriority(targetUrl, currentTitle, currentPoster);
      }
    });
  }

  window.addEventListener("message", (e: MessageEvent) => {
    const data = e.data;
    if (!data || data.source !== "vidembed-host") return;

    if (data.action === "loadSource" && typeof data.value === "string") {
      loadSourceWithWasmPriority(data.value, data.title, data.poster, data.starttime);
      return;
    }

    if (activeEngine === "native" && nativePlayer) {
      switch (data.action) {
        case "play":
          nativePlayer.play();
          break;
        case "pause":
          nativePlayer.pause();
          break;
        case "seek":
          if (typeof data.value === "number") nativePlayer.seek(data.value);
          break;
        case "setVolume":
          if (typeof data.value === "number") nativePlayer.setVolume(data.value);
          break;
        case "setMuted":
          nativePlayer.setMuted(!!data.value);
          break;
        case "setSpeed":
          if (typeof data.value === "number") nativePlayer.setSpeed(data.value);
          break;
        case "setAspect":
        case "setFit":
          if (typeof data.value === "string") {
            const normalized = data.value === "fit" ? "contain" : data.value;
            nativePlayer.setFit(normalized);
          }
          break;
      }
    } else {
      switch (data.action) {
        case "play":
          wasmPlayer.play().catch(() => {});
          break;
        case "pause":
          wasmPlayer.pause();
          break;
        case "seek":
          if (typeof data.value === "number") wasmPlayer.currentTime = data.value;
          break;
        case "setVolume":
          if (typeof data.value === "number") wasmPlayer.volume = Math.max(0, Math.min(1, data.value));
          break;
        case "setMuted":
          wasmPlayer.muted = !!data.value;
          break;
        case "setSpeed":
          if (typeof data.value === "number") wasmPlayer.playbackRate = data.value;
          break;
        case "setAspect":
        case "setFit":
          if (typeof data.value === "string") {
            const normalized = data.value === "fit" ? "contain" : data.value;
            wasmPlayer.setAttribute("objectfit", normalized);
            wasmPlayer.setAttribute("posterfit", normalized);
          }
          break;
      }
    }
  });

  postToParent("ready", {
    configured: !!targetUrl,
    title: config.title
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEmbedPlayer);
} else {
  initEmbedPlayer();
}
