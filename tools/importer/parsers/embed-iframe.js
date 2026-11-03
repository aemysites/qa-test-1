/* eslint-disable */
/* global WebImporter */
/**
 * Parser: embed-iframe
 * Source: .embed (decorated EDS embed block). Depending on lazy-load state it contains:
 *   - an <iframe src="{original URL}"> (bcove.video / Google Maps embed) once scrolled into view,
 *   - the original authored <a href="{URL}">, or
 *   - nothing (the block JS empties it until it intersects the viewport).
 * The "Skip Google Map" link (#after-map) is chrome and is ignored.
 * For the empty case the URL is recovered (best effort) from the authored
 * <page>.plain.html, matching this embed by its position on the page.
 * Rows: one row, one cell -> [optional poster image, link to embed URL]
 */

function urlFromDom(element) {
  const iframe = element.querySelector('iframe[src]');
  if (iframe && iframe.getAttribute('src')) return iframe.getAttribute('src');
  const link = Array.from(element.querySelectorAll('a[href]')).find((a) => {
    const href = a.getAttribute('href') || '';
    return href && !href.startsWith('#') && !a.classList.contains('skip-map-link');
  });
  if (link) return link.getAttribute('href');
  const withData = element.querySelector('[data-src], [data-url], [data-embed-src]');
  if (withData) {
    return withData.getAttribute('data-src') || withData.getAttribute('data-url')
      || withData.getAttribute('data-embed-src') || '';
  }
  return '';
}

function pageUrl(document) {
  const canonical = document.querySelector('link[rel="canonical"][href]');
  if (canonical) return canonical.getAttribute('href');
  const og = document.querySelector('meta[property="og:url"][content]');
  if (og) return og.getAttribute('content');
  return '';
}

// Position of this embed among all embeds on the page (already-converted embeds are
// block tables whose header cell reads "Embed Iframe").
function embedIndex(element, document) {
  const all = Array.from(document.querySelectorAll('.embed, table')).filter((el) => {
    if (el.matches('.embed')) return !el.parentElement || !el.parentElement.closest('.embed');
    const first = el.querySelector('tr > th, tr > td');
    return first && /^embed[ -]iframe/i.test(first.textContent.trim());
  });
  return Math.max(0, all.indexOf(element));
}

function urlFromAuthoredSource(element, document) {
  try {
    const page = pageUrl(document);
    if (!page) return '';
    const src = `${page.replace(/[?#].*$/, '').replace(/\/$/, '')}.plain.html`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src, false);
    xhr.send(null);
    if (xhr.status !== 200 || !xhr.responseText) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = xhr.responseText;
    const embeds = Array.from(tmp.querySelectorAll('div.embed'));
    const authored = embeds[embedIndex(element, document)] || (embeds.length === 1 ? embeds[0] : null);
    const a = authored && authored.querySelector('a[href]');
    return a ? a.getAttribute('href') : '';
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document }) {
  const cells = [];

  let url = urlFromDom(element);
  if (!url && !element.textContent.trim()) url = urlFromAuthoredSource(element, document);

  const content = [];
  const poster = element.querySelector('picture') || element.querySelector('img');
  if (poster) content.push(poster);
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    content.push(a);
  }

  cells.push([content.length ? content : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-iframe', cells });
  element.replaceWith(block);
}
