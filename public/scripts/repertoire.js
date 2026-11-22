/**
 * Arioso String Quartet — Repertoire Explorer & Search
 */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".searchBar input[name='search']");
  const clearBtn = document.getElementById("repertoire-clear");
  const statusEl = document.getElementById("repertoire-status");
  const noResultsEl = document.getElementById("repertoire-no-results");
  const repBody = document.querySelector(".repBody");
  const navLinks = document.querySelectorAll(".leftRep .nav-link");

  if (!repBody) return;

  const boxes = Array.from(repBody.querySelectorAll(".box"));

  function resetAll() {
    for (const box of boxes) {
      box.hidden = false;
      for (const col of box.querySelectorAll(".leftList, .rightList")) {
        col.hidden = false;
      }
      for (const ul of box.querySelectorAll("ul")) {
        ul.hidden = false;
      }
      for (const li of box.querySelectorAll("li")) {
        li.hidden = false;
      }
    }
    if (noResultsEl) noResultsEl.hidden = true;
    if (statusEl) statusEl.textContent = "";
    if (clearBtn) clearBtn.hidden = true;
  }

  function filterRepertoire(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      resetAll();
      return;
    }

    if (clearBtn) clearBtn.hidden = false;

    let matchingSongs = 0;
    let matchingCategories = 0;

    for (const box of boxes) {
      const headingText = (box.querySelector("h4")?.textContent || "").toLowerCase();
      let boxHasMatch = false;

      for (const col of box.querySelectorAll(".leftList, .rightList")) {
        let colHasMatch = false;

        for (const ul of col.querySelectorAll("ul")) {
          const dataKey = (ul.getAttribute("data-key") || "").toLowerCase();
          const keyMatches = dataKey.includes(query) || headingText.includes(query);
          let ulHasMatch = false;

          for (const li of ul.querySelectorAll("li")) {
            const text = li.textContent.toLowerCase();
            if (keyMatches || text.includes(query)) {
              li.hidden = false;
              ulHasMatch = true;
              matchingSongs++;
            } else {
              li.hidden = true;
            }
          }

          ul.hidden = !ulHasMatch;
          if (ulHasMatch) colHasMatch = true;
        }

        col.hidden = !colHasMatch;
        if (colHasMatch) boxHasMatch = true;
      }

      box.hidden = !boxHasMatch;
      if (boxHasMatch) matchingCategories++;
    }

    if (noResultsEl) {
      noResultsEl.hidden = matchingSongs > 0;
    }

    if (statusEl) {
      statusEl.textContent =
        matchingSongs > 0
          ? `Found ${matchingSongs} matching ${matchingSongs === 1 ? "selection" : "selections"} across ${matchingCategories} ${matchingCategories === 1 ? "category" : "categories"}.`
          : `No selections matched "${rawQuery.trim()}".`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      filterRepertoire(event.target.value);
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      resetAll();
      searchInput.focus();
    });
  }

  // Category sidebar / horizontal pill active state tracking
  function setActiveCategoryLink(hash) {
    if (!hash) return;
    for (const link of navLinks) {
      const isMatch = link.getAttribute("href") === hash;
      link.classList.toggle("active", isMatch);
      if (isMatch) {
        link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }

  for (const link of navLinks) {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (searchInput && searchInput.value.trim() !== "") {
        searchInput.value = "";
        resetAll();
      }
      setActiveCategoryLink(href);
    });
  }

  // Highlight active section on scroll
  const sectionHeadings = Array.from(repBody.querySelectorAll(".box h4[id]"));
  if (typeof IntersectionObserver !== "undefined" && sectionHeadings.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategoryLink(`#${entry.target.id}`);
            break;
          }
        }
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 }
    );

    for (const h4 of sectionHeadings) {
      observer.observe(h4);
    }
  }

  // Handle initial hash on page load
  if (window.location.hash) {
    setActiveCategoryLink(window.location.hash);
  }
});
