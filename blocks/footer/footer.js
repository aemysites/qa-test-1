/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{doc: Document, base: string}|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  return { doc: new DOMParser().parseFromString(html, 'text/html'), base: resp.url };
}

const isColumnSection = (section) => /^H[4-6]$/.test(section.firstElementChild?.tagName || '');
const isBrandSection = (section) => !!section.querySelector(':scope > p > a img');

/**
 * Builds a footer band from an authored section and tags its parts.
 * @param {Element} section authored section
 * @returns {Element} band element
 */
function buildBand(section) {
  const band = document.createElement('div');
  band.className = 'footer-band';
  if (isBrandSection(section)) {
    band.classList.add('footer-bottom');
    const logoLink = section.querySelector(':scope > p > a');
    logoLink.classList.add('footer-brand-logo');
    const list = section.querySelector(':scope > ul');
    if (list) list.classList.add('footer-legal-links');
    band.append(logoLink);
    if (list) band.append(list);
    return band;
  }
  if (section.querySelector(':scope > h1, :scope > h2, :scope > h3') && section.children.length === 1) {
    band.classList.add('footer-heading');
  } else {
    band.classList.add('footer-text');
  }
  band.append(...section.children);
  return band;
}

/**
 * Builds a column from an authored section that starts with a small heading.
 * @param {Element} section authored section
 */
function buildColumn(section) {
  const column = document.createElement('div');
  column.className = 'footer-column';
  const list = section.querySelector(':scope > ul');
  if (list) {
    const iconOnly = [...list.children].every((li) => {
      const link = li.querySelector('a');
      return link && link.querySelector('img') && !link.textContent.trim();
    });
    list.classList.add(iconOnly ? 'footer-social' : 'footer-contact');
  }
  column.append(...section.children);
  return column;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;
  const { doc, base } = fragment;

  // resolve relative image paths against the fragment location
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.loading = 'lazy';
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });

  const container = document.createElement('div');
  container.className = 'footer-container';
  let columns = null;
  [...doc.body.children].forEach((section) => {
    if (isColumnSection(section)) {
      if (!columns) {
        columns = document.createElement('div');
        columns.className = 'footer-band footer-columns';
        container.append(columns);
      }
      columns.append(buildColumn(section));
      return;
    }
    columns = null;
    container.append(buildBand(section));
  });

  // the band before the logo/legal links carries the divider line
  const bottom = container.querySelector('.footer-bottom');
  if (bottom && bottom.previousElementSibling) bottom.previousElementSibling.classList.add('footer-divider');

  // external links open the same way as on the source (mail in a new tab)
  container.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  block.textContent = '';
  block.append(container);
}
