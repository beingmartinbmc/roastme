// "Explain Like I'm 5" mode
// Renders a kid-friendly explanation of a repo, plus a contrasting roast.

const { detectPatterns } = require('../analyzers/patterns');
const { aggregateDebt } = require('../analyzers/techdebt');

/**
 * Build an ELI5 explanation for a repo.
 * @param {Object} input
 * @param {Object<string,string>} input.files
 * @param {Object} [input.pkg]
 * @returns {{eli5:string, roast:string, patterns:Array}}}
 */
function explainLikeIm5({ files = {}, pkg = null } = {}) {
  const fileCount = Object.keys(files).length;
  const totalLines = Object.values(files).reduce((a, c) => a + c.split('\n').length, 0);
  const patterns = detectPatterns(files);
  const debt = aggregateDebt(files);

  const purposeGuess = guessPurpose(pkg, files);
  const eli5Parts = [
    `📚 This is a ${purposeGuess} project.`,
    `It has ${fileCount} files (about ${totalLines} lines of code in total).`,
    patterns.length > 0
      ? `It uses these patterns: ${patterns.map(p => p.pattern).join(', ')}.`
      : `It has no obvious well-known patterns — it is mostly custom code.`,
    debt.total > 0
      ? `There are ${debt.total} sticky-notes ("TODO" comments) the developer left for later.`
      : `The developer left no "I'll fix this later" notes — clean!`,
    `Think of it like a Lego castle: lots of small bricks (files) put together to make one thing work.`
  ];

  const roastParts = [
    `Now the cruel truth:`,
    patterns.find(p => p.pattern === 'No Tests') ? `• Zero tests. The Lego castle has no glue.` : null,
    patterns.find(p => p.pattern === 'Reinvented Queue') ? `• They reinvented a queue badly.` : null,
    debt.total > 10 ? `• ${debt.total} TODOs — that is not a backlog, that is a graveyard.` : null,
    fileCount > 50 ? `• ${fileCount} files. Bold to call this "lite" of anything.` : null
  ].filter(Boolean);

  const roast = roastParts.length > 1
    ? roastParts.join('\n')
    : `Now the cruel truth:\n• Surprisingly tame. Either it is well written or you hid the bad parts.`;

  return {
    eli5: eli5Parts.join('\n'),
    roast,
    patterns
  };
}

function guessPurpose(pkg, files) {
  if (pkg && pkg.description) return pkg.description.split('.')[0].toLowerCase();
  const lowerPaths = Object.keys(files).map(p => p.toLowerCase());
  if (lowerPaths.some(p => p.includes('express'))) return 'web server';
  if (lowerPaths.some(p => p.includes('cli'))) return 'command-line tool';
  if (lowerPaths.some(p => p.includes('react'))) return 'frontend';
  return 'software';
}

module.exports = { explainLikeIm5 };
