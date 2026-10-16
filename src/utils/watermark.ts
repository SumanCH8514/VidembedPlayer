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
        top: max(14px, env(safe-area-inset-top));
        right: max(16px, env(safe-area-inset-right));
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 6px 14px 6px 9px;
        background: rgba(8, 12, 22, 0.78);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 9999px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.55);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        text-decoration: none;
        user-select: none;
        pointer-events: auto;
        cursor: pointer;
        opacity: 0.92;
        transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .vidembed-fs-watermark:hover {
        opacity: 1;
        background: rgba(14, 20, 36, 0.92);
        border-color: rgba(99, 102, 241, 0.6);
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(99, 102, 241, 0.35);
      }
      .vidembed-fs-logo {
        width: 22px;
        height: 22px;
        border-radius: 7px;
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.45);
        flex-shrink: 0;
      }
      .vidembed-fs-logo svg {
        width: 13px;
        height: 13px;
        fill: #ffffff;
      }
      .vidembed-fs-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }
      .vidembed-fs-name {
        font-size: 13px;
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
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #94a3b8;
        margin-top: 2px;
      }
      @media (max-width: 640px) {
        .vidembed-fs-watermark {
          top: max(10px, env(safe-area-inset-top));
          right: max(10px, env(safe-area-inset-right));
          padding: 5px 11px 5px 8px;
        }
        .vidembed-fs-sub {
          display: none;
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
