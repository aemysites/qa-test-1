/**
 * Two-column image | text pair. Image side follows authored order.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // drop empty cells authors may leave behind
    [...row.children].forEach((col) => {
      if (!col.textContent.trim() && !col.querySelector('picture, img')) col.remove();
    });
    const cols = [...row.children];
    if (!cols.length) {
      row.remove();
      return;
    }
    row.classList.add('columns-banner-row');
    cols.forEach((col, i) => {
      const pic = col.querySelector('picture');
      const onlyPicture = pic && col.textContent.trim() === '' && col.querySelectorAll('picture').length === 1;
      if (onlyPicture) {
        col.classList.add('columns-banner-img-col');
        if (i === 0) row.classList.add('columns-banner-image-first');
      } else {
        col.classList.add('columns-banner-text-col');
      }
    });
  });
}
