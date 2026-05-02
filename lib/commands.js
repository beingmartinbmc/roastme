// High-level command implementations used by the CLI.
// Kept in lib/ so they remain unit-testable independent of commander.

const fs = require('fs');
const path = require('path');
const { scanRepo } = require('./analyzers/repo-scan');
const { computeHealthScore } = require('./scoring/health-score');
const { detectPatterns } = require('./analyzers/patterns');
const { aggregateDebt } = require('./analyzers/techdebt');
const { critiquePackage } = require('./analyzers/dependency');
const { analyzeArchitecture, buildDependencyGraph, detectCircularDependencies } = require('./analyzers/architecture');
const { analyzeSecurity } = require('./analyzers/security');
const { explainLikeIm5 } = require('./modes/eli5');
const { generateResumeBullets } = require('./modes/resume');
const { reviewFile, renderReview } = require('./modes/serious');
const { buildSuggestions, renderSuggestions } = require('./modes/fix-suggestions');
const { renderTextCard, renderSvgCard, renderJsonCard } = require('./reporters/card');
const { compareRepos, renderCompare } = require('./reporters/compare');
const { getTone, isValidTone, listTones } = require('./tones');

/**
 * Read a file safely. Returns null if missing.
 */
function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (_) {
    return null;
  }
}

function readPackage(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  const raw = readFile(pkgPath);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}

/**
 * Score command. Returns the score object instead of printing for testability.
 * @param {string} repoPath
 * @returns {Object} health score result
 */
function scoreCommand(repoPath) {
  const { files } = scanRepo(repoPath);
  const pkg = readPackage(repoPath);
  return computeHealthScore({ files, pkg });
}

/**
 * Analyze a repo end-to-end.
 * @param {string} repoPath
 */
function analyzeRepo(repoPath) {
  const { files, stats } = scanRepo(repoPath);
  const pkg = readPackage(repoPath);
  const codeFiles = filterCodeFiles(files);

  const archFindings = [];
  const securityFindings = [];
  Object.entries(codeFiles).forEach(([f, c]) => {
    archFindings.push(...analyzeArchitecture(c, f).findings);
    securityFindings.push(...analyzeSecurity(c).findings);
  });

  const graph = buildDependencyGraph(codeFiles);
  const cycles = detectCircularDependencies(graph);
  const debt = aggregateDebt(codeFiles);
  const patterns = detectPatterns(files);
  const depCritique = pkg ? critiquePackage(pkg) : null;
  const health = computeHealthScore({ files, pkg });

  return {
    stats,
    health,
    architecture: { findings: archFindings, circularDependencies: cycles },
    security: { findings: securityFindings },
    debt,
    patterns,
    dependencies: depCritique
  };
}

/**
 * Build an ELI5 explanation + roast.
 */
function eli5Command(repoPath) {
  const { files } = scanRepo(repoPath);
  const pkg = readPackage(repoPath);
  return explainLikeIm5({ files, pkg });
}

/**
 * Generate a resume.
 */
function resumeCommand(repoPath) {
  const { files } = scanRepo(repoPath);
  const pkg = readPackage(repoPath);
  return generateResumeBullets({ files, pkg });
}

/**
 * Build fix-suggestions for a single file.
 */
function fixCommand(filePath) {
  const content = readFile(filePath);
  if (content === null) {
    throw new Error(`File not found: ${filePath}`);
  }
  const suggestions = buildSuggestions(content);
  return { suggestions, rendered: renderSuggestions(suggestions) };
}

/**
 * Serious mode review for a file.
 */
function seriousCommand(filePath) {
  const content = readFile(filePath);
  if (content === null) {
    throw new Error(`File not found: ${filePath}`);
  }
  const result = reviewFile(content, filePath);
  return { ...result, rendered: renderReview(result) };
}

/**
 * Generate shareable card formats from a repo path.
 */
function cardCommand(repoPath, opts = {}) {
  const health = scoreCommand(repoPath);
  return {
    text: renderTextCard(health, opts),
    svg: renderSvgCard(health, opts),
    json: renderJsonCard(health),
    health
  };
}

/**
 * Compare two repos side-by-side.
 */
function compareCommand(left, right) {
  const lhs = { name: path.basename(left), health: scoreCommand(left) };
  const rhs = { name: path.basename(right), health: scoreCommand(right) };
  return {
    rendered: renderCompare(lhs, rhs),
    result: compareRepos(lhs, rhs)
  };
}

/**
 * Validate or list tones.
 */
function tonesCommand(name) {
  if (!name) return { tones: listTones() };
  if (!isValidTone(name)) {
    return { error: `Invalid tone "${name}". Valid: ${listTones().join(', ')}` };
  }
  return { tone: getTone(name) };
}

function filterCodeFiles(files) {
  const out = {};
  Object.entries(files).forEach(([f, c]) => {
    if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(f)) out[f] = c;
  });
  return out;
}

module.exports = {
  scoreCommand,
  analyzeRepo,
  eli5Command,
  resumeCommand,
  fixCommand,
  seriousCommand,
  cardCommand,
  compareCommand,
  tonesCommand,
  // exposed for testing
  readPackage,
  readFile
};
