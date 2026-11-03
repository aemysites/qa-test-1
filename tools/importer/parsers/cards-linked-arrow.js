/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-linked-arrow
 * Source: .card-container (decorated EDS block, ul.nsw-grid > li > .nsw-card)
 *   - Flavours kept as block classes on the decorated block: dark, highlight, off-white
 *     -> emitted as block options, e.g. "cards-linked-arrow (dark)".
 *     "supplementary" (homepage) and "horizontal" (lost in decoration) map to no option.
 *   - Text-only cards: the image wrapper is an empty <div> -> empty image cell.
 * Rows: one per card -> [image | empty] [linked title heading + description]
 * Title heading level: authored as h3 when the card set follows a heading in the same
 *   section (e.g. homepage "The Fort Street High School difference"), otherwise h2
 *   (inner-page related-page cards). The decorated title is a plain div, so this is inferred.
 */
const OPTIONS = ['dark', 'highlight', 'off-white'];

function titleLevel(element) {
  const section = element.closest('.section') || element.parentElement;
  if (!section) return 'h2';
  const preceding = Array.from(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter((h) => (
    !element.contains(h)
    && !h.closest('table')
    // eslint-disable-next-line no-bitwise
    && (h.compareDocumentPosition(element) & 4) // element FOLLOWS heading
  ));
  const last = preceding[preceding.length - 1];
  if (last && Number(last.tagName.substring(1)) >= 2) return 'h3';
  // Heading-only section directly before this one (e.g. "What families value ...")
  if (!preceding.length && section.classList.contains('section')) {
    const prev = section.previousElementSibling;
    const wrappers = prev ? Array.from(prev.children).filter((c) => c.tagName === 'DIV') : [];
    const lastWrapper = wrappers[wrappers.length - 1];
    const lastEl = lastWrapper && lastWrapper.classList.contains('default-content-wrapper')
      && lastWrapper.lastElementChild;
    if (lastEl && /^H[2-6]$/.test(lastEl.tagName)) return 'h3';
  }
  return 'h2';
}

export default function parse(element, { document }) {
  const cells = [];
  const level = titleLevel(element);

  const cards = Array.from(element.querySelectorAll('.nsw-card'));
  cards.forEach((card) => {
    // Cell 1: image (empty for text-only cards)
    const imageWrap = card.querySelector('.nsw-card__image');
    const imageCell = imageWrap
      ? (imageWrap.querySelector('picture') || imageWrap.querySelector('img') || '')
      : '';

    // Cell 2: linked title + description
    const textCell = [];
    const titleWrap = card.querySelector('.nsw-card__title');
    if (titleWrap) {
      const link = titleWrap.querySelector('a[href]');
      const heading = document.createElement(level);
      if (link) {
        // remove decorative icon / screen-reader helper spans
        link.querySelectorAll('.sr-only, .icon, .material-icons').forEach((s) => s.remove());
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        if (link.title) a.title = link.title;
        a.textContent = link.textContent.trim();
        heading.append(a);
      } else {
        heading.textContent = titleWrap.textContent.trim();
      }
      if (heading.textContent.trim()) textCell.push(heading);
    }
    const copy = card.querySelector('.nsw-card__copy');
    if (copy) {
      Array.from(copy.children).forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img, picture')) textCell.push(child);
      });
    }

    if (!imageCell && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const options = OPTIONS.filter((o) => element.classList.contains(o));
  const name = options.length ? `cards-linked-arrow (${options.join(', ')})` : 'cards-linked-arrow';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
