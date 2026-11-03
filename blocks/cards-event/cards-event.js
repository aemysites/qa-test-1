import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Event cards: image on top, event name, bold-label "Date:" / "Time:" lines and an
 * optional description. No card link or arrow.
 * Each row is one card: [image] [heading, Date/Time paragraphs, description].
 * The image cell may be missing or empty.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-event-card';

    [...row.children].forEach((cell) => {
      const hasMedia = cell.querySelector('picture, img');
      if (!cell.textContent.trim() && !hasMedia) return;
      if (hasMedia && !cell.textContent.trim()) {
        cell.className = 'cards-event-card-image';
      } else {
        cell.className = 'cards-event-card-body';
        // tag the "Date:" / "Time:" style lines (a paragraph that starts with a bold label)
        cell.querySelectorAll(':scope > p').forEach((p) => {
          const first = p.firstElementChild;
          const startsWithLabel = first && first.matches('strong, b')
            && p.textContent.trim().startsWith(first.textContent.trim())
            && /:\s*$/.test(first.textContent);
          if (startsWithLabel) p.classList.add('cards-event-detail');
        });
      }
      li.append(cell);
    });

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
