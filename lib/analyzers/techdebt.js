// Tech-debt tracker
// Tracks TODOs, FIXMEs, HACKs, XXX, deprecated markers and complexity hotspots.

const DEBT_TAGS = ['TODO', 'FIXME', 'HACK', 'XXX', 'DEPRECATED', 'REFACTOR', 'BUG'];

/**
 * Track debt tags in source content.
 * @param {string} content
 * @param {string} [filePath]
 * @returns {Array}
 */
function trackDebtTags(content, filePath = '') {
  if (typeof content !== 'string') return [];
  const items = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    DEBT_TAGS.forEach(tag => {
      const regex = new RegExp(`\\b${tag}\\b[:\\s\\-]*(.*)`);
      const match = line.match(regex);
      if (match) {
        items.push({
          tag,
          file: filePath,
          line: idx + 1,
          message: (match[1] || '').trim().slice(0, 200) || '(no message)'
        });
      }
    });
  });
  return items;
}

/**
 * Identify hotspots — files with very high complexity or TODO density.
 * @param {Array<{file:string, debtCount:number, complexity:number, lineCount:number}>} fileStats
 * @returns {Array}
 */
function identifyHotspots(fileStats = []) {
  return fileStats
    .map(s => ({
      ...s,
      density: s.lineCount > 0 ? s.debtCount / s.lineCount : 0,
      score: (s.complexity || 0) + (s.debtCount || 0) * 2
    }))
    .filter(s => s.score >= 10 || s.density >= 0.05)
    .sort((a, b) => b.score - a.score);
}

/**
 * Aggregate debt across multiple files.
 * @param {Object<string,string>} files
 * @returns {{items:Array, byTag:Object, byFile:Object, total:number}}
 */
function aggregateDebt(files = {}) {
  const items = [];
  const byTag = {};
  const byFile = {};
  Object.entries(files).forEach(([file, content]) => {
    const found = trackDebtTags(content, file);
    items.push(...found);
    found.forEach(f => {
      byTag[f.tag] = (byTag[f.tag] || 0) + 1;
      byFile[f.file] = (byFile[f.file] || 0) + 1;
    });
  });
  return { items, byTag, byFile, total: items.length };
}

module.exports = {
  DEBT_TAGS,
  trackDebtTags,
  identifyHotspots,
  aggregateDebt
};
