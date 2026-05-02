const { computeHealthScore, scalabilityLabel } = require('../lib/scoring/health-score');

describe('health score', () => {
  test('clean repo gets near-perfect overall', () => {
    const files = { 'index.js': 'function add(a, b) { return a + b; }\nmodule.exports = add;' };
    const result = computeHealthScore({ files });
    expect(result.scores.overall).toBeGreaterThan(8);
    expect(result.summary.fileCount).toBe(1);
    expect(result.scores.scalabilityRisk).toBeDefined();
  });

  test('messy repo gets degraded scores', () => {
    let messy = '';
    for (let i = 0; i < 20; i++) messy += `console.log("debug");\nlet x = 42;\n// TODO: ${i}\n`;
    for (let i = 0; i < 30; i++) messy += `if (a) { if (b) { if (c) { if (d) { console.log(${i}); } } } }\n`;
    const files = {
      'a.js': messy,
      'b.js': "const a = require('./a');",
    };
    const result = computeHealthScore({ files });
    expect(result.scores.overall).toBeLessThan(8);
  });

  test('detects circular deps in graph', () => {
    const files = {
      'a.js': "require('./b');",
      'b.js': "require('./a');"
    };
    const result = computeHealthScore({ files });
    expect(result.summary.circularDependencies).toBeGreaterThan(0);
  });

  test('package.json influences dependency score', () => {
    const files = { 'a.js': 'console.log(1);' };
    const pkg = { dependencies: { lodash: '4', underscore: '1', moment: '2' } };
    const result = computeHealthScore({ files, pkg });
    expect(result.details.depCritique.findings.length).toBeGreaterThan(0);
  });

  test('empty input produces sane defaults', () => {
    const result = computeHealthScore({});
    expect(result.scores.overall).toBeGreaterThanOrEqual(0);
    expect(result.summary.fileCount).toBe(1);
  });

  test('scalabilityLabel maps risk correctly', () => {
    expect(scalabilityLabel({ cycles: 0, archFindings: 0, complexityPerFile: 0 })).toBe('Minimal');
    expect(scalabilityLabel({ cycles: 1, archFindings: 0, complexityPerFile: 0 })).toBe('Low');
    expect(scalabilityLabel({ cycles: 2, archFindings: 0, complexityPerFile: 0 })).toBe('Medium');
    expect(scalabilityLabel({ cycles: 4, archFindings: 0, complexityPerFile: 0 })).toBe('High');
  });

  test('files without code extensions are filtered', () => {
    const files = { 'README.md': '# hi', 'a.js': 'const x = 1;' };
    const result = computeHealthScore({ files });
    expect(result.summary.fileCount).toBe(1);
  });

  test('handles non-finite numbers via clamp', () => {
    const result = computeHealthScore({ files: {} });
    Object.entries(result.scores).forEach(([k, v]) => {
      if (typeof v === 'number') {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(10);
      }
    });
  });
});
