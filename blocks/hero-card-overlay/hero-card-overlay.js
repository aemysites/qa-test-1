import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero with a background photo and an overlaid content card.
 * Authoring: one row with the image, one row with heading, text and CTA.
 * Tolerates both cells in a single row, or missing image / content.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-card-overlay-media';
  const card = document.createElement('div');
  card.className = 'hero-card-overlay-card';

  if (picture) {
    const img = picture.querySelector('img');
    const url = img ? new URL(img.src, window.location.href) : null;
    if (img && url.origin === window.location.origin && !/\.svg$/i.test(url.pathname)) {
      media.append(createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]));
      picture.remove();
    } else {
      media.append(picture);
    }
  }

  cells.forEach((cell) => {
    // drop wrapper paragraphs left empty after moving the picture
    cell.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.children.length) p.remove();
    });
    while (cell.firstChild) card.append(cell.firstChild);
  });

  const children = [];
  if (media.children.length) children.push(media);
  else block.classList.add('no-image');
  if (card.textContent.trim() || card.children.length) children.push(card);
  block.replaceChildren(...children);
}
