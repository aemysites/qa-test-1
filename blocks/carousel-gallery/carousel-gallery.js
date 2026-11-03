import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Gallery carousel: image slides with a caption bar.
 * Each row is one slide: [image] [caption].
 * Prev/next buttons sit above the track (top right); dot pagination sits below it.
 * Uses a native scroll-snap track, so touch swipe and keyboard scrolling work without JS.
 * Prev/next and dots move one "page" (the number of slides in view) at a time;
 * slides per view come from the --carousel-gallery-per-view custom property.
 */

let galleryCount = 0;

const ICONS = {
  prev: '13 2 5 10 13 18',
  next: '7 2 15 10 7 18',
};

function icon(direction) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'carousel-gallery-icon');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const line = document.createElementNS(ns, 'polyline');
  line.setAttribute('points', ICONS[direction]);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-linecap', 'square');
  line.setAttribute('stroke-linejoin', 'square');
  line.setAttribute('stroke-width', '2');
  svg.append(line);
  return svg;
}

function buildSlide(row, idx, total, id) {
  const [media, caption] = row.children;
  const li = document.createElement('li');
  li.className = 'carousel-gallery-slide';
  li.id = `${id}-slide-${idx}`;
  li.setAttribute('role', 'group');
  li.setAttribute('aria-roledescription', 'slide');
  li.setAttribute('aria-label', `${idx + 1} of ${total}`);

  const figure = document.createElement('figure');
  figure.className = 'carousel-gallery-figure';

  if (media && (media.querySelector('picture, img, a') || media.textContent.trim())) {
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'carousel-gallery-image';
    mediaWrap.append(...media.childNodes);
    figure.append(mediaWrap);
  }

  if (caption && caption.textContent.trim()) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'carousel-gallery-caption';
    figcaption.append(...caption.childNodes);
    figure.append(figcaption);
  }

  li.append(figure);
  return li;
}

function slideWidth(track) {
  const first = track.querySelector('.carousel-gallery-slide');
  if (!first) return track.clientWidth;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return first.getBoundingClientRect().width + gap;
}

function controlButton(direction, track) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `carousel-gallery-${direction}`;
  button.setAttribute('aria-controls', track.id);
  button.setAttribute('aria-label', direction === 'prev' ? 'Show previous items' : 'Show next items');
  button.append(icon(direction));
  return button;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  galleryCount += 1;
  const id = `carousel-gallery-${galleryCount}`;
  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture, img'));
  if (!rows.length) {
    block.textContent = '';
    return;
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Gallery');

  const track = document.createElement('ul');
  track.className = 'carousel-gallery-slides';
  track.id = `${id}-slides`;
  rows.forEach((row, idx) => track.append(buildSlide(row, idx, rows.length, id)));

  track.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  const viewport = document.createElement('div');
  viewport.className = 'carousel-gallery-viewport';
  viewport.append(track);

  if (rows.length < 2) {
    block.replaceChildren(viewport);
    return;
  }

  // prev / next controls
  const controls = document.createElement('div');
  controls.className = 'carousel-gallery-controls';
  const prev = controlButton('prev', track);
  const next = controlButton('next', track);
  controls.append(prev, next);

  // dot pagination, one per page of slides
  const dotsNav = document.createElement('nav');
  dotsNav.className = 'carousel-gallery-dots';
  dotsNav.setAttribute('aria-label', 'Gallery slide controls');
  const dots = document.createElement('ol');
  dotsNav.append(dots);

  block.replaceChildren(controls, viewport, dotsNav);

  const perView = () => {
    const value = parseInt(getComputedStyle(block).getPropertyValue('--carousel-gallery-per-view'), 10);
    return Math.max(1, Math.min(value || 1, rows.length));
  };
  const pageCount = () => Math.ceil(rows.length / perView());
  const pageWidth = () => slideWidth(track) * perView();
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;

  const buildDots = () => {
    const pages = pageCount();
    if (dots.children.length === pages) return;
    dots.replaceChildren();
    for (let idx = 0; idx < pages; idx += 1) {
      const li = document.createElement('li');
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.dataset.index = idx;
      dot.setAttribute('aria-label', `Show page ${idx + 1} of ${pages}`);
      li.append(dot);
      dots.append(li);
    }
  };

  const currentPage = () => {
    if (atEnd()) return pageCount() - 1;
    return Math.min(Math.round(track.scrollLeft / pageWidth()), pageCount() - 1);
  };

  const goTo = (page) => {
    const target = Math.max(0, Math.min(page, pageCount() - 1));
    track.scrollTo({ left: target * pageWidth(), behavior: 'smooth' });
  };

  const update = () => {
    buildDots();
    const page = currentPage();
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = atEnd();
    dots.querySelectorAll('button').forEach((dot, i) => {
      if (i === page) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  prev.addEventListener('click', () => goTo(currentPage() - 1));
  next.addEventListener('click', () => goTo(currentPage() + 1));
  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('button[data-index]');
    if (dot) goTo(parseInt(dot.dataset.index, 10));
  });

  let ticking = false;
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };
  track.addEventListener('scroll', schedule, { passive: true });
  // sections are hidden until loaded, so re-measure whenever the track gets (or changes) size
  new ResizeObserver(schedule).observe(track);
  update();
}
