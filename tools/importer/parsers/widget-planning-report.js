/* eslint-disable */
/* global WebImporter */
/**
 * Parser: widget-planning-report
 * Source: .planningreporting (decorated EDS block). The live block renders a list of PDF
 *   links fetched from the DoE school-plan-report API:
 *   <ul id="planning-reporting-list-{annual-report|plan-report}-{schoolcode}-{ts}"><li><a ...>
 * The rendered list is dynamic, so the configuration is recovered instead:
 *   reporttype: annual-report -> "report", plan-report -> "plan"
 *   schoolcode: from the list id, or from the PDF URL (/{type}/{year}/{schoolcode}/...)
 * Rows (key/value): [reporttype | report|plan] [schoolcode | NNNN]
 */
export default function parse(element, { document }) {
  const cells = [];
  let reportType = '';
  let schoolCode = '';
  let recent = '';

  // 1. Undecorated / authored key-value rows
  element.querySelectorAll(':scope > div').forEach((row) => {
    const cols = Array.from(row.querySelectorAll(':scope > div'));
    if (cols.length < 2) return;
    const key = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
    const value = cols[1].textContent.trim();
    if (key === 'reporttype') reportType = value;
    else if (key === 'schoolcode') schoolCode = value;
    else if (key === 'recentreports') recent = value;
  });

  // 2. Decorated list id
  const list = element.querySelector('ul[id^="planning-reporting-list-"]');
  if (list) {
    const m = list.id.match(/^planning-reporting-list-(.+?)-(\d+)(?:-\d+)?$/);
    if (m) {
      if (!reportType) reportType = /plan/i.test(m[1]) ? 'plan' : 'report';
      if (!schoolCode) schoolCode = m[2];
    }
  }

  // 3. Rendered PDF links
  if (!reportType || !schoolCode) {
    const a = element.querySelector('a[href*="/annual-report/"], a[href*="/plan-report/"]');
    if (a) {
      const m = a.getAttribute('href').match(/\/(annual-report|plan-report)\/\d{4}\/(\d+)\//);
      if (m) {
        if (!reportType) reportType = m[1] === 'plan-report' ? 'plan' : 'report';
        if (!schoolCode) schoolCode = m[2];
      }
    }
  }

  if (reportType) cells.push(['reporttype', reportType]);
  if (schoolCode) cells.push(['schoolcode', schoolCode]);
  if (recent) cells.push(['recentreports', recent]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'widget-planning-report', cells });
  element.replaceWith(block);
}
