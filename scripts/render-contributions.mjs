import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const day = 86_400_000;
const labels = {
  'Gitlawb/zero': 'Zero',
  'Gitlawb/openclaude': 'OpenClaude',
  'Gitlawb/node': 'Node',
  'Gitlawb/openlaunch': 'Openlaunch',
  'Gitlawb/node-explorer': 'Node Explorer',
  'Gitlawb/openclaude-skills': 'OpenClaude Skills',
};
const themes = {
  dark: {
    bg: '#0d1117', border: '#30363d', ink: '#e6edf3', muted: '#9da7b3',
    grid: '#242d38', track: '#1c2530', accent: '#79e2b4', shine: '#d4ffec',
    colors: ['#79e2b4', '#b5a5ff', '#80c7f4', '#ffbd82', '#efa6cc', '#8ed6d1'],
  },
  light: {
    bg: '#ffffff', border: '#d0d7de', ink: '#1f2328', muted: '#59636e',
    grid: '#e6ebef', track: '#edf1f5', accent: '#18794e', shine: '#0a4d30',
    colors: ['#18794e', '#7651c2', '#216fba', '#a95415', '#ae387a', '#127b78'],
  },
};
const esc = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[c]);
const n = value => Number(value.toFixed(2));
function parseUtc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return NaN;
  const timestamp = Date.parse(value);
  const canonical = value.length === 20 ? value.slice(0, -1) + '.000Z' : value;
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === canonical ? timestamp : NaN;
}

export function summarize(data) {
  const end = parseUtc(data.generatedAt);
  if (!Number.isFinite(end) || data.author !== 'Vasanthdev2004' || data.org !== 'Gitlawb') {
    throw new Error('Unexpected snapshot identity or timestamp.');
  }
  if (!Array.isArray(data.merged) || !data.merged.length || !Array.isArray(data.repositories)) {
    throw new Error('A complete, nonempty public snapshot is required.');
  }
  const counts = new Map();
  const seen = new Set();
  for (const pr of data.merged) {
    const date = parseUtc(pr.mergedAt);
    if (!Object.hasOwn(labels, pr.repo) || !Number.isInteger(pr.number) || pr.number < 1 ||
        pr.url !== `https://github.com/${pr.repo}/pull/${pr.number}` ||
        !Number.isFinite(date) || date > end || seen.has(pr.url)) {
      throw new Error('Invalid, duplicate, future-dated, or non-allowlisted PR.');
    }
    seen.add(pr.url);
    counts.set(pr.repo, (counts.get(pr.repo) || 0) + 1);
  }
  const repoNames = new Set(data.repositories.map(repo => repo.name));
  if (repoNames.size !== data.repositories.length || repoNames.size !== counts.size ||
      data.repositories.some(repo => repo.count !== counts.get(repo.name) ||
        repo.url !== `https://github.com/${repo.name}`)) {
    throw new Error('Repository counts do not reconcile with the PR records.');
  }
  const sorted = [...data.merged].sort((a, b) => Date.parse(a.mergedAt) - Date.parse(b.mergedAt));
  const first = new Date(sorted[0].mergedAt);
  const start = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1);
  const endDay = Date.UTC(new Date(end).getUTCFullYear(), new Date(end).getUTCMonth(), new Date(end).getUTCDate());
  const byDay = new Map();
  for (const pr of sorted) {
    const key = pr.mergedAt.slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }
  let cumulative = 0;
  const points = [{ time: start, value: 0 }];
  for (let time = start; time <= endDay; time += day) {
    cumulative += byDay.get(new Date(time).toISOString().slice(0, 10)) || 0;
    points.push({ time: Math.min(time + day, end), value: cumulative });
  }
  const months = [];
  for (let time = start; time <= endDay;) {
    months.push({ time, label: new Date(time).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) });
    const date = new Date(time);
    time = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  }
  return {
    total: sorted.length, points, start, end, months,
    recent: sorted.filter(pr => Date.parse(pr.mergedAt) >= end - 30 * day).length,
    repositories: [...data.repositories].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    snapshot: new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
  };
}

