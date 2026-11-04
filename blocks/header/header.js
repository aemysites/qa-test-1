// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

const ICONS = {
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"/></svg>',
};

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{doc: Document, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return { doc, base: resp.url };
}

function icon(name, className) {
  const span = document.createElement('span');
  span.className = `nav-icon ${className || ''}`.trim();
  span.innerHTML = ICONS[name];
  return span;
}

function srText(text) {
  const span = document.createElement('span');
  span.className = 'nav-sr-only';
  span.textContent = text;
  return span;
}

function closeButton() {
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-panel-close';
  close.append(icon('close'), srText('Close Menu'));
  return close;
}

function closeAllPanels(nav, exceptItem) {
  nav.querySelectorAll('.nav-item.is-open').forEach((item) => {
    if (item === exceptItem) return;
    item.classList.remove('is-open');
    item.querySelector(':scope > .nav-link').setAttribute('aria-expanded', 'false');
  });
}

function closeSearch(nav) {
  const tools = nav.querySelector('.nav-tools');
  if (!tools || !tools.classList.contains('is-search-open')) return;
  tools.classList.remove('is-search-open');
  tools.querySelector('.nav-search-toggle').setAttribute('aria-expanded', 'false');
}

/**
 * Toggles the mobile menu drawer.
 * @param {Element} nav the nav element
 * @param {boolean} [force] desired state
 */
function toggleMenu(nav, force) {
  const open = force !== undefined ? force : !nav.classList.contains('is-menu-open');
  nav.classList.toggle('is-menu-open', open);
  const button = nav.querySelector('.nav-hamburger');
  if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) {
    nav.querySelectorAll('.nav-panel.is-active').forEach((p) => p.classList.remove('is-active'));
    closeAllPanels(nav);
  }
}

/**
 * Builds a panel (desktop megamenu / mobile slide-in sub-menu) for a list item.
 * @param {Element} link the item's link
 * @param {Element} list the item's nested list
 * @param {string} id panel id
 */
function buildPanel(link, list, id) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = id;

  const header = document.createElement('div');
  header.className = 'nav-panel-header';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'nav-panel-back';
  const backLabel = document.createElement('span');
  backLabel.append(document.createTextNode('Back'), srText(' to previous menu'));
  back.append(icon('back'), backLabel);
  header.append(back, closeButton());

  const title = document.createElement('div');
  title.className = 'nav-panel-title';
  const titleLink = document.createElement('a');
  titleLink.href = link.getAttribute('href');
  titleLink.textContent = link.textContent;
  titleLink.append(icon('arrow'));
  title.append(titleLink);

  list.classList.add('nav-panel-list');
  panel.append(header, title, list);
  return panel;
}

/**
 * Decorates a nav list recursively: items with a nested list get a panel.
 * @param {Element} list ul element
 * @param {number} depth nesting level (0 = top level)
 * @param {string} prefix id prefix
 */
function decorateList(list, depth, prefix) {
  list.classList.add(depth === 0 ? 'nav-list' : 'nav-sub-list');
  [...list.children].forEach((li, i) => {
    li.classList.add(depth === 0 ? 'nav-item' : 'nav-sub-item');
    const link = li.querySelector(':scope > a');
    const sub = li.querySelector(':scope > ul');
    if (!link) return;
    link.classList.add(depth === 0 ? 'nav-link' : 'nav-sub-link');
    if (!sub) return;
    const id = `${prefix}-${i}`;
    decorateList(sub, depth + 1, id);
    link.append(icon('chevron', 'nav-chevron'));
    link.setAttribute('aria-controls', id);
    link.setAttribute('aria-expanded', 'false');
    li.classList.add('has-panel');
    li.append(buildPanel(link, sub, id));
  });
}

function bindPanelEvents(nav) {
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('.has-panel > a');
    const back = e.target.closest('.nav-panel-back');
    const close = e.target.closest('.nav-panel-close');
    if (close) {
      toggleMenu(nav, false);
      return;
    }
    if (back) {
      back.closest('.nav-panel').classList.remove('is-active');
      return;
    }
    if (!link) return;
    const item = link.parentElement;
    const isTop = item.classList.contains('nav-item');
    if (isDesktop.matches) {
      // desktop: top-level items toggle their megamenu; deeper links navigate
      if (!isTop) return;
      e.preventDefault();
      const open = !item.classList.contains('is-open');
      closeAllPanels(nav, item);
      closeSearch(nav);
      item.classList.toggle('is-open', open);
      link.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    // mobile: slide in the item's sub-menu
    e.preventDefault();
    const panel = item.querySelector(':scope > .nav-panel');
    panel.classList.add('is-active');
    link.setAttribute('aria-expanded', 'true');
    panel.querySelector('.nav-panel-back').focus();
  });

  document.addEventListener('click', (e) => {
    if (!isDesktop.matches) return;
    if (!e.target.closest('.nav-item.is-open')) closeAllPanels(nav);
    if (!e.target.closest('.nav-tools')) {
      const input = nav.querySelector('.nav-search-input');
      if (input && !input.value) closeSearch(nav);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-item.is-open');
    if (open) {
      closeAllPanels(nav);
      open.querySelector(':scope > .nav-link').focus();
    } else if (nav.classList.contains('is-menu-open')) {
      toggleMenu(nav, false);
      nav.querySelector('.nav-hamburger').focus();
    } else {
      closeSearch(nav);
    }
  });
}

/**
 * Builds the search toggle and form from the authored search link.
 * @param {Element} tools tools container
 * @param {Element} searchLink authored link pointing to the search page
 */
