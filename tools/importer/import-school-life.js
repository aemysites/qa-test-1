/* eslint-disable */
/* global WebImporter */

import cardsLinkedArrowParser from './parsers/cards-linked-arrow.js';
import columnsImageTextParser from './parsers/columns-image-text.js';
import accordionBarParser from './parsers/accordion-bar.js';
import tableBorderedParser from './parsers/table-bordered.js';
import tableRowLinesParser from './parsers/table-row-lines.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';
import embedIframeParser from './parsers/embed-iframe.js';
import cardsEventParser from './parsers/cards-event.js';
import cardsSocialFeedParser from './parsers/cards-social-feed.js';
import widgetPlanningReportParser from './parsers/widget-planning-report.js';
import fortstreetCleanupTransformer from './transformers/fortstreet-cleanup.js';
import fortstreetSectionsTransformer from './transformers/fortstreet-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'cards-linked-arrow': cardsLinkedArrowParser,
  'columns-image-text': columnsImageTextParser,
  'accordion-bar': accordionBarParser,
  'table-bordered': tableBorderedParser,
  'table-row-lines': tableRowLinesParser,
  'carousel-gallery': carouselGalleryParser,
  'embed-iframe': embedIframeParser,
  'cards-event': cardsEventParser,
  'cards-social-feed': cardsSocialFeedParser,
  'widget-planning-report': widgetPlanningReportParser,
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
