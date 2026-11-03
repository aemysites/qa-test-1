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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-card-overlay.js
  function parse(element, { document }) {
    const cells = [];
    const picture = element.querySelector(".hero__image picture, .hero-banner-image picture");
    const img = element.querySelector(".hero__image img, .hero-banner-image img");
    const imageEl = picture || img;
    cells.push([imageEl || ""]);
    const content = [];
    const cardContent = element.querySelector(".nsw-card__content") || element.querySelector(".hero__content");
    if (cardContent) {
      const heading = cardContent.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) content.push(heading);
      const copy = cardContent.querySelector(".nsw-card__copy");
      if (copy) {
        content.push(...Array.from(copy.children));
      } else {
        cardContent.querySelectorAll(":scope > p").forEach((p) => content.push(p));
      }
    }
    cells.push([content.length ? content : ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-card-overlay", cells });
    element.replaceWith(block);
  }

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
  function parse2(element, { document }) {
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

  // tools/importer/parsers/columns-banner.js
  function parse3(element, { document }) {
    const cells = [];
    const textCell = [];
    const content = element.querySelector(".nsw-hero-banner__content");
    if (content) {
      Array.from(content.children).forEach((child) => {
        if (child.classList.contains("nsw-hero-banner__button")) {
          child.querySelectorAll("a[href]").forEach((a) => {
            const link = document.createElement("a");
            link.href = a.getAttribute("href");
            link.textContent = a.textContent.trim();
            const p = document.createElement("p");
            p.append(link);
            textCell.push(p);
          });
        } else {
          textCell.push(child);
        }
      });
    }
    const picture = element.querySelector(".nsw-hero-banner__box picture, .nsw-hero-banner__image");
    const img = element.querySelector(".nsw-hero-banner__box img");
    const imageCell = picture || img || "";
    const flipped = element.classList.contains("flipped");
    const textValue = textCell.length ? textCell : "";
    cells.push(flipped ? [imageCell, textValue] : [textValue, imageCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-text.js
  function parse4(element, { document }) {
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

  // tools/importer/parsers/cards-social-feed.js
  function parse5(element, { document }) {
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://fortstreet-h.schools.nsw.gov.au/"
    ],
    "representativeUrl": "https://fortstreet-h.schools.nsw.gov.au/",
    "description": "Homepage: hero banner, feature cards, principal message banner, image/text promos, quick links, apply banner, key dates and social feed",
    "blocks": [
      {
        "name": "hero-card-overlay",
        "instances": [
          ".full-image-banner"
        ]
      },
      {
        "name": "cards-linked-arrow",
        "instances": [
          ".card-container"
        ]
      },
      {
        "name": "columns-banner",
        "instances": [
          ".banner"
        ]
      },
      {
        "name": "columns-image-text",
        "instances": [
          ".columns.columns-2-cols",
          ".columns"
        ]
      },
      {
        "name": "cards-social-feed",
        "instances": [
          ".facebook-feed"
        ]
      }
    ],
    "urlPattern": "/",
    "sections": [
      {
        "id": "section-1",
        "name": "Hero welcome",
        "selector": [
          "#main > div.section.nsw-section.nsw-section--brand-dark.nsw-section--invert.full-image-banner-container"
        ],
        "style": null,
        "blocks": [
          "hero-card-overlay"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "The Fort Street High School difference",
        "selector": [
          "#main > div.section.nsw-section.card-container-container:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [
          "cards-linked-arrow"
        ],
        "defaultContent": [
          ".default-content-wrapper > h2"
        ]
      },
      {
        "id": "section-3",
        "name": "Principal's message",
        "selector": [
          "#main > div.section.nsw-section.nsw-section--off-white.banner-container"
        ],
        "style": "light-grey",
        "blocks": [
          "columns-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Fort Fest",
        "selector": [
          "#main > div.section.nsw-section.columns-container:nth-of-type(4)"
        ],
        "style": null,
        "blocks": [
          "columns-image-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-5",
        "name": "School tours and open evenings",
        "selector": [
          "#main > div.section.nsw-section.nsw-section--brand-dark.nsw-section--invert.columns-container"
        ],
        "style": "dark",
        "blocks": [
          "columns-image-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-6",
        "name": "Quick links",
        "selector": [
          "#main > div.section.nsw-section.card-container-container:nth-of-type(6)"
        ],
        "style": null,
        "blocks": [
          "cards-linked-arrow"
        ],
        "defaultContent": [
          ".default-content-wrapper > h2"
        ]
      },
      {
        "id": "section-7",
        "name": "Ready to apply?",
        "selector": [
          "#main > div.section.nsw-section.nsw-section--brand-dark.nsw-section--invert.banner-container"
        ],
        "style": "dark",
        "blocks": [
          "columns-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "section-8",
        "name": "Key dates",
        "selector": [
          "#main > div.section.nsw-section.columns-container:nth-of-type(8)"
        ],
        "style": null,
        "blocks": [
          "columns-image-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-9",
        "name": "Stay connected on our socials",
        "selector": [
          "#main > div.section.nsw-section.facebook-feed-container"
        ],
        "style": null,
        "blocks": [
          "cards-social-feed"
        ],
        "defaultContent": [
          ".default-content-wrapper > h2"
        ]
      }
    ]
  };
  var parsers = {
    "hero-card-overlay": parse,
    "cards-linked-arrow": parse2,
    "columns-banner": parse3,
    "columns-image-text": parse4,
    "cards-social-feed": parse5
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
