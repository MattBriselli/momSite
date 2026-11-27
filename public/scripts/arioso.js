/**
 * Arioso String Quartet — Core Site Interactions
 * - Responsive Navbar with Popover & ResizeObserver (modern-web-guidance: navbar)
 * - FAQ Accordion Expand/Collapse All & Invoker Commands fallback (modern-web-guidance: accordion)
 * - Audio Samples Exclusive Playback & Media Lazy-Load Fallback (modern-web-guidance: lazy-load-video-and-audio)
 * - Venues Live Search, Region Filter & Venue-Type Filter
 * - Accessible Booking Inquiry Form & Post-Interaction Validation (modern-web-guidance: forms, validate-input-after-interaction)
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
  initReviewClamp();
  initContactClickTracking();
  initBookingInquiryForm();
});

/**
 * 1. Responsive Site Navigation (navbar guide)
 */
function initResponsiveNavbar() {
  const header = document.getElementById("site-header");
  const menu = document.getElementById("site-menu");
  if (!header || !menu) return;

  const inner = header.querySelector(".header-inner");
  if (!inner) return;

  const currentLinks = menu.querySelectorAll('a[aria-current="page"]');
  if (currentLinks.length === 0) {
    const rawPath = window.location.pathname.replace(/\/+$/g, "") || "/";
    for (const link of menu.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href");
      if (href && href.toLowerCase() === rawPath.toLowerCase()) {
        link.setAttribute("aria-current", "page");
        break;
      }
    }
  }

  let lastHeaderWidth = 0;

  function syncNavbarLayout() {
    const currentWidth = header.clientWidth;
    const isCurrentlyWide = header.classList.contains("is-wide");

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

  document.addEventListener(
    "command",
    (event) => {
      if (event.command !== "--toggle-all") return;
      toggleAllItems(event.source, event.target);
    },
    { capture: true }
  );

  if (!Object.hasOwn(HTMLButtonElement.prototype, "commandForElement")) {
    const toggleBtn = accordion.querySelector('[command="--toggle-all"]');
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        toggleAllItems(toggleBtn, accordion);
      });
    }
  }

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

  const trackedTracks = new WeakSet();

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
          if (!trackedTracks.has(audio) && typeof window.ariosoTrack === "function") {
            trackedTracks.add(audio);
            const title = card.querySelector(".track-title")?.textContent?.trim() || "Unknown";
            const composer = card.querySelector(".track-composer")?.textContent?.trim() || "";
            window.ariosoTrack("audio_play", {
              track_title: title,
              track_composer: composer
            });
          }
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
 * 5. Venues Search + Regional Filter (collapsible <details> regions)
 */
function initVenuesFilter() {
  const searchInput = document.getElementById("venue-search");
  const regionBtns = document.querySelectorAll("[data-region-filter]");
  const regionCards = document.querySelectorAll("[data-venue-region]");
  const noResults = document.getElementById("venue-no-results");

  if (!searchInput || regionCards.length === 0) return;

  let activeRegion = "all";

  function applyVenueFilter() {
    const query = searchInput.value.trim().toLowerCase();
    const isFiltering = query !== "" || activeRegion !== "all";
    let totalVisible = 0;

    for (const card of regionCards) {
      const cardRegion = card.getAttribute("data-venue-region");
      const matchesRegion = activeRegion === "all" || activeRegion === cardRegion;

      if (!matchesRegion) {
        card.hidden = true;
        continue;
      }

      let cardVisibleCount = 0;
      for (const item of card.querySelectorAll(".venue-list li")) {
        const text = item.textContent.toLowerCase();
        const showItem = query === "" || text.includes(query);

        item.hidden = !showItem;
        if (showItem) {
          cardVisibleCount++;
          totalVisible++;
        }
      }

      const countBadge = card.querySelector("[data-region-count]");
      if (countBadge) {
        countBadge.textContent = `${cardVisibleCount} ${cardVisibleCount === 1 ? "Venue" : "Venues"}`;
      }

      card.hidden = cardVisibleCount === 0;

      if (card instanceof HTMLDetailsElement && !card.hidden) {
        card.open = isFiltering ? true : cardRegion === "philadelphia";
      }
    }

    if (noResults) {
      noResults.hidden = totalVisible > 0;
    }
  }

  searchInput.addEventListener("input", applyVenueFilter);

  for (const btn of regionBtns) {
    btn.addEventListener("click", () => {
      activeRegion = btn.getAttribute("data-region-filter") || "all";
      for (const b of regionBtns) b.classList.toggle("is-active", b === btn);
      applyVenueFilter();
    });
  }
}

/**
 * 5b. Review Card Line-Clamp "Read more" Toggle
 */
