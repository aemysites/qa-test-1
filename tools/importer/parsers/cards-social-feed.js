/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-social-feed
 * Source: .facebook-feed (decorated EDS block, .nsw-grid > .nsw-col > .nsw-card)
 * Rows: one per post -> [post image] [linked excerpt]
 * Decorative network icon (.card-icon data-URI svg) and arrow (.material-icons) are dropped;
 * the block JS re-adds them.
 */
export default function parse(element, { document }) {
  const cells = [];

  // The source renders posts twice: desktop grid (.nsw-grid) and a mobile
  // duplicate (.nsw-carousel-container). Use the grid; dedupe by post link.
  const grid = element.querySelector(':scope > .nsw-grid');
  const scope = grid || element;
  const seen = new Set();
  const cards = Array.from(scope.querySelectorAll('.nsw-card')).filter((card) => {
    const a = card.querySelector('.nsw-card__copy a[href]');
    const key = a ? a.getAttribute('href') : card.textContent.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  cards.forEach((card) => {
    // Cell 1: post image
    const imageWrap = card.querySelector('.nsw-card__image');
    let imageCell = '';
    if (imageWrap) {
      const picture = imageWrap.querySelector('picture');
      const img = imageWrap.querySelector('img');
      imageCell = picture || img || '';
    }

    // Cell 2: linked excerpt
    const textCell = [];
    const copy = card.querySelector('.nsw-card__copy');
    if (copy) {
      Array.from(copy.children).forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img, picture')) textCell.push(child);
      });
    }

    if (!imageCell && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-social-feed', cells });
  element.replaceWith(block);
}
