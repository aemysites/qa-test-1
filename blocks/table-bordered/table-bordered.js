/**
 * Table (bordered): full cell grid with a bold header row.
 * Rows are table rows, cells are table cells; the first row becomes the header.
 * Rows with fewer cells than the widest row are padded so the grid stays intact.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) {
    block.textContent = '';
    return;
  }
  const columnCount = Math.max(...rows.map((row) => row.children.length));

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    const tr = document.createElement('tr');
    const cells = [...row.children];
    for (let i = 0; i < columnCount; i += 1) {
      const cell = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) cell.scope = 'col';
      if (cells[i]) cell.append(...cells[i].childNodes);
      tr.append(cell);
    }
    (isHeader ? thead : tbody).append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);

  // scroll container so wide tables do not overflow on small screens
  const scroller = document.createElement('div');
  scroller.className = 'table-bordered-scroll';
  scroller.tabIndex = 0;
  scroller.append(table);
  block.replaceChildren(scroller);
}
