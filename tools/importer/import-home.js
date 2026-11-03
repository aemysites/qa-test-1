/* eslint-disable */
/* global WebImporter */

import heroCardOverlayParser from './parsers/hero-card-overlay.js';
import cardsLinkedArrowParser from './parsers/cards-linked-arrow.js';
import columnsBannerParser from './parsers/columns-banner.js';
import columnsImageTextParser from './parsers/columns-image-text.js';
import cardsSocialFeedParser from './parsers/cards-social-feed.js';
import fortstreetCleanupTransformer from './transformers/fortstreet-cleanup.js';
import fortstreetSectionsTransformer from './transformers/fortstreet-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'hero-card-overlay': heroCardOverlayParser,
  'cards-linked-arrow': cardsLinkedArrowParser,
  'columns-banner': columnsBannerParser,
  'columns-image-text': columnsImageTextParser,
  'cards-social-feed': cardsSocialFeedParser,
};

const transformers = [fortstreetCleanupTransformer, fortstreetSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
