/* eslint-disable */
/* global WebImporter */
/**
 * Parser: table-bordered
 * Source: .table.bordered (decorated EDS table block: .nsw-table--bordered > table > thead/tbody)
 * Rows: first row = header cells (from thead th), then one row per tbody tr; one cell per column.
 */
function cellContent(cell) {
  cell.querySelectorAll('.sr-only, span.icon[add-by-script], .material-icons').forEach((s) => s.remove());
  const kids = Array.from(cell.childNodes).filter((n) => n.nodeType === 1 || n.textContent.trim());
  return kids.length ? kids : '';
}

export default function parse(element, { document }) {
  const cells = [];

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-bordered', cells });
  element.replaceWith(block);
}
