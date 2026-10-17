import "./nativePlayer.css";

export interface NativePlayerOptions {
  src?: string;
  title?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  ambient?: boolean;
  accent?: string;
  starttime?: number;
  fit?: "contain" | "cover" | "fill" | "zoom";
}

export type PlayerEventHandler = (payload?: any) => void;

const SVG_ICONS = {
  play: `<svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  volumeHigh: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  volumeMedium: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  volumeMute: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
  exitFullscreen: `<svg viewBox="0 0 24 24"><path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10H4m6 0V4m0 6L3 3m14 7h6m-6 0V4m0 6l7-7"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  watermark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
};

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const sStr = s < 10 ? `0${s}` : `${s}`;
  if (h > 0) {
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${h}:${mStr}:${sStr}`;
  }
  return `${m}:${sStr}`;
}

export class NativeCkinPlayer {
  public container: HTMLElement;
  public video: HTMLVideoElement;
  private canvas?: HTMLCanvasElement;
  private canvasCtx?: CanvasRenderingContext2D | null;
  private animFrameId?: number;
  private posterEl: HTMLImageElement;
  private bigPlayBtn: HTMLButtonElement;
  private spinnerEl: HTMLDivElement;
  private controlsEl: HTMLDivElement;
  private topBarEl: HTMLDivElement;
  private titleEl: HTMLSpanElement;
  private scrubBar: HTMLDivElement;
  private bufferBar: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private scrubHandle: HTMLDivElement;
  private playPauseBtn: HTMLButtonElement;
  private timeDisplay: HTMLSpanElement;
  private volumeBtn: HTMLButtonElement;
  private volumeSlider: HTMLInputElement;
  private volumeWrapper: HTMLDivElement;
  private speedBtn: HTMLButtonElement;
  private speedMenu: HTMLDivElement;
  private fullscreenBtn: HTMLButtonElement;
  private watermarkEl: HTMLDivElement;

  private isDraggingScrub: boolean = false;
  private hideControlsTimer?: number;
  private ambientEnabled: boolean = false;
  private listeners: Map<string, Set<PlayerEventHandler>> = new Map();
  private lastTapTime: number = 0;

  constructor(target: string | HTMLElement, options: NativePlayerOptions = {}) {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) {
      throw new Error(`Target container not found: ${target}`);
    }
    this.container = el;
    this.container.classList.add("ckin-container");

    if (options.accent) {
      this.container.style.setProperty("--accent-color", options.accent);
    }

    if (options.ambient) {
      this.ambientEnabled = true;
      this.canvas = document.createElement("canvas");
      this.canvas.className = "ckin-ambient-canvas";
      this.canvasCtx = this.canvas.getContext("2d", { willReadFrequently: false });
      this.container.appendChild(this.canvas);
    }

    this.video = document.createElement("video");
    this.video.className = "ckin-video";
    this.video.playsInline = true;
    this.video.setAttribute("playsinline", "true");
    this.video.setAttribute("webkit-playsinline", "true");
    this.video.preload = "auto";
    if (options.muted) this.video.muted = true;
    if (options.loop) this.video.loop = true;
    if (options.autoplay) {
      this.video.autoplay = true;
      this.video.muted = true;
    }
    this.container.appendChild(this.video);

    this.posterEl = document.createElement("img");
    this.posterEl.className = "ckin-poster";
    this.posterEl.src = options.poster || "/assets/img/image.png";
    this.posterEl.alt = options.title || "Video Preview";
    const initialFit = options.fit === "fill" ? "fill" : options.fit === "cover" ? "cover" : "contain";
    this.video.style.objectFit = initialFit;
    this.posterEl.style.objectFit = initialFit;
    this.container.appendChild(this.posterEl);

    this.spinnerEl = document.createElement("div");
    this.spinnerEl.className = "ckin-spinner";
    this.container.appendChild(this.spinnerEl);

    this.bigPlayBtn = document.createElement("button");
    this.bigPlayBtn.className = "ckin-big-play";
    this.bigPlayBtn.innerHTML = SVG_ICONS.play;
    this.bigPlayBtn.setAttribute("aria-label", "Play Video");
    this.container.appendChild(this.bigPlayBtn);

    this.topBarEl = document.createElement("div");
    this.topBarEl.className = "ckin-top-bar";
    this.titleEl = document.createElement("span");
    this.titleEl.className = "ckin-title";
    this.titleEl.textContent = options.title || "";
    this.topBarEl.appendChild(this.titleEl);

    this.watermarkEl = document.createElement("div");
    this.watermarkEl.className = "ckin-watermark";
    this.watermarkEl.innerHTML = `
      <div class="ckin-watermark-icon">${SVG_ICONS.watermark}</div>
      <div class="ckin-watermark-text">Vid<span>Embed</span></div>
    `;
    this.container.appendChild(this.watermarkEl);
    this.container.appendChild(this.topBarEl);

    this.controlsEl = document.createElement("div");
    this.controlsEl.className = "ckin-controls";
    if (options.controls === false) {
      this.controlsEl.style.display = "none";
      this.bigPlayBtn.style.display = "none";
    }

    this.scrubBar = document.createElement("div");
    this.scrubBar.className = "ckin-scrub-bar";
    this.bufferBar = document.createElement("div");
    this.bufferBar.className = "ckin-buffer-bar";
    this.progressBar = document.createElement("div");
    this.progressBar.className = "ckin-progress-bar";
    this.scrubHandle = document.createElement("div");
    this.scrubHandle.className = "ckin-scrub-handle";

    this.scrubBar.appendChild(this.bufferBar);
    this.scrubBar.appendChild(this.progressBar);
    this.scrubBar.appendChild(this.scrubHandle);
    this.controlsEl.appendChild(this.scrubBar);

    const controlsRow = document.createElement("div");
    controlsRow.className = "ckin-controls-row";

    const leftControls = document.createElement("div");
    leftControls.className = "ckin-controls-left";

    this.playPauseBtn = document.createElement("button");
    this.playPauseBtn.className = "ckin-btn";
    this.playPauseBtn.innerHTML = SVG_ICONS.play;
    this.playPauseBtn.setAttribute("aria-label", "Play");
    leftControls.appendChild(this.playPauseBtn);

    this.volumeWrapper = document.createElement("div");
    this.volumeWrapper.className = "ckin-volume-wrapper";
    this.volumeBtn = document.createElement("button");
    this.volumeBtn.className = "ckin-btn";
    this.volumeBtn.innerHTML = SVG_ICONS.volumeHigh;
    this.volumeBtn.setAttribute("aria-label", "Mute");

    const volSliderBox = document.createElement("div");
    volSliderBox.className = "ckin-volume-slider-box";
    this.volumeSlider = document.createElement("input");
    this.volumeSlider.type = "range";
    this.volumeSlider.className = "ckin-volume-slider";
    this.volumeSlider.min = "0";
    this.volumeSlider.max = "1";
    this.volumeSlider.step = "0.05";
    this.volumeSlider.value = options.muted ? "0" : "1";
    volSliderBox.appendChild(this.volumeSlider);

    this.volumeWrapper.appendChild(this.volumeBtn);
    this.volumeWrapper.appendChild(volSliderBox);
    leftControls.appendChild(this.volumeWrapper);

    this.timeDisplay = document.createElement("span");
    this.timeDisplay.className = "ckin-time-display";
    this.timeDisplay.innerHTML = `<span class="current">0:00</span> / 0:00`;
    leftControls.appendChild(this.timeDisplay);

    const rightControls = document.createElement("div");
    rightControls.className = "ckin-controls-right";

    const speedWrapper = document.createElement("div");
    speedWrapper.className = "ckin-speed-dropdown";
    this.speedBtn = document.createElement("button");
    this.speedBtn.className = "ckin-btn";
    this.speedBtn.innerHTML = SVG_ICONS.settings;
    this.speedBtn.setAttribute("aria-label", "Playback Speed");

    this.speedMenu = document.createElement("div");
    this.speedMenu.className = "ckin-speed-menu";
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    speeds.forEach((speed) => {
      const item = document.createElement("button");
      item.className = "ckin-speed-item" + (speed === 1.0 ? " active" : "");
      item.textContent = `${speed}x`;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setSpeed(speed);
        this.speedMenu.classList.remove("open");
        this.speedMenu.querySelectorAll(".ckin-speed-item").forEach((b) => b.classList.remove("active"));
        item.classList.add("active");
      });
      this.speedMenu.appendChild(item);
    });

    speedWrapper.appendChild(this.speedBtn);
    speedWrapper.appendChild(this.speedMenu);
    rightControls.appendChild(speedWrapper);

    this.fullscreenBtn = document.createElement("button");
    this.fullscreenBtn.className = "ckin-btn";
    this.fullscreenBtn.innerHTML = SVG_ICONS.fullscreen;
    this.fullscreenBtn.setAttribute("aria-label", "Fullscreen");
    rightControls.appendChild(this.fullscreenBtn);

    controlsRow.appendChild(leftControls);
    controlsRow.appendChild(rightControls);
    this.controlsEl.appendChild(controlsRow);

    this.container.appendChild(this.controlsEl);

    this.bindEvents();

    if (options.src) {
      this.loadSource(options.src, options.title, options.starttime);
    }
  }

  private bindEvents(): void {
    this.bigPlayBtn.addEventListener("click", () => this.togglePlay());
    this.playPauseBtn.addEventListener("click", () => this.togglePlay());

    this.video.addEventListener("play", () => {
      this.playPauseBtn.innerHTML = SVG_ICONS.pause;
      this.playPauseBtn.setAttribute("aria-label", "Pause");
      this.bigPlayBtn.classList.add("playing");
      this.posterEl.classList.add("hidden");
      this.startAmbientLoop();
      this.scheduleHideControls();
      this.emit("play");
    });

    this.video.addEventListener("pause", () => {
      this.playPauseBtn.innerHTML = SVG_ICONS.play;
      this.playPauseBtn.setAttribute("aria-label", "Play");
      this.bigPlayBtn.classList.remove("playing");
      this.showControls();
      this.emit("pause");
    });

    this.video.addEventListener("waiting", () => {
      this.spinnerEl.classList.add("active");
    });

    this.video.addEventListener("playing", () => {
      this.spinnerEl.classList.remove("active");
    });

    this.video.addEventListener("canplay", () => {
      this.spinnerEl.classList.remove("active");
    });

    this.video.addEventListener("timeupdate", () => {
      if (!this.isDraggingScrub && this.video.duration) {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.progressBar.style.width = `${percent}%`;
        this.scrubHandle.style.left = `${percent}%`;
      }
      const cur = formatSeconds(this.video.currentTime);
      const dur = formatSeconds(this.video.duration);
      this.timeDisplay.innerHTML = `<span class="current">${cur}</span> / ${dur}`;
      this.emit("timeupdate", { currentTime: this.video.currentTime, duration: this.video.duration });
    });

    this.video.addEventListener("progress", () => {
      if (this.video.buffered.length > 0 && this.video.duration) {
        const end = this.video.buffered.end(this.video.buffered.length - 1);
        const percent = (end / this.video.duration) * 100;
        this.bufferBar.style.width = `${percent}%`;
      }
    });

    this.video.addEventListener("volumechange", () => {
      this.volumeSlider.value = String(this.video.volume);
      if (this.video.muted || this.video.volume === 0) {
        this.volumeBtn.innerHTML = SVG_ICONS.volumeMute;
      } else if (this.video.volume < 0.5) {
        this.volumeBtn.innerHTML = SVG_ICONS.volumeMedium;
      } else {
        this.volumeBtn.innerHTML = SVG_ICONS.volumeHigh;
      }
      this.emit("volumechange", { volume: this.video.volume, muted: this.video.muted });
    });

    this.video.addEventListener("ended", () => {
      this.playPauseBtn.innerHTML = SVG_ICONS.play;
      this.bigPlayBtn.classList.remove("playing");
      this.showControls();
      this.emit("ended");
    });

    this.video.addEventListener("error", () => {
      this.spinnerEl.classList.remove("active");
      const err = this.video.error;
      if (err && this.video.src && this.video.src !== window.location.href) {
        this.emit("error", { code: err.code, message: err.message || "Media Error" });
      }
    });

    this.volumeBtn.addEventListener("click", () => {
      this.setMuted(!this.video.muted);
    });

    this.volumeSlider.addEventListener("input", (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.setVolume(val);
      if (val > 0 && this.video.muted) {
        this.video.muted = false;
      }
    });

    this.speedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.speedMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!this.speedMenu.contains(e.target as Node) && e.target !== this.speedBtn) {
        this.speedMenu.classList.remove("open");
      }
    });

    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());

    const handleScrubMove = (clientX: number) => {
      const rect = this.scrubBar.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.progressBar.style.width = `${pos * 100}%`;
      this.scrubHandle.style.left = `${pos * 100}%`;
      if (this.video.duration) {
        this.video.currentTime = pos * this.video.duration;
      }
    };

    this.scrubBar.addEventListener("pointerdown", (e) => {
      this.isDraggingScrub = true;
      this.scrubBar.classList.add("dragging");
      this.scrubBar.setPointerCapture(e.pointerId);
      handleScrubMove(e.clientX);
    });

    this.scrubBar.addEventListener("pointermove", (e) => {
      if (this.isDraggingScrub) {
        handleScrubMove(e.clientX);
      }
    });

    const endScrub = () => {
      if (this.isDraggingScrub) {
        this.isDraggingScrub = false;
        this.scrubBar.classList.remove("dragging");
      }
    };

    this.scrubBar.addEventListener("pointerup", endScrub);
    this.scrubBar.addEventListener("pointercancel", endScrub);

    this.container.addEventListener("pointermove", () => {
      this.showControls();
      this.scheduleHideControls();
    });

    this.container.addEventListener("pointerleave", () => {
      if (!this.video.paused) {
        this.hideControls();
      }
    });

    this.container.addEventListener("touchstart", (e) => {
      const now = Date.now();
      const rect = this.container.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;

      if (now - this.lastTapTime < 300) {
        if (touchX < rect.width * 0.35) {
          this.seek(Math.max(0, this.video.currentTime - 10));
        } else if (touchX > rect.width * 0.65) {
          this.seek(Math.min(this.video.duration || 0, this.video.currentTime + 10));
        } else {
          this.togglePlay();
        }
      } else {
        this.showControls();
        this.scheduleHideControls();
      }
      this.lastTapTime = now;
    });

    document.addEventListener("keydown", (e) => {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
        return;
      }
      if (!this.container.matches(":hover") && document.fullscreenElement !== this.container) {
        return;
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        this.seek(Math.max(0, this.video.currentTime - 5));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        this.seek(Math.min(this.video.duration || 0, this.video.currentTime + 5));
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        this.setVolume(Math.min(1, this.video.volume + 0.1));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        this.setVolume(Math.max(0, this.video.volume - 0.1));
      } else if (e.code === "KeyF") {
        e.preventDefault();
        this.toggleFullscreen();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        this.setMuted(!this.video.muted);
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const isFs = document.fullscreenElement === this.container;
      this.fullscreenBtn.innerHTML = isFs ? SVG_ICONS.exitFullscreen : SVG_ICONS.fullscreen;
      this.fullscreenBtn.setAttribute("aria-label", isFs ? "Exit Fullscreen" : "Fullscreen");
    });
  }

  private scheduleHideControls(): void {
    if (this.hideControlsTimer) clearTimeout(this.hideControlsTimer);
    this.hideControlsTimer = window.setTimeout(() => {
      if (!this.video.paused && !this.isDraggingScrub && !this.speedMenu.classList.contains("open")) {
        this.hideControls();
      }
    }, 2800);
  }

  private showControls(): void {
    this.controlsEl.classList.remove("hidden");
    this.topBarEl.classList.remove("hidden");
  }

  private hideControls(): void {
    this.controlsEl.classList.add("hidden");
    this.topBarEl.classList.add("hidden");
  }

  private startAmbientLoop(): void {
    if (!this.ambientEnabled || !this.canvas || !this.canvasCtx) return;
    const render = () => {
      if (this.video.paused || this.video.ended) return;
      if (this.video.readyState >= 2) {
        if (this.canvas!.width !== 64 || this.canvas!.height !== 36) {
          this.canvas!.width = 64;
          this.canvas!.height = 36;
        }
        try {
          this.canvasCtx!.drawImage(this.video, 0, 0, 64, 36);
        } catch {}
      }
      this.animFrameId = requestAnimationFrame(render);
    };
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(render);
  }

  public togglePlay(): void {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public play(): Promise<void> {
    return this.video.play().catch(() => {});
  }

  public pause(): void {
    this.video.pause();
  }

  public seek(seconds: number): void {
    if (!isNaN(seconds)) {
      this.video.currentTime = seconds;
    }
  }

  public setVolume(vol: number): void {
    this.video.volume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean): void {
    this.video.muted = muted;
  }

  public setSpeed(rate: number): void {
    this.video.playbackRate = rate;
  }

  public setFit(fit: string = "contain"): void {
    const normalized = fit === "fill" ? "fill" : fit === "cover" ? "cover" : "contain";
    this.video.style.objectFit = normalized;
    if (this.posterEl) {
      this.posterEl.style.objectFit = normalized;
    }
  }

  public toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  public loadSource(url: string, title?: string, starttime?: number): void {
    this.spinnerEl.classList.add("active");
    this.video.src = url;
    if (title !== undefined) {
      this.titleEl.textContent = title;
    }
    if (starttime && starttime > 0) {
      const onMeta = () => {
        this.video.currentTime = starttime;
        this.video.removeEventListener("loadedmetadata", onMeta);
      };
      this.video.addEventListener("loadedmetadata", onMeta);
    }
    this.video.load();
  }

  public setPoster(url: string): void {
    this.posterEl.src = url;
    this.posterEl.classList.remove("hidden");
  }

  public on(event: string, handler: PlayerEventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  public off(event: string, handler: PlayerEventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, payload?: any): void {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        fn(payload);
      } catch {}
    });
  }

  public destroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.hideControlsTimer) clearTimeout(this.hideControlsTimer);
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.container.innerHTML = "";
  }
}
