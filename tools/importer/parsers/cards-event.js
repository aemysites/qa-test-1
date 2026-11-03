/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-event
 * Source: .content-container (decorated EDS block:
 *   .nsw-grid > .nsw-col > .nsw-content-block__image (picture) + .nsw-content-block__content
 *   (h3.nsw-content-block__title + p.nsw-content-block__copy ...))
 * Rows: one per event -> [image (optional)] [h3 name + Date/Time paragraphs + description]
 */
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll('.sr-only, span.icon[add-by-script], .material-icons').forEach((s) => s.remove());

  let items = Array.from(element.querySelectorAll('.nsw-grid > .nsw-col'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.nsw-content-block__content'))
      .map((c) => c.parentElement)
      .filter((p, i, arr) => p && arr.indexOf(p) === i);
  }

  items.forEach((item) => {
    const imageWrap = item.querySelector('.nsw-content-block__image');
    const imageCell = imageWrap
      ? (imageWrap.querySelector('picture') || imageWrap.querySelector('img') || '')
      : (item.querySelector('picture') || item.querySelector('img') || '');

    const contentWrap = item.querySelector('.nsw-content-block__content') || item;
    const textCell = [];
    Array.from(contentWrap.children).forEach((child) => {
      if (child.matches('.nsw-content-block__image, picture, img')) return;
      if (!child.textContent.trim() && !child.querySelector('img, picture')) return;
      // Normalise the event name to an H3 heading
      if (child.classList.contains('nsw-content-block__title') && !/^H[1-6]$/.test(child.tagName)) {
        const h3 = document.createElement('h3');
        h3.innerHTML = child.innerHTML;
        textCell.push(h3);
        return;
      }
      textCell.push(child);
    });

    if (!imageCell && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  // Undecorated fallback: rows of [image, content]
  if (!cells.length) {
    element.querySelectorAll(':scope > div').forEach((row) => {
      const cols = Array.from(row.querySelectorAll(':scope > div'));
      if (!cols.length) return;
      const img = cols[0].querySelector('picture, img') || '';
      const text = cols[1] ? Array.from(cols[1].children) : [];
      cells.push([img, text.length ? text : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-event', cells });
  element.replaceWith(block);
}
