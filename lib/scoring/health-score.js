// Repo Health Score
// Generates a shareable scorecard across multiple dimensions.

const { analyzeCode } = require('../analyzer');
const { analyzeArchitecture, buildDependencyGraph, detectCircularDependencies } = require('../analyzers/architecture');
const { analyzeSecurity } = require('../analyzers/security');
const { aggregateDebt } = require('../analyzers/techdebt');
const { critiquePackage } = require('../analyzers/dependency');

/**
 * Compute a full health score for a repository.
 * @param {Object} input
 * @param {Object<string,string>} input.files - map of relative path -> content
 * @param {Object} [input.pkg]                - parsed package.json
 * @returns {{
 *   scores: { codeQuality:number, architecture:number, readability:number, scalabilityRisk:string, security:number, dependencies:number, overall:number },
 *   summary: Object,
 *   details: Object
 * }}
 */
function computeHealthScore({ files = {}, pkg = null } = {}) {
  const codeFiles = Object.entries(files).filter(([f]) => /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(f));
  const issueCounts = { total: 0, high: 0, medium: 0, low: 0 };
  const archFindings = [];
  const securityFindings = [];

  let totalLines = 0;
  let totalComplexity = 0;
  let avgFunctionLength = 0;
  let functionLengthSamples = 0;

  codeFiles.forEach(([file, content]) => {
    totalLines += content.split('\n').length;
    const codeAnalysis = analyzeCode(content);
    issueCounts.total += codeAnalysis.issues.length;
    codeAnalysis.issues.forEach(i => {
      issueCounts[i.severity] = (issueCounts[i.severity] || 0) + 1;
    });
    const archResult = analyzeArchitecture(content, file);
    archFindings.push(...archResult.findings);
    totalComplexity += archResult.complexity;

    const sec = analyzeSecurity(content);
    securityFindings.push(...sec.findings);

    const fnLengths = extractFunctionLengths(content);
    fnLengths.forEach(len => {
      avgFunctionLength += len;
      functionLengthSamples += 1;
    });
  });

  const debt = aggregateDebt(Object.fromEntries(codeFiles));
  const graph = buildDependencyGraph(Object.fromEntries(codeFiles));
  const cycles = detectCircularDependencies(graph);
  const depCritique = pkg ? critiquePackage(pkg) : { findings: [], totalDeps: 0, score: 10 };

  const fileCount = codeFiles.length || 1;
  const issuesPerFile = issueCounts.total / fileCount;
  const complexityPerFile = totalComplexity / fileCount;
  avgFunctionLength = functionLengthSamples ? avgFunctionLength / functionLengthSamples : 0;

  const codeQuality = clamp10(10 - issuesPerFile * 0.6 - issueCounts.high * 0.3);
  const architecture = clamp10(10 - archFindings.length * 0.5 - cycles.length * 1.5 - Math.max(0, complexityPerFile - 10) * 0.1);
  const readability = clamp10(10 - Math.max(0, avgFunctionLength - 20) * 0.05 - issueCounts.medium * 0.15);
  const security = clamp10(10 - securityFindings.length * 0.8);
  const dependencies = clamp10(depCritique.score);

  const scalabilityRisk = scalabilityLabel({ cycles: cycles.length, archFindings: archFindings.length, complexityPerFile });
  const overall = clamp10((codeQuality + architecture + readability + security + dependencies) / 5);

  return {
    scores: {
      codeQuality,
      architecture,
      readability,
      scalabilityRisk,
      security,
      dependencies,
      overall
    },
    summary: {
      fileCount,
      totalLines,
      totalIssues: issueCounts.total,
      highSeverityIssues: issueCounts.high || 0,
      mediumSeverityIssues: issueCounts.medium || 0,
      circularDependencies: cycles.length,
      securityFindings: securityFindings.length,
      techDebtItems: debt.total,
      avgFunctionLength: Math.round(avgFunctionLength * 10) / 10,
      complexityPerFile: Math.round(complexityPerFile * 10) / 10
    },
    details: {
      cycles,
      archFindings,
      securityFindings,
      debt,
      depCritique
    }
  };
}

function clamp10(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function scalabilityLabel({ cycles, archFindings, complexityPerFile }) {
  let risk = 0;
  risk += cycles * 2;
  risk += archFindings * 0.5;
  risk += Math.max(0, complexityPerFile - 15) * 0.4;
  if (risk >= 6) return 'High';
  if (risk >= 3) return 'Medium';
  if (risk >= 1) return 'Low';
  return 'Minimal';
}

function extractFunctionLengths(content) {
  const lengths = [];
  const lines = content.split('\n');
  let inFn = false;
  let depth = 0;
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inFn && /\bfunction\b|=>\s*\{/.test(line) && /\{/.test(line)) {
      inFn = true;
      start = i;
      depth = countDelta(line);
      continue;
    }
    if (inFn) {
      depth += countDelta(line);
      if (depth <= 0) {
        lengths.push(i - start + 1);
        inFn = false;
      }
    }
  }
  return lengths;
}

function countDelta(line) {
  return (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
}

module.exports = {
  computeHealthScore,
  scalabilityLabel
};