function initReviewClamp() {
  const clampables = document.querySelectorAll(".review-body.is-clampable");
  if (clampables.length === 0) return;

  const setup = () => {
    for (const body of clampables) {
      if (body.dataset.clampInit === "true") continue;
      if (body.scrollHeight > body.clientHeight + 2) {
        body.dataset.clampInit = "true";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "read-more-btn";
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Read more";
        btn.addEventListener("click", () => {
          const expanded = body.classList.toggle("is-expanded");
          btn.setAttribute("aria-expanded", String(expanded));
          btn.textContent = expanded ? "Show less" : "Read more";
        });
        body.insertAdjacentElement("afterend", btn);
      }
    }
  };

  setup();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setup);
  }
}

/**
 * 5c. Phone & Email Contact Click Tracking (GA4 prod-only)
 */
function initContactClickTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || typeof window.ariosoTrack !== "function") return;

    const href = link.getAttribute("href") || "";
    const isPhone = href.startsWith("tel:");
    const isEmail = href.startsWith("mailto:");
    if (!isPhone && !isEmail) return;

    let location = "page";
    if (link.closest(".utility-bar, .site-header")) location = "header";
    else if (link.closest(".site-footer")) location = "footer";
    else if (link.closest(".mobile-action-bar")) location = "mobile_bar";
    else if (link.closest("#inquiry-result")) location = "inquiry_result";

    window.ariosoTrack("contact_click", {
      method: isPhone ? "phone" : "email",
      location
    });
  });
}

/**
 * 6. Accessible Booking Inquiry Form & Post-Interaction Validation
 * Implements validate-input-after-interaction (:user-invalid + ARIA sync + WeakMap fallback)
 * and works seamlessly on both Express (/api/inquiry) and static hosting.
 */
