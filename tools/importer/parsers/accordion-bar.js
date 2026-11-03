/* eslint-disable */
/* global WebImporter */
/**
 * Parser: accordion-bar
 * Source: .accordions (decorated EDS block:
 *   .nsw-accordion > (.nsw-accordion__title > button) + .nsw-accordion__content, repeated)
 * Rows: one per item -> [title (plain text)] [panel content]
 * Title/content are paired by document order.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Strip script-added link helpers ("(opens in new window)" + inline icon)
  element.querySelectorAll('.sr-only, span.icon[add-by-script], .material-icons').forEach((s) => s.remove());

  const titles = Array.from(element.querySelectorAll('.nsw-accordion__title'));
  const contents = Array.from(element.querySelectorAll('.nsw-accordion__content'));

  if (titles.length) {
    titles.forEach((titleEl, i) => {
      const btn = titleEl.querySelector('button') || titleEl;
      const title = btn.textContent.replace(/\s+/g, ' ').trim();
      // Prefer the panel referenced by aria-controls, fall back to document order
      const id = btn.getAttribute && btn.getAttribute('aria-controls');
      let panel = id ? element.querySelector(`[id="${id}"]`) : null;
      if (!panel) panel = contents[i];
      const content = panel ? Array.from(panel.children) : [];
      if (!title && !content.length) return;
      cells.push([title, content.length ? content : (panel ? panel.textContent.trim() : '')]);
    });
  } else {
    // Undecorated fallback: rows of [title, content]
    element.querySelectorAll(':scope > div').forEach((row) => {
      const cols = Array.from(row.querySelectorAll(':scope > div'));
      if (!cols.length) return;
      const title = cols[0].textContent.replace(/\s+/g, ' ').trim();
      const content = cols[1] ? Array.from(cols[1].children) : [];
      cells.push([title, content.length ? content : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-bar', cells });
  element.replaceWith(block);
}
