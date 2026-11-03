/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-image-text
 * Source: .columns.columns-2-cols (decorated EDS columns block: rows > cols)
 * Rows: [image, heading + paragraph + CTA] (one table row per source row)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Strip script-added external-link helpers ("(opens in new window)" + inline icon)
  element.querySelectorAll('.sr-only, span.icon[add-by-script]').forEach((s) => s.remove());

  const rows = Array.from(element.querySelectorAll(':scope > div'));
  let maxCols = 0;
  const built = [];

  rows.forEach((row) => {
    const cols = Array.from(row.querySelectorAll(':scope > div'));
    const rowCells = cols.map((col) => {
      const pictures = col.querySelectorAll('picture');
      const textOnly = col.textContent.trim();
      // Image-only column (picture may be wrapped in an empty heading/paragraph)
      if (pictures.length === 1 && !textOnly) {
        return pictures[0];
      }
      if (!pictures.length) {
        const img = col.querySelector('img');
        if (img && !textOnly) return img;
      }
      const content = Array.from(col.children);
      return content.length ? content : (textOnly ? col.textContent.trim() : '');
    });
    if (!rowCells.length) return;
    maxCols = Math.max(maxCols, rowCells.length);
    built.push(rowCells);
  });

  // Pad rows to equal column count
  built.forEach((r) => {
    while (r.length < maxCols) r.push('');
    cells.push(r);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells });
  element.replaceWith(block);
}
