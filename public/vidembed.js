(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VidEmbed = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function VidEmbedInstance(target, options) {
    options = options || {};
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) {
      throw new Error("Target container not found: " + target);
    }
    this.container = el;

    var baseUrl = options.embedUrl || (typeof window !== "undefined" ? window.location.origin + "/embed" : "/embed");
    var params = new URLSearchParams();

    var videoSrc = options.src || options.url || "";
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

    var fullSrc = baseUrl + "?" + params.toString();

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

    this.listeners = {};
    this.isReady = false;
    this.commandQueue = [];

    var self = this;
    this.messageHandler = function (event) {
      if (!self.iframe.contentWindow || event.source !== self.iframe.contentWindow) return;
      var data = event.data;
      if (!data || data.source !== "vidembed") return;

      if (data.event === "ready") {
        self.isReady = true;
        self.flushQueue();
      }

      var handlers = self.listeners[data.event];
      if (handlers) {
        handlers.forEach(function (h) { h(data.payload); });
      }
      var allHandlers = self.listeners["*"];
      if (allHandlers) {
        allHandlers.forEach(function (h) { h({ event: data.event, payload: data.payload }); });
      }
    };

    window.addEventListener("message", this.messageHandler);
    this.container.appendChild(this.iframe);
  }

  VidEmbedInstance.prototype.sendCommand = function (action, value, extra) {
    var payload = Object.assign({ source: "vidembed-host", action: action, value: value }, extra || {});
    if (!this.isReady || !this.iframe.contentWindow) {
      this.commandQueue.push(payload);
      return;
    }
    this.iframe.contentWindow.postMessage(payload, "*");
  };

  VidEmbedInstance.prototype.flushQueue = function () {
    if (!this.iframe.contentWindow) return;
    while (this.commandQueue.length > 0) {
      var cmd = this.commandQueue.shift();
      this.iframe.contentWindow.postMessage(cmd, "*");
    }
  };

  VidEmbedInstance.prototype.play = function () {
    this.sendCommand("play");
  };

  VidEmbedInstance.prototype.pause = function () {
    this.sendCommand("pause");
  };

  VidEmbedInstance.prototype.seek = function (seconds) {
    this.sendCommand("seek", seconds);
  };

  VidEmbedInstance.prototype.setVolume = function (vol) {
    this.sendCommand("setVolume", Math.max(0, Math.min(1, vol)));
  };

  VidEmbedInstance.prototype.setMuted = function (muted) {
    this.sendCommand("setMuted", !!muted);
  };

  VidEmbedInstance.prototype.setPlaybackRate = function (rate) {
    this.sendCommand("setSpeed", rate);
  };

  VidEmbedInstance.prototype.loadSource = function (src, meta) {
    this.sendCommand("loadSource", src, meta);
  };

  VidEmbedInstance.prototype.on = function (event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
    return this;
  };

  VidEmbedInstance.prototype.off = function (event, handler) {
    var handlers = this.listeners[event];
    if (handlers) {
      this.listeners[event] = handlers.filter(function (h) { return h !== handler; });
    }
    return this;
  };

  VidEmbedInstance.prototype.destroy = function () {
    window.removeEventListener("message", this.messageHandler);
    this.listeners = {};
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
  };

  return {
    create: function (target, options) {
      return new VidEmbedInstance(target, options);
    }
  };
});
