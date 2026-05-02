const dep = require('../lib/analyzers/dependency');

describe('dependency critique', () => {
  test('flags redundant lodash + underscore', () => {
    const result = dep.critiquePackage({
      dependencies: { lodash: '^4.0.0', underscore: '^1.0.0' }
    });
    expect(result.findings.some(f => f.type === 'redundantDeps')).toBe(true);
  });

  test('flags moment as heavy', () => {
    const result = dep.critiquePackage({ dependencies: { moment: '^2.0.0' } });
    expect(result.findings.some(f => f.type === 'heavyDep')).toBe(true);
  });

  test('flags suspicious is-* package', () => {
    const result = dep.critiquePackage({ dependencies: { 'is-odd': '1.0.0' } });
    expect(result.findings.some(f => f.type === 'suspiciousDep')).toBe(true);
  });

  test('flags missing engines and license', () => {
    const result = dep.critiquePackage({ dependencies: {} });
    const types = result.findings.map(f => f.type);
    expect(types).toEqual(expect.arrayContaining(['noEngines', 'noLicense']));
  });

  test('flags dep bloat for >30 deps', () => {
    const deps = {};
    for (let i = 0; i < 35; i++) deps[`pkg-${i}`] = '1.0.0';
    const result = dep.critiquePackage({ dependencies: deps, license: 'MIT', engines: { node: '>=18' } });
    expect(result.findings.some(f => f.type === 'depBloat')).toBe(true);
    expect(result.totalDeps).toBe(35);
  });

  test('clean package gets a high score', () => {
    const result = dep.critiquePackage({
      dependencies: { commander: '^11.0.0' },
      license: 'MIT',
      engines: { node: '>=18' }
    });
    expect(result.findings.length).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(9);
  });

  test('computeDependencyScore floors at 0', () => {
    const findings = [];
    for (let i = 0; i < 50; i++) findings.push({ severity: 'critical' });
    expect(dep.computeDependencyScore(findings, 100)).toBe(0);
  });

  test('handles empty package object', () => {
    const result = dep.critiquePackage({});
    expect(result.totalDeps).toBe(0);
    expect(result.findings.length).toBeGreaterThan(0);
  });

  test('default empty arg works', () => {
    const result = dep.critiquePackage();
    expect(result.totalDeps).toBe(0);
  });
});
