import {
  getSectionTree, findNode, ancestry, currentPagePath,
} from '../../scripts/section-tree.js';

/**
 * Builds the breadcrumb trail for the current page from the site page tree.
 * @param {Element} block The breadcrumb block element
 */
export default async function decorate(block) {
  const tree = await getSectionTree();
  const node = tree && findNode(tree, currentPagePath());
  block.textContent = '';
  if (!node || node === tree) {
    block.closest('.section')?.remove();
    return;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumbs');
  const list = document.createElement('ol');
  const chain = ancestry(node);

  chain.forEach((crumb, i) => {
    const li = document.createElement('li');
    if (i === chain.length - 1) {
      const current = document.createElement('span');
      current.className = 'breadcrumb-current';
      current.setAttribute('aria-current', 'page');
      current.textContent = crumb.title;
      li.append(current);
    } else {
      const link = document.createElement('a');
      link.href = crumb.path;
      link.textContent = crumb.title;
      li.append(link);
    }
    list.append(li);

    // long trails collapse the middle crumbs behind a "show more" toggle on mobile
    if (i === 0 && chain.length > 3) {
      const toggleItem = document.createElement('li');
      toggleItem.className = 'breadcrumb-toggle';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Show more breadcrumbs');
      toggle.textContent = '…';
      toggle.addEventListener('click', () => list.classList.add('is-expanded'));
      toggleItem.append(toggle);
      list.append(toggleItem);
    }
  });

  nav.append(list);
  block.append(nav);
}
