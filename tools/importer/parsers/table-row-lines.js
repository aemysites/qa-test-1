/* eslint-disable */
/* global WebImporter */
/**
 * Parser: table-row-lines
 * Source: .table (non-bordered decorated EDS table block: .nsw-table > table > thead/tbody)
 * Variants: .table.no-header -> "table-row-lines (no-header)" (decorated thead is empty;
 *   every row is data). Otherwise the first row (thead th) is the header row.
 * Rows: one row per tr, one cell per column.
 */
function cellContent(cell) {
  cell.querySelectorAll('.sr-only, span.icon[add-by-script], .material-icons').forEach((s) => s.remove());
  const kids = Array.from(cell.childNodes).filter((n) => n.nodeType === 1 || n.textContent.trim());
  return kids.length ? kids : '';
}

export default function parse(element, { document }) {
  const cells = [];
  const noHeader = element.classList.contains('no-header');

  const table = element.querySelector('table');
  if (table) {
    const rows = Array.from(table.querySelectorAll(
      ':scope > thead > tr, :scope > tbody > tr, :scope > tr, :scope > tfoot > tr',
    ));
    rows.forEach((tr) => {
      const row = Array.from(tr.querySelectorAll(':scope > th, :scope > td')).map(cellContent);
      if (row.length) cells.push(row);
    });
  } else {
    // Undecorated fallback: rows of divs
    element.querySelectorAll(':scope > div').forEach((r) => {
      const row = Array.from(r.querySelectorAll(':scope > div')).map(cellContent);
      if (row.length) cells.push(row);
    });
  }

  // Pad to a uniform column count
  const maxCols = cells.reduce((m, r) => Math.max(m, r.length), 0);
  cells.forEach((r) => { while (r.length < maxCols) r.push(''); });

  const name = noHeader ? 'table-row-lines (no-header)' : 'table-row-lines';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