function buildSearch(tools, searchLink) {
  const action = searchLink ? searchLink.getAttribute('href') : '/search';
  const label = searchLink ? searchLink.textContent.trim() : 'Search';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-search');
  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'nav-tool-label';
  toggleLabel.append(srText('Show '), document.createTextNode(label));
  toggle.append(icon('search'), toggleLabel);

  const area = document.createElement('div');
  area.className = 'nav-search';
  area.id = 'nav-search';
  const form = document.createElement('form');
  form.role = 'search';
  form.action = action;
  const inputLabel = document.createElement('label');
  inputLabel.className = 'nav-sr-only';
  inputLabel.htmlFor = 'nav-search-input';
  inputLabel.textContent = 'Search site for:';
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'q';
  input.id = 'nav-search-input';
  input.className = 'nav-search-input';
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', label);
  submit.append(icon('search'));
  form.append(inputLabel, input, submit);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', `Close ${label.toLowerCase()}`);
  close.append(icon('close'));
  area.append(form, close);

  toggle.addEventListener('click', () => {
    tools.classList.add('is-search-open');
    toggle.setAttribute('aria-expanded', 'true');
    input.focus();
  });
  close.addEventListener('click', () => {
    tools.classList.remove('is-search-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });

  tools.append(toggle, area);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;
  const { doc, base } = fragment;
  const sectionsInFragment = [...doc.body.children];
  // sections are identified by content, so authored order and extra wrappers don't matter
  const brandSection = sectionsInFragment.find((sec) => sec.querySelector('img'));
  const navSection = sectionsInFragment.find((sec) => sec.querySelector('ul ul'));
  const brandIndex = sectionsInFragment.indexOf(brandSection);
  const skipSection = sectionsInFragment
    .find((sec, i) => i < brandIndex && sec !== navSection && sec.querySelector('a'));
  const toolsSection = sectionsInFragment
    .find((sec) => ![skipSection, brandSection, navSection].includes(sec));

  // list items with a sub-list may wrap their link in a paragraph (Document Authoring)
  doc.querySelectorAll('li > p').forEach((p) => {
    if (p.children.length === 1 && p.firstElementChild.tagName === 'A') p.replaceWith(p.firstElementChild);
  });

  // resolve relative image paths against the fragment location
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });

  block.textContent = '';
  const nav = document.createElement('div');
  nav.className = 'nav';
  nav.id = 'nav';

  // skip links (visible on keyboard focus only)
  if (skipSection) {
    const skip = document.createElement('nav');
    skip.className = 'nav-skip';
    skip.setAttribute('aria-label', 'Skip to links');
    // skip links target the main nav and the page content
    const targets = ['#main-nav', '#main'];
    skipSection.querySelectorAll('a').forEach((a, i) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#') && targets[i]) a.setAttribute('href', targets[i]);
      skip.append(a);
    });
    const main = document.querySelector('main');
    if (main && !main.id) main.id = 'main';
    nav.append(skip);
  }

  // masthead: logo + school name (whole area links home) and tools
  const masthead = document.createElement('div');
  masthead.className = 'nav-masthead';
  const inner = document.createElement('div');
  inner.className = 'nav-masthead-inner';
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    const homeLink = brandSection.querySelector('a');
    const logo = brandSection.querySelector('img');
    const texts = [...brandSection.querySelectorAll('p')].filter((p) => !p.querySelector('a'));
    const link = document.createElement('a');
    link.className = 'nav-brand-link';
    link.href = homeLink ? homeLink.getAttribute('href') : '/';
    if (logo) {
      logo.className = 'nav-brand-logo';
      logo.loading = 'eager';
      link.append(logo);
    }
    const linkLabel = homeLink ? homeLink.textContent.trim() : '';
    if (linkLabel) {
      const sr = document.createElement('span');
      sr.className = 'nav-sr-only';
      sr.textContent = linkLabel;
      link.append(sr);
    }
    const name = document.createElement('span');
    name.className = 'nav-brand-name';
    texts.forEach((p, i) => {
      const line = document.createElement('span');
      line.className = i === 0 ? 'nav-brand-title' : 'nav-brand-subtitle';
      line.textContent = p.textContent.trim();
      name.append(line);
    });
    brand.append(link, name);
  }

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'main-nav');
  hamburger.setAttribute('aria-expanded', 'false');
  const menuLabel = document.createElement('span');
  menuLabel.className = 'nav-tool-label';
  menuLabel.append(srText('Open '), document.createTextNode('Menu'));
  hamburger.append(icon('menu'), menuLabel);
  hamburger.addEventListener('click', () => toggleMenu(nav));
  tools.append(hamburger);
  buildSearch(tools, toolsSection ? toolsSection.querySelector('a') : null);

  inner.append(brand, tools);
  masthead.append(inner);

  // main navigation bar
  const sections = document.createElement('nav');
  sections.className = 'nav-sections';
  sections.id = 'main-nav';
  sections.setAttribute('aria-label', 'Main');
  const sectionsHeader = document.createElement('div');
  sectionsHeader.className = 'nav-panel-header nav-sections-header';
  const sectionsTitle = document.createElement('div');
  sectionsTitle.className = 'nav-sections-title';
  sectionsTitle.textContent = 'Menu';
  sectionsHeader.append(sectionsTitle, closeButton());
  const list = navSection ? navSection.querySelector('ul') : null;
  if (list) {
    decorateList(list, 0, 'nav-panel');
    list.querySelectorAll(':scope > li > a').forEach((a) => a.classList.add('nav-trigger'));
  }
  sections.append(sectionsHeader);
  if (list) sections.append(list);

  nav.append(masthead, sections);
  bindPanelEvents(nav);

  // reset menus when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closeSearch(nav);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
