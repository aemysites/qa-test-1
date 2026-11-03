/* eslint-disable */
/* global WebImporter */
/**
 * Parser: hero-card-overlay
 * Source: .full-image-banner (decorated EDS block)
 * Rows: [image], [heading + copy + CTA]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const picture = element.querySelector('.hero__image picture, .hero-banner-image picture');
  const img = element.querySelector('.hero__image img, .hero-banner-image img');
  const imageEl = picture || img;
  cells.push([imageEl || '']);

  // Row 2: card content (heading, copy, CTA)
  const content = [];
  const cardContent = element.querySelector('.nsw-card__content') || element.querySelector('.hero__content');
  if (cardContent) {
    const heading = cardContent.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) content.push(heading);
    const copy = cardContent.querySelector('.nsw-card__copy');
    if (copy) {
      content.push(...Array.from(copy.children));
    } else {
      cardContent.querySelectorAll(':scope > p').forEach((p) => content.push(p));
    }
  }
  cells.push([content.length ? content : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-card-overlay', cells });
  element.replaceWith(block);
}
