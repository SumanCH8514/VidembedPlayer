const genType = document.getElementById("gen-type") as HTMLSelectElement | null;
const genId = document.getElementById("gen-id") as HTMLInputElement | null;
const genTvWrap = document.getElementById("gen-tv-wrap") as HTMLElement | null;
const genSeason = document.getElementById("gen-season") as HTMLInputElement | null;
const genEpisode = document.getElementById("gen-episode") as HTMLInputElement | null;
const genBrand = document.getElementById("gen-brand") as HTMLInputElement | null;
const genColor = document.getElementById("gen-color") as HTMLInputElement | null;
const genFit = document.getElementById("gen-fit") as HTMLSelectElement | null;
const genAutoplay = document.getElementById("gen-autoplay") as HTMLInputElement | null;
const genMuted = document.getElementById("gen-muted") as HTMLInputElement | null;

const outputIframe = document.getElementById("gen-output-iframe") as HTMLElement | null;
const outputUrl = document.getElementById("gen-output-url") as HTMLElement | null;
const outputReact = document.getElementById("gen-output-react") as HTMLElement | null;
const previewBtn = document.getElementById("gen-preview-btn") as HTMLButtonElement | null;

function buildEmbedUrl(): string {
  const type = genType?.value || "movie";
  const id = genId?.value.trim() || "1236045";
  const brand = genBrand?.value.trim() || "SumanMovies";
  const color = (genColor?.value.trim() || "0ea5e9").replace("#", "");
  const fit = genFit?.value || "contain";
  const autoplay = genAutoplay?.checked ? "1" : "0";
  const muted = genMuted?.checked ? "1" : "0";

  const host = window.location.origin;
  const q = new URLSearchParams();
  q.set("type", type);
  q.set("id", id);
  if (type === "tv") {
    q.set("s", genSeason?.value || "1");
    q.set("e", genEpisode?.value || "1");
  }
  if (brand && brand !== "SumanMovies") q.set("brand", brand);
  if (color && color !== "0ea5e9") q.set("color", color);
  if (fit !== "contain") q.set("fit", fit);
  if (autoplay === "1") q.set("autoplay", "1");
  if (muted === "1") q.set("muted", "1");
  q.set("embed", "1");

  return `${host}/auto?${q.toString()}`;
}

function updateGeneratorOutputs(): void {
  const isTv = genType?.value === "tv";
  if (genTvWrap) {
    genTvWrap.style.display = isTv ? "flex" : "none";
  }

  const url = buildEmbedUrl();
  const type = genType?.value || "movie";
  const id = genId?.value.trim() || "1236045";
  const s = genSeason?.value || "1";
  const e = genEpisode?.value || "1";
  const brand = genBrand?.value.trim() || "SumanMovies";
  const color = (genColor?.value.trim() || "0ea5e9").replace("#", "");

  if (outputUrl) {
    outputUrl.textContent = url;
  }

  if (outputIframe) {
    outputIframe.textContent = `<div style="position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;">
  <iframe
    src="${url}"
    width="100%"
    height="100%"
    style="border:none;position:absolute;top:0;left:0;width:100%;height:100%;"
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
    allowfullscreen>
  </iframe>
</div>`;
  }

  if (outputReact) {
    outputReact.textContent = `import React from 'react';

export const AutoPlayer = () => {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}>
      <iframe
        src="${url}"
        style={{ border: 'none', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
      />
    </div>
  );
};`;
  }
}

[genType, genFit].forEach((el) => el?.addEventListener("change", updateGeneratorOutputs));
[genId, genSeason, genEpisode, genBrand, genColor].forEach((el) => el?.addEventListener("input", updateGeneratorOutputs));
[genAutoplay, genMuted].forEach((el) => el?.addEventListener("change", updateGeneratorOutputs));

previewBtn?.addEventListener("click", () => {
  const url = buildEmbedUrl();
  window.open(url, "_blank");
});

updateGeneratorOutputs();

document.querySelectorAll<HTMLButtonElement>(".docs-code-copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const pre = btn.closest(".docs-code-container")?.querySelector("pre code");
    if (!pre) return;
    const text = pre.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      const originalHtml = btn.innerHTML;
      btn.classList.add("copied");
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>`;
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = originalHtml;
      }, 2000);
    } catch {}
  });
});

const mobileToggle = document.getElementById("docs-mobile-toggle");
const sidebar = document.getElementById("docs-sidebar");
const sidebarBackdrop = document.getElementById("docs-sidebar-backdrop");
const sidebarClose = document.getElementById("docs-sidebar-close");

function openMobileSidebar(): void {
  sidebar?.classList.add("open");
  sidebarBackdrop?.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar(): void {
  sidebar?.classList.remove("open");
  sidebarBackdrop?.classList.remove("visible");
  document.body.style.overflow = "";
}

mobileToggle?.addEventListener("click", () => {
  if (sidebar?.classList.contains("open")) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
});

sidebarClose?.addEventListener("click", closeMobileSidebar);
sidebarBackdrop?.addEventListener("click", closeMobileSidebar);

document.addEventListener("click", (e) => {
  if (
    sidebar?.classList.contains("open") &&
    !sidebar.contains(e.target as Node) &&
    !mobileToggle?.contains(e.target as Node) &&
    !sidebarBackdrop?.contains(e.target as Node)
  ) {
    closeMobileSidebar();
  }
});

const sections = document.querySelectorAll<HTMLElement>("section[id]");
const navLinks = document.querySelectorAll<HTMLAnchorElement>(".docs-sidebar-link");
const mainScroll = document.getElementById("docs-main-scroll");

function updateActiveSection(): void {
  let activeId = "";
  sections.forEach((sec) => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 160 && rect.bottom >= 100) {
      activeId = sec.getAttribute("id") || "";
    }
  });

  if (!activeId && sections.length > 0) {
    const firstRect = sections[0].getBoundingClientRect();
    if (firstRect.top > 0) {
      activeId = sections[0].getAttribute("id") || "";
    }
  }

  if (activeId) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }
}

mainScroll?.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("scroll", updateActiveSection, { passive: true });

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const targetEl = document.getElementById(href.slice(1));
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
      if (window.innerWidth <= 840) {
        closeMobileSidebar();
      }
    }
  });
});