function initBookingInquiryForm() {
  const form = document.getElementById("booking-inquiry-form");
  if (!form) return;

  // Quick-select ensemble links on pricing cards
  for (const trigger of document.querySelectorAll("[data-select-ensemble]")) {
    trigger.addEventListener("click", () => {
      const targetEnsemble = trigger.getAttribute("data-select-ensemble");
      for (const radio of form.querySelectorAll('input[name="ensemble"]')) {
        if (radio.value.includes(targetEnsemble)) {
          radio.checked = true;
          break;
        }
      }
    });
  }

  // Link error message id into aria-describedby ONLY while invalid
  const linkError = (el, shown) => {
    const errorId = el.dataset?.error;
    if (!errorId) return;
    const ids = (el.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
    else el.removeAttribute("aria-describedby");
  };

  // Single polite live region for delayed blur error announcements
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", "polite");
  announcer.classList.add("visually-hidden");
  document.body.append(announcer);
  let announceTimer;
  let announcedField;

  const spokenText = (node) => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    copy.querySelectorAll('[role="img"][aria-label]').forEach((n) =>
      n.replaceWith(`${n.getAttribute("aria-label")}: `)
    );
    return copy.textContent.replace(/\s+/g, " ").trim();
  };

  const announceError = (el) => {
    const error = document.getElementById(el.dataset.error);
    if (!error) return;
    const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : "";
    clearTimeout(announceTimer);
    announcer.textContent = "";
    announcedField = el;
    announceTimer = setTimeout(() => {
      announcer.textContent = label + spokenText(error);
    }, 500);
  };

  const supportsUserInvalid = CSS.supports("selector(:user-invalid)");
  const dirtyState = new WeakMap();
  const flagged = new WeakSet();
  const announced = new WeakSet();

  const isFieldUserInvalid = (el) => {
    if (supportsUserInvalid) return el.matches(":user-invalid");
    return el.classList.contains("user-invalid-fallback");
  };

  const syncAria = (el, announce = false) => {
    if (!el.matches?.("input, select, textarea")) return;
    const invalid = isFieldUserInvalid(el);
    if (invalid) {
      if (announce && !announced.has(el)) {
        announceError(el);
        announced.add(el);
      }
      el.setAttribute("aria-invalid", "true");
      linkError(el, true);
      flagged.add(el);
    } else if (flagged.has(el) || el.getAttribute("aria-invalid") !== "true") {
      el.setAttribute("aria-invalid", "false");
      linkError(el, false);
      flagged.delete(el);
      announced.delete(el);
      if (announcedField === el) {
        clearTimeout(announceTimer);
        announcer.textContent = "";
      }
    }
  };

  // Initialize every field in the form at aria-invalid="false"
  form.querySelectorAll("input, select, textarea").forEach((el) => syncAria(el));

  // Fallback for browsers without native :user-invalid
  if (!supportsUserInvalid) {
    const updateFallback = (input, announce) => {
      const valid = input.validity.valid;
      input.classList.toggle("user-invalid-fallback", !valid);
      input.classList.toggle("user-valid-fallback", valid);
      syncAria(input, announce);
    };

    form.addEventListener(
      "blur",
      (e) => {
        const el = e.target;
        if (!el.checkValidity) return;
        const st = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        st.hasBlurred = true;
        dirtyState.set(el, st);
        if (st.hasInteracted) updateFallback(el, true);
      },
      true
    );

    form.addEventListener("input", (e) => {
      const el = e.target;
      if (!el.checkValidity) return;
      const st = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
      st.hasInteracted = true;
      dirtyState.set(el, st);
      if (st.hasBlurred) updateFallback(el, false);
    });
  } else {
    form.addEventListener("blur", (e) => syncAria(e.target, true), true);
    form.addEventListener("input", (e) => {
      if (e.target.hasAttribute("aria-invalid")) syncAria(e.target);
    });
    form.addEventListener("change", (e) => syncAria(e.target, true), true);
  }

  form.addEventListener(
    "invalid",
    (e) => {
      const el = e.target;
      if (!supportsUserInvalid) {
        dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
        el.classList.add("user-invalid-fallback");
      }
      announced.add(el);
      syncAria(el);
    },
    true
  );

  // Form Submission Handler (sends directly via Formspree, with mailto/copy fallback)
  const submitBtn = document.getElementById("inquiry-submit-btn");
  const resultCard = document.getElementById("inquiry-result");
  const resultTitle = document.getElementById("inquiry-result-title");
  const resultDesc = document.getElementById("inquiry-result-desc");
  const summaryPreview = document.getElementById("inquiry-summary-preview");
  const fallbackActions = document.getElementById("inquiry-fallback-actions");
  const mailtoLink = document.getElementById("inquiry-mailto-link");
  const copyBtn = document.getElementById("inquiry-copy-btn");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) {
        if (!supportsUserInvalid) {
          for (const inv of form.querySelectorAll(":invalid")) {
            inv.classList.add("user-invalid-fallback");
            syncAria(inv);
          }
        }
        firstInvalid.focus();
      }
      return;
    }

    const fd = new FormData(form);
    if (fd.get("_gotcha") || fd.get("website_url")) return; // Honeypot

    const name = String(fd.get("full_name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const eventDate = String(fd.get("event_date") || "").trim();
    const ensemble = String(fd.get("ensemble") || "String Quartet").trim();
    const duration = String(fd.get("duration") || "").trim();
    const venue = String(fd.get("venue") || "").trim();
    const addons = fd.getAll("addons").join(", ");
    const notes = String(fd.get("notes") || "").trim();

    const subject = `Arioso Booking Inquiry — ${eventDate || "Upcoming Event"} (${ensemble})`;
    const summaryText = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      eventDate ? `Event Date: ${eventDate}` : null,
      `Preferred Ensemble: ${ensemble}`,
      duration ? `Estimated Duration: ${duration}` : null,
      venue ? `Venue / Location: ${venue}` : null,
      addons ? `Ceremony Enhancements: ${addons}` : null,
      notes ? `\nEvent Details & Song Requests:\n${notes}` : null
    ]
      .filter(Boolean)
      .join("\n");

    const finalMailto = `mailto:carol@ariosoquartet.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(summaryText)}`;

    const originalBtnText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending inquiry...";
    }

    let sent = false;
    try {
      const endpoint = form.getAttribute("action") || "https://formspree.io/f/xqpqjnna";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          _replyto: email,
          _subject: subject,
          phone: phone || "Not provided",
          event_date: eventDate || "Not yet set",
          ensemble,
          duration: duration || "Not specified",
          venue: venue || "Not provided",
          enhancements: addons || "None",
          notes: notes || "None",
          _gotcha: ""
        })
      });
      sent = res.ok;
    } catch (_) {
      sent = false;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || "Send Availability Inquiry to Carol";
      }
    }

    if (summaryPreview) summaryPreview.textContent = summaryText;
    if (mailtoLink) mailtoLink.setAttribute("href", finalMailto);

    if (sent) {
      if (resultTitle) resultTitle.textContent = "Inquiry Sent to Carol!";
      if (resultDesc) {
        resultDesc.textContent =
          "Thank you — your inquiry has been emailed to Carol Briselli, who will reply to you shortly. Here is a copy of what you sent:";
      }
      if (fallbackActions) fallbackActions.hidden = true;
      form.reset();
    } else {
      if (resultTitle) resultTitle.textContent = "Couldn't Send Automatically";
      if (resultDesc) {
        resultDesc.textContent =
          "Something interrupted the automatic send. Click below to open a pre-filled email to carol@ariosoquartet.com, or copy the details:";
      }
      if (fallbackActions) fallbackActions.hidden = false;
    }

    if (typeof window.ariosoTrack === "function") {
      window.ariosoTrack("generate_lead", {
        ensemble,
        duration: duration || "unspecified",
        has_venue: Boolean(venue),
        delivery: sent ? "formspree" : "mailto_fallback"
      });
    }

    if (resultCard) {
      resultCard.hidden = false;
      resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (copyBtn) {
      copyBtn.onclick = async () => {
        const copyPayload = `To: carol@ariosoquartet.com\nSubject: ${subject}\n\n${summaryText}`;
        try {
          await navigator.clipboard.writeText(copyPayload);
          copyBtn.textContent = "Copied to Clipboard!";
          setTimeout(() => {
            copyBtn.textContent = "Copy summary & email address";
          }, 2500);
        } catch (_) {
          copyBtn.textContent = "Select text above to copy";
        }
      };
    }
  });
}
