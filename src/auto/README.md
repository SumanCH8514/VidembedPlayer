# Auto Stream Player & Embed Studio

Enterprise-grade auto streaming engine and embed studio designed for seamless movie and episodic television playback. Features an adaptive multi-CDN failover system, Universal Studio aesthetic, live latency telemetry, and a customizable embed builder.

Developed and maintained by **[SumanOnline Web Services](https://sumanonline.com)**.

---

## Architecture Overview

The `src/auto` module contains the self-contained Auto Stream Player suite, architected to deliver high-performance streaming with zero external framework dependencies:

```
src/auto/
├── autoPlayer.ts         Core autonomous player engine & playback lifecycle controller
├── autoPlayer.css        Styles, design tokens, animations, and custom UI components
├── autoStudio.ts         Interactive embed generator cockpit, live inspector & preview engine
├── autoStudio.css        Layout, glassmorphism styling, and telemetry UI for the Studio page
├── types.ts              TypeScript interfaces, data models, and configuration contracts
├── README.md             Technical documentation and integration guide
└── services/
    └── streamApi.ts      Resilient stream discovery, health monitoring, and TMDB resolver
```

---

## Core Capabilities

### 1. Universal Studio Cinematic Interface
- **Center Frosted-Glass Play Button**: High-precision circular action button with radial glow and smooth transition on play/pause.
- **Top Brand Pill**: Interactive watermark displaying the custom brand name and organization credits (`A SUMANONLINE PROJECT`). Clicking instantly opens the server selection panel.
- **Dynamic Bottom Controls**:
  - Play / Pause toggling with micro-animations.
  - Quick seek buttons: 10-second replay and 10-second forward.
  - Expandable volume slider with instant mute toggle.
  - High-visibility monospace timestamp (`HH:MM:SS` / `MM:SS`).
  - Settings slider button opening the unified streaming panel.
  - Aspect ratio switcher button.
  - Native Picture-in-Picture (PiP) and Fullscreen triggers.
- **Dual-Zone Touch Gestures**: Left and right mobile tap zones with animated ripple indicators for double-tap 10-second seeking.
- **Idle Chrome Management**: Controls auto-hide after 3.5 seconds of user inactivity during playback.

### 2. Unified Settings & Stream Control Popover
- **Stream & Servers Submenu**: Real-time server switching among HLS direct streams and embed mirrors with live ping latency indicators (`ms`) and status badges.
- **Quality Selector**: Auto adaptive switching alongside manual resolution selection (`1080p`, `720p`, `480p`).
- **Multi-Track Audio**: Native language and track selection for multi-audio HLS streams.
- **Subtitle Selector**: Multi-language subtitle tracks with instant toggle.
- **Variable Playback Speed**: Granular speed adjustments (`0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`).
- **Aspect Ratio Control**:
  - `Fit (contain)`: Preserves original aspect ratio without distortion (Default).
  - `Fill (cover)`: Scales video to completely fill the player viewport.
  - `Stretch (fill)`: Stretches video to exact 100% dimensions.
- **Enhancement Toggles**:
  - `Crop black bars`: Automatically zooms and crops letterboxing (1.18x scale factor).
  - `Loop`: Enables seamless continuous looping.

### 3. Multi-CDN Failover & Health Polling
- Concurrently queries stream health endpoints alongside stream manifests.
- Maps server response times and health status to order servers by availability and lowest latency.
- Graceful fallback: If an HLS manifest encounters an unrecoverable network failure, the player seamlessly falls back to alternate mirrors or embed sources without breaking user session state.

---

## Configuration & Parameter Reference

The player accepts configuration via TypeScript initialization options or standard URL query parameters:

### `AutoPlayerConfig` Options

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | `"movie"` \| `"tv"` | Required | Media classification |
| `id` | `string` | Required | TMDB ID or IMDb ID (e.g. `1236045` or `tt1234567`) |
| `season` | `number` | `1` | Season number (required for TV series) |
| `episode` | `number` | `1` | Episode number (required for TV series) |
| `brand` | `string` | `"VidEmbed"` | Brand label rendered in the player watermark pill |
| `color` | `string` | `"#38bdf8"` | Hex or CSS color string for progress bar, glow, and accent highlights |
| `autoplay` | `boolean` | `false` | When true, attempts immediate video playback on load |
| `muted` | `boolean` | `false` | When true, mutes audio on initial load |
| `server` | `string` | `undefined` | Target server identifier to select on initialization |
| `fit` | `"contain"` \| `"cover"` \| `"fill"` | `"contain"` | Default video object-fit mode |

### URL Query Parameters

When loading the player or embed frame directly, append query parameters to the URL:

```
https://example.com/auto?type=movie&id=1236045&color=38bdf8&brand=SumanMovies&autoplay=0
```

```
https://example.com/auto?type=tv&id=94997&s=1&e=1&color=06b6d4&brand=StreamHub&autoplay=0
```

---

## Integration Examples

### Programmatic Integration (TypeScript / JavaScript)

```html
<div id="player-container" style="width: 100%; aspect-ratio: 16/9; position: relative;"></div>

<script type="module">
  import { AutoPlayer } from "/src/auto/autoPlayer.ts";

  const container = document.getElementById("player-container");
  const player = new AutoPlayer(container, {
    type: "movie",
    id: "1236045",
    brand: "SumanMovies",
    color: "#38bdf8",
    fit: "contain",
    autoplay: false,
    muted: false
  });
</script>
```

### TV Series Integration

```html
<div id="player-container" style="width: 100%; aspect-ratio: 16/9; position: relative;"></div>

<script type="module">
  import { AutoPlayer } from "/src/auto/autoPlayer.ts";

  const container = document.getElementById("player-container");
  const player = new AutoPlayer(container, {
    type: "tv",
    id: "94997",
    season: 1,
    episode: 1,
    brand: "SumanTV",
    color: "#6366f1",
    fit: "contain",
    autoplay: false,
    muted: false
  });
</script>
```

### Responsive Embed (Iframe)

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);">
  <iframe
    src="https://yourdomain.com/auto?type=movie&id=1236045&color=06b6d4&brand=SumanMovies&embed=1"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
    allowfullscreen>
  </iframe>
</div>
```

---

## Embed Studio Cockpit (`/auto`)

The Auto Embed Studio (`auto.html`) offers an interactive developer console:

1. **TMDB / IMDb Quick Search**: Input any TMDB or IMDb media ID with instantaneous live preview and metadata verification (posters, genres, backdrop, release year, runtime).
2. **Interactive Customizer**: Real-time adjustment of brand watermarks, accent hex colors, autoplay flags, mute flags, and aspect ratios.
3. **Embed Code Generator**: Instant copying of responsive `<iframe>` code, script-based imports, or direct cinema URLs.
4. **Live Telemetry Bar**: Shows active stream CDN, audio channels, latency metrics, and current resolution.

---

## Technical Standards & Compliance

- **No Third-Party Bloat**: Built with vanilla TypeScript and clean DOM manipulation without bulky dependencies.
- **Security-First Architecture**: Sensitive configurations, proxies, and external credentials reside strictly on backend layers; client components consume normalized stream representations.
- **Mobile First Design**: Fully responsive across mobile touchscreens, tablets, widescreen desktops, and Smart TV browsers with fluid touch gestures.
- **Accessibility**: Includes descriptive `aria-label` tags, high-contrast themes, focus rings, and custom scrollbar visibility.

---

## Organization & Maintenance

- **Owner**: SumanOnline Web Services
- **Website**: [SumanOnline.Com](https://sumanonline.com)
- **Status**: Production Grade Ready
