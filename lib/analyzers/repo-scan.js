// Repo scanner
// Recursively walks a directory and collects file content for further analysis.

const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt',
  '.cache', 'out', '.turbo', '.vercel', '.idea', '.vscode', '.cursor', '.windsurf'
]);

const DEFAULT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.java', '.go', '.rb', '.rs', '.php', '.cs',
  '.json'
]);

/**
 * Recursively scan a repository directory.
 * @param {string} rootDir
 * @param {{maxFileSize?:number, extensions?:Set<string>, ignore?:Set<string>, fs?:typeof fs}} [opts]
 * @returns {{root:string, files:Object<string,string>, stats:{fileCount:number, totalLines:number, totalBytes:number}}}
 */
function scanRepo(rootDir, opts = {}) {
  const fsImpl = opts.fs || fs;
  const maxFileSize = opts.maxFileSize ?? 500_000;
  const extensions = opts.extensions || DEFAULT_EXTENSIONS;
  const ignore = opts.ignore || DEFAULT_IGNORE;

  const files = {};
  const stats = { fileCount: 0, totalLines: 0, totalBytes: 0 };

  if (!fsImpl.existsSync(rootDir)) {
    throw new Error(`Path does not exist: ${rootDir}`);
  }

  walk(rootDir, rootDir);

  function walk(currentDir, base) {
    let entries;
    try {
      entries = fsImpl.readdirSync(currentDir, { withFileTypes: true });
    } catch (_) {
      return;
    }

    for (const entry of entries) {
      if (ignore.has(entry.name)) continue;
      const full = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(full, base);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!extensions.has(ext)) continue;
        let stat;
        try {
          stat = fsImpl.statSync(full);
        } catch (_) {
          continue;
        }
        if (stat.size > maxFileSize) continue;
        let content;
        try {
          content = fsImpl.readFileSync(full, 'utf8');
        } catch (_) {
          continue;
        }
        const rel = path.relative(base, full);
        files[rel] = content;
        stats.fileCount += 1;
        stats.totalBytes += stat.size;
        stats.totalLines += content.split('\n').length;
      }
    }
  }

  return { root: rootDir, files, stats };
}

module.exports = {
  DEFAULT_IGNORE,
  DEFAULT_EXTENSIONS,
  scanRepo
};
