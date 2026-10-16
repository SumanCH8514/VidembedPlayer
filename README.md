# VidEmbed Studio

> **Universal Client-Side Video Player & Embed Platform**  
> Play any video format directly in the browser with WebCodecs & FFmpeg WASM — zero server transcoding required.

---

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Organization](https://img.shields.io/badge/Maintained%20by-SumanOnline%20Web%20Services-blueviolet?style=flat-square)](https://sumanonline.com)

VidEmbed Studio is a high-performance web-based video player and embed generator. It delivers native, hardware-accelerated playback for non-native web containers (such as MKV, AVI, and TS) alongside standard web formats (MP4, WebM, HLS). By combining client-side demuxing with WebCodecs and WebAssembly, VidEmbed eliminates expensive server-side transcode pipelines while providing a production-grade embed solution.

---

## Key Features

- **Universal Container Support**: Plays MKV, MP4, AVI, WebM, MOV, and HLS (.m3u8) streams client-side without backend re-encoding.
- **Hardware Acceleration**: Utilizes browser WebCodecs and FFmpeg WASM for low-latency, smooth decoding.
- **Portable Embed Engine**: Generates standalone, responsive iframe embeds with customizable parameters (`autoplay`, `loop`, `controls`, `theme`).
- **Dynamic Security Watermarking**: Built-in client-side canvas watermarking with dynamic timestamping and customizable positioning for anti-rip protection.
- **Bi-directional JavaScript SDK**: Lightweight postMessage-based SDK (`VidEmbedPlayer`) for remote control and playback telemetry.
- **Developer Studio UI**: Interactive URL query builder, live playback previewer, embed code generator, and API playground.
- **Zero Heavy Dependencies**: Clean, modern design built with Vanilla CSS variables, high-contrast dark mode, and TypeScript.

---

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Vanilla TypeScript & HTML5 | Lightweight, standards-based foundation |
| **Video Engine** | Movi-Player / FFmpeg WASM | Client-side container demuxing & WebCodecs |
| **Styling** | Modern CSS3 (Custom Design System) | Glassmorphism, CSS Grid, full mobile responsiveness |
| **Build & Tooling** | Vite 5.x | Ultra-fast HMR and optimized production bundling |
| **Integration** | Custom JavaScript SDK (`postMessage`) | Headless cross-origin embed communications |

---

## Project Structure

```text
VidembedPlayer/
├── public/                 # Static assets and icons
├── src/
│   ├── sdk/
│   │   └── vidembed.ts     # Client-side JavaScript SDK
│   ├── utils/
│   │   └── watermark.ts    # Canvas security overlay engine
│   ├── embed.ts            # Lightweight embed runtime entry
│   ├── main.ts             # Studio dashboard controller
│   └── style.css           # Design tokens, themes & layout styles
├── docs.html               # Comprehensive API & parameter documentation
├── embed.html              # Standalone embed player page
├── index.html              # Main studio dashboard & generator
├── test-embed.html         # SDK verification & test harness
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (version 9.0.0 or higher)

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

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`.

---

## Usage

### 1. Direct Embed URL

You can embed any video source by linking directly to `/embed` with query parameters:

```html
<iframe
  src="https://your-domain.com/embed?url=https://example.com/video.mkv&title=Demo+Video&autoplay=1&muted=1"
  width="100%"
  height="480"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>
```

### 2. Supported Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | *required* | Encoded URL of the media file (MP4, MKV, WebM, HLS) |
| `title` | `string` | `""` | Video title displayed in top overlay |
| `poster` | `string` | `""` | Poster image URL shown before playback starts |
| `autoplay` | `boolean` | `0` | Automatically start playback (`1` or `0`) |
| `muted` | `boolean` | `0` | Start playback in muted state (`1` or `0`) |
| `loop` | `boolean` | `0` | Loop playback continuously (`1` or `0`) |
| `controls` | `boolean` | `1` | Show player control bar (`1` or `0`) |
| `wm` | `string` | `""` | Watermark text overlay for DRM/attribution |

### 3. Programmatic JavaScript SDK

Control the player and listen for playback events across origins:

```typescript
import { VidEmbedPlayer } from './src/sdk/vidembed';

const container = document.getElementById('player-container')!;
const player = new VidEmbedPlayer(container, {
  url: 'https://example.com/sample.mkv',
  title: 'Sample Playback',
  autoplay: false,
  muted: false,
  watermark: 'Confidential - Preview Only'
});

player.on('play', () => {
  console.log('Video playback started');
});

player.on('timeupdate', ({ currentTime, duration }) => {
  console.log(`Progress: ${currentTime.toFixed(1)} / ${duration.toFixed(1)}s`);
});
```

---

## Preview & Demos

| Studio Dashboard | Standalone Embed Player |
| :---: | :---: |
| ![Studio Dashboard](https://raw.githubusercontent.com/SumanCH8514/VidembedPlayer/main/public/preview-dashboard.png) | ![Embed Player](https://raw.githubusercontent.com/SumanCH8514/VidembedPlayer/main/public/preview-player.png) |

> *Note: Replace preview images with production screenshots upon release.*

---

## Contributing

Contributions make the open-source community an inspiring place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Organization & Contact

Built, designed, and maintained by **SumanOnline Web Services**.

- **Website**: [SumanOnline.Com](https://sumanonline.com)
- **GitHub**: [@SumanCH8514](https://github.com/SumanCH8514)
- **Repository**: [https://github.com/SumanCH8514/VidembedPlayer](https://github.com/SumanCH8514/VidembedPlayer)
