/**
 * Planning / reporting widget: lists a NSW public school's published annual reports or
 * school excellence plans as PDF links, fetched from the NSW DoE school-plan-report API.
 *
 * Configuration (either form):
 *  - key/value rows:  reporttype | report (or plan)
 *                     schoolcode | 8504
 *                     recentreports | <optional count>
 *  - widget link (project widget convention):
 *      /widgets/planningreporting.html?reporttype=report&schoolcode=8504
 * As in the project widget block, the resolved config is exposed as data- attributes.
 */

const API_ENDPOINT = 'https://teu7j4uno5.execute-api.ap-southeast-2.amazonaws.com/v1/school-plan-report';

// authored value -> API value
const REPORT_TYPES = {
  report: 'annual-report',
  'annual-report': 'annual-report',
  plan: 'plan-report',
  'plan-report': 'plan-report',
};

const KNOWN_KEYS = ['reporttype', 'schoolcode', 'recentreports'];

function readConfig(block) {
  const config = {};

  // widget-style link: query params carry the config
  const link = block.querySelector('a[href]');
  if (link) {
    try {
      new URL(link.href, window.location.href).searchParams.forEach((value, key) => {
        const k = key.trim().toLowerCase();
        if (KNOWN_KEYS.includes(k)) config[k] = value.trim();
      });
    } catch (e) {
      // ignore a malformed link and fall back to key/value rows
    }
  }

  // key/value rows (take precedence over the link)
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
    const value = cells[1].textContent.trim();
    if (KNOWN_KEYS.includes(key) && value) config[key] = value;
  });

  return config;
}

function itemLabel(item) {
  const meta = [item.type, item.size].filter(Boolean).join(' ');
  return [item.year, item.name].filter(Boolean).join(' ') + (meta ? ` (${meta})` : '');
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const config = readConfig(block);
  Object.entries(config).forEach(([key, value]) => {
    block.dataset[key] = value;
  });

  const reportType = REPORT_TYPES[(config.reporttype || '').toLowerCase()];
  const schoolCode = (config.schoolcode || '').replace(/\D/g, '');

  const list = document.createElement('ul');
  list.className = 'widget-planning-report-list';
  block.replaceChildren(list);

  if (!reportType || !schoolCode) {
    // eslint-disable-next-line no-console
    console.error(`widget-planning-report: invalid config (reporttype "${config.reporttype}", schoolcode "${config.schoolcode}"). Expected reporttype report|plan and a numeric schoolcode.`);
    block.classList.add('is-empty');
    return;
  }

  const url = new URL(API_ENDPOINT);
  url.searchParams.set('reporttype', reportType);
  url.searchParams.set('schoolcode', schoolCode);
  url.searchParams.set('recentreports', config.recentreports || '');

  block.setAttribute('aria-busy', 'true');
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const items = await resp.json();
    (Array.isArray(items) ? items : []).forEach((item) => {
      if (!item || !item.path) return;
      let href;
      try {
        href = new URL(item.path);
      } catch (e) {
        return;
      }
      if (href.protocol !== 'https:') return;
      const label = itemLabel(item);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href.href;
      a.title = label;
      a.textContent = label;
      a.className = 'widget-planning-report-link';
      li.append(a);
      list.append(li);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('widget-planning-report: failed to load reports', error);
  } finally {
    block.removeAttribute('aria-busy');
    if (!list.children.length) block.classList.add('is-empty');
  }
}
