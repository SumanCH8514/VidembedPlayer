# VidEmbed Player

> Universal Client-Side Video Engine & Auto Streaming Studio for the Modern Web.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hls.js](https://img.shields.io/badge/HLS.js-Adaptive%20VOD-orange?style=flat-square)](https://github.com/video-dev/hls.js)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers%20%26%20Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Organization](https://img.shields.io/badge/Maintained%20by-SumanOnline%20Web%20Services-blueviolet?style=flat-square)](https://sumanonline.com)

VidEmbed Player is a high-performance web media architecture and embed studio engineered for high-traffic streaming hubs, developers, and media portals. It combines a client-side zero-transcode player engine with an autonomous multi-server failover streaming suite.

By leveraging browser WebCodecs, WebAssembly demuxing, and optimized HLS adaptive bitrate streaming, VidEmbed delivers smooth, hardware-accelerated playback across desktop and mobile devices without requiring expensive server-side transcoding clusters.

---

## Features

- **Universal Container Playback**: Directly decodes MKV, AVI, MP4, WebM, MOV, and HLS (`.m3u8`) files in the browser without server-side re-encoding.
- **Autonomous Multi-Server Failover**: Real-time CDN edge discovery with automatic failover across live streaming nodes for 99.99% uptime.
- **Adaptive Bitrate & Multi-Audio**: Intelligent ABR quality switching (`1080p`, `720p`, `480p`, `Auto`) paired with multi-channel language track selection.
- **Hardware-Accelerated UI**: 60fps GPU-composited interface featuring custom scrub bars, double-tap seek ripples, and responsive cinema controls.
- **Zero-Overhead Standalone Embeds**: Dedicated lightweight player shells (`< 3KB`) optimized for low-latency iframe embedding without main-thread DOM bloat.
- **Interactive Embed Studio**: Real-time URL query customizer, dynamic brand watermark injection, live server telemetry, and instant code generation (Iframe, Direct URL, JS SDK).
- **Dynamic Security Watermarking**: Client-side canvas watermarking with customizable text, positioning, and timestamp overlays to deter content ripping.
- **Mobile-First Gestures**: Dual-zone touch navigation, tap-to-seek intervals, Picture-in-Picture (PiP), and native aspect ratio controls (`Fit`, `Fill`, `Stretch`).

---

## Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Language & Core** | TypeScript 5.5 | Strictly-typed application logic and data contracts |
| **Build & Dev Server** | Vite 5.4 | Ultra-fast Hot Module Replacement (HMR) and optimized rollup bundling |
| **Stream Engine** | HLS.js & WebCodecs | Buffer-optimized VOD streaming and client-side container demuxing |
| **Styling** | Modern CSS3 | Custom design system, CSS Grid, hardware acceleration, glassmorphism |
| **Deployment** | Cloudflare Workers & Pages | Global edge caching, clean URL rewriting, and zero-cold-start delivery |
| **Metadata Integration** | TMDB & IMDb Proxy | Automated artwork generation via wsrv.nl and metadata resolution |

---

## Project Structure

```text
VidembedPlayer/
├── public/                 # Static assets, branding icons, and favicons
├── src/
│   ├── auto/               # Autonomous Multi-Server Streaming Suite
│   │   ├── services/       # Stream discovery, health checks & TMDB APIs
│   │   ├── autoPlayer.ts   # Core playback lifecycle and HLS controller
│   │   ├── autoPlayer.css  # Hardware-accelerated player design system
│   │   ├── autoStudio.ts   # Interactive embed studio dashboard & generator
│   │   ├── autoStudio.css  # Studio layout and telemetry visual tokens
│   │   ├── autoEmbed.ts    # Standalone lightweight embed entry point
│   │   └── types.ts        # Media schemas, server contracts, and configurations
│   ├── player/             # Native HTML5 and WebCodecs playback fallback
│   ├── sdk/                # Modular client-side JavaScript SDK
│   ├── utils/              # Canvas watermark and utility modules
│   ├── style.css           # Global design system tokens and components
│   ├── main.ts             # Main universal studio controller
│   └── worker.ts           # Cloudflare Worker edge router
├── auto.html               # Auto Stream Studio & Configurator
├── auto-embed.html         # Ultra-lightweight standalone embed shell
├── embed.html              # Universal player embed shell
├── docs.html               # Full API parameter and SDK documentation
├── index.html              # Main Universal Video Studio
├── package.json            # Project dependencies and script tasks
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite multi-page build & clean routing plugins
└── wrangler.json           # Cloudflare Workers deployment configuration
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SumanCH8514/VidembedPlayer.git
   cd VidembedPlayer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local development server**
   ```bash
   npm run dev
   ```

4. **Open in your browser**
   - Universal Studio: `http://localhost:3000`
   - Auto Stream Studio: `http://localhost:3000/auto`

---

## Usage Examples

### 1. Auto Stream Responsive Iframe Embed

Embed any TMDB movie or television episode with custom player branding:

```html
<iframe
  src="https://your-domain.com/auto?type=movie&id=1236045&brand=SumanMovies&color=06b6d4&embed=1"
  width="100%"
  height="100%"
  frameborder="0"
  scrolling="no"
  allowfullscreen
  allow="autoplay; encrypted-media; picture-in-picture">
</iframe>
```

### 2. Direct Player Link

Open standalone cinema mode directly in any browser:

```text
https://your-domain.com/auto?type=movie&id=1236045&brand=SumanMovies&color=06b6d4&embed=1
```

For episodic TV series:

```text
https://your-domain.com/auto?type=tv&id=94997&s=1&e=1&brand=SumanMovies&color=06b6d4&embed=1
```

### 3. Programmatic JavaScript SDK

Mount the autonomous player directly inside any DOM container:

```html
<div id="player-container" style="width: 100%; aspect-ratio: 16/9;"></div>

<script type="module">
  import { AutoPlayer } from "https://your-domain.com/src/auto/autoPlayer.ts";

  const player = new AutoPlayer(document.getElementById("player-container"), {
    type: "movie",
    id: "1236045",
    brand: "SumanMovies",
    color: "#06b6d4",
    fit: "contain",
    autoplay: true,
    muted: false
  });
</script>
```

---

## URL Parameters Reference

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `"movie"` \| `"tv"` | `"movie"` | Media classification |
| `id` | `string` | — | TMDB ID or IMDb ID (e.g., `1236045` or `tt1375666`) |
| `s` | `number` | `1` | Season index for television content |
| `e` | `number` | `1` | Episode index for television content |
| `brand` | `string` | `"VidEmbed"` | Brand watermark text displayed in the header pill |
| `color` | `string` | `"#06b6d4"` | Primary player accent color (Hex string) |
| `fit` | `"contain"` \| `"cover"` \| `"fill"` | `"contain"` | Initial video viewport object-fit mode |
| `autoplay` | `"1"` \| `"0"` | `"0"` | Attempt automatic playback on initial load |
| `muted` | `"1"` \| `"0"` | `"0"` | Initialize player audio in muted state |
| `embed` | `"1"` \| `"0"` | `"0"` | Launch directly into standalone player mode |

---

## Preview & Demos

| Auto Stream Studio Dashboard | Standalone Cinema Player |
| :---: | :---: |
| ![Studio Dashboard](https://raw.githubusercontent.com/SumanCH8514/VidembedPlayer/main/public/preview-dashboard.png) | ![Cinema Player](https://raw.githubusercontent.com/SumanCH8514/VidembedPlayer/main/public/preview-player.png) |

---

## Contributing

Contributions make the developer community an open and productive place. Any improvements, bug fixes, or enhancements are welcome.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m "Add NewFeature"`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for full licensing information.

---

## Author & Contact

Built, designed, and maintained by **SumanOnline Web Services**.

- **Organization**: [SumanOnline Web Services](https://sumanonline.com)
- **Official Website**: [SumanOnline.Com](https://sumanonline.com)
- **GitHub**: [@SumanCH8514](https://github.com/SumanCH8514)
- **Repository**: [https://github.com/SumanCH8514/VidembedPlayer](https://github.com/SumanCH8514/VidembedPlayer)
