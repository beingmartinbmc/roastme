// Serious mode
// Pure professional feedback — no jokes, just review notes.

const { analyzeCode } = require('../analyzer');
const { analyzeArchitecture } = require('../analyzers/architecture');
const { analyzeSecurity } = require('../analyzers/security');
const { buildSuggestions } = require('./fix-suggestions');

/**
 * Produce a professional code review for a single file.
 * @param {string} content
 * @param {string} [filePath]
 * @returns {{review:Array<{level:string, message:string, line?:number}>, suggestions:Array}}
 */
function reviewFile(content, filePath = '') {
  if (typeof content !== 'string') return { review: [], suggestions: [] };

  const code = analyzeCode(content);
  const arch = analyzeArchitecture(content, filePath);
  const sec = analyzeSecurity(content);

  const review = [];

  code.issues.forEach(issue => {
    review.push({
      level: severityToLevel(issue.severity),
      line: issue.line,
      message: `${issue.type}: ${issue.description}`
    });
  });

  arch.findings.forEach(f => {
    review.push({ level: severityToLevel(f.severity), message: `${f.type}: ${f.detail}` });
  });

  sec.findings.forEach(f => {
    review.push({ level: severityToLevel(f.severity), line: f.line, message: `Security/${f.name}: ${f.advice || ''}`.trim() });
  });

  const suggestions = buildSuggestions(content);
  return { review, suggestions };
}

function severityToLevel(sev) {
  switch (sev) {
    case 'critical': return 'error';
    case 'high': return 'error';
    case 'medium': return 'warn';
    case 'low': return 'info';
    default: return 'info';
  }
}

/**
 * Render a serious review as plain text.
 * @param {{review:Array, suggestions:Array}} result
 * @returns {string}
 */
function renderReview(result) {
  const sections = [];
  if (!result.review || result.review.length === 0) {
    sections.push('Review: No issues detected.');
  } else {
    sections.push('Review:');
    result.review.forEach(item => {
      const at = item.line ? ` (line ${item.line})` : '';
      sections.push(`  [${item.level.toUpperCase()}]${at} ${item.message}`);
    });
  }
  if (result.suggestions && result.suggestions.length > 0) {
    sections.push('');
    sections.push(`Suggestions: ${result.suggestions.length} available — see fix-suggestions output.`);
  }
  return sections.join('\n');
}

module.exports = { reviewFile, renderReview };
