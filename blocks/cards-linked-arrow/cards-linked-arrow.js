import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Image-top cards with a linked title, description and trailing arrow.
 * Each row is one card: [image] [title link, description].
 * The whole card becomes clickable via the first link in the body.
 * Options (block classes): dark, horizontal, off-white, highlight.
 * Colour options are CSS-only; unknown tokens are ignored.
 * @param {Element} block
 */
export default function decorate(block) {
  const isHorizontal = block.classList.contains('horizontal');
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-linked-arrow-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-linked-arrow-card-image';
      } else {
        div.className = 'cards-linked-arrow-card-body';
      }
    });

    // drop empty cells authors may leave behind
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture, img')) div.remove();
    });

    const body = li.querySelector('.cards-linked-arrow-card-body');
    const link = (body || li).querySelector('a[href]');
    if (link) {
      li.classList.add('is-linked');
      link.classList.add('cards-linked-arrow-link');
      if (link.target === '_blank' || (link.host && link.host !== window.location.host)) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
      const arrow = document.createElement('span');
      arrow.className = 'cards-linked-arrow-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      (body || li).append(arrow);
    }

    // horizontal option: image beside text; cards without an image fall back to text-only
    if (isHorizontal && !li.querySelector('.cards-linked-arrow-card-image')) {
      li.classList.add('is-text-only');
    }

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
