import { createOptimizedPicture } from '../../scripts/aem.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONS = {
  // Material Icons "east"
  arrow: {
    viewBox: '0 0 24 24',
    d: 'M15 5l-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z',
  },
  facebook: {
    viewBox: '0 0 32 32',
    d: 'M32 16.098C32 7.207 24.837 0 16 0S0 7.207 0 16.098C0 24.133 5.851 30.793 13.5 32V20.751H9.437v-4.653H13.5v-3.547c0-4.035 2.389-6.263 6.043-6.263 1.751 0 3.582.314 3.582.314v3.962h-2.018c-1.988 0-2.607 1.241-2.607 2.514v3.02h4.438l-.709 4.653h-3.728V32c7.649-1.208 13.5-7.867 13.5-15.902z',
  },
};

function svgIcon({ viewBox, d }) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

function chevron(points) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const line = document.createElementNS(SVG_NS, 'polyline');
  line.setAttribute('points', points);
  svg.append(line);
  return svg;
}

function span(className, icon) {
  const el = document.createElement('span');
  el.className = className;
  el.setAttribute('aria-hidden', 'true');
  el.append(svgIcon(icon));
  return el;
}

function buildCard(row) {
  const li = document.createElement('li');
  li.className = 'cards-social-feed-card';
  while (row.firstElementChild) li.append(row.firstElementChild);

  [...li.children].forEach((div) => {
    if (div.querySelector('picture, img') && !div.textContent.trim()) {
      div.className = 'cards-social-feed-card-image';
    } else if (!div.textContent.trim()) {
      div.remove();
    } else {
      div.className = 'cards-social-feed-card-body';
    }
  });

  let body = li.querySelector('.cards-social-feed-card-body');
  if (!body) {
    body = document.createElement('div');
    body.className = 'cards-social-feed-card-body';
    li.append(body);
  }

  // excerpt: a single clamped paragraph (undo EDS auto-button decoration)
  let copy = body.querySelector('p');
  if (!copy) {
    copy = document.createElement('p');
    while (body.firstChild) copy.append(body.firstChild);
    body.append(copy);
  }
  copy.className = 'cards-social-feed-copy';

  const link = li.querySelector('a[href]');
  if (link) {
    li.classList.add('is-linked');
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    link.classList.add('cards-social-feed-link');
    link.removeAttribute('title');
    if (link.host && link.host !== window.location.host) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }

  body.append(
    span('cards-social-feed-arrow', ICONS.arrow),
    span('cards-social-feed-network', ICONS.facebook),
  );

  return (li.textContent.trim() || li.querySelector('picture, img')) ? li : null;
}

/**
 * Mobile carousel: prev/next controls and dot navigation driving a
 * scroll-snap track. Hidden by CSS from tablet up, where cards form a grid.
 */
function buildCarousel(block, ul) {
  const cards = [...ul.children];
  if (cards.length < 2) return;

  const controls = document.createElement('div');
  controls.className = 'cards-social-feed-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-social-feed-prev';
  prev.setAttribute('aria-label', 'Show previous items');
  prev.append(chevron('13 2 5 10 13 18'));
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-social-feed-next';
  next.setAttribute('aria-label', 'Show next items');
  next.append(chevron('7 2 15 10 7 18'));
  controls.append(prev, next);

  const dots = document.createElement('div');
  dots.className = 'cards-social-feed-dots';
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cards-social-feed-dot';
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Show item ${i + 1} of ${cards.length}`);
    dots.append(dot);
  });

  ul.id = ul.id || `cards-social-feed-${Math.random().toString(36).slice(2, 8)}`;
  [prev, next].forEach((b) => b.setAttribute('aria-controls', ul.id));
  ul.setAttribute('aria-roledescription', 'carousel');
  ul.setAttribute('aria-label', 'Card carousel');

  const step = () => {
    if (cards.length < 2) return ul.clientWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  };
  const current = () => Math.max(0, Math.min(cards.length - 1, Math.round(ul.scrollLeft / step())));
  const goTo = (i) => ul.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });

  const update = () => {
    const idx = current();
    const max = ul.scrollWidth - ul.clientWidth - 1;
    prev.disabled = ul.scrollLeft <= 1;
    next.disabled = ul.scrollLeft >= max;
    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle('is-active', i === idx);
      if (i === idx) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    cards.forEach((card, i) => card.setAttribute('aria-label', `${i + 1} of ${cards.length}`));
  };

  controls.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = current();
    goTo(btn === prev ? Math.max(0, idx - 1) : Math.min(cards.length - 1, idx + 1));
  });
  dots.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) goTo(Number(btn.dataset.index));
  });

  let raf;
  ul.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });
  // re-sync once the track is laid out (block is hidden while loading) and on resize
  new ResizeObserver(update).observe(ul);

  block.prepend(controls);
  block.append(dots);
  update();
}

/**
 * Social post cards: [post image] [linked excerpt].
 * Adds the arrow and Facebook icon; 3-column grid on desktop,
 * swipe carousel with controls on mobile.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-social-feed-track';
  [...block.children].forEach((row) => {
    const li = buildCard(row);
    if (li) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
  buildCarousel(block, ul);
}
