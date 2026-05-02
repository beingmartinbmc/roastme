const fix = require('../lib/modes/fix-suggestions');

describe('fix-suggestions', () => {
  test('replaces console.log with logger', () => {
    const out = fix.buildSuggestions('console.log("hi")');
    expect(out.some(s => s.type === 'replaceConsoleLog')).toBe(true);
  });

  test('renames bad variables', () => {
    const out = fix.buildSuggestions('let x = 1;\nconst temp = 2;');
    const types = out.map(s => s.type);
    expect(types).toEqual(expect.arrayContaining(['rename']));
  });

  test('suggests strict equality', () => {
    const out = fix.buildSuggestions('if (a == b) {}');
    expect(out.some(s => s.type === 'strictEquality')).toBe(true);
  });

  test('replaces var with const', () => {
    const out = fix.buildSuggestions('var foo = 1;');
    expect(out.some(s => s.type === 'modernDeclaration')).toBe(true);
  });

  test('extracts magic numbers', () => {
    const out = fix.buildSuggestions('const t = 9999;');
    expect(out.some(s => s.type === 'extractConstant')).toBe(true);
  });

  test('suggests resolving tech-debt markers', () => {
    const out = fix.buildSuggestions('// TODO: refactor');
    expect(out.some(s => s.type === 'resolveTechDebt')).toBe(true);
  });

  test('suggests modularization for huge files', () => {
    const big = 'a;\n'.repeat(450);
    const out = fix.buildSuggestions(big);
    expect(out.some(s => s.type === 'modularize')).toBe(true);
  });

  test('returns [] for non-string input', () => {
    expect(fix.buildSuggestions(null)).toEqual([]);
  });

  test('renderSuggestions formats results', () => {
    const out = fix.buildSuggestions('console.log("x")');
    const text = fix.renderSuggestions(out);
    expect(text).toMatch(/Why:/);
    expect(text).toMatch(/Before:/);
    expect(text).toMatch(/After:/);
  });

  test('renderSuggestions handles empty list', () => {
    expect(fix.renderSuggestions([])).toMatch(/No automatic suggestions/);
    expect(fix.renderSuggestions(null)).toMatch(/No automatic suggestions/);
  });

  test('dedupes identical suggestions', () => {
    const out = fix.buildSuggestions('console.log(1)\nconsole.log(1)');
    const unique = new Set(out.map(s => `${s.type}:${s.line}:${s.before}`));
    expect(unique.size).toBe(out.length);
  });
});
