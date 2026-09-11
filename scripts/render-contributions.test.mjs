import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarize, renderSvg } from './render-contributions.mjs';

const snapshot = JSON.parse(readFileSync(new URL('../data/gitlawb-contributions.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(snapshot);
const repoLabels = {
  'Gitlawb/zero': 'Zero',
  'Gitlawb/openclaude': 'OpenClaude',
  'Gitlawb/node': 'Node',
  'Gitlawb/openlaunch': 'Openlaunch',
  'Gitlawb/node-explorer': 'Node Explorer',
  'Gitlawb/openclaude-skills': 'OpenClaude Skills',
};

test('verified snapshot reconciles totals, repository counts, and the last 30 days', () => {
  const summary = summarize(snapshot);
  assert.equal(summary.total, 189);
  assert.equal(summary.recent, 13);
  assert.equal(summary.repositories.length, 6);
  assert.deepEqual(Object.fromEntries(summary.repositories.map(repo => [repo.name, repo.count])), {
    'Gitlawb/zero': 141,
    'Gitlawb/openclaude': 38,
    'Gitlawb/node': 5,
    'Gitlawb/node-explorer': 2,
    'Gitlawb/openlaunch': 2,
    'Gitlawb/openclaude-skills': 1,
  });
  assert.equal(summary.repositories.reduce((total, repo) => total + repo.count, 0), summary.total);
});

test('cumulative timeline reaches each independently measured monthly boundary and final total', () => {
  const summary = summarize(snapshot);
  const cumulativeAt = time => summary.points.find(point => point.time === Date.parse(time))?.value;
  assert.deepEqual(summary.months.map(month => month.label), ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']);
  for (const [time, expected] of [
    ['2026-04-01T00:00:00Z', 0],
    ['2026-05-01T00:00:00Z', 34],
    ['2026-06-01T00:00:00Z', 40],
    ['2026-07-01T00:00:00Z', 134],
    ['2026-08-01T00:00:00Z', 168],
    ['2026-09-01T00:00:00Z', 184],
  ]) assert.equal(cumulativeAt(time), expected, time);
  assert.deepEqual(summary.points.at(-1), { time: Date.parse(snapshot.generatedAt), value: 189 });
  for (let index = 1; index < summary.points.length; index++) {
    assert.ok(summary.points[index].time >= summary.points[index - 1].time, 'time cannot go backwards');
    assert.ok(summary.points[index].value >= summary.points[index - 1].value, 'cumulative merges cannot decrease');
  }
});

test('recent window includes its exact cutoff, excludes the preceding second, and rejects future merges', () => {
  const data = {
    ...snapshot,
    repositories: [{ name: 'Gitlawb/zero', url: 'https://github.com/Gitlawb/zero', count: 3 }],
    merged: ['2026-08-12T17:40:10Z', '2026-08-12T17:40:11Z', snapshot.generatedAt].map((mergedAt, index) => ({
      repo: 'Gitlawb/zero', number: index + 1, mergedAt, url: `https://github.com/Gitlawb/zero/pull/${index + 1}`,
    })),
  };
  assert.equal(summarize(data).recent, 2);
  data.merged[2].mergedAt = '2026-09-11T17:40:12Z';
  assert.throws(() => summarize(data));
});

test('summarizing unsorted input preserves the caller data and produces the same timeline', () => {
  const data = clone();
  data.merged.reverse();
  data.repositories.reverse();
  const before = structuredClone(data);
  const summary = summarize(data);
  assert.deepEqual(data, before);
  assert.deepEqual(summary, summarize(snapshot));
});

for (const repo of ['Gitlawb/not-public', 'OtherOrg/zero']) {
  test(`rejects a repository outside the verified public allowlist: ${repo}`, () => {
    const data = clone();
    data.merged[0].repo = repo;
    data.merged[0].url = `https://github.com/${repo}/pull/${data.merged[0].number}`;
    assert.throws(() => summarize(data));
  });
}

test('rejects duplicate PRs, duplicate repository summaries, and mismatched counts', () => {
  const duplicatePr = clone();
  duplicatePr.merged.push(structuredClone(duplicatePr.merged[0]));
  duplicatePr.repositories.find(repo => repo.name === duplicatePr.merged[0].repo).count++;
  assert.throws(() => summarize(duplicatePr));

  const duplicateRepo = clone();
  duplicateRepo.repositories.push(structuredClone(duplicateRepo.repositories[0]));
  assert.throws(() => summarize(duplicateRepo));

  const wrongCount = clone();
  wrongCount.repositories[0].count++;
  assert.throws(() => summarize(wrongCount));
});

test('rejects PR URLs that disagree with their repository and number', () => {
  const data = clone();
  data.merged[0].url = 'https://github.com/Gitlawb/zero/pull/999999';
  assert.throws(() => summarize(data));
});

for (const invalidDate of ['not-a-date', '2026-04-31T12:00:00Z', '2026-02-29T12:00:00Z']) {
  test(`rejects malformed or impossible merge dates: ${invalidDate}`, () => {
    const data = clone();
    data.merged[0].mergedAt = invalidDate;
    assert.throws(() => summarize(data));
  });
}

test('rejects impossible snapshot dates and timestamps outside the canonical UTC dataset format', () => {
  for (const generatedAt of ['2026-09-31T12:00:00Z', 'September 11, 2026']) {
    assert.throws(() => summarize({ ...clone(), generatedAt }), generatedAt);
  }
  const data = clone();
  data.merged[0].mergedAt = '2026-04-01T00:30:00+02:00';
  assert.throws(() => summarize(data), 'offset timestamps must not silently group under their non-UTC date');
});

for (const theme of ['dark', 'light']) {
  for (const mobile of [false, true]) {
    test(`${theme} ${mobile ? 'mobile' : 'desktop'} chart retains truthful labels and a complete static chart`, () => {
      const svg = renderSvg(summarize(snapshot), theme, mobile);
      assert.match(svg, mobile ? /viewBox="0 0 480 858"/ : /viewBox="0 0 960 540"/);
      assert.match(svg, /role="img" aria-labelledby="title description"/);
      assert.match(svg, /189 merged pull requests across 6 public repositories as of 11 Sept 2026/);
      assert.match(svg, /dated snapshot, not a live feed/);
      const texts = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(match => match[1]);
      for (const [value, label] of [['189', 'merged PRs'], ['6', 'public repos'], ['13', 'last 30 days']]) {
        assert.equal(texts[texts.indexOf(label) - 1], value, label);
      }
      for (const repo of snapshot.repositories) {
        assert.equal(texts[texts.indexOf(repoLabels[repo.name]) + 1], String(repo.count), repo.name);
      }
      assert.equal(texts.filter(value => value === '189').length, 2, 'total and chart endpoint both show 189');
      assert.match(svg, /\.sweep,\.ripple\{display:none\}/);
      assert.match(svg, /@media \(prefers-reduced-motion:no-preference\)\{\s*\.sweep\{display:block;/);
      const sweepPath = svg.match(/<path class="sweep" d="([^"]+)"/);
      assert.ok(sweepPath, 'decorative sweep follows the chart');
      assert.ok(svg.includes(`<path d="${sweepPath[1]}" fill="none" stroke=`), 'identical data line stays visible without animation');
      assert.match(svg, /<circle cx="[^"]+" cy="[^"]+" r="4"/, 'endpoint stays visible without animation');
      assert.doesNotMatch(svg, /<script\b|<foreignObject\b|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
    });
  }
}

test('unsupported themes fail instead of generating a broken asset', () => {
  assert.throws(() => renderSvg(summarize(snapshot), 'unknown'));
});
