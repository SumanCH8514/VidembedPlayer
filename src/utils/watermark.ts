export function attachFullscreenWatermark(player: HTMLElement): void {
  if (!player) return;

  const tryInject = () => {
    const shadowRoot = (player as any).shadowRoot;
    if (!shadowRoot) {
      setTimeout(tryInject, 100);
      return;
    }

    if (shadowRoot.getElementById("vidembed-fs-watermark")) return;

    const style = document.createElement("style");
    style.id = "vidembed-fs-watermark-styles";
    style.textContent = `
      .vidembed-fs-watermark {
        position: absolute;
        top: max(12px, env(safe-area-inset-top));
        right: max(14px, env(safe-area-inset-right));
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 5px 12px 5px 8px;
        background: rgba(8, 12, 22, 0.72);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9999px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        text-decoration: none;
        user-select: none;
        pointer-events: auto;
        cursor: pointer;
        opacity: 0.9;
        transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .vidembed-fs-watermark:hover {
        opacity: 1;
        background: rgba(14, 20, 36, 0.92);
        border-color: rgba(99, 102, 241, 0.6);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
      }
      .vidembed-fs-logo {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.45);
        flex-shrink: 0;
      }
      .vidembed-fs-logo svg {
        width: 12px;
        height: 12px;
        fill: #ffffff;
      }
      .vidembed-fs-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }
      .vidembed-fs-name {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #ffffff;
      }
      .vidembed-fs-name span {
        background: linear-gradient(135deg, #818cf8, #38bdf8);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .vidembed-fs-sub {
        font-size: 8.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #94a3b8;
        margin-top: 1px;
      }
      .movi-title-bar {
        padding-right: 130px !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .movi-title-text {
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        display: block !important;
      }
      @media (max-width: 640px) {
        .vidembed-fs-watermark {
          top: max(8px, env(safe-area-inset-top));
          right: max(8px, env(safe-area-inset-right));
          padding: 3.5px 8px 3.5px 6px;
          gap: 5px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
        .vidembed-fs-logo {
          width: 16px;
          height: 16px;
          border-radius: 5px;
        }
        .vidembed-fs-logo svg {
          width: 10px;
          height: 10px;
        }
        .vidembed-fs-name {
          font-size: 11px;
          font-weight: 700;
        }
        .vidembed-fs-sub {
          display: none;
        }
        .movi-title-bar {
          padding-right: 88px !important;
          padding-left: 10px !important;
          top: 6px !important;
        }
        .movi-title-text {
          font-size: 11.5px !important;
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
      }
      @media (max-width: 400px) {
        .vidembed-fs-watermark {
          top: max(6px, env(safe-area-inset-top));
          right: max(6px, env(safe-area-inset-right));
          padding: 3px 7px 3px 5px;
          gap: 4px;
        }
        .vidembed-fs-logo {
          width: 14px;
          height: 14px;
          border-radius: 4px;
        }
        .vidembed-fs-logo svg {
          width: 9px;
          height: 9px;
        }
        .vidembed-fs-name {
          font-size: 10px;
        }
        .movi-title-bar {
          padding-right: 80px !important;
          padding-left: 8px !important;
          top: 5px !important;
        }
        .movi-title-text {
          font-size: 10.5px !important;
        }
      }
    `;

    const badge = document.createElement("a");
    badge.id = "vidembed-fs-watermark";
    badge.className = "vidembed-fs-watermark";
    badge.href = "https://sumanonline.com";
    badge.target = "_blank";
    badge.rel = "noopener noreferrer";
    badge.title = "VidEmbed — A SumanOnline Project";
    badge.innerHTML = `
      <div class="vidembed-fs-logo">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="vidembed-fs-text">
        <div class="vidembed-fs-name">Vid<span>Embed</span></div>
        <div class="vidembed-fs-sub">A SumanOnline Project</div>
      </div>
    `;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(badge);

    const updateVisibility = () => {
      const isFs = document.fullscreenElement === player ||
                   (player as any).hasAttribute("data-fullscreen") ||
                   (player as any).classList?.contains("movi-fullscreen-active") ||
                   !!document.fullscreenElement;

      if (isFs) {
        badge.style.display = "flex";
        badge.style.opacity = "0.96";
      } else {
        badge.style.display = "flex";
        badge.style.opacity = "0.85";
      }
    };

    document.addEventListener("fullscreenchange", updateVisibility);
    document.addEventListener("webkitfullscreenchange", updateVisibility);
    player.addEventListener("fullscreenchange", updateVisibility);
    updateVisibility();
  };

  tryInject();
}
