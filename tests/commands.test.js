const path = require('path');
const fs = require('fs');
const os = require('os');
const cmd = require('../lib/commands');

function mkRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-cmd-'));
  fs.writeFileSync(path.join(root, 'index.js'), `
    const x = 1;
    console.log(x);
    function add(a,b){ return a+b; }
    module.exports = { add };
  `);
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'sample',
    version: '1.0.0',
    description: 'demo',
    license: 'MIT',
    engines: { node: '>=18' },
    dependencies: { commander: '11' }
  }));
  return root;
}

describe('commands', () => {
  let repo;
  beforeAll(() => { repo = mkRepo(); });

  test('scoreCommand returns full health structure', () => {
    const result = cmd.scoreCommand(repo);
    expect(result.scores).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.scores.overall).toBeGreaterThanOrEqual(0);
  });

  test('analyzeRepo includes patterns, security, deps', () => {
    const result = cmd.analyzeRepo(repo);
    expect(Array.isArray(result.patterns)).toBe(true);
    expect(result.security).toBeDefined();
    expect(result.architecture).toBeDefined();
    expect(result.dependencies).toBeDefined();
  });

  test('eli5Command runs end-to-end', () => {
    const result = cmd.eli5Command(repo);
    expect(result.eli5).toBeDefined();
    expect(result.roast).toBeDefined();
  });

  test('resumeCommand returns bullets', () => {
    const result = cmd.resumeCommand(repo);
    expect(result.bullets.length).toBeGreaterThan(0);
  });

  test('fixCommand returns suggestions for a file', () => {
    const file = path.join(repo, 'index.js');
    const result = cmd.fixCommand(file);
    expect(result.rendered).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('fixCommand throws when file missing', () => {
    expect(() => cmd.fixCommand('/no/such/file')).toThrow();
  });

  test('seriousCommand reviews a file', () => {
    const file = path.join(repo, 'index.js');
    const result = cmd.seriousCommand(file);
    expect(result.rendered).toMatch(/Review|Suggestions/);
  });

  test('seriousCommand throws when file missing', () => {
    expect(() => cmd.seriousCommand('/no/such/file')).toThrow();
  });

  test('cardCommand returns text/svg/json', () => {
    const result = cmd.cardCommand(repo);
    expect(result.text).toMatch(/Repo Health/);
    expect(result.svg).toMatch(/<svg/);
    expect(result.json.schema).toBe('roastme.card.v1');
  });

  test('compareCommand renders comparison', () => {
    const repoB = mkRepo();
    const result = cmd.compareCommand(repo, repoB);
    expect(result.rendered).toMatch(/Verdict/);
    expect(result.result.deltas).toBeDefined();
  });

  test('tonesCommand lists tones', () => {
    const result = cmd.tonesCommand();
    expect(result.tones.length).toBeGreaterThan(3);
  });

  test('tonesCommand returns tone definition', () => {
    const result = cmd.tonesCommand('savage');
    expect(result.tone.label).toBe('Savage');
  });

  test('tonesCommand returns error on invalid tone', () => {
    const result = cmd.tonesCommand('not-a-tone');
    expect(result.error).toMatch(/Invalid tone/);
  });

  test('readPackage returns null when missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-empty-'));
    expect(cmd.readPackage(tmp)).toBeNull();
  });

  test('readPackage returns null when invalid JSON', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-bad-'));
    fs.writeFileSync(path.join(tmp, 'package.json'), '{not json');
    expect(cmd.readPackage(tmp)).toBeNull();
  });

  test('readFile returns null for missing files', () => {
    expect(cmd.readFile('/no/such/path')).toBeNull();
  });
});
