# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--qa-test-1--aemysites.aem.page/
- Live: https://main--qa-test-1--aemysites.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `qa-test-1` directory in your favorite IDE and start coding :)

## Site navigation content

The header, footer, breadcrumbs and section navigation sidebar are driven by content fragments:

- `nav` — header masthead, main menu (nested lists = dropdowns / mobile sub-menus) and search link
- `footer` — footer bands (school name, contact, social, acknowledgement, logo + legal links)
- `section-nav` — the full page tree (a "Home" link followed by nested lists of every page, labelled with page titles); used for breadcrumbs and the inner-page sidebar

When pages are added, renamed or removed, update `section-nav` (and `nav` if the page should appear in the menu). Set `section-nav: off` in a page's metadata to hide the breadcrumb and sidebar on that page.
