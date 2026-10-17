export interface VidEmbedOptions {
  src?: string;
  url?: string;
  title?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  theme?: string;
  accent?: string;
  ambient?: boolean;
  embedUrl?: string;
  aspectRatio?: string;
  fit?: string;
  aspect?: string;
  width?: string;
  height?: string;
  className?: string;
}

export type VidEmbedEventHandler = (payload: any) => void;

export class VidEmbedInstance {
  public iframe: HTMLIFrameElement;
  private container: HTMLElement;
  private listeners: Map<string, Set<VidEmbedEventHandler>> = new Map();
  private messageHandler: (event: MessageEvent) => void;
  private isReady: boolean = false;
  private commandQueue: Array<any> = [];

  constructor(target: string | HTMLElement, options: VidEmbedOptions = {}) {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) {
      throw new Error(`Target container not found: ${target}`);
    }
    this.container = el;

    const baseUrl = options.embedUrl || (typeof window !== "undefined" ? `${window.location.origin}/embed` : "/embed");
    const params = new URLSearchParams();

    const videoSrc = options.src || options.url || "";
    if (videoSrc) params.set("url", videoSrc);
    if (options.title) params.set("title", options.title);
    params.set("poster", options.poster || "/assets/img/image.png");
    if (options.autoplay !== undefined) params.set("autoplay", options.autoplay ? "1" : "0");
    if (options.muted !== undefined) params.set("muted", options.muted ? "1" : "0");
    if (options.controls !== undefined) params.set("controls", options.controls ? "1" : "0");
    if (options.loop !== undefined) params.set("loop", options.loop ? "1" : "0");
    if (options.theme) params.set("theme", options.theme);
    if (options.accent) params.set("accent", options.accent);
    if (options.ambient !== undefined) params.set("ambient", options.ambient ? "1" : "0");
    if (options.fit) params.set("fit", options.fit);
    if (options.aspect) params.set("aspect", options.aspect);

    const fullSrc = `${baseUrl}?${params.toString()}`;

    this.iframe = document.createElement("iframe");
    this.iframe.src = fullSrc;
    this.iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    this.iframe.setAttribute("allowfullscreen", "true");
    this.iframe.style.width = options.width || "100%";
    this.iframe.style.height = options.height || "100%";
    this.iframe.style.border = "none";
    this.iframe.style.display = "block";
    this.iframe.style.aspectRatio = options.aspectRatio || "16 / 9";
    this.iframe.style.borderRadius = "12px";
    this.iframe.style.overflow = "hidden";

    if (options.className) {
      this.iframe.className = options.className;
    }

    this.messageHandler = (event: MessageEvent) => {
      if (!this.iframe.contentWindow || event.source !== this.iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "vidembed") return;

      if (data.event === "ready") {
        this.isReady = true;
        this.flushQueue();
      }

      const handlers = this.listeners.get(data.event);
      if (handlers) {
        handlers.forEach(handler => handler(data.payload));
      }
      const allHandlers = this.listeners.get("*");
      if (allHandlers) {
        allHandlers.forEach(handler => handler({ event: data.event, payload: data.payload }));
      }
    };

    window.addEventListener("message", this.messageHandler);
    this.container.appendChild(this.iframe);
  }

  private sendCommand(action: string, value?: any, extra?: any): void {
    const payload = { source: "vidembed-host", action, value, ...extra };
    if (!this.isReady || !this.iframe.contentWindow) {
      this.commandQueue.push(payload);
      return;
    }
    this.iframe.contentWindow.postMessage(payload, "*");
  }

  private flushQueue(): void {
    if (!this.iframe.contentWindow) return;
    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift();
      this.iframe.contentWindow.postMessage(cmd, "*");
    }
  }

  public play(): void {
    this.sendCommand("play");
  }

  public pause(): void {
    this.sendCommand("pause");
  }

  public seek(seconds: number): void {
    this.sendCommand("seek", seconds);
  }

  public setVolume(volume: number): void {
    this.sendCommand("setVolume", Math.max(0, Math.min(1, volume)));
  }

  public setMuted(muted: boolean): void {
    this.sendCommand("setMuted", !!muted);
  }

  public setPlaybackRate(rate: number): void {
    this.sendCommand("setSpeed", rate);
  }

  public loadSource(src: string, meta?: { title?: string; poster?: string }): void {
    this.sendCommand("loadSource", src, meta);
  }

  public on(event: string, handler: VidEmbedEventHandler): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return this;
  }

  public off(event: string, handler: VidEmbedEventHandler): this {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
    return this;
  }

  public destroy(): void {
    window.removeEventListener("message", this.messageHandler);
    this.listeners.clear();
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
  }
}

export const VidEmbed = {
  create(target: string | HTMLElement, options?: VidEmbedOptions): VidEmbedInstance {
    return new VidEmbedInstance(target, options);
  }
};

if (typeof window !== "undefined") {
  (window as any).VidEmbed = VidEmbed;
}
