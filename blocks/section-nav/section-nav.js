import {
  getSectionTree, findNode, ancestry, currentPagePath,
} from '../../scripts/section-tree.js';

/**
 * Renders a list of pages; the branch containing the current page is expanded.
 * @param {Object[]} nodes pages to list
 * @param {Set<Object>} activeChain current page and its ancestors
 * @param {Object} current current page node
 */
function buildList(nodes, activeChain, current) {
  const list = document.createElement('ul');
  nodes.forEach((node) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = node.path;
    link.textContent = node.title;
    if (node === current) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
    li.append(link);
    const expanded = activeChain.has(node) && node.children.length > 0;
    if (expanded) {
      li.classList.add('is-active');
      li.append(buildList(node.children, activeChain, current));
    }
    list.append(li);
  });
  return list;
}

/**
 * Builds the "Section navigation" sidebar for the current page from the site page tree.
 * @param {Element} block The section-nav block element
 */
export default async function decorate(block) {
  const section = block.closest('.section');
  const tree = await getSectionTree();
  const current = tree && findNode(tree, currentPagePath());
  block.textContent = '';
  if (!current || current === tree) {
    section?.remove();
    return;
  }

  // span the sidebar alongside every content section of the page
  const rows = Number(section?.dataset.contentSections) || 1;
  if (section) section.style.gridRow = `2 / span ${rows}`;

  const chain = ancestry(current);
  const activeChain = new Set(chain);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'section navigation');

  const heading = document.createElement('h2');
  heading.className = 'section-nav-sr-heading';
  heading.textContent = 'Section navigation';
  nav.append(heading);

  if (chain.length === 2) {
    // a top-level section page lists every section, with its own pages expanded
    nav.append(buildList(tree.children, activeChain, current));
  } else {
    const top = chain[1];
    const header = document.createElement('div');
    header.className = 'section-nav-header';
    const headerLink = document.createElement('a');
    headerLink.href = top.path;
    headerLink.textContent = top.title;
    header.append(headerLink);
    nav.append(header, buildList(top.children, activeChain, current));
  }

  block.append(nav);
}
