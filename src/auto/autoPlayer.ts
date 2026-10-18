import Hls from "hls.js";
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
  volumeMedium: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  volumeMute: `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
  exitFullscreen: `<svg viewBox="0 0 24 24"><path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10H4m6 0V4m0 6L3 3m14 7h6m-6 0V4m0 6l7-7"/></svg>`,
  pip: `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="8" height="6" rx="1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.4-1.4z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  watermark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  aspect: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="7 9 7 7 9 7"/><polyline points="17 9 17 7 15 7"/><polyline points="7 15 7 17 9 17"/><polyline points="17 15 17 17 15 17"/></svg>`,
  monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><line x1="6" y1="6.5" x2="6.01" y2="6.5" stroke-width="2.5"/><line x1="6" y1="17.5" x2="6.01" y2="17.5" stroke-width="2.5"/></svg>`,
  speed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 14l4-4"/><circle cx="12" cy="14" r="8"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
  aspectRect: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="12" r="1.5"/></svg>`,
  crop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  subtitles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><line x1="7" y1="11" x2="11" y2="11"/><line x1="7" y1="14" x2="13" y2="14"/><line x1="15" y1="11" x2="17" y2="11"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`
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
  private activeSubtitle: string = "off";
  private metadata: MediaMetadata | null = null;
  private hlsInstance: Hls | null = null;
  private availableQualities: string[] = ["Auto"];
  private availableAudioTracks: { id: string; label: string; lang: string; url?: string }[] = [];
  private availableSubtitles: { id: string; label: string; lang: string; url?: string }[] = [];

  private videoEl: HTMLVideoElement | null = null;
  private embedIframe: HTMLIFrameElement | null = null;
  private uiChrome!: HTMLElement;
  private topBar!: HTMLElement;
  private bottomBar!: HTMLElement;
  private spinnerEl!: HTMLElement;
  private bigPlayBtn!: HTMLButtonElement;
  private scrubBar!: HTMLElement;
  private bufferBar!: HTMLElement;
  private progressBar!: HTMLElement;
  private scrubThumb!: HTMLElement;
  private curTimeSpan!: HTMLElement;
  private durTimeSpan!: HTMLElement;
  private playBtn!: HTMLButtonElement;
  private settingsBtn!: HTMLButtonElement;
  private aspectBtn!: HTMLButtonElement;
  private settingsPopover!: HTMLElement;
  private cropToggle!: HTMLInputElement;
  private loopToggle!: HTMLInputElement;

  private isDraggingScrub: boolean = false;
  private hideTimer?: number;
  private isCropBars: boolean = false;
  private isLoop: boolean = false;
  private playbackRate: number = 1;
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
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.removeAttribute("src");
      this.videoEl.load();
      this.videoEl.remove();
      this.videoEl = null;
    }
    if (this.embedIframe) {
      this.embedIframe.src = "about:blank";
      this.embedIframe.remove();
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
      id = params.get("id") || params.get("tmdb") || (type === "tv" ? "94997" : "1236045");
      if (params.get("s") || params.get("season")) {
        season = parseInt(params.get("s") || params.get("season") || "1", 10);
      }
      if (params.get("e") || params.get("episode")) {
        episode = parseInt(params.get("e") || params.get("episode") || "1", 10);
      }
    }

    const rawFit = params.get("fit") || params.get("aspect") || "contain";
    const fit: "contain" | "cover" | "fill" = rawFit === "fill" ? "fill" : rawFit === "cover" ? "cover" : "contain";
    const rawColor = params.get("color");
    const color = rawColor ? (rawColor.startsWith("#") ? rawColor : `#${rawColor}`) : undefined;

    return {
      type,
      id,
      season,
      episode,
      brand: params.get("brand") || "SumanMovies",
      color,
      server: params.get("server") || undefined,
      autoplay: params.get("autoplay") === "1",
      muted: params.get("muted") === "1",
      fit
    };
  }

  private buildDOM(): void {
    const brandName = this.config.brand || "SumanMovies";
    let brandMarkup = brandName;
    if (brandName.toLowerCase().startsWith("suman")) {
      brandMarkup = `Suman<span>${brandName.slice(5) || "Movies"}</span>`;
    } else if (brandName.toLowerCase().startsWith("vid")) {
      brandMarkup = `Vid<span>${brandName.slice(3) || "Embed"}</span>`;
    } else {
      const mid = Math.ceil(brandName.length / 2);
      brandMarkup = `${brandName.slice(0, mid)}<span>${brandName.slice(mid)}</span>`;
    }

    this.container.innerHTML = `
      <div class="auto-viewport" id="auto-vp">
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
        <div class="auto-fit-toast" id="auto-fit-toast">Fit (contain)</div>

        <button class="ckin-big-play" id="auto-big-play" aria-label="Play video">
          ${SVG.play}
        </button>

        <div class="auto-ui-chrome" id="auto-chrome">
          <div class="ckin-top-bar" id="auto-top">
            <div class="ckin-top-left">
              <span class="ckin-title" id="auto-title">Loading Stream...</span>
              <span class="ckin-badge" id="auto-badge" style="display: none;"></span>
            </div>

            <div class="ckin-watermark" id="auto-watermark-pill">
              <div class="ckin-watermark-icon">${SVG.watermark}</div>
              <div class="ckin-watermark-text-col">
                <div class="ckin-watermark-title"><span id="auto-brand-text">${brandMarkup}</span></div>
                <div class="ckin-watermark-sub">A SUMANONLINE PROJECT</div>
              </div>
            </div>
          </div>

          <div class="ckin-settings-backdrop" id="settings-backdrop"></div>
          <div class="ckin-settings-popover" id="settings-popover">
            <div class="ckin-menu-page active" id="menu-page-main">
              <div class="ckin-menu-header ckin-menu-header-main">
                <span class="ckin-menu-header-title">Stream Settings</span>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" id="btn-close-settings" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-section-title">STREAM &amp; SERVERS</div>
              <div class="ckin-menu-row" data-sub="servers">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.server}</span>
                  <span class="ckin-menu-label">Servers</span>
                </div>
                <div class="ckin-menu-row-right">
                  <span class="ckin-menu-val" id="val-server">Castle (HLS)</span>
                  <span class="ckin-menu-chevron">${SVG.chevronRight}</span>
                </div>
              </div>

              <div class="ckin-menu-row" data-sub="quality">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.monitor}</span>
                  <span class="ckin-menu-label">Quality</span>
                </div>
                <div class="ckin-menu-row-right">
                  <span class="ckin-menu-val" id="val-quality">Auto</span>
                  <span class="ckin-menu-chevron">${SVG.chevronRight}</span>
                </div>
              </div>

              <div class="ckin-menu-row" data-sub="audio">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.audio}</span>
                  <span class="ckin-menu-label">Audio</span>
                </div>
                <div class="ckin-menu-row-right">
                  <span class="ckin-menu-val" id="val-audio">Default</span>
                  <span class="ckin-menu-chevron">${SVG.chevronRight}</span>
                </div>
              </div>

              <div class="ckin-menu-row" data-sub="subtitles">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.subtitles}</span>
                  <span class="ckin-menu-label">Subtitle</span>
                </div>
                <div class="ckin-menu-row-right">
                  <span class="ckin-menu-val" id="val-subtitles">Off</span>
                  <span class="ckin-menu-chevron">${SVG.chevronRight}</span>
                </div>
              </div>

              <div class="ckin-menu-section-title" style="margin-top: 10px;">PLAYBACK</div>
              <div class="ckin-menu-row" data-sub="speed">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.speed}</span>
                  <span class="ckin-menu-label">Playback speed</span>
                </div>
                <div class="ckin-menu-row-right">
                  <span class="ckin-menu-val" id="val-speed">1x</span>
                  <span class="ckin-menu-chevron">${SVG.chevronRight}</span>
                </div>
              </div>

              <div class="ckin-menu-row" data-sub="aspect">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.aspectRect}</span>
                  <span class="ckin-menu-label">Aspect</span>
                </div>
                <div class="ckin-menu-row-right">
                  <span class="ckin-menu-val" id="val-aspect">Fit</span>
                  <span class="ckin-menu-chevron">${SVG.chevronRight}</span>
                </div>
              </div>

              <div class="ckin-menu-section-title" style="margin-top: 10px;">ENHANCEMENTS</div>
              <div class="ckin-menu-row" id="row-crop-bars">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.crop}</span>
                  <span class="ckin-menu-label">Crop black bars</span>
                </div>
                <div class="ckin-menu-row-right">
                  <label class="ckin-switch">
                    <input type="checkbox" id="toggle-crop-bars">
                    <span class="ckin-switch-slider"></span>
                  </label>
                </div>
              </div>

              <div class="ckin-menu-row" id="row-loop">
                <div class="ckin-menu-row-left">
                  <span class="ckin-menu-icon">${SVG.repeat}</span>
                  <span class="ckin-menu-label">Loop</span>
                </div>
                <div class="ckin-menu-row-right">
                  <label class="ckin-switch">
                    <input type="checkbox" id="toggle-loop">
                    <span class="ckin-switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="ckin-menu-page" id="menu-page-servers">
              <div class="ckin-menu-header">
                <button class="ckin-menu-back-btn" data-back="main" aria-label="Back to settings">
                  ${SVG.chevronLeft}
                  <span class="ckin-menu-header-title">Servers</span>
                </button>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-list" id="menu-list-servers"></div>
            </div>

            <div class="ckin-menu-page" id="menu-page-quality">
              <div class="ckin-menu-header">
                <button class="ckin-menu-back-btn" data-back="main" aria-label="Back to settings">
                  ${SVG.chevronLeft}
                  <span class="ckin-menu-header-title">Quality</span>
                </button>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-list" id="menu-list-quality"></div>
            </div>

            <div class="ckin-menu-page" id="menu-page-audio">
              <div class="ckin-menu-header">
                <button class="ckin-menu-back-btn" data-back="main" aria-label="Back to settings">
                  ${SVG.chevronLeft}
                  <span class="ckin-menu-header-title">Audio Track</span>
                </button>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-list" id="menu-list-audio"></div>
            </div>

            <div class="ckin-menu-page" id="menu-page-subtitles">
              <div class="ckin-menu-header">
                <button class="ckin-menu-back-btn" data-back="main" aria-label="Back to settings">
                  ${SVG.chevronLeft}
                  <span class="ckin-menu-header-title">Subtitles</span>
                </button>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-list" id="menu-list-subtitles"></div>
            </div>

            <div class="ckin-menu-page" id="menu-page-speed">
              <div class="ckin-menu-header">
                <button class="ckin-menu-back-btn" data-back="main" aria-label="Back to settings">
                  ${SVG.chevronLeft}
                  <span class="ckin-menu-header-title">Playback speed</span>
                </button>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-list" id="menu-list-speed"></div>
            </div>

            <div class="ckin-menu-page" id="menu-page-aspect">
              <div class="ckin-menu-header">
                <button class="ckin-menu-back-btn" data-back="main" aria-label="Back to settings">
                  ${SVG.chevronLeft}
                  <span class="ckin-menu-header-title">Aspect</span>
                </button>
                <button class="ckin-menu-close-btn ckin-btn-close-popover" aria-label="Close settings">${SVG.close}</button>
              </div>
              <div class="ckin-menu-list" id="menu-list-aspect"></div>
            </div>
          </div>

          <div class="ckin-controls" id="auto-bottom">
            <div class="ckin-scrub-bar" id="auto-scrub">
              <div class="ckin-buffer-bar" id="auto-buf"></div>
              <div class="ckin-progress-bar" id="auto-prog"></div>
              <div class="ckin-scrub-handle" id="auto-thumb"></div>
            </div>

            <div class="ckin-controls-row">
              <div class="ckin-controls-left">
                <button class="ckin-btn" id="btn-play" aria-label="Play/Pause">${SVG.play}</button>
                <button class="ckin-btn" id="btn-rep10" aria-label="Replay 10s">${SVG.replay10}</button>
                <button class="ckin-btn" id="btn-fwd10" aria-label="Forward 10s">${SVG.forward10}</button>
                <div class="ckin-volume-wrapper" id="vol-cluster">
                  <button class="ckin-btn" id="btn-mute" aria-label="Volume">${SVG.volumeHigh}</button>
                  <div class="ckin-volume-slider-box">
                    <input type="range" class="ckin-volume-slider" id="vol-slider" min="0" max="1" step="0.05" value="1">
                  </div>
                </div>
                <div class="ckin-time-display">
                  <span class="current" id="time-cur">00:00</span> / <span id="time-dur">00:00</span>
                </div>
              </div>

              <div class="ckin-controls-right">
                <button class="ckin-btn" id="btn-tune" aria-label="Stream Settings &amp; Servers" title="Quality, Servers &amp; Audio">${SVG.sliders}</button>
                <button class="ckin-btn" id="btn-aspect" aria-label="Aspect Ratio" title="Aspect Ratio: Fit (Default)">${SVG.aspect}</button>
                <button class="ckin-btn" id="btn-pip" aria-label="Picture-in-Picture">${SVG.pip}</button>
                <button class="ckin-btn" id="btn-fs" aria-label="Fullscreen">${SVG.fullscreen}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.uiChrome = document.getElementById("auto-chrome")!;
    this.topBar = document.getElementById("auto-top")!;
    this.bottomBar = document.getElementById("auto-bottom")!;
    this.spinnerEl = document.getElementById("auto-spinner")!;
    this.bigPlayBtn = document.getElementById("auto-big-play") as HTMLButtonElement;
    this.scrubBar = document.getElementById("auto-scrub")!;
    this.bufferBar = document.getElementById("auto-buf")!;
    this.progressBar = document.getElementById("auto-prog")!;
    this.scrubThumb = document.getElementById("auto-thumb")!;
    this.curTimeSpan = document.getElementById("time-cur")!;
    this.durTimeSpan = document.getElementById("time-dur")!;
    this.playBtn = document.getElementById("btn-play") as HTMLButtonElement;
    this.settingsBtn = document.getElementById("btn-tune") as HTMLButtonElement;
    this.aspectBtn = document.getElementById("btn-aspect") as HTMLButtonElement;
    this.settingsPopover = document.getElementById("settings-popover")!;
    this.cropToggle = document.getElementById("toggle-crop-bars") as HTMLInputElement;
    this.loopToggle = document.getElementById("toggle-loop") as HTMLInputElement;

    if (this.config.color) {
      document.documentElement.style.setProperty("--auto-accent", this.config.color);
    }
  }

  private async init(): Promise<void> {
    this.bindEvents();

    const streamPromise = fetchStreamSources(this.config.type, this.config.id, this.config.season, this.config.episode);

    fetchMediaDetails(this.config.type, this.config.id, this.config.season, this.config.episode)
      .then((meta) => {
        this.metadata = meta;
        this.renderMetadata();
      })
      .catch(() => {});

    fetchStreamHealth(this.config.type, this.config.id, this.config.season, this.config.episode)
      .then((healthRes) => {
        if (healthRes && healthRes.results) {
          healthRes.results.forEach((r) => this.healthMap.set(r.id, r));
          this.renderServersSubmenu();
        }
      })
      .catch(() => {});

    try {
      const streamsRes = await streamPromise;
      if (streamsRes && streamsRes.sources && streamsRes.sources.length > 0) {
        this.sources = streamsRes.sources;
        this.selectInitialServer();
      } else {
        this.showFatalError("No available video stream sources found.");
      }
    } catch {
      this.showFatalError("Unable to connect to stream server.");
    }
  }

  private renderMetadata(): void {
    if (!this.metadata) return;
    const titleEl = document.getElementById("auto-title");
    const badgeEl = document.getElementById("auto-badge");

    if (titleEl) titleEl.textContent = this.metadata.title;
    if (badgeEl && this.config.type === "tv") {
      const s = this.config.season || 1;
      const e = this.config.episode || 1;
      badgeEl.textContent = `S${s}:E${e}`;
      badgeEl.style.display = "inline-flex";
    }

    const backdrop = (this.metadata.backdropUrl && this.metadata.backdropUrl.trim() !== "")
      ? this.metadata.backdropUrl
      : (this.metadata.posterUrl || "");
    if (this.videoEl && backdrop) {
      this.videoEl.poster = backdrop;
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

    if (source.type === "hls" && source.url) {
      this.setupDirectVideo(source);
    } else if (source.type === "embed" && source.url) {
      this.setupEmbedIframe(source);
    } else {
      this.showFatalError("Unable to load selected server.");
    }

    this.updateSettingsPanel();
  }

  private setupDirectVideo(source: StreamSource): void {
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }

    this.availableQualities = ["Auto"];
    if (source.qualityVariants && source.qualityVariants.length > 0) {
      source.qualityVariants.forEach((qv) => {
        if (!this.availableQualities.includes(qv.label)) {
          this.availableQualities.push(qv.label);
        }
      });
    }

    this.availableAudioTracks = [];
    if (source.audioStreams && source.audioStreams.length > 0) {
      this.availableAudioTracks = source.audioStreams.map((a) => ({
        id: a.lang,
        label: a.label,
        lang: a.lang,
        url: a.url
      }));
    }

    this.availableSubtitles = [{ id: "off", label: "Off", lang: "off" }];
    if (source.subtitles && source.subtitles.length > 0) {
      source.subtitles.forEach((s) => {
        this.availableSubtitles.push({
          id: s.lang,
          label: s.label,
          lang: s.lang,
          url: s.url
        });
      });
    }

    const stage = document.getElementById("auto-stage")!;
    const video = document.createElement("video");
    video.className = `auto-video-element ${this.isCropBars ? "crop-black-bars" : ""}`;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.style.objectFit = this.fitMode;
    video.crossOrigin = "anonymous";
    video.loop = this.isLoop;
    video.playbackRate = this.playbackRate;
    video.preload = "metadata";

    const initialBackdrop = (this.metadata?.backdropUrl && this.metadata.backdropUrl.trim() !== "")
      ? this.metadata.backdropUrl
      : (this.metadata?.posterUrl || "");
    if (initialBackdrop) {
      video.poster = initialBackdrop;
    }

    if (source.subtitles && source.subtitles.length > 0) {
      source.subtitles.forEach((sub) => {
        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = sub.label;
        track.srclang = sub.lang;
        track.src = sub.url;
        video.appendChild(track);
      });
    }

    this.videoEl = video;
    this.embedIframe = null;
    stage.appendChild(video);

    if (source.type === "hls" && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        progressive: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 5,
        maxFragLookUpTolerance: 0.25,
        startLevel: -1,
        testBandwidth: false
      });
      this.hlsInstance = hls;
      hls.attachMedia(video);
      hls.loadSource(source.url);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.spinnerEl.classList.remove("visible");
        this.durTimeSpan.textContent = formatTime(video.duration);

        if (hls.levels && hls.levels.length > 0) {
          hls.levels.forEach((lvl) => {
            const h = lvl.height && lvl.height > 0 ? lvl.height : 0;
            const lbl = h > 0 ? `${h}p` : (lvl.name && lvl.name !== "0p" ? lvl.name : "");
            if (lbl && lbl !== "0p" && !this.availableQualities.includes(lbl)) {
              this.availableQualities.push(lbl);
            }
          });
        }

        if (hls.audioTracks && hls.audioTracks.length > 0) {
          hls.audioTracks.forEach((t) => {
            const exists = this.availableAudioTracks.some((a) => a.id === String(t.id) || a.lang === t.lang);
            if (!exists) {
              this.availableAudioTracks.push({
                id: String(t.id),
                label: t.name || t.lang || `Track ${t.id}`,
                lang: t.lang || ""
              });
            }
          });
        }

        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
          hls.subtitleTracks.forEach((st) => {
            const exists = this.availableSubtitles.some((s) => s.id === String(st.id) || s.lang === st.lang);
            if (!exists) {
              this.availableSubtitles.push({
                id: String(st.id),
                label: st.name || st.lang || `Subtitle ${st.id}`,
                lang: st.lang || ""
              });
            }
          });
        }

        this.updateSettingsPanel();

        if (this.config.autoplay === true) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (this.hlsInstance && this.hlsInstance.levels[data.level]) {
          const lvl = this.hlsInstance.levels[data.level];
          const valQuality = document.getElementById("val-quality");
          if (valQuality && this.activeQuality.toLowerCase() === "auto") {
            const h = (lvl.height && lvl.height > 0) ? lvl.height : (video.videoHeight > 0 ? video.videoHeight : 0);
            valQuality.textContent = h > 0 ? `Auto (${h}p)` : "Auto";
          }
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              this.hlsInstance = null;
              const nextHealthy = this.sources.find((s) => s.id !== source.id && s.url && this.healthMap.get(s.id)?.reachable !== false);
              if (nextHealthy) {
                this.loadSource(nextHealthy);
              } else {
                this.spinnerEl.classList.remove("visible");
              }
              break;
          }
        }
      });
    } else {
      video.src = source.url;
    }

    video.addEventListener("loadedmetadata", () => {
      this.spinnerEl.classList.remove("visible");
      this.durTimeSpan.textContent = formatTime(video.duration);
      if (this.config.autoplay === true) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener("play", () => {
      this.playBtn.innerHTML = SVG.pause;
      this.bigPlayBtn.classList.add("playing");
      this.resetHideTimer();
    });

    video.addEventListener("pause", () => {
      this.playBtn.innerHTML = SVG.play;
      this.bigPlayBtn.classList.remove("playing");
      this.uiChrome.classList.remove("hidden");
    });

    let timeUpdateRaf = 0;
    video.addEventListener("timeupdate", () => {
      if (!this.isDraggingScrub && video.duration > 0 && !timeUpdateRaf) {
        timeUpdateRaf = requestAnimationFrame(() => {
          timeUpdateRaf = 0;
          if (this.videoEl && !this.isDraggingScrub && this.videoEl.duration > 0) {
            const pct = (this.videoEl.currentTime / this.videoEl.duration) * 100;
            this.progressBar.style.width = `${pct}%`;
            this.scrubThumb.style.left = `${pct}%`;
            this.curTimeSpan.textContent = formatTime(this.videoEl.currentTime);
          }
        });
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
      if (!this.hlsInstance) {
        const nextHealthy = this.sources.find((s) => s.id !== source.id && s.url && this.healthMap.get(s.id)?.reachable !== false);
        if (nextHealthy) {
          this.loadSource(nextHealthy);
        } else {
          this.spinnerEl.classList.remove("visible");
        }
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
      this.bigPlayBtn.classList.add("playing");
    };
  }

  private showToast(msg: string): void {
    const toast = document.getElementById("auto-fit-toast");
    if (toast) {
      toast.textContent = msg;
      toast.classList.add("visible");
      setTimeout(() => toast.classList.remove("visible"), 1500);
    }
  }

  private updateSettingsPanel(): void {
    const valServer = document.getElementById("val-server");
    const valQuality = document.getElementById("val-quality");
    const valAudio = document.getElementById("val-audio");
    const valSubtitles = document.getElementById("val-subtitles");
    const valSpeed = document.getElementById("val-speed");
    const valAspect = document.getElementById("val-aspect");

    if (valServer) valServer.textContent = this.activeSource?.label || this.activeSource?.name || "Castle (HLS)";

    if (this.activeSource?.type === "embed") {
      if (valQuality) valQuality.textContent = "Embed Player";
      if (valAudio) valAudio.textContent = "Embed Player";
      if (valSubtitles) valSubtitles.textContent = "Embed Player";
    } else {
      if (valQuality) {
        if (this.activeQuality.toLowerCase() === "auto") {
          let height = 0;
          if (this.hlsInstance && this.hlsInstance.currentLevel >= 0) {
            const lvl = this.hlsInstance.levels[this.hlsInstance.currentLevel];
            if (lvl && lvl.height && lvl.height > 0) height = lvl.height;
          }
          if (!height && this.videoEl && this.videoEl.videoHeight > 0) {
            height = this.videoEl.videoHeight;
          }
          valQuality.textContent = height > 0 ? `Auto (${height}p)` : "Auto";
        } else {
          valQuality.textContent = this.activeQuality;
        }
      }

      let audioLabel = "Default";
      const foundAudio = this.availableAudioTracks.find((a) => a.id === this.activeAudioLang || a.lang === this.activeAudioLang);
      if (foundAudio) {
        audioLabel = foundAudio.label;
      } else if (this.activeSource?.audioStreams && this.activeSource.audioStreams.length > 0) {
        const found = this.activeSource.audioStreams.find((a) => a.lang === this.activeAudioLang);
        audioLabel = found?.label || this.activeSource.audioStreams[0].label;
      }
      if (valAudio) valAudio.textContent = audioLabel;

      let subLabel = "Off";
      if (this.activeSubtitle !== "off") {
        const foundSub = this.availableSubtitles.find((s) => s.id === this.activeSubtitle || s.lang === this.activeSubtitle);
        subLabel = foundSub?.label || this.activeSubtitle;
      }
      if (valSubtitles) valSubtitles.textContent = subLabel;
    }

    if (valSpeed) valSpeed.textContent = `${this.playbackRate}x`;

    const aspectLabels: Record<string, string> = {
      contain: "Fit",
      cover: "Fill",
      fill: "Stretch"
    };
    if (valAspect) valAspect.textContent = aspectLabels[this.fitMode] || "Fit";

    this.renderServersSubmenu();
    this.renderQualitySubmenu();
    this.renderAudioSubmenu();
    this.renderSubtitlesSubmenu();
    this.renderSpeedSubmenu();
    this.renderAspectSubmenu();
  }

  private renderServersSubmenu(): void {
    const listEl = document.getElementById("menu-list-servers");
    if (!listEl) return;
    listEl.innerHTML = "";

    this.sources.forEach((s) => {
      const isCurrent = this.activeSource?.id === s.id;
      const health = this.healthMap.get(s.id);
      const latencyStr = health ? `${health.latencyMs}ms` : "Online";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `ckin-menu-item ${isCurrent ? "active" : ""}`;
      btn.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
          <span style="font-weight:700;color:${isCurrent ? "var(--auto-accent, #38bdf8)" : "#ffffff"};">${s.label || s.name}</span>
          <span style="font-size:10.5px;color:#94a3b8;font-family:var(--auto-mono);">${s.type.toUpperCase()} · ${latencyStr}</span>
        </div>
        ${isCurrent ? SVG.check : ""}
      `;
      btn.onclick = (e) => {
        e.stopPropagation();
        this.loadSource(s);
        this.showSettingsPage("main");
      };
      listEl.appendChild(btn);
    });
  }

  private renderQualitySubmenu(): void {
    const listEl = document.getElementById("menu-list-quality");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (this.activeSource?.type === "embed") {
      const info = document.createElement("div");
      info.style.cssText = "padding:12px 8px;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;";
      info.textContent = `Quality settings are managed directly inside the ${this.activeSource.label} player.`;
      listEl.appendChild(info);

      const castle = this.sources.find((s) => s.type === "hls" && s.url);
      if (castle) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ckin-menu-item";
        btn.style.cssText = "justify-content:center;color:var(--auto-accent, #38bdf8);margin-top:8px;";
        btn.textContent = `Switch to ${castle.label} (Native Controls)`;
        btn.onclick = () => {
          this.loadSource(castle);
          this.showSettingsPage("quality");
        };
        listEl.appendChild(btn);
      }
      return;
    }

    const qualities = this.availableQualities.length > 0 ? this.availableQualities : ["Auto", "1080p", "720p", "480p"];
    qualities.forEach((q) => {
      const isCurrent = this.activeQuality.toLowerCase() === q.toLowerCase();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `ckin-menu-item ${isCurrent ? "active" : ""}`;
      btn.innerHTML = `<span style="color:${isCurrent ? "var(--auto-accent, #38bdf8)" : "#ffffff"};">${q}</span> ${isCurrent ? SVG.check : ""}`;
      btn.onclick = (e) => {
        e.stopPropagation();
        this.applyQualityChange(q);
        this.updateSettingsPanel();
        this.showToast(`Quality: ${q}`);
        this.showSettingsPage("main");
      };
      listEl.appendChild(btn);
    });
  }

  private renderAudioSubmenu(): void {
    const listEl = document.getElementById("menu-list-audio");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (this.activeSource?.type === "embed") {
      const info = document.createElement("div");
      info.style.cssText = "padding:12px 8px;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;";
      info.textContent = `Audio tracks are managed directly inside the ${this.activeSource.label} player.`;
      listEl.appendChild(info);

      const castle = this.sources.find((s) => s.type === "hls" && s.url);
      if (castle) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ckin-menu-item";
        btn.style.cssText = "justify-content:center;color:var(--auto-accent, #38bdf8);margin-top:8px;";
        btn.textContent = `Switch to ${castle.label} (Multi-Audio)`;
        btn.onclick = () => {
          this.loadSource(castle);
          this.showSettingsPage("audio");
        };
        listEl.appendChild(btn);
      }
      return;
    }

    const tracks: Array<{ id?: string; label: string; lang: string; url?: string }> = this.availableAudioTracks.length > 0 ? this.availableAudioTracks : (this.activeSource?.audioStreams || []);

    if (tracks.length > 0) {
      tracks.forEach((stream) => {
        const isCurrent = this.activeAudioLang === stream.lang || (stream.id && this.activeAudioLang === stream.id);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `ckin-menu-item ${isCurrent ? "active" : ""}`;
        btn.innerHTML = `<span style="color:${isCurrent ? "var(--auto-accent, #38bdf8)" : "#ffffff"};">${stream.label}</span> ${isCurrent ? SVG.check : ""}`;
        btn.onclick = (e) => {
          e.stopPropagation();
          this.applyAudioChange(stream);
          this.updateSettingsPanel();
          this.showToast(`Audio: ${stream.label}`);
          this.showSettingsPage("main");
        };
        listEl.appendChild(btn);
      });
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ckin-menu-item active";
      btn.innerHTML = `<span style="color:var(--auto-accent, #38bdf8);">Default Audio (Original)</span> ${SVG.check}`;
      btn.onclick = () => this.showSettingsPage("main");
      listEl.appendChild(btn);
    }
  }

  private renderSubtitlesSubmenu(): void {
    const listEl = document.getElementById("menu-list-subtitles");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (this.activeSource?.type === "embed") {
      const info = document.createElement("div");
      info.style.cssText = "padding:12px 8px;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;";
      info.textContent = `Subtitles are managed directly inside the ${this.activeSource.label} player.`;
      listEl.appendChild(info);

      const castle = this.sources.find((s) => s.type === "hls" && s.url);
      if (castle) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ckin-menu-item";
        btn.style.cssText = "justify-content:center;color:var(--auto-accent, #38bdf8);margin-top:8px;";
        btn.textContent = `Switch to ${castle.label} (Native Subtitles)`;
        btn.onclick = () => {
          this.loadSource(castle);
          this.showSettingsPage("subtitles");
        };
        listEl.appendChild(btn);
      }
      return;
    }

    const subs = this.availableSubtitles.length > 0 ? this.availableSubtitles : [
      { id: "off", label: "Off", lang: "off" }
    ];

    subs.forEach((sub) => {
      const isCurrent = this.activeSubtitle === sub.id || (this.activeSubtitle === "off" && sub.id === "off");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `ckin-menu-item ${isCurrent ? "active" : ""}`;
      btn.innerHTML = `<span style="color:${isCurrent ? "var(--auto-accent, #38bdf8)" : "#ffffff"};">${sub.label}</span> ${isCurrent ? SVG.check : ""}`;
      btn.onclick = (e) => {
        e.stopPropagation();
        this.applySubtitleChange(sub);
        this.updateSettingsPanel();
        this.showToast(`Subtitle: ${sub.label}`);
        this.showSettingsPage("main");
      };
      listEl.appendChild(btn);
    });
  }

  private renderSpeedSubmenu(): void {
    const listEl = document.getElementById("menu-list-speed");
    if (!listEl) return;
    listEl.innerHTML = "";

    const speeds = [
      { rate: 0.5, label: "0.5x" },
      { rate: 0.75, label: "0.75x" },
      { rate: 1, label: "Normal (1x)" },
      { rate: 1.25, label: "1.25x" },
      { rate: 1.5, label: "1.5x" },
      { rate: 2, label: "2x" }
    ];

    speeds.forEach((sp) => {
      const isCurrent = this.playbackRate === sp.rate;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `ckin-menu-item ${isCurrent ? "active" : ""}`;
      btn.innerHTML = `<span style="color:${isCurrent ? "var(--auto-accent, #38bdf8)" : "#ffffff"};">${sp.label}</span> ${isCurrent ? SVG.check : ""}`;
      btn.onclick = (e) => {
        e.stopPropagation();
        this.playbackRate = sp.rate;
        if (this.videoEl) this.videoEl.playbackRate = sp.rate;
        this.updateSettingsPanel();
        this.showToast(`Speed: ${sp.label}`);
        this.showSettingsPage("main");
      };
      listEl.appendChild(btn);
    });
  }

  private renderAspectSubmenu(): void {
    const listEl = document.getElementById("menu-list-aspect");
    if (!listEl) return;
    listEl.innerHTML = "";

    const aspects = [
      { mode: "contain" as const, label: "Fit (contain) [Default]" },
      { mode: "cover" as const, label: "Fill Screen (cover)" },
      { mode: "fill" as const, label: "Stretch (100% 100%)" }
    ];

    aspects.forEach((asp) => {
      const isCurrent = this.fitMode === asp.mode;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `ckin-menu-item ${isCurrent ? "active" : ""}`;
      btn.innerHTML = `<span style="color:${isCurrent ? "var(--auto-accent, #38bdf8)" : "#ffffff"};">${asp.label}</span> ${isCurrent ? SVG.check : ""}`;
      btn.onclick = (e) => {
        e.stopPropagation();
        this.fitMode = asp.mode;
        this.applyFitMode();
        this.updateSettingsPanel();
        this.showSettingsPage("main");
      };
      listEl.appendChild(btn);
    });
  }

  private showSettingsPage(page: string): void {
    const pages = document.querySelectorAll<HTMLElement>(".ckin-menu-page");
    pages.forEach((p) => p.classList.remove("active"));
    const target = document.getElementById(`menu-page-${page}`);
    if (target) target.classList.add("active");
  }

  private openSettings(page = "main"): void {
    this.showSettingsPage(page);
    this.settingsPopover.classList.add("visible");
    this.bigPlayBtn.classList.add("hidden-for-settings");
  }

  private closeSettings(): void {
    this.settingsPopover.classList.remove("visible");
    this.bigPlayBtn.classList.remove("hidden-for-settings");
    this.resetHideTimer();
  }

  private applyQualityChange(quality: string): void {
    this.activeQuality = quality;

    if (quality.toLowerCase() === "auto") {
      if (this.hlsInstance) {
        this.hlsInstance.currentLevel = -1;
      }
      return;
    }

    if (this.hlsInstance && this.hlsInstance.levels && this.hlsInstance.levels.length > 0) {
      const idx = this.hlsInstance.levels.findIndex(
        (l) => `${l.height}p`.toLowerCase() === quality.toLowerCase() || l.name?.toLowerCase() === quality.toLowerCase()
      );
      if (idx !== -1) {
        this.hlsInstance.currentLevel = idx;
        return;
      }
    }

    if (this.activeSource?.qualityVariants && this.activeSource.qualityVariants.length > 0 && this.videoEl) {
      const match = this.activeSource.qualityVariants.find((qv) => qv.label.toLowerCase() === quality.toLowerCase());
      if (match && match.url) {
        const time = this.videoEl.currentTime;
        const wasPaused = this.videoEl.paused;
        if (this.hlsInstance) {
          this.hlsInstance.loadSource(match.url);
        } else {
          this.videoEl.src = match.url;
        }
        this.videoEl.currentTime = time;
        if (!wasPaused) this.videoEl.play().catch(() => {});
      }
    }
  }

  private applyAudioChange(stream: { id?: string; label: string; lang: string; url?: string }): void {
    if (!this.videoEl) return;
    this.activeAudioLang = stream.lang || stream.id || "";

    if (this.hlsInstance && this.hlsInstance.audioTracks && this.hlsInstance.audioTracks.length > 0) {
      const idx = this.hlsInstance.audioTracks.findIndex(
        (t) => (stream.id && String(t.id) === stream.id) || t.lang === stream.lang || t.name === stream.label
      );
      if (idx !== -1) {
        this.hlsInstance.audioTrack = idx;
        return;
      }
    }

    if (stream.url && stream.url !== this.videoEl.src) {
      const time = this.videoEl.currentTime;
      const wasPaused = this.videoEl.paused;
      if (this.hlsInstance) {
        this.hlsInstance.loadSource(stream.url);
      } else {
        this.videoEl.src = stream.url;
      }
      this.videoEl.currentTime = time;
      if (!wasPaused) this.videoEl.play().catch(() => {});
    }
  }

  private applySubtitleChange(sub: { id: string; label: string; lang: string; url?: string }): void {
    this.activeSubtitle = sub.id;

    if (sub.id === "off") {
      if (this.hlsInstance) {
        this.hlsInstance.subtitleTrack = -1;
      }
      if (this.videoEl) {
        for (let i = 0; i < this.videoEl.textTracks.length; i++) {
          this.videoEl.textTracks[i].mode = "disabled";
        }
      }
      return;
    }

    if (this.hlsInstance && this.hlsInstance.subtitleTracks && this.hlsInstance.subtitleTracks.length > 0) {
      const idx = this.hlsInstance.subtitleTracks.findIndex(
        (t) => String(t.id) === sub.id || t.lang === sub.lang || t.name === sub.label
      );
      if (idx !== -1) {
        this.hlsInstance.subtitleTrack = idx;
        return;
      }
    }

    if (this.videoEl) {
      let found = false;
      for (let i = 0; i < this.videoEl.textTracks.length; i++) {
        const t = this.videoEl.textTracks[i];
        if (t.language === sub.lang || t.label.toLowerCase() === sub.label.toLowerCase()) {
          t.mode = "showing";
          found = true;
        } else {
          t.mode = "disabled";
        }
      }

      if (!found && sub.url) {
        const trackEl = document.createElement("track");
        trackEl.kind = "subtitles";
        trackEl.label = sub.label;
        trackEl.srclang = sub.lang;
        trackEl.src = sub.url;
        trackEl.default = true;
        this.videoEl.appendChild(trackEl);
        setTimeout(() => {
          if (!this.videoEl) return;
          for (let i = 0; i < this.videoEl.textTracks.length; i++) {
            const t = this.videoEl.textTracks[i];
            t.mode = (t.language === sub.lang || t.label === sub.label) ? "showing" : "disabled";
          }
        }, 100);
      }
    }
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
    if (!this.videoEl || !this.videoEl.duration) return;
    this.videoEl.currentTime = Math.max(0, Math.min(this.videoEl.duration, this.videoEl.currentTime + secs));
  }

  private toggleFullscreen(): void {
    const vp = document.getElementById("auto-vp")!;
    if (!document.fullscreenElement) {
      vp.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
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

  private cycleAspectMode(): void {
    if (this.fitMode === "contain") {
      this.fitMode = "cover";
    } else if (this.fitMode === "cover") {
      this.fitMode = "fill";
    } else {
      this.fitMode = "contain";
    }
    this.applyFitMode();
    this.updateSettingsPanel();
  }

  private applyFitMode(): void {
    if (this.videoEl) {
      this.videoEl.style.objectFit = this.fitMode;
    }
    if (this.embedIframe) {
      this.embedIframe.style.objectFit = this.fitMode;
    }

    const fitNames: Record<string, string> = {
      contain: "Fit (contain) [Default]",
      cover: "Fill (cover)",
      fill: "Stretch (fill)"
    };

    const label = fitNames[this.fitMode] || this.fitMode;

    const fitToast = document.getElementById("auto-fit-toast");
    if (fitToast) {
      fitToast.textContent = `Aspect: ${label}`;
      fitToast.classList.add("visible");
      setTimeout(() => fitToast.classList.remove("visible"), 1400);
    }

    const teleAspect = document.getElementById("studio-tele-aspect");
    if (teleAspect) {
      teleAspect.textContent = label;
    }
  }

  private bindEvents(): void {
    this.playBtn.addEventListener("click", () => this.togglePlay());
    this.bigPlayBtn.addEventListener("click", () => this.togglePlay());

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
        this.videoEl.volume = val;
        this.videoEl.muted = val === 0;
        if (muteBtn) muteBtn.innerHTML = val === 0 ? SVG.volumeMute : SVG.volumeHigh;
      }
    });

    this.settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = this.settingsPopover.classList.contains("visible");
      if (isVisible) {
        this.closeSettings();
      } else {
        this.openSettings("main");
      }
    });

    document.querySelectorAll(".ckin-btn-close-popover").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeSettings();
      });
    });

    document.getElementById("settings-backdrop")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.closeSettings();
    });

    document.addEventListener("click", (e) => {
      if (
        this.settingsPopover.classList.contains("visible") &&
        !this.settingsPopover.contains(e.target as Node) &&
        !this.settingsBtn.contains(e.target as Node)
      ) {
        this.closeSettings();
      }
    });

    const menuRows = document.querySelectorAll<HTMLElement>(".ckin-menu-row[data-sub]");
    menuRows.forEach((row) => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        const sub = row.getAttribute("data-sub");
        if (sub) this.showSettingsPage(sub);
      });
    });

    const backBtns = document.querySelectorAll<HTMLElement>(".ckin-menu-back-btn");
    backBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showSettingsPage("main");
      });
    });

    this.cropToggle?.addEventListener("change", () => {
      this.isCropBars = !!this.cropToggle.checked;
      if (this.videoEl) {
        this.videoEl.classList.toggle("crop-black-bars", this.isCropBars);
      }
    });

    this.loopToggle?.addEventListener("change", () => {
      this.isLoop = !!this.loopToggle.checked;
      if (this.videoEl) {
        this.videoEl.loop = this.isLoop;
      }
    });

    this.aspectBtn.addEventListener("click", () => {
      this.cycleAspectMode();
    });

    document.getElementById("btn-fs")?.addEventListener("click", () => this.toggleFullscreen());
    document.getElementById("btn-pip")?.addEventListener("click", () => this.togglePiP());

    document.getElementById("auto-watermark-pill")?.addEventListener("click", () => {
      this.openSettings("servers");
    });

    this.bindScrubEvents();
    this.bindGestures();
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
    const vp = document.getElementById("auto-vp")!;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTapTime = 0;
    let lastTapZone: "left" | "right" | null = null;
    let lastTouchEndTime = 0;

    const handleTap = (clientX: number, clientY: number, target: HTMLElement | null) => {
      if (target && target.closest(".ckin-btn, .ckin-scrub-bar, .ckin-settings-popover, .ckin-switch, input, button")) {
        return;
      }

      const rect = vp.getBoundingClientRect();
      const relX = clientX - rect.left;
      const zone: "left" | "right" = relX < rect.width / 2 ? "left" : "right";
      const now = Date.now();

      if (now - lastTapTime < 320 && lastTapZone === zone) {
        lastTapTime = 0;
        lastTapZone = null;
        if (zone === "left") {
          this.seekRelative(-10);
          this.triggerRipple("left");
        } else {
          this.seekRelative(10);
          this.triggerRipple("right");
        }
        this.uiChrome.classList.remove("hidden");
        this.resetHideTimer();
        return;
      }

      lastTapTime = now;
      lastTapZone = zone;

      if (this.settingsPopover.classList.contains("visible")) {
        this.closeSettings();
        return;
      }

      if (this.uiChrome.classList.contains("hidden")) {
        this.uiChrome.classList.remove("hidden");
        this.resetHideTimer();
      } else {
        this.uiChrome.classList.add("hidden");
      }
    };

    vp.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    vp.addEventListener("touchend", (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const t = e.changedTouches[0];
      const deltaX = Math.abs(t.clientX - touchStartX);
      const deltaY = Math.abs(t.clientY - touchStartY);
      const duration = Date.now() - touchStartTime;

      if (duration > 400 || deltaX > 18 || deltaY > 18) {
        return;
      }

      lastTouchEndTime = Date.now();
      const target = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
      handleTap(t.clientX, t.clientY, target);
    });

    vp.addEventListener("click", (e: MouseEvent) => {
      if (Date.now() - lastTouchEndTime < 450) {
        return;
      }
      handleTap(e.clientX, e.clientY, e.target as HTMLElement | null);
    });

    let lastMouseMove = 0;
    vp.addEventListener("mousemove", () => {
      const now = performance.now();
      if (now - lastMouseMove < 50) return;
      lastMouseMove = now;
      this.uiChrome.classList.remove("hidden");
      this.resetHideTimer();
    });
  }

  private triggerRipple(dir: "left" | "right"): void {
    const ripple = document.getElementById(`ripple-${dir}`);
    if (!ripple) return;
    ripple.classList.add("active");
    setTimeout(() => ripple.classList.remove("active"), 450);
  }

  private toggleChromeVisibility(): void {
    if (this.uiChrome.classList.contains("hidden")) {
      this.uiChrome.classList.remove("hidden");
      this.resetHideTimer();
    } else {
      this.uiChrome.classList.add("hidden");
      this.closeSettings();
    }
  }

  private resetHideTimer(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      if (this.videoEl && !this.videoEl.paused && !this.settingsPopover.classList.contains("visible")) {
        this.uiChrome.classList.add("hidden");
      }
    }, 3500);
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
