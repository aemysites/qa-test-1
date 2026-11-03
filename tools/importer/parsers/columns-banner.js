/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-banner
 * Source: .banner (decorated EDS block, .nsw-hero-banner)
 * Row 1: [text, image] - or [image, text] when the source banner is "flipped"
 * (the block renders image side by authored cell order).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Text column: heading, intro paragraphs, CTA
  const textCell = [];
  const content = element.querySelector('.nsw-hero-banner__content');
  if (content) {
    Array.from(content.children).forEach((child) => {
      if (child.classList.contains('nsw-hero-banner__button')) {
        child.querySelectorAll('a[href]').forEach((a) => {
          const link = document.createElement('a');
          link.href = a.getAttribute('href');
          link.textContent = a.textContent.trim();
          const p = document.createElement('p');
          p.append(link);
          textCell.push(p);
        });
      } else {
        textCell.push(child);
      }
    });
  }

  // Image column
  const picture = element.querySelector('.nsw-hero-banner__box picture, .nsw-hero-banner__image');
  const img = element.querySelector('.nsw-hero-banner__box img');
  const imageCell = picture || img || '';

  const flipped = element.classList.contains('flipped');
  const textValue = textCell.length ? textCell : '';
  cells.push(flipped ? [imageCell, textValue] : [textValue, imageCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner', cells });
  element.replaceWith(block);
}