export function renderSvg(summary, themeName, mobile = false) {
  const c = themes[themeName];
  if (!c) throw new Error('Unknown theme.');
  const width = mobile ? 480 : 960;
  const height = mobile ? 858 : 540;
  const pad = mobile ? 28 : 32;
  const parts = [];
  const add = value => parts.push(value);
  const text = (x, y, value, size = 16, fill = c.ink, extra = '') =>
    `<text x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${fill}" ${extra}>${esc(value)}</text>`;
  add(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">`);
  add(`<title id="title">Public Gitlawb contributions</title><desc id="description">${summary.total} merged pull requests across ${summary.repositories.length} public repositories as of ${esc(summary.snapshot)}. A cumulative timeline and proportional repository bars. ${summary.repositories.map(repo => `${esc(labels[repo.name])}: ${repo.count}`).join('; ')}. Motion is decorative; this is a dated snapshot, not a live feed.</desc>`);
  add(`<defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${c.accent}" stop-opacity=".2"/><stop offset="1" stop-color="${c.accent}" stop-opacity=".015"/></linearGradient></defs>`);
  add(`<style>
    text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
    .number{font-variant-numeric:tabular-nums;font-weight:650;letter-spacing:-1.6px}
    .label{font-family:ui-monospace,"SFMono-Regular",Consolas,monospace;letter-spacing:1.6px}
    .sweep,.ripple{display:none}
    @media (prefers-reduced-motion:no-preference){
      .sweep{display:block;stroke-dasharray:4 96;animation:travel 9s linear infinite}
      .ripple{display:block;transform-box:fill-box;transform-origin:center;animation:pulse 3.6s ease-out infinite}
    }
    @keyframes travel{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
    @keyframes pulse{0%{transform:scale(.65);opacity:.55}75%,100%{transform:scale(2);opacity:0}}
  </style>`);
  add(`<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="18" fill="${c.bg}" stroke="${c.border}"/>`);
  add(text(pad, 36, 'GITLAWB / OPEN-SOURCE ACTIVITY', mobile ? 12 : 13, c.muted, 'class="label"'));
  add(text(pad, 76, 'Built in the open.', mobile ? 30 : 32, c.ink, 'font-weight="650" letter-spacing="-.9"'));
  if (!mobile) add(text(width - pad, 36, summary.snapshot, 13, c.muted, 'text-anchor="end"'));

  const statXs = mobile ? [pad, 195, 355] : [pad, 355, 668];
  const stats = [[summary.total, 'merged PRs'], [summary.repositories.length, 'public repos'], [summary.recent, 'last 30 days']];
  stats.forEach(([value, label], i) => {
    add(text(statXs[i], 142, value, mobile ? 40 : 46, i === 0 ? c.accent : c.ink, 'class="number"'));
    add(text(statXs[i], 170, label, mobile ? 14 : 15, c.muted));
  });
  add(`<path d="M ${pad} 198 H ${width - pad}" stroke="${c.border}"/>`);

  const plot = mobile ? { x: 55, y: 276, w: 390, h: 143 } : { x: 61, y: 286, w: 505, h: 153 };
  add(text(pad, 234, 'Merged, over time', 18, c.ink, 'font-weight="600"'));
  add(text(pad, 258, 'Cumulative public pull requests', 14, c.muted));
  const ceiling = Math.ceil(summary.total / 50) * 50;
  const px = time => plot.x + (time - summary.start) / (summary.end - summary.start || 1) * plot.w;
  const py = value => plot.y + plot.h * (1 - value / ceiling);
  for (let value = 0; value <= ceiling; value += 50) {
    const y = n(py(value));
    add(`<path d="M ${plot.x} ${y} H ${plot.x + plot.w}" stroke="${c.grid}" ${value ? 'stroke-dasharray="3 5"' : ''}/>`);
    add(text(plot.x - 12, y + 4, value, 12, c.muted, 'text-anchor="end"'));
  }
  for (const month of summary.months) {
    add(text(px(month.time), plot.y + plot.h + 24, month.label, 13, c.muted, month.time === summary.start ? '' : 'text-anchor="middle"'));
  }
  const path = summary.points.map((point, index) => `${index ? 'L' : 'M'} ${n(px(point.time))} ${n(py(point.value))}`).join(' ');
  const bottom = plot.y + plot.h;
  add(`<path d="${path} L ${n(px(summary.end))} ${bottom} L ${plot.x} ${bottom} Z" fill="url(#area)"/>`);
  add(`<path d="${path}" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`);
  add(`<path class="sweep" d="${path}" pathLength="100" fill="none" stroke="${c.shine}" stroke-width="3.5" stroke-linecap="round"/>`);
  const endX = n(px(summary.end)), endY = n(py(summary.total));
  add(`<circle class="ripple" cx="${endX}" cy="${endY}" r="6" fill="none" stroke="${c.accent}"/>`);
  add(`<circle cx="${endX}" cy="${endY}" r="4" fill="${c.accent}" stroke="${c.bg}" stroke-width="2"/>`);
  add(text(endX - 2, endY - 14, summary.total, 15, c.accent, 'text-anchor="end" font-weight="650"'));

  const bars = mobile ? { x: pad, y: 504, w: width - 2 * pad, step: 46 } : { x: 639, y: 278, w: 289, step: 32 };
  if (!mobile) add(`<path d="M 606 224 V 471" stroke="${c.border}"/>`);
  add(text(bars.x, mobile ? 477 : 234, 'Across the ecosystem', 18, c.ink, 'font-weight="600"'));
  if (!mobile) add(text(bars.x, 258, 'Merged PRs by repository', 14, c.muted));
  const max = summary.repositories[0].count;
  summary.repositories.forEach((repo, i) => {
    const y = bars.y + i * bars.step;
    add(text(bars.x, y + 10, labels[repo.name], mobile ? 15 : 14, c.ink));
    add(text(bars.x + bars.w, y + 10, repo.count, mobile ? 15 : 14, c.muted, 'text-anchor="end" font-weight="600"'));
    add(`<rect x="${bars.x}" y="${y + 18}" width="${bars.w}" height="5" rx="2.5" fill="${c.track}"/>`);
    add(`<rect x="${bars.x}" y="${y + 18}" width="${n(bars.w * repo.count / max)}" height="5" rx="1" fill="${c.colors[i]}"/>`);
  });
  const foot = mobile ? 810 : 504;
  add(`<path d="M ${pad} ${foot - 18} H ${width - pad}" stroke="${c.border}"/>`);
  add(text(pad, foot + 7, mobile ? `Public merge history · ${summary.snapshot}` : 'Public merge history · authored PRs · verified from GitHub', mobile ? 13 : 12, c.muted));
  if (!mobile) add(text(width - pad, foot + 7, 'NO PRIVATE ACTIVITY INCLUDED', 10, c.muted, 'text-anchor="end" class="label"'));
  add('</svg>');
  return parts.join('\n') + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(readFileSync(resolve(root, 'data/gitlawb-contributions.json'), 'utf8'));
  const summary = summarize(data);
  const check = process.argv.includes('--check');
  if (!check) mkdirSync(resolve(root, 'assets'), { recursive: true });
  for (const theme of ['dark', 'light']) {
    for (const mobile of [false, true]) {
      const file = resolve(root, `assets/contributions-${theme}${mobile ? '-mobile' : ''}.svg`);
      const svg = renderSvg(summary, theme, mobile);
      if (check) {
        if (readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== svg) throw new Error(`Stale generated asset: ${file}`);
      } else writeFileSync(file, svg);
    }
  }
  console.log(`${check ? 'Verified' : 'Rendered'} four charts from ${summary.total} public merges; ${summary.recent} in the last 30 days.`);
}
