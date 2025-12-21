// assets/js/markdown-renderer.js
// Requires:
//   - marked (https://cdn.jsdelivr.net/npm/marked/marked.min.js)
//   - DOMPurify (https://cdn.jsdelivr.net/npm/dompurify@3.x/dist/purify.min.js)
//
// Usage (HTML):
//   <div id="md-content"
//        data-md-src="/assets/docs/privacy.md"
//        data-md-status="#md-status"
//        data-md-anchors="true"
//        data-md-external-links="true"></div>
//   <div id="md-status">Loading…</div>
//
//   <script src="...marked..."></script>
//   <script src="...dompurify..."></script>
//   <script src="/assets/js/markdown-renderer.js" defer></script>
//   <script defer>
//     window.MarkdownPageRenderer.render("#md-content");
//   </script>

(function (global) {
  "use strict";

  function $(selectorOrEl) {
    if (!selectorOrEl) return null;
    if (typeof selectorOrEl === "string") return document.querySelector(selectorOrEl);
    return selectorOrEl;
  }

  function isExternalHref(href) {
    return typeof href === "string" && (href.startsWith("http://") || href.startsWith("https://"));
  }

  function safeBool(value, defaultValue) {
    if (value == null) return defaultValue;
    const v = String(value).trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
    if (v === "false" || v === "0" || v === "no" || v === "off") return false;
    return defaultValue;
  }

  function ensureDeps(statusEl, rawLinkHtml) {
    if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
      if (statusEl) {
        statusEl.innerHTML =
          `<strong>Markdown renderer failed to load.</strong> ` +
          (rawLinkHtml ? `Try opening the raw Markdown: ${rawLinkHtml}` : "");
      }
      return false;
    }
    return true;
  }

  function addHeadingAnchors(containerEl, options) {
    if (!options.anchors) return;

    const headings = containerEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach(h => {
      // Marked will generate ids when headerIds=true. If not present, skip.
      if (!h.id) return;

      // Avoid adding twice.
      if (h.querySelector(".md-anchor")) return;

      const a = document.createElement("a");
      a.className = "md-anchor";
      a.href = `#${h.id}`;
      a.setAttribute("aria-label", "Link to this section");
      a.textContent = "¶";

      // Small, unobtrusive anchor symbol
      a.style.marginLeft = "0.5rem";
      a.style.textDecoration = "none";
      a.style.opacity = "0.6";
      a.style.fontSize = "0.9em";

      a.addEventListener("mouseenter", () => (a.style.opacity = "1"));
      a.addEventListener("mouseleave", () => (a.style.opacity = "0.6"));

      h.appendChild(a);
    });
  }

  function fixExternalLinks(containerEl, options) {
    if (!options.externalLinks) return;

    containerEl.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href") || "";
      if (isExternalHref(href)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });
  }

  function defaultMarkedConfig() {
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false
    });
  }

  async function fetchMarkdown(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to load Markdown (${res.status} ${res.statusText})`);
    }
    return await res.text();
  }

  function renderStatus(statusEl, html) {
    if (!statusEl) return;
    statusEl.innerHTML = html || "";
  }

  function clearStatus(statusEl) {
    if (!statusEl) return;
    statusEl.textContent = "";
  }

  const MarkdownPageRenderer = {
    /**
     * Render markdown into a container.
     *
     * @param {string|HTMLElement} container - selector or element that receives rendered HTML
     * @param {object} [opts]
     * @param {string} [opts.src] - markdown URL (if omitted, read from data-md-src)
     * @param {string|HTMLElement} [opts.status] - selector/element for status messages (if omitted, read from data-md-status)
     * @param {boolean} [opts.anchors=true] - add paragraph-anchor links to headings
     * @param {boolean} [opts.externalLinks=true] - set target=_blank for external links
     */
    async render(container, opts = {}) {
      const containerEl = $(container);
      if (!containerEl) return;

      const statusEl =
        $(opts.status) ||
        $(containerEl.getAttribute("data-md-status")) ||
        null;

      const src =
        opts.src ||
        containerEl.getAttribute("data-md-src") ||
        "";

      // Optional config from data attributes
      const anchors = safeBool(
        opts.anchors ?? containerEl.getAttribute("data-md-anchors"),
        true
      );

      const externalLinks = safeBool(
        opts.externalLinks ?? containerEl.getAttribute("data-md-external-links"),
        true
      );

      if (!src) {
        renderStatus(statusEl, `<strong>No Markdown source provided.</strong>`);
        return;
      }

      const rawLinkHtml = `<a href="${src}">View Raw Markdown</a>`;

      renderStatus(statusEl, `Loading…`);

      if (!ensureDeps(statusEl, rawLinkHtml)) return;

      try {
        defaultMarkedConfig();

        const markdown = await fetchMarkdown(src);

        const rawHtml = marked.parse(markdown);

        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          USE_PROFILES: { html: true }
        });

        containerEl.innerHTML = cleanHtml;

        addHeadingAnchors(containerEl, { anchors });
        fixExternalLinks(containerEl, { externalLinks });

        clearStatus(statusEl);
      } catch (err) {
        renderStatus(
          statusEl,
          `<strong>Could not render this page.</strong> <span class="muted">${String(err)}</span>`
        );
        containerEl.innerHTML = `<p>${rawLinkHtml}</p>`;
      }
    },

    /**
     * Render all containers on the page that have data-md-src.
     */
    async renderAll(opts = {}) {
      const nodes = document.querySelectorAll("[data-md-src]");
      for (const node of nodes) {
        // eslint-disable-next-line no-await-in-loop
        await this.render(node, opts);
      }
    }
  };

  global.MarkdownPageRenderer = MarkdownPageRenderer;
})(window);
