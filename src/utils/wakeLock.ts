export class ScreenWakeLock {
  private sentinel: any = null;
  private isActive: boolean = false;
  private visibilityHandler: (() => void) | null = null;
  private userInteractionHandler: (() => void) | null = null;
  private shouldKeepAliveCallback?: () => boolean;

  constructor(shouldKeepAlive?: () => boolean) {
    this.shouldKeepAliveCallback = shouldKeepAlive;
    this.bindVisibility();
  }

  private bindVisibility(): void {
    if (typeof document === "undefined") return;
    this.visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        if (this.isActive && (!this.shouldKeepAliveCallback || this.shouldKeepAliveCallback())) {
          this.request();
        }
      } else {
        if (this.sentinel) {
          try {
            this.sentinel.release().catch(() => {});
          } catch {}
          this.sentinel = null;
        }
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  public async request(): Promise<boolean> {
    this.isActive = true;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return false;
    }
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return false;
    }
    try {
      if (this.sentinel && !this.sentinel.released) {
        return true;
      }
      this.sentinel = await (navigator as any).wakeLock.request("screen");
      this.sentinel.addEventListener("release", () => {
        this.sentinel = null;
        if (this.isActive && document.visibilityState === "visible" && (!this.shouldKeepAliveCallback || this.shouldKeepAliveCallback())) {
          this.request();
        }
      });
      this.detachUserInteraction();
      return true;
    } catch {
      this.sentinel = null;
      this.attachUserInteraction();
      return false;
    }
  }

  public release(): void {
    this.isActive = false;
    this.detachUserInteraction();
    if (this.sentinel) {
      try {
        this.sentinel.release().catch(() => {});
      } catch {}
      this.sentinel = null;
    }
  }

  private attachUserInteraction(): void {
    if (this.userInteractionHandler || typeof document === "undefined") return;
    this.userInteractionHandler = () => {
      this.detachUserInteraction();
      if (this.isActive && (!this.shouldKeepAliveCallback || this.shouldKeepAliveCallback())) {
        this.request();
      }
    };
    const opts = { once: true, passive: true };
    document.addEventListener("touchstart", this.userInteractionHandler, opts);
    document.addEventListener("pointerdown", this.userInteractionHandler, opts);
    document.addEventListener("click", this.userInteractionHandler, opts);
  }

  private detachUserInteraction(): void {
    if (!this.userInteractionHandler || typeof document === "undefined") return;
    document.removeEventListener("touchstart", this.userInteractionHandler);
    document.removeEventListener("pointerdown", this.userInteractionHandler);
    document.removeEventListener("click", this.userInteractionHandler);
    this.userInteractionHandler = null;
  }

  public destroy(): void {
    this.release();
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
