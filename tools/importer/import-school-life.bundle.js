/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-school-life.js
  var import_school_life_exports = {};
  __export(import_school_life_exports, {
    default: () => import_school_life_default
  });

  // tools/importer/parsers/cards-linked-arrow.js
  var OPTIONS = ["dark", "highlight", "off-white"];
  function titleLevel(element) {
    const section = element.closest(".section") || element.parentElement;
    if (!section) return "h2";
    const preceding = Array.from(section.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter((h) => !element.contains(h) && !h.closest("table") && h.compareDocumentPosition(element) & 4);
    const last = preceding[preceding.length - 1];
    if (last && Number(last.tagName.substring(1)) >= 2) return "h3";
    if (!preceding.length && section.classList.contains("section")) {
      const prev = section.previousElementSibling;
      const wrappers = prev ? Array.from(prev.children).filter((c) => c.tagName === "DIV") : [];
      const lastWrapper = wrappers[wrappers.length - 1];
      const lastEl = lastWrapper && lastWrapper.classList.contains("default-content-wrapper") && lastWrapper.lastElementChild;
      if (lastEl && /^H[2-6]$/.test(lastEl.tagName)) return "h3";
    }
    return "h2";
  }
  function parse(element, { document }) {
    const cells = [];
    const level = titleLevel(element);
    const cards = Array.from(element.querySelectorAll(".nsw-card"));
    cards.forEach((card) => {
      const imageWrap = card.querySelector(".nsw-card__image");
      const imageCell = imageWrap ? imageWrap.querySelector("picture") || imageWrap.querySelector("img") || "" : "";
      const textCell = [];
      const titleWrap = card.querySelector(".nsw-card__title");
      if (titleWrap) {
        const link = titleWrap.querySelector("a[href]");
        const heading = document.createElement(level);
        if (link) {
          link.querySelectorAll(".sr-only, .icon, .material-icons").forEach((s) => s.remove());
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          if (link.title) a.title = link.title;
          a.textContent = link.textContent.trim();
          heading.append(a);
        } else {
          heading.textContent = titleWrap.textContent.trim();
        }
        if (heading.textContent.trim()) textCell.push(heading);
      }
      const copy = card.querySelector(".nsw-card__copy");
      if (copy) {
        Array.from(copy.children).forEach((child) => {
          if (child.textContent.trim() || child.querySelector("img, picture")) textCell.push(child);
        });
      }
      if (!imageCell && !textCell.length) return;
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    const options = OPTIONS.filter((o) => element.classList.contains(o));
    const name = options.length ? `cards-linked-arrow (${options.join(", ")})` : "cards-linked-arrow";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-text.js
  function parse2(element, { document }) {
    const cells = [];
    element.querySelectorAll(".sr-only, span.icon[add-by-script]").forEach((s) => s.remove());
    const rows = Array.from(element.querySelectorAll(":scope > div"));
    let maxCols = 0;
    const built = [];
    rows.forEach((row) => {
      const cols = Array.from(row.querySelectorAll(":scope > div"));
      const rowCells = cols.map((col) => {
        const pictures = col.querySelectorAll("picture");
        const textOnly = col.textContent.trim();
        if (pictures.length === 1 && !textOnly) {
          return pictures[0];
        }
        if (!pictures.length) {
          const img = col.querySelector("img");
          if (img && !textOnly) return img;
        }
        const content = Array.from(col.children);
        return content.length ? content : textOnly ? col.textContent.trim() : "";
      });
      if (!rowCells.length) return;
      maxCols = Math.max(maxCols, rowCells.length);
      built.push(rowCells);
    });
    built.forEach((r) => {
      while (r.length < maxCols) r.push("");
      cells.push(r);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-image-text", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-bar.js
  function parse3(element, { document }) {
    const cells = [];
    element.querySelectorAll(".sr-only, span.icon[add-by-script], .material-icons").forEach((s) => s.remove());
    const titles = Array.from(element.querySelectorAll(".nsw-accordion__title"));
    const contents = Array.from(element.querySelectorAll(".nsw-accordion__content"));
    if (titles.length) {
      titles.forEach((titleEl, i) => {
        const btn = titleEl.querySelector("button") || titleEl;
        const title = btn.textContent.replace(/\s+/g, " ").trim();
        const id = btn.getAttribute && btn.getAttribute("aria-controls");
        let panel = id ? element.querySelector(`[id="${id}"]`) : null;
        if (!panel) panel = contents[i];
        const content = panel ? Array.from(panel.children) : [];
        if (!title && !content.length) return;
        cells.push([title, content.length ? content : panel ? panel.textContent.trim() : ""]);
      });
    } else {
      element.querySelectorAll(":scope > div").forEach((row) => {
        const cols = Array.from(row.querySelectorAll(":scope > div"));
        if (!cols.length) return;
        const title = cols[0].textContent.replace(/\s+/g, " ").trim();
        const content = cols[1] ? Array.from(cols[1].children) : [];
        cells.push([title, content.length ? content : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-bar", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-bordered.js
  function cellContent(cell) {
    cell.querySelectorAll(".sr-only, span.icon[add-by-script], .material-icons").forEach((s) => s.remove());
    const kids = Array.from(cell.childNodes).filter((n) => n.nodeType === 1 || n.textContent.trim());
    return kids.length ? kids : "";
  }
  function parse4(element, { document }) {
    const cells = [];
    const table = element.querySelector("table");
    if (table) {
      const rows = Array.from(table.querySelectorAll(
        ":scope > thead > tr, :scope > tbody > tr, :scope > tr, :scope > tfoot > tr"
      ));
      rows.forEach((tr) => {
        const row = Array.from(tr.querySelectorAll(":scope > th, :scope > td")).map(cellContent);
        if (row.length) cells.push(row);
      });
    } else {
      element.querySelectorAll(":scope > div").forEach((r) => {
        const row = Array.from(r.querySelectorAll(":scope > div")).map(cellContent);
        if (row.length) cells.push(row);
      });
    }
    const maxCols = cells.reduce((m, r) => Math.max(m, r.length), 0);
    cells.forEach((r) => {
      while (r.length < maxCols) r.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "table-bordered", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-row-lines.js
  function cellContent2(cell) {
    cell.querySelectorAll(".sr-only, span.icon[add-by-script], .material-icons").forEach((s) => s.remove());
    const kids = Array.from(cell.childNodes).filter((n) => n.nodeType === 1 || n.textContent.trim());
    return kids.length ? kids : "";
  }
  function parse5(element, { document }) {
    const cells = [];
    const noHeader = element.classList.contains("no-header");
    const table = element.querySelector("table");
    if (table) {
      const rows = Array.from(table.querySelectorAll(
        ":scope > thead > tr, :scope > tbody > tr, :scope > tr, :scope > tfoot > tr"
      ));
      rows.forEach((tr) => {
        const row = Array.from(tr.querySelectorAll(":scope > th, :scope > td")).map(cellContent2);
        if (row.length) cells.push(row);
      });
    } else {
      element.querySelectorAll(":scope > div").forEach((r) => {
        const row = Array.from(r.querySelectorAll(":scope > div")).map(cellContent2);
        if (row.length) cells.push(row);
      });
    }
    const maxCols = cells.reduce((m, r) => Math.max(m, r.length), 0);
    cells.forEach((r) => {
      while (r.length < maxCols) r.push("");
    });
    const name = noHeader ? "table-row-lines (no-header)" : "table-row-lines";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse6(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    let items = Array.from(element.querySelectorAll("li.nsw-carousel__item"));
    if (!items.length) items = Array.from(element.querySelectorAll("figure"));
    items.forEach((item) => {
      const picture = item.querySelector("picture");
      const img = item.querySelector("img");
      const media = picture || img;
      const key = item.getAttribute("data-index") || img && img.getAttribute("src") || item.textContent.trim();
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      const captionEl = item.querySelector("figcaption");
      let caption = "";
      if (captionEl) {
        const kids = Array.from(captionEl.children);
        caption = kids.length ? kids : captionEl.textContent.trim();
      }
      if (!media && !caption) return;
      cells.push([media || "", caption]);
    });
    if (!cells.length) {
      element.querySelectorAll(":scope > div").forEach((row) => {
        const cols = Array.from(row.querySelectorAll(":scope > div"));
        if (!cols.length) return;
        const media = cols[0].querySelector("picture, img") || "";
        const caption = cols[1] ? Array.from(cols[1].children) : [];
        cells.push([media, caption.length ? caption : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-iframe.js
  function urlFromDom(element) {
    const iframe = element.querySelector("iframe[src]");
    if (iframe && iframe.getAttribute("src")) return iframe.getAttribute("src");
    const link = Array.from(element.querySelectorAll("a[href]")).find((a) => {
      const href = a.getAttribute("href") || "";
      return href && !href.startsWith("#") && !a.classList.contains("skip-map-link");
    });
    if (link) return link.getAttribute("href");
    const withData = element.querySelector("[data-src], [data-url], [data-embed-src]");
    if (withData) {
      return withData.getAttribute("data-src") || withData.getAttribute("data-url") || withData.getAttribute("data-embed-src") || "";
    }
    return "";
  }
  function pageUrl(document) {
    const canonical = document.querySelector('link[rel="canonical"][href]');
    if (canonical) return canonical.getAttribute("href");
    const og = document.querySelector('meta[property="og:url"][content]');
    if (og) return og.getAttribute("content");
    return "";
  }
  function embedIndex(element, document) {
    const all = Array.from(document.querySelectorAll(".embed, table")).filter((el) => {
      if (el.matches(".embed")) return !el.parentElement || !el.parentElement.closest(".embed");
      const first = el.querySelector("tr > th, tr > td");
      return first && /^embed[ -]iframe/i.test(first.textContent.trim());
    });
    return Math.max(0, all.indexOf(element));
  }
  function urlFromAuthoredSource(element, document) {
    try {
      const page = pageUrl(document);
      if (!page) return "";
      const src = `${page.replace(/[?#].*$/, "").replace(/\/$/, "")}.plain.html`;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", src, false);
      xhr.send(null);
      if (xhr.status !== 200 || !xhr.responseText) return "";
      const tmp = document.createElement("div");
      tmp.innerHTML = xhr.responseText;
      const embeds = Array.from(tmp.querySelectorAll("div.embed"));
      const authored = embeds[embedIndex(element, document)] || (embeds.length === 1 ? embeds[0] : null);
      const a = authored && authored.querySelector("a[href]");
      return a ? a.getAttribute("href") : "";
    } catch (e) {
      return "";
    }
  }
  function parse7(element, { document }) {
    const cells = [];
    let url = urlFromDom(element);
    if (!url && !element.textContent.trim()) url = urlFromAuthoredSource(element, document);
    const content = [];
    const poster = element.querySelector("picture") || element.querySelector("img");
    if (poster) content.push(poster);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.textContent = url;
      content.push(a);
    }
    cells.push([content.length ? content : ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-iframe", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-event.js
  function parse8(element, { document }) {
    const cells = [];
    element.querySelectorAll(".sr-only, span.icon[add-by-script], .material-icons").forEach((s) => s.remove());
    let items = Array.from(element.querySelectorAll(".nsw-grid > .nsw-col"));
    if (!items.length) {
      items = Array.from(element.querySelectorAll(".nsw-content-block__content")).map((c) => c.parentElement).filter((p, i, arr) => p && arr.indexOf(p) === i);
    }
    items.forEach((item) => {
      const imageWrap = item.querySelector(".nsw-content-block__image");
      const imageCell = imageWrap ? imageWrap.querySelector("picture") || imageWrap.querySelector("img") || "" : item.querySelector("picture") || item.querySelector("img") || "";
      const contentWrap = item.querySelector(".nsw-content-block__content") || item;
      const textCell = [];
      Array.from(contentWrap.children).forEach((child) => {
        if (child.matches(".nsw-content-block__image, picture, img")) return;
        if (!child.textContent.trim() && !child.querySelector("img, picture")) return;
        if (child.classList.contains("nsw-content-block__title") && !/^H[1-6]$/.test(child.tagName)) {
          const h3 = document.createElement("h3");
          h3.innerHTML = child.innerHTML;
          textCell.push(h3);
          return;
        }
        textCell.push(child);
      });
      if (!imageCell && !textCell.length) return;
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.querySelectorAll(":scope > div").forEach((row) => {
        const cols = Array.from(row.querySelectorAll(":scope > div"));
        if (!cols.length) return;
        const img = cols[0].querySelector("picture, img") || "";
        const text = cols[1] ? Array.from(cols[1].children) : [];
        cells.push([img, text.length ? text : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-event", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-social-feed.js
  function parse9(element, { document }) {
    const cells = [];
    const grid = element.querySelector(":scope > .nsw-grid");
    const scope = grid || element;
    const seen = /* @__PURE__ */ new Set();
    const cards = Array.from(scope.querySelectorAll(".nsw-card")).filter((card) => {
      const a = card.querySelector(".nsw-card__copy a[href]");
      const key = a ? a.getAttribute("href") : card.textContent.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    cards.forEach((card) => {
      const imageWrap = card.querySelector(".nsw-card__image");
      let imageCell = "";
      if (imageWrap) {
        const picture = imageWrap.querySelector("picture");
        const img = imageWrap.querySelector("img");
        imageCell = picture || img || "";
      }
      const textCell = [];
      const copy = card.querySelector(".nsw-card__copy");
      if (copy) {
        Array.from(copy.children).forEach((child) => {
          if (child.textContent.trim() || child.querySelector("img, picture")) textCell.push(child);
        });
      }
      if (!imageCell && !textCell.length) return;
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-social-feed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/widget-planning-report.js
  function parse10(element, { document }) {
    const cells = [];
    let reportType = "";
    let schoolCode = "";
    let recent = "";
    element.querySelectorAll(":scope > div").forEach((row) => {
      const cols = Array.from(row.querySelectorAll(":scope > div"));
      if (cols.length < 2) return;
      const key = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, "");
      const value = cols[1].textContent.trim();
      if (key === "reporttype") reportType = value;
      else if (key === "schoolcode") schoolCode = value;
      else if (key === "recentreports") recent = value;
    });
    const list = element.querySelector('ul[id^="planning-reporting-list-"]');
    if (list) {
      const m = list.id.match(/^planning-reporting-list-(.+?)-(\d+)(?:-\d+)?$/);
      if (m) {
        if (!reportType) reportType = /plan/i.test(m[1]) ? "plan" : "report";
        if (!schoolCode) schoolCode = m[2];
      }
    }
    if (!reportType || !schoolCode) {
      const a = element.querySelector('a[href*="/annual-report/"], a[href*="/plan-report/"]');
      if (a) {
        const m = a.getAttribute("href").match(/\/(annual-report|plan-report)\/\d{4}\/(\d+)\//);
        if (m) {
          if (!reportType) reportType = m[1] === "plan-report" ? "plan" : "report";
          if (!schoolCode) schoolCode = m[2];
        }
      }
    }
    if (reportType) cells.push(["reporttype", reportType]);
    if (schoolCode) cells.push(["schoolcode", schoolCode]);
    if (recent) cells.push(["recentreports", recent]);
    const block = WebImporter.Blocks.createBlock(document, { name: "widget-planning-report", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/fortstreet-cleanup.js
  var remove = (root, selectors) => {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  };
  var isEmptySection = (el) => !el.textContent.trim() && !el.querySelector("img, picture, video, iframe, svg, table, hr");
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      remove(element, [
        "header",
        ".header-wrapper",
        "footer",
        ".footer-wrapper",
        "nav.nsw-skip",
        "#main-nav",
        ".nsw-breadcrumbs",
        'nav[aria-label="breadcrumb"]',
        ".breadcrumb",
        ".breadcrumbs",
        // Generated "Section navigation" sidebar on inner pages
        "aside.nsw-layout__sidebar",
        ".sidebar-wrapper",
        ".nsw-side-nav"
      ]);
      remove(element, [
        ".back-to-top",
        ".js-back-to-top",
        ".nsw-back-to-top"
      ]);
      remove(element, [
        ".nsw-carousel__control",
        ".js-carousel__navigation",
        ".nsw-carousel__navigation",
        ".js-carousel__aria-live"
      ]);
      element.querySelectorAll("nav").forEach((nav) => {
        if (!nav.textContent.trim() && !nav.querySelector("img, a")) nav.remove();
      });
      remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        'iframe[src*="googletagmanager"]',
        '[class*="cookie"]',
        '[id*="cookie"]',
        "#onetrust-consent-sdk"
      ]);
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll("#main > div.section, main > div.section, div.section.nsw-section").forEach((sec) => {
        if (isEmptySection(sec)) sec.remove();
      });
      remove(element, [
        "span.material-icons",
        "span.nsw-material-icons",
        // Script-added "(opens in new window)" text and link icons in default content
        ".sr-only",
        "span.icon[add-by-script]"
      ]);
      remove(element, [
        "button",
        "form",
        "input",
        "select",
        "textarea",
        "link",
        'source[srcset^="data:"]'
      ]);
      element.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach(({ name }) => {
          if (name.startsWith("data-") || name.startsWith("on") || name === "aria-hidden" || name === "tabindex") {
            el.removeAttribute(name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/fortstreet-sections.js
  var MARKER = "data-excat-section-id";
  var findSectionEl = (root, section) => {
    var _a;
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector].filter(Boolean);
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel) || ((_a = root.ownerDocument) == null ? void 0 : _a.querySelector(sel));
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  };
  var autoState = /* @__PURE__ */ new WeakMap();
  var autoTransform = (hookName, element, auto) => {
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      const entries = [...element.querySelectorAll(auto.selector)].map((el) => {
        const styles = Object.entries(auto.styles || {}).filter(([cls]) => el.classList.contains(cls)).map(([, style]) => style);
        return { el, style: [...new Set(styles)].join(", ") || null };
      });
      entries.forEach(({ el }, i) => {
        if (i > 0) el.parentNode.insertBefore(document.createElement("hr"), el);
      });
      autoState.set(document, entries);
    }
    if (hookName === "afterTransform") {
      const entries = autoState.get(document) || [];
      entries.forEach(({ el, style }) => {
        if (!style || !el.parentNode) return;
        el.after(WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        }));
      });
      [...element.querySelectorAll("hr")].forEach((hr) => {
        const next = hr.nextElementSibling;
        if (!next || next.tagName === "HR") hr.remove();
      });
      autoState.delete(document);
    }
  };
  function transform2(hookName, element, payload) {
    var _a, _b, _c;
    const auto = (_a = payload == null ? void 0 : payload.template) == null ? void 0 : _a.autoSections;
    if (auto == null ? void 0 : auto.selector) {
      autoTransform(hookName, element, auto);
      return;
    }
    const sections = (_b = payload == null ? void 0 : payload.template) == null ? void 0 : _b.sections;
    if (!Array.isArray(sections) || sections.length === 0) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      if (sections.length < 2 && !((_c = sections[0]) == null ? void 0 : _c.style)) return;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionEl(element, section);
        if (!el) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER, section.id);
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = markers.find((hr) => hr.getAttribute(MARKER) === section.id);
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (marker) {
          let last = marker;
          let next = marker.nextElementSibling;
          while (next && next.tagName !== "HR") {
            last = next;
            next = next.nextElementSibling;
          }
          last.after(sectionMetadata);
        } else {
          const el = findSectionEl(element, section);
          if (el) el.after(sectionMetadata);
        }
      }
      markers.forEach((hr) => {
        const isFirst = hr.getAttribute(MARKER) === sections[0].id;
        if (isFirst) {
          hr.remove();
        } else {
          hr.removeAttribute(MARKER);
        }
      });
    }
  }

  // tools/importer/import-school-life.js
  var PAGE_TEMPLATE = {
    "name": "school-life",
    "urls": [
      "https://fortstreet-h.schools.nsw.gov.au/about-us",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/enrol",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/facilities-and-resources",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/hsc-results",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/our-principal-and-staff",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/policies-and-reports",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/policies-and-reports/nsw-public-school-information",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/school-history-and-archives",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/school-history-and-archives/fort-street-archives",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/school-history-and-archives/the-fort-street-museum",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/school-history-and-archives/the-fortian-digitised",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/stories-and-highlights",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/transition-to-high-school",
      "https://fortstreet-h.schools.nsw.gov.au/about-us/why-choose-us",
      "https://fortstreet-h.schools.nsw.gov.au/contact-us",
      "https://fortstreet-h.schools.nsw.gov.au/learning-and-support",
      "https://fortstreet-h.schools.nsw.gov.au/learning-and-support/additional-learning-support",
      "https://fortstreet-h.schools.nsw.gov.au/learning-and-support/careers",
      "https://fortstreet-h.schools.nsw.gov.au/learning-and-support/high-potential-and-gifted-education",
      "https://fortstreet-h.schools.nsw.gov.au/learning-and-support/learning",
      "https://fortstreet-h.schools.nsw.gov.au/learning-and-support/wellbeing",
      "https://fortstreet-h.schools.nsw.gov.au/our-community",
      "https://fortstreet-h.schools.nsw.gov.au/our-community/alumni",
      "https://fortstreet-h.schools.nsw.gov.au/our-community/fortians-union",
      "https://fortstreet-h.schools.nsw.gov.au/our-community/foundation",
      "https://fortstreet-h.schools.nsw.gov.au/our-community/foundation-tertiary-bursaries",
      "https://fortstreet-h.schools.nsw.gov.au/our-community/pandc",
      "https://fortstreet-h.schools.nsw.gov.au/school-life",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/bell-times",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/bring-your-own-device",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/canteen",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/events",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/forms",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/house-and-merit-system",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/lockers-and-lost-property",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/newsletters",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/parent-portal",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/stationery",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/academic-competitions",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/clubs-and-committees",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/creative-and-performing-arts",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/debating-and-public-speaking",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/duke-of-edinburgh-award",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/instrumental-music-program",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/robotics-and-maker-society",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/sport",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/student-opportunities-and-activities/student-leadership-opportunities",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/travel-to-school",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/uniform",
      "https://fortstreet-h.schools.nsw.gov.au/school-life/uniform/uniform-shop"
    ],
    "representativeUrl": "https://fortstreet-h.schools.nsw.gov.au/about-us",
    "description": "Inner content pages: h1 + intro, then variable sections of cards, columns, accordions, tables, galleries, embeds, event cards and school report widgets, ending with related-page cards",
    "blocks": [
      {
        "name": "cards-linked-arrow",
        "instances": [
          ".card-container"
        ]
      },
      {
        "name": "columns-image-text",
        "instances": [
          ".columns"
        ]
      },
      {
        "name": "accordion-bar",
        "instances": [
          ".accordions"
        ]
      },
      {
        "name": "table-bordered",
        "instances": [
          ".table.bordered"
        ]
      },
      {
        "name": "table-row-lines",
        "instances": [
          ".table"
        ]
      },
      {
        "name": "carousel-gallery",
        "instances": [
          ".gallery"
        ]
      },
      {
        "name": "embed-iframe",
        "instances": [
          ".embed"
        ]
      },
      {
        "name": "cards-event",
        "instances": [
          ".content-container"
        ]
      },
      {
        "name": "cards-social-feed",
        "instances": [
          ".facebook-feed"
        ]
      },
      {
        "name": "widget-planning-report",
        "instances": [
          ".planningreporting"
        ]
      }
    ],
    "urlPattern": "/*",
    "autoSections": {
      "selector": "#main > div.section",
      "styles": {
        "nsw-section--brand-dark": "dark",
        "nsw-section--off-white": "light-grey",
        "nsw-section--brand-light": "light-yellow"
      }
    },
    "sections": [
      {
        "id": "about-us-s1",
        "name": "About us landing: title and section cards",
        "selector": [
          "#main > div.section.card-container-container:nth-of-type(1)"
        ],
        "style": null,
        "blocks": [
          "cards-linked-arrow"
        ],
        "defaultContent": [
          ".default-content-wrapper"
        ]
      }
    ]
  };
  var parsers = {
    "cards-linked-arrow": parse,
    "columns-image-text": parse2,
    "accordion-bar": parse3,
    "table-bordered": parse4,
    "table-row-lines": parse5,
    "carousel-gallery": parse6,
    "embed-iframe": parse7,
    "cards-event": parse8,
    "cards-social-feed": parse9,
    "widget-planning-report": parse10
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (pageBlocks.some((b) => b.element === element)) return;
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_school_life_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_school_life_exports);
})();
