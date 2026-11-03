/* eslint-disable */
/* global WebImporter */
/**
 * Parser: carousel-gallery
 * Source: .gallery (decorated EDS block:
 *   .nsw-carousel__list > li.nsw-carousel__item > figure > img + figcaption)
 * Rows: one per slide -> [image] [caption]
 * Carousel chrome (prev/next, pager dots, aria-live) is ignored.
 */
export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();

  let items = Array.from(element.querySelectorAll('li.nsw-carousel__item'));
  if (!items.length) items = Array.from(element.querySelectorAll('figure'));

  items.forEach((item) => {
    const picture = item.querySelector('picture');
    const img = item.querySelector('img');
    const media = picture || img;

    // Dedupe cloned slides (infinite-loop carousels) by data-index / image src
    const key = item.getAttribute('data-index') || (img && img.getAttribute('src')) || item.textContent.trim();
    if (key && seen.has(key)) return;
    if (key) seen.add(key);

    const captionEl = item.querySelector('figcaption');
    let caption = '';
    if (captionEl) {
      const kids = Array.from(captionEl.children);
      caption = kids.length ? kids : captionEl.textContent.trim();
    }

    if (!media && !caption) return;
    cells.push([media || '', caption]);
  });

  // Undecorated fallback: rows of [image, caption]
  if (!cells.length) {
    element.querySelectorAll(':scope > div').forEach((row) => {
      const cols = Array.from(row.querySelectorAll(':scope > div'));
      if (!cols.length) return;
      const media = cols[0].querySelector('picture, img') || '';
      const caption = cols[1] ? Array.from(cols[1].children) : [];
      cells.push([media, caption.length ? caption : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
