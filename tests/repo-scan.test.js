const path = require('path');
const fs = require('fs');
const os = require('os');
const { scanRepo } = require('../lib/analyzers/repo-scan');

function mkTmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'roastme-scan-'));
}

describe('repo scanner', () => {
  test('scans a repo and includes only known extensions', () => {
    const root = mkTmp();
    fs.writeFileSync(path.join(root, 'a.js'), 'console.log(1);');
    fs.writeFileSync(path.join(root, 'README.md'), 'hi'); // ignored ext
    fs.mkdirSync(path.join(root, 'sub'));
    fs.writeFileSync(path.join(root, 'sub', 'b.ts'), 'export const x = 1;');
    const result = scanRepo(root);
    expect(Object.keys(result.files)).toEqual(expect.arrayContaining(['a.js', path.join('sub', 'b.ts')]));
    expect(result.files['README.md']).toBeUndefined();
    expect(result.stats.fileCount).toBe(2);
    expect(result.stats.totalLines).toBeGreaterThan(0);
  });

  test('ignores node_modules and .git', () => {
    const root = mkTmp();
    fs.mkdirSync(path.join(root, 'node_modules'));
    fs.writeFileSync(path.join(root, 'node_modules', 'x.js'), 'x');
    fs.mkdirSync(path.join(root, '.git'));
    fs.writeFileSync(path.join(root, '.git', 'a.js'), 'a');
    fs.writeFileSync(path.join(root, 'keep.js'), 'k');
    const result = scanRepo(root);
    expect(Object.keys(result.files)).toEqual(['keep.js']);
  });

  test('respects maxFileSize', () => {
    const root = mkTmp();
    fs.writeFileSync(path.join(root, 'big.js'), 'a'.repeat(1000));
    fs.writeFileSync(path.join(root, 'small.js'), 'small');
    const result = scanRepo(root, { maxFileSize: 100 });
    expect(result.files['big.js']).toBeUndefined();
    expect(result.files['small.js']).toBeDefined();
  });

  test('throws on missing path', () => {
    expect(() => scanRepo('/this/does/not/exist/12345')).toThrow();
  });

  test('handles unreadable directories gracefully via mock fs', () => {
    const mockFs = {
      existsSync: () => true,
      readdirSync: () => { throw new Error('EACCES'); },
      statSync: () => ({ size: 0 }),
      readFileSync: () => ''
    };
    const result = scanRepo('/fake', { fs: mockFs });
    expect(result.files).toEqual({});
  });

  test('skips files that fail stat or read', () => {
    let call = 0;
    const mockFs = {
      existsSync: () => true,
      readdirSync: () => [
        { name: 'a.js', isDirectory: () => false, isFile: () => true },
        { name: 'b.js', isDirectory: () => false, isFile: () => true }
      ],
      statSync: () => {
        call += 1;
        if (call === 1) throw new Error('stat fail');
        return { size: 10 };
      },
      readFileSync: () => { throw new Error('read fail'); }
    };
    const result = scanRepo('/fake', { fs: mockFs });
    expect(Object.keys(result.files)).toEqual([]);
  });
});
