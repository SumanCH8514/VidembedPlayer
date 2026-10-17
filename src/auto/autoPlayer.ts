import "./autoPlayer.css";
import {
  StreamSource,
  HealthResult,
  MediaMetadata,
  AutoPlayerConfig
} from "./types";
import {
  fetchStreamSources,
  fetchStreamHealth,
  fetchMediaDetails
} from "./services/streamApi";

const SVG = {
  play: `<svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  replay10: `<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 13c0-4.42-3.58-8-8-8zm-1.5 6.5h-1V17h1.5v-4.5H12V11h-1.5v.5zm3.5 0c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5zm0 4.5h-.5v-3h.5v3z"/></svg>`,
  forward10: `<svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6 0 1.01.25 1.97.7 2.8l-1.46 1.46A7.93 7.93 0 0 1 4 13c0-4.42 3.58-8 8-8zm-1.5 6.5h-1V17h1.5v-4.5H12V11h-1.5v.5zm3.5 0c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5zm0 4.5h-.5v-3h.5v3z"/></svg>`,
  volumeHigh: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  volumeMute: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
  exitFullscreen: `<svg viewBox="0 0 24 24"><path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10H4m6 0V4m0 6L3 3m14 7h6m-6 0V4m0 6l7-7"/></svg>`,
  lock: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  unlock: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  pip: `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="8" height="6" rx="1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.4-1.4z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  serverRack: `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><line x1="6" y1="6.5" x2="6.01" y2="6.5" stroke-width="2.5" stroke="currentColor"/><line x1="6" y1="17.5" x2="6.01" y2="17.5" stroke-width="2.5" stroke="currentColor"/></svg>`,
  audioSubs: `<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM11 11H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z"/></svg>`
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const sStr = s < 10 ? `0${s}` : `${s}`;
  if (h > 0) {
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${h}:${mStr}:${sStr}`;
  }
  return `${m}:${sStr}`;
}

export class AutoPlayer {
  private container: HTMLElement;
  private config: AutoPlayerConfig;
  private sources: StreamSource[] = [];
  private healthMap: Map<string, HealthResult> = new Map();
  private activeSource: StreamSource | null = null;
  private activeQuality: string = "Auto";
  private activeAudioLang: string = "default";
  private metadata: MediaMetadata | null = null;

  private videoEl: HTMLVideoElement | null = null;
  private embedIframe: HTMLIFrameElement | null = null;
  private uiChrome!: HTMLElement;
  private topBar!: HTMLElement;
  private bottomBar!: HTMLElement;
  private centerPauseOverlay!: HTMLElement;
  private serverDrawer!: HTMLElement;
  private audioDrawer!: HTMLElement;
  private spinnerEl!: HTMLElement;
  private scrubBar!: HTMLElement;
  private bufferBar!: HTMLElement;
  private progressBar!: HTMLElement;
  private scrubThumb!: HTMLElement;
  private curTimeSpan!: HTMLElement;
  private durTimeSpan!: HTMLElement;
  private playBtn!: HTMLButtonElement;
  private qualityPillBtn!: HTMLButtonElement;
  private audioPillBtn!: HTMLButtonElement;
  private lockOverlay!: HTMLElement;

  private isDraggingScrub: boolean = false;
  private hideTimer?: number;
  private lastTapTime: number = 0;
  private isLocked: boolean = false;
  private volumeBoost: number = 1;
  private fitMode: "contain" | "cover" | "fill" = "contain";

  constructor(target: HTMLElement, customConfig?: AutoPlayerConfig) {
    this.container = target;
    this.config = customConfig || this.parseConfig();
    this.fitMode = this.config.fit || "contain";
    this.buildDOM();
    this.init();
  }

  public destroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.src = "";
      this.videoEl.load();
      this.videoEl = null;
    }
    if (this.embedIframe) {
      this.embedIframe.src = "about:blank";
      this.embedIframe = null;
    }
    this.container.innerHTML = "";
  }

  public getActiveSource(): StreamSource | null {
    return this.activeSource;
  }

  public getSources(): StreamSource[] {
    return this.sources;
  }

  private parseConfig(): AutoPlayerConfig {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    let type: "movie" | "tv" = "movie";
    let id = "1236045";
    let season: number | undefined;
    let episode: number | undefined;

    const moviePathMatch = path.match(/\/auto\/movie\/([a-zA-Z0-9_-]+)/);
    const tvPathMatch = path.match(/\/auto\/tv\/([a-zA-Z0-9_-]+)\/(\d+)\/(\d+)/);

    if (tvPathMatch) {
      type = "tv";
      id = tvPathMatch[1];
      season = parseInt(tvPathMatch[2], 10);
      episode = parseInt(tvPathMatch[3], 10);
    } else if (moviePathMatch) {
      type = "movie";
      id = moviePathMatch[1];
    } else {
      type = (params.get("type") as "movie" | "tv") || (params.get("s") ? "tv" : "movie");
      id = params.get("id") || params.get("tmdb") || (type === "tv" ? "123542" : "1236045");
      if (params.get("s") || params.get("season")) {
        season = parseInt(params.get("s") || params.get("season") || "1", 10);
      }
      if (params.get("e") || params.get("episode")) {
        episode = parseInt(params.get("e") || params.get("episode") || "1", 10);
      }
    }

    const rawFit = params.get("fit") || params.get("aspect") || "contain";
    const fit: "contain" | "cover" | "fill" = rawFit === "fill" ? "fill" : rawFit === "cover" ? "cover" : "contain";

    return {
      type,
      id,
      season,
      episode,
      brand: params.get("brand") || "SumanMovies",
      color: params.get("color") || undefined,
      server: params.get("server") || undefined,
      autoplay: params.get("autoplay") !== "0",
      muted: params.get("muted") === "1",
      fit
    };
  }

  private buildDOM(): void {
    this.container.innerHTML = `
      <div class="auto-viewport" id="auto-vp">
        <canvas class="auto-ambient-canvas" id="auto-ambient"></canvas>
        <div class="auto-screen-stage" id="auto-stage"></div>
        <div class="auto-touch-overlay" id="auto-touch">
          <div class="auto-touch-left" id="touch-left"></div>
          <div class="auto-touch-right" id="touch-right"></div>
        </div>

        <div class="auto-seek-ripple left" id="ripple-left">
          ${SVG.replay10}
          <span>10s</span>
        </div>
        <div class="auto-seek-ripple right" id="ripple-right">
          ${SVG.forward10}
          <span>10s</span>
        </div>

        <div class="auto-loading-spinner visible" id="auto-spinner"></div>

        <div class="auto-lock-overlay" id="auto-lock-box">
          <button class="auto-unlock-pill" id="auto-unlock-btn">
            ${SVG.unlock}
            <span>Unlock Screen</span>
          </button>
        </div>

        <div class="auto-ui-chrome" id="auto-chrome">
          <div class="auto-top-bar" id="auto-top">
            <div class="auto-top-left">
              <div class="auto-title-col">
                <span class="auto-media-title" id="auto-title">Loading Stream...</span>
                <span class="auto-media-badge" id="auto-badge"></span>
              </div>
            </div>
            <div class="auto-top-right">
              <button class="auto-pill-btn" id="pill-quality-server">
                ${SVG.serverRack}
                <span id="label-quality-server">Quality AUTO • CASTLE</span>
              </button>
              <button class="auto-pill-btn" id="pill-audio-subs">
                ${SVG.audioSubs}
                <span>Audio &amp; Subtitles</span>
              </button>
              <div class="auto-brand-pill">
                <span>●</span>
                <strong id="auto-brand-text">${this.config.brand || "SumanMovies"}</strong>
              </div>
            </div>
          </div>

          <div class="auto-center-pause" id="auto-pause-overlay">
            <span class="auto-pause-status">Paused</span>
            <h2 class="auto-pause-heading" id="pause-title">Animals</h2>
            <span class="auto-pause-meta" id="pause-meta">2026 · 1h 46m</span>
            <div class="auto-pause-actions">
              <button class="auto-btn-resume" id="btn-resume">
                ${SVG.play}
                <span>Resume</span>
              </button>
              <button class="auto-btn-startover" id="btn-startover">
                ${SVG.replay10}
                <span>Start over</span>
              </button>
              <span class="auto-time-remaining" id="pause-remain"></span>
            </div>
          </div>

          <div class="auto-bottom-bar" id="auto-bottom">
            <div class="auto-scrub-box" id="auto-scrub">
              <div class="auto-scrub-buffer" id="auto-buf"></div>
              <div class="auto-scrub-progress" id="auto-prog"></div>
              <div class="auto-scrub-thumb" id="auto-thumb"></div>
            </div>

            <div class="auto-controls-row">
              <div class="auto-ctrl-left">
                <button class="auto-icon-btn" id="btn-play" aria-label="Play/Pause">${SVG.play}</button>
                <button class="auto-icon-btn" id="btn-rep10" aria-label="Replay 10s">${SVG.replay10}</button>
                <button class="auto-icon-btn" id="btn-fwd10" aria-label="Forward 10s">${SVG.forward10}</button>
                <div class="auto-volume-cluster" id="vol-cluster">
                  <button class="auto-icon-btn" id="btn-mute" aria-label="Volume">${SVG.volumeHigh}</button>
                  <div class="auto-vol-slider-wrap">
                    <input type="range" class="auto-vol-slider" id="vol-slider" min="0" max="1" step="0.05" value="1">
                  </div>
                </div>
                <div class="auto-time-counter">
                  <span class="cur" id="time-cur">0:00</span> / <span id="time-dur">0:00</span>
                </div>
              </div>

              <div class="auto-ctrl-right">
                <button class="auto-icon-btn" id="btn-lock" aria-label="Lock screen" title="Lock controls">${SVG.lock}</button>
                <button class="auto-icon-btn" id="btn-pip" aria-label="Picture in Picture">${SVG.pip}</button>
                <button class="auto-icon-btn" id="btn-fs" aria-label="Fullscreen">${SVG.fullscreen}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="auto-drawer-modal" id="drawer-server">
          <div class="auto-drawer-head">
            <span class="auto-drawer-title">Server &amp; Quality</span>
            <button class="auto-drawer-close" id="close-server-drawer">${SVG.close}</button>
          </div>
          <div class="auto-drawer-columns">
            <div class="auto-drawer-col" id="col-quality">
              <div class="auto-col-header">Quality</div>
              <div id="list-quality"></div>
            </div>
            <div class="auto-drawer-col" id="col-servers">
              <div class="auto-col-header">Server</div>
              <div id="list-servers"></div>
            </div>
          </div>
          <div class="auto-drawer-foot">
            <div class="auto-foot-row">
              <span class="lbl">Playback Speed</span>
              <div class="auto-segmented-ctrl" id="seg-speed">
                <button class="auto-seg-btn" data-speed="0.75">0.75x</button>
                <button class="auto-seg-btn active" data-speed="1">1x</button>
                <button class="auto-seg-btn" data-speed="1.25">1.25x</button>
                <button class="auto-seg-btn" data-speed="1.5">1.5x</button>
                <button class="auto-seg-btn" data-speed="2">2x</button>
              </div>
            </div>
            <div class="auto-foot-row">
              <span class="lbl">Volume Boost</span>
              <div class="auto-segmented-ctrl" id="seg-boost">
                <button class="auto-seg-btn active" data-boost="1">Off</button>
                <button class="auto-seg-btn" data-boost="2">2x</button>
                <button class="auto-seg-btn" data-boost="3">3x</button>
              </div>
            </div>
            <div class="auto-foot-row">
              <span class="lbl">Aspect Ratio</span>
              <div class="auto-segmented-ctrl" id="seg-fit">
                <button class="auto-seg-btn active" data-fit="contain">Fit</button>
                <button class="auto-seg-btn" data-fit="cover">Fill</button>
                <button class="auto-seg-btn" data-fit="fill">Stretch</button>
              </div>
            </div>
          </div>
        </div>

        <div class="auto-drawer-modal" id="drawer-audio">
          <div class="auto-drawer-head">
            <span class="auto-drawer-title">Audio &amp; Subtitles</span>
            <button class="auto-drawer-close" id="close-audio-drawer">${SVG.close}</button>
          </div>
          <div class="auto-drawer-columns">
            <div class="auto-drawer-col">
              <div class="auto-col-header">Audio Stream</div>
              <div id="list-audio"></div>
            </div>
            <div class="auto-drawer-col">
              <div class="auto-col-header">Subtitles</div>
              <div id="list-subs">
                <button class="auto-select-item active">
                  <span>Off</span>
                  ${SVG.check}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.uiChrome = document.getElementById("auto-chrome")!;
    this.topBar = document.getElementById("auto-top")!;
    this.bottomBar = document.getElementById("auto-bottom")!;
    this.centerPauseOverlay = document.getElementById("auto-pause-overlay")!;
    this.serverDrawer = document.getElementById("drawer-server")!;
    this.audioDrawer = document.getElementById("drawer-audio")!;
    this.spinnerEl = document.getElementById("auto-spinner")!;
    this.scrubBar = document.getElementById("auto-scrub")!;
    this.bufferBar = document.getElementById("auto-buf")!;
    this.progressBar = document.getElementById("auto-prog")!;
    this.scrubThumb = document.getElementById("auto-thumb")!;
    this.curTimeSpan = document.getElementById("time-cur")!;
    this.durTimeSpan = document.getElementById("time-dur")!;
    this.playBtn = document.getElementById("btn-play") as HTMLButtonElement;
    this.qualityPillBtn = document.getElementById("pill-quality-server") as HTMLButtonElement;
    this.audioPillBtn = document.getElementById("pill-audio-subs") as HTMLButtonElement;
    this.lockOverlay = document.getElementById("auto-lock-box")!;

    if (this.config.color) {
      document.documentElement.style.setProperty("--auto-accent", this.config.color);
    }
  }

  private async init(): Promise<void> {
    this.bindEvents();

    const [streamsRes, healthRes, metaRes] = await Promise.allSettled([
      fetchStreamSources(this.config.type, this.config.id, this.config.season, this.config.episode),
      fetchStreamHealth(this.config.type, this.config.id, this.config.season, this.config.episode),
      fetchMediaDetails(this.config.type, this.config.id)
    ]);

    if (metaRes.status === "fulfilled") {
      this.metadata = metaRes.value;
      this.renderMetadata();
    }

    if (healthRes.status === "fulfilled" && healthRes.value.results) {
      healthRes.value.results.forEach((r) => this.healthMap.set(r.id, r));
    }

    if (streamsRes.status === "fulfilled" && streamsRes.value.sources) {
      this.sources = streamsRes.value.sources;
      this.selectInitialServer();
    } else {
      this.showFatalError("No available video stream sources found.");
    }
  }

  private renderMetadata(): void {
    if (!this.metadata) return;
    const titleEl = document.getElementById("auto-title");
    const pauseTitle = document.getElementById("pause-title");
    const pauseMeta = document.getElementById("pause-meta");
    const badgeEl = document.getElementById("auto-badge");

    if (titleEl) titleEl.textContent = this.metadata.title;
    if (pauseTitle) pauseTitle.textContent = this.metadata.title;
    if (pauseMeta) {
      const parts = [this.metadata.year, this.metadata.duration].filter(Boolean);
      pauseMeta.textContent = parts.join(" · ");
    }
    if (badgeEl && this.config.type === "tv") {
      const s = this.config.season || 1;
      const e = this.config.episode || 1;
      badgeEl.textContent = `Season ${s} · Episode ${e}`;
    }
  }

  private selectInitialServer(): void {
    if (this.sources.length === 0) {
      this.showFatalError("No stream sources provided.");
      return;
    }

    let chosen: StreamSource | undefined;
    if (this.config.server) {
      chosen = this.sources.find((s) => s.id === this.config.server || s.name.toLowerCase() === this.config.server?.toLowerCase());
    }

    if (!chosen) {
      chosen = this.sources.find((s) => s.type === "hls" && s.url && this.healthMap.get(s.id)?.reachable !== false);
    }

    if (!chosen) {
      chosen = this.sources.find((s) => s.type === "embed" && s.url && this.healthMap.get(s.id)?.reachable !== false);
    }

    if (!chosen) {
      chosen = this.sources[0];
    }

    this.loadSource(chosen);
  }

  private loadSource(source: StreamSource): void {
    this.activeSource = source;
    const stage = document.getElementById("auto-stage")!;
    stage.innerHTML = "";
    this.spinnerEl.classList.add("visible");

    const labelQualityServer = document.getElementById("label-quality-server");
    if (labelQualityServer) {
      labelQualityServer.textContent = `Quality ${this.activeQuality.toUpperCase()} • ${source.label || source.name}`;
    }

    if (source.type === "hls" && source.url) {
      this.setupDirectVideo(source);
    } else if (source.type === "embed" && source.url) {
      this.setupEmbedIframe(source);
    } else {
      this.showFatalError("Unable to load selected server.");
    }

    this.renderServerDrawerList();
    this.renderAudioDrawerList();
  }

  private setupDirectVideo(source: StreamSource): void {
    const stage = document.getElementById("auto-stage")!;
    const video = document.createElement("video");
    video.className = "auto-video-element";
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.style.objectFit = this.fitMode;
    video.crossOrigin = "anonymous";
    video.src = source.url;

    this.videoEl = video;
    this.embedIframe = null;
    stage.appendChild(video);

    video.addEventListener("loadedmetadata", () => {
      this.spinnerEl.classList.remove("visible");
      this.durTimeSpan.textContent = formatTime(video.duration);
      if (this.config.autoplay) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener("play", () => {
      this.playBtn.innerHTML = SVG.pause;
      this.centerPauseOverlay.classList.remove("visible");
      this.resetHideTimer();
    });

    video.addEventListener("pause", () => {
      this.playBtn.innerHTML = SVG.play;
      this.showPauseOverlay();
      this.uiChrome.classList.remove("hidden");
    });

    video.addEventListener("timeupdate", () => {
      if (!this.isDraggingScrub && video.duration > 0) {
        const pct = (video.currentTime / video.duration) * 100;
        this.progressBar.style.width = `${pct}%`;
        this.scrubThumb.style.left = `${pct}%`;
        this.curTimeSpan.textContent = formatTime(video.currentTime);
      }
    });

    video.addEventListener("progress", () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufEnd = video.buffered.end(video.buffered.length - 1);
        const bufPct = (bufEnd / video.duration) * 100;
        this.bufferBar.style.width = `${bufPct}%`;
      }
    });

    video.addEventListener("waiting", () => this.spinnerEl.classList.add("visible"));
    video.addEventListener("canplay", () => this.spinnerEl.classList.remove("visible"));

    video.addEventListener("error", () => {
      const nextHealthy = this.sources.find((s) => s.id !== source.id && s.url && this.healthMap.get(s.id)?.reachable !== false);
      if (nextHealthy) {
        this.loadSource(nextHealthy);
      } else {
        this.spinnerEl.classList.remove("visible");
      }
    });
  }

  private setupEmbedIframe(source: StreamSource): void {
    const stage = document.getElementById("auto-stage")!;
    const iframe = document.createElement("iframe");
    iframe.className = "auto-embed-iframe";
    iframe.src = source.url;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.setAttribute("allowfullscreen", "true");

    this.embedIframe = iframe;
    this.videoEl = null;
    stage.appendChild(iframe);

    iframe.onload = () => {
      this.spinnerEl.classList.remove("visible");
    };
  }

  private renderServerDrawerList(): void {
    const listServers = document.getElementById("list-servers");
    const listQuality = document.getElementById("list-quality");
    if (!listServers || !listQuality) return;

    listServers.innerHTML = "";
    listQuality.innerHTML = "";

    const qualities = ["Auto", "1080p", "720p", "480p"];
    qualities.forEach((q) => {
      const btn = document.createElement("button");
      btn.className = `auto-select-item ${this.activeQuality === q ? "active" : ""}`;
      btn.innerHTML = `<span>${q}</span> ${this.activeQuality === q ? SVG.check : ""}`;
      btn.onclick = () => {
        this.activeQuality = q;
        this.applyQualityChange(q);
      };
      listQuality.appendChild(btn);
    });

    this.sources.forEach((s) => {
      const btn = document.createElement("button");
      const isActive = this.activeSource?.id === s.id;
      btn.className = `auto-select-item ${isActive ? "active" : ""}`;

      const health = this.healthMap.get(s.id);
      let pingBadge = "";
      if (health && health.reachable) {
        pingBadge = `<span class="auto-ping-pill">${health.latencyMs}ms</span>`;
      } else if (health && health.reachable === false) {
        pingBadge = `<span class="auto-ping-pill warn">Offline</span>`;
      }

      btn.innerHTML = `
        <div class="auto-item-label-group">
          <span>${s.label || s.name}</span>
          ${pingBadge}
        </div>
        ${isActive ? SVG.check : ""}
      `;

      btn.onclick = () => {
        this.loadSource(s);
        this.serverDrawer.classList.remove("visible");
      };

      listServers.appendChild(btn);
    });
  }

  private renderAudioDrawerList(): void {
    const listAudio = document.getElementById("list-audio");
    if (!listAudio) return;
    listAudio.innerHTML = "";

    const streams = this.activeSource?.audioStreams || [
      { lang: "default", label: "Original Audio", url: "" }
    ];

    streams.forEach((a) => {
      const btn = document.createElement("button");
      const isActive = this.activeAudioLang === a.lang || (streams.length === 1);
      btn.className = `auto-select-item ${isActive ? "active" : ""}`;
      btn.innerHTML = `<span>${a.label}</span> ${isActive ? SVG.check : ""}`;
      btn.onclick = () => {
        this.activeAudioLang = a.lang;
        if (a.url && this.videoEl) {
          const curTime = this.videoEl.currentTime;
          this.videoEl.src = a.url;
          this.videoEl.currentTime = curTime;
          this.videoEl.play().catch(() => {});
        }
        this.renderAudioDrawerList();
        this.audioDrawer.classList.remove("visible");
      };
      listAudio.appendChild(btn);
    });
  }

  private applyQualityChange(q: string): void {
    if (!this.activeSource || !this.videoEl) return;
    if (this.activeSource.qualityVariants && this.activeSource.qualityVariants.length > 0) {
      const match = this.activeSource.qualityVariants.find((v) => v.label.toLowerCase().includes(q.toLowerCase()));
      if (match) {
        const curTime = this.videoEl.currentTime;
        this.videoEl.src = match.url;
        this.videoEl.currentTime = curTime;
        this.videoEl.play().catch(() => {});
      }
    }
    this.renderServerDrawerList();
    const labelQualityServer = document.getElementById("label-quality-server");
    if (labelQualityServer) {
      labelQualityServer.textContent = `Quality ${q.toUpperCase()} • ${this.activeSource.label || this.activeSource.name}`;
    }
  }

  private bindEvents(): void {
    this.playBtn.addEventListener("click", () => this.togglePlay());

    document.getElementById("btn-rep10")?.addEventListener("click", () => this.seekRelative(-10));
    document.getElementById("btn-fwd10")?.addEventListener("click", () => this.seekRelative(10));

    const muteBtn = document.getElementById("btn-mute");
    const volSlider = document.getElementById("vol-slider") as HTMLInputElement;

    muteBtn?.addEventListener("click", () => {
      if (this.videoEl) {
        this.videoEl.muted = !this.videoEl.muted;
        muteBtn.innerHTML = this.videoEl.muted ? SVG.volumeMute : SVG.volumeHigh;
      }
    });

    volSlider?.addEventListener("input", () => {
      const val = parseFloat(volSlider.value);
      if (this.videoEl) {
        this.videoEl.volume = val * this.volumeBoost;
        this.videoEl.muted = val === 0;
        if (muteBtn) muteBtn.innerHTML = val === 0 ? SVG.volumeMute : SVG.volumeHigh;
      }
    });

    this.qualityPillBtn.addEventListener("click", () => {
      this.serverDrawer.classList.toggle("visible");
      this.audioDrawer.classList.remove("visible");
    });

    this.audioPillBtn.addEventListener("click", () => {
      this.audioDrawer.classList.toggle("visible");
      this.serverDrawer.classList.remove("visible");
    });

    document.getElementById("close-server-drawer")?.addEventListener("click", () => {
      this.serverDrawer.classList.remove("visible");
    });

    document.getElementById("close-audio-drawer")?.addEventListener("click", () => {
      this.audioDrawer.classList.remove("visible");
    });

    document.getElementById("btn-fs")?.addEventListener("click", () => this.toggleFullscreen());
    document.getElementById("btn-pip")?.addEventListener("click", () => this.togglePiP());

    document.getElementById("btn-resume")?.addEventListener("click", () => {
      if (this.videoEl) this.videoEl.play().catch(() => {});
    });

    document.getElementById("btn-startover")?.addEventListener("click", () => {
      if (this.videoEl) {
        this.videoEl.currentTime = 0;
        this.videoEl.play().catch(() => {});
      }
    });

    document.getElementById("btn-lock")?.addEventListener("click", () => {
      this.isLocked = true;
      this.uiChrome.classList.add("locked");
      this.lockOverlay.classList.add("visible");
    });

    document.getElementById("auto-unlock-btn")?.addEventListener("click", () => {
      this.isLocked = false;
      this.uiChrome.classList.remove("locked");
      this.lockOverlay.classList.remove("visible");
    });

    this.bindScrubEvents();
    this.bindGestures();
    this.bindDrawerFootControls();
  }

  private bindScrubEvents(): void {
    const scrub = this.scrubBar;

    const handleScrub = (e: MouseEvent | TouchEvent) => {
      const rect = scrub.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.progressBar.style.width = `${pos * 100}%`;
      this.scrubThumb.style.left = `${pos * 100}%`;

      if (this.videoEl && this.videoEl.duration > 0) {
        this.videoEl.currentTime = pos * this.videoEl.duration;
      }
    };

    scrub.addEventListener("mousedown", (e) => {
      this.isDraggingScrub = true;
      scrub.classList.add("dragging");
      handleScrub(e);

      const onMouseMove = (ev: MouseEvent) => {
        if (this.isDraggingScrub) handleScrub(ev);
      };
      const onMouseUp = () => {
        this.isDraggingScrub = false;
        scrub.classList.remove("dragging");
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });

    scrub.addEventListener("touchstart", (e) => {
      this.isDraggingScrub = true;
      scrub.classList.add("dragging");
      handleScrub(e);
    }, { passive: true });

    scrub.addEventListener("touchmove", (e) => {
      if (this.isDraggingScrub) handleScrub(e);
    }, { passive: true });

    scrub.addEventListener("touchend", () => {
      this.isDraggingScrub = false;
      scrub.classList.remove("dragging");
    });
  }

  private bindGestures(): void {
    const leftTouch = document.getElementById("touch-left");
    const rightTouch = document.getElementById("touch-right");
    const vp = document.getElementById("auto-vp")!;

    let lastTapLeft = 0;
    leftTouch?.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastTapLeft < 300) {
        this.seekRelative(-10);
        this.triggerRipple("left");
      } else {
        this.toggleChromeVisibility();
      }
      lastTapLeft = now;
    });

    let lastTapRight = 0;
    rightTouch?.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastTapRight < 300) {
        this.seekRelative(10);
        this.triggerRipple("right");
      } else {
        this.toggleChromeVisibility();
      }
      lastTapRight = now;
    });

    vp.addEventListener("mousemove", () => {
      if (!this.isLocked) {
        this.uiChrome.classList.remove("hidden");
        this.resetHideTimer();
      }
    });
  }

  private triggerRipple(dir: "left" | "right"): void {
    const ripple = document.getElementById(`ripple-${dir}`);
    if (!ripple) return;
    ripple.classList.add("active");
    setTimeout(() => ripple.classList.remove("active"), 450);
  }

  private bindDrawerFootControls(): void {
    const speedBtns = document.querySelectorAll<HTMLButtonElement>("#seg-speed button");
    speedBtns.forEach((btn) => {
      btn.onclick = () => {
        speedBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const s = parseFloat(btn.getAttribute("data-speed") || "1");
        if (this.videoEl) this.videoEl.playbackRate = s;
      };
    });

    const boostBtns = document.querySelectorAll<HTMLButtonElement>("#seg-boost button");
    boostBtns.forEach((btn) => {
      btn.onclick = () => {
        boostBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.volumeBoost = parseInt(btn.getAttribute("data-boost") || "1", 10);
        const volSlider = document.getElementById("vol-slider") as HTMLInputElement;
        const val = volSlider ? parseFloat(volSlider.value) : 1;
        if (this.videoEl) this.videoEl.volume = Math.min(1, val * this.volumeBoost);
      };
    });

    const fitBtns = document.querySelectorAll<HTMLButtonElement>("#seg-fit button");
    fitBtns.forEach((btn) => {
      btn.onclick = () => {
        fitBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.fitMode = (btn.getAttribute("data-fit") as any) || "contain";
        if (this.videoEl) {
          this.videoEl.style.objectFit = this.fitMode;
        }
      };
    });
  }

  private togglePlay(): void {
    if (!this.videoEl) return;
    if (this.videoEl.paused) {
      this.videoEl.play().catch(() => {});
    } else {
      this.videoEl.pause();
    }
  }

  private seekRelative(secs: number): void {
    if (!this.videoEl) return;
    this.videoEl.currentTime = Math.max(0, Math.min(this.videoEl.duration || 0, this.videoEl.currentTime + secs));
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  private togglePiP(): void {
    if (this.videoEl && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      } else {
        this.videoEl.requestPictureInPicture().catch(() => {});
      }
    }
  }

  private toggleChromeVisibility(): void {
    if (this.isLocked) return;
    if (this.uiChrome.classList.contains("hidden")) {
      this.uiChrome.classList.remove("hidden");
      this.resetHideTimer();
    } else {
      this.uiChrome.classList.add("hidden");
      this.serverDrawer.classList.remove("visible");
      this.audioDrawer.classList.remove("visible");
    }
  }

  private resetHideTimer(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      if (this.videoEl && !this.videoEl.paused && !this.serverDrawer.classList.contains("visible") && !this.audioDrawer.classList.contains("visible")) {
        this.uiChrome.classList.add("hidden");
      }
    }, 3500);
  }

  private showPauseOverlay(): void {
    if (this.videoEl && this.videoEl.duration > 0) {
      const left = this.videoEl.duration - this.videoEl.currentTime;
      const pauseRemain = document.getElementById("pause-remain");
      if (pauseRemain) {
        pauseRemain.textContent = `${formatTime(left)} left`;
      }
    }
    this.centerPauseOverlay.classList.add("visible");
  }

  private showFatalError(msg: string): void {
    this.spinnerEl.classList.remove("visible");
    const stage = document.getElementById("auto-stage")!;
    stage.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;color:#94a3b8;gap:12px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style="font-size:16px;font-weight:700;color:#fff;">Stream Unavailable</span>
        <span style="font-size:13px;max-width:380px;">${msg}</span>
      </div>
    `;
  }
}

if (typeof document !== "undefined" && !(window as any).__VIDEMBED_AUTO_STUDIO__) {
  const initApp = () => {
    const root = document.getElementById("auto-player-root");
    if (root && !root.dataset.initialized) {
      root.dataset.initialized = "true";
      new AutoPlayer(root);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
}
