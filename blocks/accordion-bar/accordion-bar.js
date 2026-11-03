/**
 * Accordion bar: stacked full-width title bars that expand to rich-text panels.
 * Each row is one item: [title] [panel content].
 * Titles are authored as plain text; headings authors paste in are flattened to text
 * so the summary keeps button semantics.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    const title = label ? label.textContent.trim() : '';
    if (!title && !(body && body.textContent.trim())) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-bar-item-label';
    summary.textContent = title;

    const panel = document.createElement('div');
    panel.className = 'accordion-bar-item-body';
    if (body) panel.append(...body.childNodes);

    const details = document.createElement('details');
    details.className = 'accordion-bar-item';
    details.append(summary, panel);
    row.replaceWith(details);
  });
}
