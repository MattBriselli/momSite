/**
 * Arioso String Quartet — Core Site Interactions
 * - Responsive Navbar with Popover & ResizeObserver (modern-web-guidance: navbar)
 * - FAQ Accordion Expand/Collapse All & Invoker Commands fallback (modern-web-guidance: accordion)
 * - Audio Samples Exclusive Playback & Media Lazy-Load Fallback (modern-web-guidance: lazy-load-video-and-audio)
 * - Venues Live Search & Category Filter
 */

// MANDATORY: Feature detect 'popover' on HTMLElement.prototype before loading polyfill.
if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
  import("https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js");
}

document.addEventListener("DOMContentLoaded", () => {
  initResponsiveNavbar();
  initFaqAccordion();
  initAudioSamples();
  initLazyMediaFallback();
  initVenuesFilter();
});

/**
 * 1. Responsive Site Navigation (navbar guide)
 * Uses one <nav> landmark and switches between popover="auto" (narrow)
 * and inline .is-wide layout based on measured available width.
 */
function initResponsiveNavbar() {
  const header = document.getElementById("site-header");
  const menu = document.getElementById("site-menu");
  if (!header || !menu) return;

  const inner = header.querySelector(".header-inner");
  if (!inner) return;

  // Ensure aria-current="page" matches current URL path if not already set
  const currentLinks = menu.querySelectorAll('a[aria-current="page"]');
  if (currentLinks.length === 0) {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
    const pageKey = rawPath === "" ? "index" : rawPath;
    for (const link of menu.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href").replace(/\.html$/i, "");
      if (href.toLowerCase() === pageKey.toLowerCase()) {
        link.setAttribute("aria-current", "page");
        break;
      }
    }
  }

  let lastHeaderWidth = 0;

  function syncNavbarLayout() {
    const currentWidth = header.clientWidth;
    const isCurrentlyWide = header.classList.contains("is-wide");

    // While collapsed, only remeasure when the header's width has grown
    // so switching to inline just to measure on every shrink doesn't thrash layout.
    if (!isCurrentlyWide && currentWidth <= lastHeaderWidth) {
      lastHeaderWidth = currentWidth;
      return;
    }
    lastHeaderWidth = currentWidth;

    const wasOpen = menu.matches(":popover-open, .\\:popover-open");

    header.classList.add("is-measuring", "is-wide");
    const fitsInline = inner.scrollWidth <= inner.clientWidth;

    if (fitsInline) {
      header.classList.add("is-wide");
      menu.removeAttribute("popover");
    } else {
      header.classList.remove("is-wide");
      menu.setAttribute("popover", "auto");
      if (wasOpen && typeof menu.showPopover === "function") {
        try {
          menu.showPopover();
        } catch (_) {
          // Ignore if polyfill is still initializing
        }
      }
    }

    requestAnimationFrame(() => {
      header.classList.remove("is-measuring");
    });
  }

  syncNavbarLayout();

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => syncNavbarLayout());
    ro.observe(header);
    ro.observe(menu);
  } else {
    window.addEventListener("resize", syncNavbarLayout);
  }
}

/**
 * 2. FAQ Accordion Expand/Collapse All (accordion guide)
 */
function initFaqAccordion() {
  const accordion = document.getElementById("faq-accordion");
  if (!accordion) return;

  function toggleAllItems(button, targetAccordion) {
    const expand = button.getAttribute("aria-expanded") !== "true";
    for (const details of targetAccordion.querySelectorAll(":scope > details")) {
      details.open = expand;
    }
    button.setAttribute("aria-expanded", String(expand));
  }

  // Native Invoker Commands handler
  document.addEventListener(
    "command",
    (event) => {
      if (event.command !== "--toggle-all") return;
      toggleAllItems(event.source, event.target);
    },
    { capture: true }
  );

  // Fallback for browsers without Invoker Commands support
  if (!Object.hasOwn(HTMLButtonElement.prototype, "commandForElement")) {
    const toggleBtn = accordion.querySelector('[command="--toggle-all"]');
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        toggleAllItems(toggleBtn, accordion);
      });
    }
  }

  // Keep button aria-expanded in sync when individual <details> items open/close
  document.addEventListener(
    "toggle",
    (event) => {
      if (!(event.target instanceof HTMLDetailsElement)) return;
      if (!event.target.matches(".accordion > details")) return;
      const parentAccordion = event.target.parentElement;
      const button = parentAccordion.querySelector('[command="--toggle-all"]');
      if (!button) return;

      const items = parentAccordion.querySelectorAll(":scope > details");
      const allOpen = Array.prototype.every.call(items, (d) => d.open);
      button.setAttribute("aria-expanded", String(allOpen));
    },
    { capture: true }
  );
}

