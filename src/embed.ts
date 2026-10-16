import "movi-player/element";
import { attachFullscreenWatermark } from "./utils/watermark";

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
    starttime: parseNumber(params.get("starttime"))
  };
}

function initEmbedPlayer(): void {
  const player = document.getElementById("vidembed-player") as any;
  const alertOverlay = document.getElementById("embed-alert");
  const alertTitle = document.getElementById("embed-alert-title");
  const alertDesc = document.getElementById("embed-alert-desc");
  const retryBtn = document.getElementById("embed-alert-retry");
  if (!player) return;

  attachFullscreenWatermark(player);

  const config = parseParameters();

  if (config.accent) {
    document.documentElement.style.setProperty("--accent-color", config.accent);
    player.style.setProperty("--movi-primary-accent", config.accent);
  }

  if (config.theme === "light") {
    player.setAttribute("theme", "light");
    document.documentElement.style.setProperty("--bg-color", "#f8fafc");
    document.documentElement.style.setProperty("--text-color", "#0f172a");
  } else {
    player.setAttribute("theme", "dark");
  }

  if (config.controls) {
    player.setAttribute("controls", "");
  } else {
    player.removeAttribute("controls");
  }

  if (config.autoplay) {
    player.setAttribute("autoplay", "");
    player.setAttribute("muted", "");
  }

  if (config.muted) {
    player.setAttribute("muted", "");
  }

  if (config.loop) {
    player.setAttribute("loop", "");
  }

  if (config.ambient) {
    player.setAttribute("ambientmode", "");
  }

  if (config.title) {
    player.setAttribute("title", config.title);
    player.setAttribute("showtitle", "");
  }

  player.setAttribute("poster", config.poster || "/assets/img/image.png");

  if (config.starttime && config.starttime > 0) {
    player.setAttribute("startat", String(config.starttime));
  }

  const targetUrl = config.url || config.src;
  if (targetUrl) {
    player.src = targetUrl;
  }

  const postToParent = (event: string, payload?: any): void => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        source: "vidembed",
        event,
        payload: payload || {
          currentTime: player.currentTime || 0,
          duration: player.duration || 0,
          paused: player.paused !== undefined ? player.paused : true,
          muted: player.muted || false,
          volume: player.volume !== undefined ? player.volume : 1
        }
      }, "*");
    }
  };

  const bindEvent = (name: string, mapping?: string): void => {
    player.addEventListener(name, () => {
      postToParent(mapping || name, {
        currentTime: player.currentTime || 0,
        duration: player.duration || 0,
        paused: player.paused !== undefined ? player.paused : true,
        muted: player.muted || false,
        volume: player.volume !== undefined ? player.volume : 1
      });
    });
  };

  bindEvent("play");
  bindEvent("pause");
  bindEvent("ended");
  bindEvent("timeupdate");
  bindEvent("volumechange");
  bindEvent("ratechange");
  bindEvent("loadedmetadata");
  bindEvent("canplay");

  player.addEventListener("error", (e: any) => {
    if (alertOverlay && alertTitle && alertDesc) {
      alertTitle.textContent = "Playback Error";
      alertDesc.textContent = "Could not load video source. If this is a cross-origin resource, make sure CORS headers are supported.";
      alertOverlay.classList.add("visible");
    }
    postToParent("error", { error: e?.message || "Playback error" });
  });

  player.addEventListener("errordisplay", (e: any) => {
    if (alertOverlay && alertTitle && alertDesc) {
      alertTitle.textContent = e.detail?.title || "Codec / Stream Error";
      alertDesc.textContent = e.detail?.message || "Unable to play stream format.";
      alertOverlay.classList.add("visible");
    }
    postToParent("error", e.detail);
  });

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      if (alertOverlay) alertOverlay.classList.remove("visible");
      if (targetUrl) {
        player.src = "";
        player.src = targetUrl;
        player.play().catch(() => {});
      }
    });
  }

  window.addEventListener("message", (e: MessageEvent) => {
    const data = e.data;
    if (!data || data.source !== "vidembed-host") return;

    switch (data.action) {
      case "play":
        player.play().catch(() => {});
        break;
      case "pause":
        player.pause();
        break;
      case "seek":
        if (typeof data.value === "number") {
          player.currentTime = data.value;
        }
        break;
      case "setVolume":
        if (typeof data.value === "number") {
          player.volume = Math.max(0, Math.min(1, data.value));
        }
        break;
      case "setMuted":
        player.muted = !!data.value;
        break;
      case "setSpeed":
        if (typeof data.value === "number") {
          player.playbackRate = data.value;
        }
        break;
      case "loadSource":
        if (typeof data.value === "string") {
          if (alertOverlay) alertOverlay.classList.remove("visible");
          if (data.title) player.setAttribute("title", data.title);
          player.setAttribute("poster", data.poster || "/assets/img/image.png");
          player.src = data.value;
          player.play().catch(() => {});
        }
        break;
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
