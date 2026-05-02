const { renderTextCard, renderSvgCard, renderJsonCard } = require('../lib/reporters/card');
const { compareRepos, renderCompare } = require('../lib/reporters/compare');

const sampleHealth = {
  scores: {
    codeQuality: 7.1,
    architecture: 5.3,
    readability: 6.8,
    scalabilityRisk: 'High',
    security: 8,
    dependencies: 9,
    overall: 7.2
  },
  summary: { fileCount: 10, totalLines: 1000 }
};

describe('card reporter', () => {
  test('renderTextCard renders all key metrics', () => {
    const text = renderTextCard(sampleHealth, { funniestLine: 'You reinvented a queue. Badly.' });
    expect(text).toMatch(/Overall/);
    expect(text).toMatch(/Code Quality/);
    expect(text).toMatch(/High/);
    expect(text).toMatch(/queue/);
  });

  test('renderTextCard handles missing scores', () => {
    const text = renderTextCard({ scores: {} });
    expect(text).toMatch(/Repo Health Card/);
  });

  test('renderSvgCard returns valid-ish svg', () => {
    const svg = renderSvgCard(sampleHealth);
    expect(svg).toMatch(/<svg /);
    expect(svg).toMatch(/<\/svg>/);
    expect(svg).toMatch(/Overall/);
    expect(svg).toMatch(/&amp;|orange|0f172a/);
  });

  test('renderSvgCard escapes XML special chars in title', () => {
    const svg = renderSvgCard(sampleHealth, { title: 'a & b <c>' });
    expect(svg).toMatch(/&amp;/);
    expect(svg).toMatch(/&lt;c&gt;/);
  });

  test('renderJsonCard produces a stable structure', () => {
    const json = renderJsonCard(sampleHealth);
    expect(json.schema).toBe('roastme.card.v1');
    expect(json.scores.overall).toBe(7.2);
    expect(typeof json.generatedAt).toBe('string');
  });

  test('renderTextCard handles long funniest line by chunking', () => {
    const long = 'A'.repeat(120);
    const text = renderTextCard(sampleHealth, { funniestLine: long });
    expect(text.split('\n').length).toBeGreaterThan(10);
  });
});

describe('compare reporter', () => {
  const a = { name: 'repoA', health: sampleHealth };
  const b = { name: 'repoB', health: { scores: { ...sampleHealth.scores, overall: 5.0, codeQuality: 4 } } };

  test('compareRepos picks the winner', () => {
    const r = compareRepos(a, b);
    expect(r.winner).toBe('repoA');
    expect(r.deltas.overall).toBeDefined();
    expect(r.summary).toMatch(/repoA/);
  });

  test('compareRepos detects ties', () => {
    const r = compareRepos(a, { name: 'clone', health: sampleHealth });
    expect(r.winner).toBe('tie');
  });

  test('renderCompare formats output', () => {
    const text = renderCompare(a, b);
    expect(text).toMatch(/repoA/);
    expect(text).toMatch(/repoB/);
    expect(text).toMatch(/Verdict/);
  });

  test('handles missing scores gracefully', () => {
    const r = compareRepos({ name: 'x', health: {} }, { name: 'y', health: {} });
    expect(r.winner).toBe('tie');
  });
});
