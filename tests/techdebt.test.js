const debt = require('../lib/analyzers/techdebt');

describe('tech-debt tracker', () => {
  test('trackDebtTags finds TODO, FIXME, HACK, BUG', () => {
    const src = `
      // TODO: write tests
      // FIXME: race condition here
      // HACK: hardcoded for demo
      // BUG: off by one
    `;
    const items = debt.trackDebtTags(src, 'a.js');
    const tags = items.map(i => i.tag);
    expect(tags).toEqual(expect.arrayContaining(['TODO', 'FIXME', 'HACK', 'BUG']));
  });

  test('trackDebtTags assigns line numbers and file paths', () => {
    const items = debt.trackDebtTags('foo;\n// TODO bar', 'x.js');
    expect(items[0].line).toBe(2);
    expect(items[0].file).toBe('x.js');
    expect(items[0].message).toMatch(/bar/);
  });

  test('trackDebtTags handles empty / non-string input', () => {
    expect(debt.trackDebtTags('')).toEqual([]);
    expect(debt.trackDebtTags(null)).toEqual([]);
  });

  test('trackDebtTags marks "no message" when nothing follows tag', () => {
    const items = debt.trackDebtTags('// TODO', 'a.js');
    expect(items[0].message).toBe('(no message)');
  });

  test('aggregateDebt groups by tag and file', () => {
    const result = debt.aggregateDebt({
      'a.js': '// TODO a\n// TODO b',
      'b.js': '// FIXME c'
    });
    expect(result.total).toBe(3);
    expect(result.byTag.TODO).toBe(2);
    expect(result.byTag.FIXME).toBe(1);
    expect(result.byFile['a.js']).toBe(2);
  });

  test('identifyHotspots returns sorted hotspots', () => {
    const stats = [
      { file: 'a.js', debtCount: 6, complexity: 5, lineCount: 100 },
      { file: 'b.js', debtCount: 0, complexity: 1, lineCount: 1000 },
      { file: 'c.js', debtCount: 1, complexity: 0, lineCount: 10 }
    ];
    const hotspots = debt.identifyHotspots(stats);
    expect(hotspots[0].file).toBe('a.js');
    expect(hotspots.every(h => h.score !== undefined)).toBe(true);
  });

  test('identifyHotspots handles empty input', () => {
    expect(debt.identifyHotspots()).toEqual([]);
  });
});
