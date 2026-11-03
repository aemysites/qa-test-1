/*
 * Site page tree shared by the breadcrumb and section-nav blocks.
 * Authored in the section-nav fragment as a "Home" link followed by a nested list of pages.
 */

let treePromise;

/**
 * Returns the current page path without the local preview prefix or trailing index/slash.
 * @returns {string} e.g. "/about-us/enrol" or "/" for the home page
 */
export function currentPagePath() {
  const path = window.location.pathname
    .replace(/^\/content(?=\/|$)/, '')
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '');
  return path || '/';
}

function normalize(href) {
  try {
    const url = new URL(href, window.location.origin);
    return url.pathname.replace(/\/$/, '') || '/';
  } catch (e) {
    return href;
  }
}

function parseList(list, parent) {
  return [...list.children].map((li) => {
    const link = li.querySelector(':scope > a');
    const node = {
      title: link ? link.textContent.trim() : '',
      path: link ? normalize(link.getAttribute('href')) : '',
      parent,
      children: [],
    };
    const sub = li.querySelector(':scope > ul');
    if (sub) node.children = parseList(sub, node);
    return node;
  });
}

async function loadTree() {
  let resp = await fetch('/content/section-nav.plain.html');
  if (!resp.ok) resp = await fetch('/section-nav.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  const homeLink = doc.querySelector('p > a');
  const list = doc.querySelector('ul');
  const home = {
    title: homeLink ? homeLink.textContent.trim() : 'Home',
    path: homeLink ? normalize(homeLink.getAttribute('href')) : '/',
    parent: null,
    children: [],
  };
  if (list) home.children = parseList(list, home);
  return home;
}

/**
 * Loads (once) and returns the page tree root (the home page node).
 * @returns {Promise<Object|null>}
 */
export function getSectionTree() {
  if (!treePromise) treePromise = loadTree().catch(() => null);
  return treePromise;
}

/**
 * Finds the node for a path in the tree.
 * @param {Object} node tree node to search from
 * @param {string} path page path
 * @returns {Object|null}
 */
export function findNode(node, path) {
  if (!node) return null;
  if (node.path === path) return node;
  return node.children.reduce((found, child) => found || findNode(child, path), null);
}

/**
 * Returns the chain of nodes from the home page down to the given node.
 * @param {Object} node tree node
 * @returns {Object[]}
 */
export function ancestry(node) {
  const chain = [];
  for (let n = node; n; n = n.parent) chain.unshift(n);
  return chain;
}
