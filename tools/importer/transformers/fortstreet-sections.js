/* eslint-disable */
/* global WebImporter */

/**
 * Sections transformer for fortstreet-h.schools.nsw.gov.au.
 * Driven entirely by payload.template.sections, so it is reusable by any
 * template of the site (home, school-life, ...). No-op for templates with
 * fewer than two sections and no styled section.
 *
 * beforeTransform: insert <hr> section breaks (while parser targets exist),
 *   marking styled sections' breaks with data-excat-section-id.
 * afterTransform: insert Section Metadata after each styled section's content,
 *   then drop temporary markers.
 */

const MARKER = 'data-excat-section-id';

const findSectionEl = (root, section) => {
  const selectors = Array.isArray(section.selector)
    ? section.selector
    : [section.selector].filter(Boolean);
  for (const sel of selectors) {
    try {
      const el = root.querySelector(sel) || root.ownerDocument?.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
};

// Auto mode (template.autoSections = { selector, styles: { className: style } }):
// every source section element becomes an EDS section, styled from its classes.
// Used by templates whose section count/order varies per page (school-life).
const autoState = new WeakMap();

const autoTransform = (hookName, element, auto) => {
  const document = element.ownerDocument;
  if (hookName === 'beforeTransform') {
    const entries = [...element.querySelectorAll(auto.selector)].map((el) => {
      const styles = Object.entries(auto.styles || {})
        .filter(([cls]) => el.classList.contains(cls))
        .map(([, style]) => style);
      return { el, style: [...new Set(styles)].join(', ') || null };
    });
    entries.forEach(({ el }, i) => {
      if (i > 0) el.parentNode.insertBefore(document.createElement('hr'), el);
    });
    autoState.set(document, entries);
  }

  if (hookName === 'afterTransform') {
    const entries = autoState.get(document) || [];
    entries.forEach(({ el, style }) => {
      // Empty spacer sections are removed by cleanup; they need no metadata.
      if (!style || !el.parentNode) return;
      el.after(WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      }));
    });
    // Drop section breaks orphaned by removed spacer sections.
    [...element.querySelectorAll('hr')].forEach((hr) => {
      const next = hr.nextElementSibling;
      if (!next || next.tagName === 'HR') hr.remove();
    });
    autoState.delete(document);
  }
};

export default function transform(hookName, element, payload) {
  const auto = payload?.template?.autoSections;
  if (auto?.selector) {
    autoTransform(hookName, element, auto);
    return;
  }
  const sections = payload?.template?.sections;
  if (!Array.isArray(sections) || sections.length === 0) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    if (sections.length < 2 && !sections[0]?.style) return;

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionEl(element, section);
      if (!el) continue;

      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = markers.find((hr) => hr.getAttribute(MARKER) === section.id);
      const sectionMetadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (marker) {
        // Section content runs from the marker to the next <hr> (or end of parent).
        let last = marker;
        let next = marker.nextElementSibling;
        while (next && next.tagName !== 'HR') {
          last = next;
          next = next.nextElementSibling;
        }
        last.after(sectionMetadata);
      } else {
        const el = findSectionEl(element, section);
        if (el) el.after(sectionMetadata);
      }
    }

    // Remove the first section's temporary break; strip markers from the rest.
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
