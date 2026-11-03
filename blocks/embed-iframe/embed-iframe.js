/**
 * Embed iframe: responsive 16:9 iframe for providers the standard embed block does not cover
 * (Brightcove bcove.video / players.brightcove.net, Google Maps embed URLs), plus any other
 * iframe-able URL. A skip link lets keyboard users jump past the embedded content.
 * Content: one cell with the URL (link or plain text); an optional poster image turns the
 * embed into click-to-load.
 */

let embedCount = 0;

const PROVIDERS = [
  {
    id: 'map',
    match: (url) => /(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname.startsWith('/maps'),
    label: 'Google Map',
    attrs: { referrerpolicy: 'no-referrer-when-downgrade' },
  },
  {
    id: 'video',
    match: (url) => url.hostname.endsWith('bcove.video') || url.hostname.endsWith('brightcove.net'),
    label: 'video',
    // bcove.video redirects to players.brightcove.net (another origin), so the features
    // need a `*` allowlist; a bare feature name only covers the original src origin
    attrs: { allow: 'encrypted-media *; fullscreen *; picture-in-picture *' },
  },
];

function findUrl(block) {
  const link = block.querySelector('a[href]');
  const raw = link ? link.href : block.textContent.trim();
  try {
    const url = new URL(raw, window.location.href);
    return /^https?:$/.test(url.protocol) ? url : null;
  } catch (e) {
    return null;
  }
}

function buildIframe(url, provider) {
  const iframe = document.createElement('iframe');
  iframe.title = `Embedded ${provider ? provider.label : 'content'} from ${url.hostname}`;
  iframe.loading = 'lazy';
  const attrs = provider ? provider.attrs : {};
  // `allow` already grants fullscreen when present; both together trigger a console warning
  if (!attrs.allow) iframe.setAttribute('allowfullscreen', '');
  Object.entries(attrs).forEach(([k, v]) => iframe.setAttribute(k, v));
  // permissions policy is fixed when navigation starts, so set src last
  iframe.src = url.href;
  return iframe;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const url = findUrl(block);
  const picture = block.querySelector('picture');
  if (!url) {
    // nothing usable authored: leave the block empty rather than render a broken frame
    block.textContent = '';
    return;
  }

  embedCount += 1;
  const provider = PROVIDERS.find((p) => p.match(url));
  if (provider) block.classList.add(`embed-iframe-${provider.id}`);
  const label = provider ? provider.label : 'embedded content';
  const afterId = `embed-iframe-after-${embedCount}`;

  const skip = document.createElement('a');
  skip.className = 'embed-iframe-skip';
  skip.href = `#${afterId}`;
  skip.textContent = `Skip ${label}`;

  const frame = document.createElement('div');
  frame.className = 'embed-iframe-frame';

  const after = document.createElement('div');
  after.id = afterId;
  after.className = 'embed-iframe-after';
  after.tabIndex = -1;

  block.replaceChildren(skip, frame, after);

  const load = () => {
    if (block.classList.contains('is-loaded')) return;
    frame.replaceChildren(buildIframe(url, provider));
    block.classList.add('is-loaded');
  };

  if (picture) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'embed-iframe-placeholder';
    button.setAttribute('aria-label', `Load ${label}`);
    button.append(picture);
    button.addEventListener('click', load, { once: true });
    frame.append(button);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  });
  observer.observe(block);
}
