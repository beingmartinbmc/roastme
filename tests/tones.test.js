const tones = require('../lib/tones');

describe('tones', () => {
  test('listTones returns all tone keys', () => {
    const list = tones.listTones();
    expect(list).toEqual(expect.arrayContaining(['savage', 'polite', 'senior-engineer', 'cto', 'corporate', 'toxic', 'gentle']));
    expect(list.length).toBeGreaterThanOrEqual(7);
  });

  test('getTone returns matching tone object', () => {
    const t = tones.getTone('savage');
    expect(t.label).toBe('Savage');
    expect(t.intensity).toBeGreaterThan(0);
  });

  test('getTone is case-insensitive', () => {
    expect(tones.getTone('POLITE').label).toBe('Polite');
  });

  test('getTone falls back to default when name is missing or invalid', () => {
    expect(tones.getTone(undefined).label).toBe('Savage');
    expect(tones.getTone('nonsense').label).toBe('Savage');
    expect(tones.getTone(null).label).toBe('Savage');
    expect(tones.getTone(123).label).toBe('Savage');
  });

  test('isValidTone correctly validates names', () => {
    expect(tones.isValidTone('cto')).toBe(true);
    expect(tones.isValidTone('CTO')).toBe(true);
    expect(tones.isValidTone('nope')).toBe(false);
    expect(tones.isValidTone(null)).toBe(false);
    expect(tones.isValidTone(42)).toBe(false);
  });

  test('describeTone produces a string mentioning rules', () => {
    const desc = tones.describeTone('senior-engineer');
    expect(desc).toMatch(/Senior Engineer/);
    expect(desc).toMatch(/Rules:/);
  });

  test('describeTone falls back when name is invalid', () => {
    const desc = tones.describeTone('???');
    expect(desc).toMatch(/Savage/);
  });
});
