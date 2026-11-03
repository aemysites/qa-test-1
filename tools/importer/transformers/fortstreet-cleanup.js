/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for fortstreet-h.schools.nsw.gov.au (NSW schools AEM EDS site).
 * Generic across templates (home, school-life): only strips site chrome and
 * non-authorable widgets; never touches authorable section content.
 */

const remove = (root, selectors) => {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
};

const isEmptySection = (el) => !el.textContent.trim()
  && !el.querySelector('img, picture, video, iframe, svg, table, hr');

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Site chrome (EDS header/footer wrappers, skip links, mega menu, search)
    remove(element, [
      'header',
      '.header-wrapper',
      'footer',
      '.footer-wrapper',
      'nav.nsw-skip',
      '#main-nav',
      '.nsw-breadcrumbs',
      'nav[aria-label="breadcrumb"]',
      '.breadcrumb',
      '.breadcrumbs',
      // Generated "Section navigation" sidebar on inner pages
      'aside.nsw-layout__sidebar',
      '.sidebar-wrapper',
      '.nsw-side-nav',
    ]);

    // "Back to top" block/button inside main
    remove(element, [
      '.back-to-top',
      '.js-back-to-top',
      '.nsw-back-to-top',
    ]);

    // Carousel chrome (prev/next controls, pager dots, aria-live regions)
    remove(element, [
      '.nsw-carousel__control',
      '.js-carousel__navigation',
      '.nsw-carousel__navigation',
      '.js-carousel__aria-live',
    ]);
    // Leftover empty <nav> wrappers around removed carousel controls
    element.querySelectorAll('nav').forEach((nav) => {
      if (!nav.textContent.trim() && !nav.querySelector('img, a')) nav.remove();
    });

    // Non-content elements
    remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe[src*="googletagmanager"]',
      '[class*="cookie"]',
      '[id*="cookie"]',
      '#onetrust-consent-sdk',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Empty spacer sections (e.g. trailing `div.section.nsw-section` with no content).
    // Done here (not before) so :nth-of-type section selectors stay valid for the
    // sections transformer and parsers.
    element.querySelectorAll('#main > div.section, main > div.section, div.section.nsw-section')
      .forEach((sec) => {
        if (isEmptySection(sec)) sec.remove();
      });

    // Decorative Material icon ligatures ("east", "north", ...)
    remove(element, [
      'span.material-icons',
      'span.nsw-material-icons',
      // Script-added "(opens in new window)" text and link icons in default content
      '.sr-only',
      'span.icon[add-by-script]',
    ]);

    // Any remaining interactive chrome and inline-SVG data-URI icons
    remove(element, [
      'button',
      'form',
      'input',
      'select',
      'textarea',
      'link',
      'source[srcset^="data:"]',
    ]);
    element.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());

    // Tracking / framework attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach(({ name }) => {
        if (
          name.startsWith('data-')
          || name.startsWith('on')
          || name === 'aria-hidden'
          || name === 'tabindex'
        ) {
          el.removeAttribute(name);
        }
      });
    });
  }
}
