const { explainLikeIm5 } = require('../lib/modes/eli5');
const { generateResumeBullets } = require('../lib/modes/resume');
const { reviewFile, renderReview } = require('../lib/modes/serious');

describe('ELI5 mode', () => {
  test('explains a repo and returns roast', () => {
    const files = { 'index.js': 'console.log(1);' };
    const result = explainLikeIm5({ files, pkg: { description: 'A demo CLI tool' } });
    expect(result.eli5).toMatch(/demo cli tool/i);
    expect(result.roast).toBeDefined();
    expect(Array.isArray(result.patterns)).toBe(true);
  });

  test('roasts a repo with no tests and many TODOs', () => {
    const files = {};
    for (let i = 0; i < 6; i++) files[`f${i}.js`] = '// TODO\n'.repeat(5);
    const result = explainLikeIm5({ files });
    expect(result.roast).toMatch(/TODOs|tests|reinvented/i);
  });

  test('handles empty input', () => {
    const result = explainLikeIm5();
    expect(result.eli5).toBeDefined();
    expect(result.roast).toBeDefined();
  });

  test('infers purpose from express imports', () => {
    const files = { 'server/express.js': "require('express')" };
    const result = explainLikeIm5({ files });
    expect(result.eli5).toBeDefined();
  });

  test('infers purpose for cli folder', () => {
    const files = { 'cli/index.js': 'console.log(1)' };
    const result = explainLikeIm5({ files });
    expect(result.eli5.toLowerCase()).toMatch(/command-line|software/);
  });
});

describe('Resume mode', () => {
  test('generates bullets from package + files', () => {
    const files = { 'src/index.ts': 'export const x = 1;', 'tests/a.test.ts': '' };
    const pkg = {
      name: 'cool-thing',
      description: 'A cool thing',
      dependencies: { typescript: '5', jest: '29' }
    };
    const result = generateResumeBullets({ files, pkg });
    expect(result.summary).toMatch(/cool/i);
    expect(result.bullets.some(b => /TypeScript/i.test(b))).toBe(true);
    expect(result.bullets.some(b => /jest/i.test(b))).toBe(true);
  });

  test('flags missing tests', () => {
    const files = { 'a.js': 'x' };
    const result = generateResumeBullets({ files });
    expect(result.bullets.some(b => /no test framework|tests/i.test(b))).toBe(true);
  });

  test('detects Express + Prometheus', () => {
    const files = { 'src/controllers/x.js': '', 'src/models/y.js': '', 'src/views/z.ejs': '' };
    const pkg = { dependencies: { express: '4', 'prom-client': '15' } };
    const result = generateResumeBullets({ files, pkg });
    expect(result.bullets.some(b => /MVC|HTTP|Express/i.test(b))).toBe(true);
    expect(result.bullets.some(b => /Prometheus/i.test(b))).toBe(true);
  });

  test('handles empty input', () => {
    const result = generateResumeBullets();
    expect(result.bullets.length).toBeGreaterThan(0);
  });

  test('detects multiple language files', () => {
    const files = {
      'a.py': 'print(1)', 'b.py': 'print(2)',
      'c.go': 'package main', 'd.java': 'class A{}'
    };
    const result = generateResumeBullets({ files });
    expect(result.summary).toBeDefined();
  });
});

describe('Serious mode', () => {
  test('reviews a file and provides suggestions', () => {
    const src = `
      var x = 1;
      console.log(x);
      eval('1+1');
    `;
    const result = reviewFile(src, 'a.js');
    expect(result.review.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('returns empty for non-string input', () => {
    expect(reviewFile(null)).toEqual({ review: [], suggestions: [] });
  });

  test('renderReview shows messages', () => {
    const result = reviewFile('var x = 1;\neval(x);');
    const text = renderReview(result);
    expect(text).toMatch(/Review:/);
  });

  test('renderReview handles clean file', () => {
    const result = reviewFile('function add(a,b){ return a + b; }');
    const text = renderReview(result);
    expect(text).toMatch(/No issues|Review/);
  });
});
