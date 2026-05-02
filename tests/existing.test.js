// Tests for the original modules so they are not penalized in coverage.

const { analyzeCode } = require('../lib/analyzer');
const utils = require('../lib/utils');
const { roastStatic } = require('../lib/engines/static');
const { roast, checkEngineAvailability } = require('../lib/adapter');
const config = require('../lib/config');
const constants = require('../lib/constants');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('analyzer', () => {
  test('detects console.log, magic numbers, bad names, TODOs', () => {
    const src = `
      // TODO: fix
      console.log("hi");
      let x = 1234;
      const y = 4321;
      function f() {
        if (a) {
          if (b) {
            if (c) {
              if (d) {
                if (e) {
                  console.log("deep");
                }
              }
            }
          }
        }
      }
    `;
    const result = analyzeCode(src);
    const types = result.issues.map(i => i.type);
    expect(types).toEqual(expect.arrayContaining(['consoleLog', 'magicNumbers', 'badVariableNames', 'todoComments']));
    expect(result.summary.totalIssues).toBeGreaterThan(0);
    expect(result.summary.byType).toBeDefined();
    expect(result.summary.bySeverity).toBeDefined();
  });

  test('skips comments and empty lines', () => {
    const src = '\n// console.log("ignored")\n/* still ignored */\n';
    const result = analyzeCode(src);
    expect(result.issues.every(i => i.type !== 'consoleLog')).toBe(true);
  });

  test('detects long files', () => {
    const big = 'a;\n'.repeat(600);
    const result = analyzeCode(big);
    expect(result.issues.some(i => i.description.includes('lines'))).toBe(true);
  });

  test('detects long functions', () => {
    let body = '';
    for (let i = 0; i < 25; i++) body += `  let v${i} = ${i};\n`;
    const src = `function bigFn() {\n${body}}\n`;
    const result = analyzeCode(src);
    expect(result.issues.some(i => i.type === 'longFunctions')).toBe(true);
  });
});

describe('utils', () => {
  test('countIssueTypes', () => {
    const counts = utils.countIssueTypes([
      { type: 'a' }, { type: 'a' }, { type: 'b' }
    ]);
    expect(counts).toEqual({ a: 2, b: 1 });
  });

  test('getMostCommonIssue picks most frequent', () => {
    const v = utils.getMostCommonIssue([{ type: 'x' }, { type: 'y' }, { type: 'y' }]);
    expect(v).toBe('y');
  });

  test('createUniqueFilename has prefix and ext', () => {
    const f = utils.createUniqueFilename('hi', 'txt');
    expect(f.startsWith('hi-')).toBe(true);
    expect(f.endsWith('.txt')).toBe(true);
  });

  test('safeJsonParse returns fallback on bad json', () => {
    expect(utils.safeJsonParse('{', { ok: 1 })).toEqual({ ok: 1 });
    expect(utils.safeJsonParse('{"a":1}')).toEqual({ a: 1 });
  });

  test('formatFileSize formats correctly', () => {
    expect(utils.formatFileSize(0)).toBe('0 B');
    expect(utils.formatFileSize(1500)).toMatch(/KB/);
  });

  test('isEmpty handles edge cases', () => {
    expect(utils.isEmpty(null)).toBe(true);
    expect(utils.isEmpty(undefined)).toBe(true);
    expect(utils.isEmpty('')).toBe(true);
    expect(utils.isEmpty('  ')).toBe(true);
    expect(utils.isEmpty([])).toBe(true);
    expect(utils.isEmpty({})).toBe(true);
    expect(utils.isEmpty('x')).toBe(false);
    expect(utils.isEmpty([1])).toBe(false);
    expect(utils.isEmpty({ a: 1 })).toBe(false);
  });

  test('normalizeConfig fills defaults', () => {
    expect(utils.normalizeConfig().mode).toBe('savage');
    expect(utils.normalizeConfig({ mode: 'gentle' }).mode).toBe('gentle');
  });

  test('displayRoast prints with color', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    utils.displayRoast('hi', 'savage');
    utils.displayRoast('hi', 'unknown');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('generateTimestamp returns numeric string', () => {
    expect(/^\d+$/.test(utils.generateTimestamp())).toBe(true);
  });
});

describe('static engine + adapter', () => {
  test('roastStatic returns one of the canned roasts', () => {
    const v = roastStatic({}, 'gentle');
    expect(typeof v).toBe('string');
    expect(v.length).toBeGreaterThan(0);
  });

  test('roastStatic falls back to savage for unknown mode', () => {
    const v = roastStatic({}, 'unknown');
    expect(typeof v).toBe('string');
  });

  test('adapter.roast uses static engine by default', async () => {
    const v = await roast({}, 'savage', 'hello');
    expect(typeof v).toBe('string');
  });

  test('adapter.roast falls back to static when engine throws', async () => {
    const v = await roast({}, 'savage', '', 'openai');
    // OPENAI without key throws inside engine -> fallback to static
    expect(typeof v).toBe('string');
  });

  test('checkEngineAvailability handles all engines', async () => {
    const stat = await checkEngineAvailability('static');
    expect(stat.available).toBe(true);
    const oa = await checkEngineAvailability('openai');
    expect(typeof oa.available).toBe('boolean');
    const unknown = await checkEngineAvailability('whatever');
    expect(unknown.available).toBe(false);
  });

  test('checkEngineAvailability for ollama gracefully fails when offline', async () => {
    const result = await checkEngineAvailability('ollama');
    expect(typeof result.available).toBe('boolean');
  });
});

describe('config', () => {
  test('loadConfig returns defaults when missing', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-cfg-'));
    const result = await config.loadConfig(path.join(tmp, '.nope'));
    expect(result.mode).toBe(constants.DEFAULT_CONFIG.mode);
  });

  test('loadConfig parses file when present', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-cfg2-'));
    const p = path.join(tmp, '.roastmerc');
    fs.writeFileSync(p, JSON.stringify({ mode: 'gentle' }));
    const result = await config.loadConfig(p);
    expect(result.mode).toBe('gentle');
  });

  test('loadConfig warns on bad json and returns defaults', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-cfg3-'));
    const p = path.join(tmp, '.roastmerc');
    fs.writeFileSync(p, '{not json');
    const result = await config.loadConfig(p);
    expect(result.mode).toBe(constants.DEFAULT_CONFIG.mode);
  });

  test('createDefaultConfig writes file and refuses overwrite', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-cfg4-'));
    const p = path.join(tmp, '.roastmerc');
    expect(await config.createDefaultConfig(p)).toBe(true);
    expect(fs.existsSync(p)).toBe(true);
    expect(await config.createDefaultConfig(p)).toBe(false);
  });

  test('validateConfig accepts a valid config', () => {
    expect(config.validateConfig(constants.DEFAULT_CONFIG)).toEqual([]);
  });

  test('validateConfig collects errors for invalid input', () => {
    const errs = config.validateConfig({
      mode: 'oops',
      targets: 'nope',
      enabledChecks: ['bogus'],
      ci: 'no',
      maxFileSize: -1
    });
    expect(errs.length).toBeGreaterThan(0);
  });
});