/**
 * 3. Audio Samples Manager: auto-pause other tracks when one plays
 */
function initAudioSamples() {
  const players = document.querySelectorAll("audio");
  if (players.length === 0) return;

  document.addEventListener(
    "play",
    (event) => {
      if (!(event.target instanceof HTMLAudioElement)) return;
      for (const audio of players) {
        const card = audio.closest(".track-card");
        if (audio !== event.target) {
          audio.pause();
          if (card) card.classList.remove("is-playing");
        } else if (card) {
          card.classList.add("is-playing");
        }
      }
    },
    true
  );

  for (const audio of players) {
    const clearPlayingState = () => {
      if (audio.paused) {
        const card = audio.closest(".track-card");
        if (card) card.classList.remove("is-playing");
      }
    };
    audio.addEventListener("pause", clearPlayingState);
    audio.addEventListener("ended", clearPlayingState);
  }
}

/**
 * 4. Lazy-Load Media Fallback (lazy-load-video-and-audio guide)
 */
function initLazyMediaFallback() {
  const supportsLazyMedia = Object.hasOwn(HTMLMediaElement.prototype, "loading");
  if (supportsLazyMedia || typeof IntersectionObserver === "undefined") return;

  const lazyMediaElements = document.querySelectorAll(
    'video[loading="lazy"], audio[loading="lazy"][controls]'
  );
  if (lazyMediaElements.length === 0) return;

  const mediaObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const media = entry.target;

        if (media.dataset.poster) {
          media.poster = media.dataset.poster;
          delete media.dataset.poster;
        }
        if (media.dataset.preload) {
          media.preload = media.dataset.preload;
          delete media.dataset.preload;
        }
        if (media.dataset.src) {
          media.src = media.dataset.src;
          delete media.dataset.src;
        }
        for (const source of media.querySelectorAll("source[data-src]")) {
          source.src = source.dataset.src;
          delete source.dataset.src;
        }

        media.load();
        observer.unobserve(media);
      }
    },
    { rootMargin: "200px 0px" }
  );

  for (const media of lazyMediaElements) {
    if (media.hasAttribute("poster")) {
      media.dataset.poster = media.getAttribute("poster");
      media.removeAttribute("poster");
    }
    if (media.hasAttribute("preload") && media.getAttribute("preload") !== "none") {
      media.dataset.preload = media.getAttribute("preload");
    }
    media.preload = "none";
    mediaObserver.observe(media);
  }
}

/**
 * 5. Venues Search & Category Filter
 */
function initVenuesFilter() {
  const searchInput = document.getElementById("venue-search");
  const filterBtns = document.querySelectorAll("[data-venue-filter]");
  const categoryCards = document.querySelectorAll("[data-venue-category]");
  const noResults = document.getElementById("venue-no-results");

  if (!searchInput || categoryCards.length === 0) return;

  let activeCategory = "all";

  function applyVenueFilter() {
    const query = searchInput.value.trim().toLowerCase();
    let totalVisible = 0;

    for (const card of categoryCards) {
      const category = card.getAttribute("data-venue-category");
      const matchesCategory = activeCategory === "all" || activeCategory === category;

      if (!matchesCategory) {
        card.hidden = true;
        continue;
      }

      let cardVisibleCount = 0;
      for (const item of card.querySelectorAll(".venue-list li")) {
        const text = item.textContent.toLowerCase();
        const matchesQuery = query === "" || text.includes(query);
        item.hidden = !matchesQuery;
        if (matchesQuery) {
          cardVisibleCount++;
          totalVisible++;
        }
      }

      card.hidden = cardVisibleCount === 0;
    }

    if (noResults) {
      noResults.hidden = totalVisible > 0;
    }
  }

  searchInput.addEventListener("input", applyVenueFilter);

  for (const btn of filterBtns) {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-venue-filter") || "all";
      for (const b of filterBtns) {
        b.classList.toggle("is-active", b === btn);
      }
      applyVenueFilter();
    });
  }
}
