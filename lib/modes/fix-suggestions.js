// Fix-suggestions mode
// Generates before/after refactor suggestions for common code smells.

/**
 * Build before -> after suggestions for a file's content.
 * @param {string} content
 * @returns {Array<{type:string, before:string, after:string, line:number, why:string}>}
 */
function buildSuggestions(content) {
  if (typeof content !== 'string') return [];
  const lines = content.split('\n');
  const out = [];

  lines.forEach((rawLine, idx) => {
    const line = rawLine;
    const trimmed = line.trim();
    const lineNumber = idx + 1;

    if (/console\.(log|error|warn|info|debug)/.test(trimmed)) {
      out.push({
        type: 'replaceConsoleLog',
        line: lineNumber,
        before: trimmed,
        after: trimmed.replace(/console\.(log|error|warn|info|debug)/, 'logger.$1'),
        why: 'Replace console.* with a structured logger (winston/pino) for production-readiness.'
      });
    }

    const badVarMatch = trimmed.match(/\b(let|const|var)\s+(x|y|z|temp|data|stuff|thing|obj|arr|str|num)\b/);
    if (badVarMatch) {
      const keyword = badVarMatch[1];
      const varName = badVarMatch[2];
      const suggestionMap = { x: 'value', y: 'count', z: 'result', temp: 'buffer', data: 'payload', stuff: 'items', thing: 'item', obj: 'config', arr: 'items', str: 'text', num: 'count' };
      out.push({
        type: 'rename',
        line: lineNumber,
        before: trimmed,
        after: trimmed.replace(new RegExp(`\\b${keyword}\\s+${varName}\\b`), `${keyword} ${suggestionMap[varName] || 'value'}`),
        why: `Rename "${varName}" to a domain-specific name describing what it stores.`
      });
    }

    if (/==[^=]/.test(trimmed) && !/!=/.test(trimmed)) {
      out.push({
        type: 'strictEquality',
        line: lineNumber,
        before: trimmed,
        after: trimmed.replace(/==(?!=)/g, '==='),
        why: 'Use === / !== to avoid type-coercion bugs.'
      });
    }

    if (/\bvar\s+/.test(trimmed)) {
      out.push({
        type: 'modernDeclaration',
        line: lineNumber,
        before: trimmed,
        after: trimmed.replace(/\bvar\b/, 'const'),
        why: 'Prefer const/let; var has function-scope hoisting surprises.'
      });
    }

    const magicMatch = trimmed.match(/\b(?:[2-9]\d{1,4}|1\d{2,4})\b/);
    if (magicMatch && !/(http|status|port|version)/i.test(trimmed)) {
      out.push({
        type: 'extractConstant',
        line: lineNumber,
        before: trimmed,
        after: `const SOME_THRESHOLD = ${magicMatch[0]};\n${trimmed.replace(magicMatch[0], 'SOME_THRESHOLD')}`,
        why: 'Extract magic numbers into named constants to communicate intent.'
      });
    }

    if (/\bTODO\b|\bFIXME\b|\bHACK\b/.test(trimmed)) {
      out.push({
        type: 'resolveTechDebt',
        line: lineNumber,
        before: trimmed,
        after: '// (resolve and remove this debt marker)',
        why: 'TODO/FIXME/HACK markers accumulate quickly. Schedule them or delete them.'
      });
    }
  });

  // Modularization heuristic: if file has > 400 lines, suggest splitting
  if (lines.length > 400) {
    out.push({
      type: 'modularize',
      line: 1,
      before: `(file is ${lines.length} lines)`,
      after: '// Split this file into smaller modules grouped by responsibility.',
      why: 'Single-Responsibility Principle: large files become unmaintainable.'
    });
  }

  return dedupe(out);
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(i => {
    const key = `${i.type}:${i.line}:${i.before}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Render suggestions as a readable text report.
 * @param {Array} suggestions
 * @returns {string}
 */
function renderSuggestions(suggestions) {
  if (!suggestions || suggestions.length === 0) {
    return 'No automatic suggestions generated. Either the file is clean or beyond saving.';
  }
  return suggestions.map(s => {
    return [
      `Line ${s.line} — ${s.type}`,
      `Why: ${s.why}`,
      `Before:`,
      `  ${s.before}`,
      `After:`,
      `  ${s.after}`,
      ''
    ].join('\n');
  }).join('\n');
}

module.exports = { buildSuggestions, renderSuggestions };
