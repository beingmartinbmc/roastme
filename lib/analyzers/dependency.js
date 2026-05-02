// Dependency critique
// Analyzes a package.json for bloat, redundancy, security, and overengineering.

const REDUNDANT_PAIRS = [
  { has: ['lodash', 'underscore'], snark: 'lodash and underscore? Just pick one cult.' },
  { has: ['moment', 'date-fns'], snark: 'moment and date-fns. Time is already confusing — stop.' },
  { has: ['moment', 'dayjs'], snark: 'moment AND dayjs? Choose your fighter.' },
  { has: ['axios', 'node-fetch'], snark: 'axios and node-fetch. fetch is built in now.' },
  { has: ['axios', 'request'], snark: 'request is deprecated. axios is enough.' }
];

const HEAVY_DEPS = [
  { name: 'lodash', alternative: 'native ES2020+ array/object methods' },
  { name: 'moment', alternative: 'date-fns or native Intl.DateTimeFormat' },
  { name: 'request', alternative: 'fetch or axios (request is deprecated)' },
  { name: 'underscore', alternative: 'native ES methods or lodash-es' },
  { name: 'jquery', alternative: 'native DOM APIs' },
  { name: 'left-pad', alternative: 'String.prototype.padStart' }
];

const SUSPICIOUS_PATTERNS = [
  { regex: /^is-\w+$/, reason: 'Single-purpose "is-*" packages bloat the tree.' },
  { regex: /^npm$/, reason: 'You almost certainly should not depend on npm itself.' }
];

/**
 * Critique a parsed package.json.
 * @param {Object} pkg
 * @returns {{findings:Array, totalDeps:number, score:number}}
 */
function critiquePackage(pkg = {}) {
  const findings = [];
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const depNames = Object.keys(deps);
  const totalDeps = depNames.length;

  if (totalDeps > 30) {
    findings.push({
      type: 'depBloat',
      severity: 'medium',
      detail: `${totalDeps} total dependencies — consider trimming.`,
      snark: `${totalDeps} deps? You shipped a Node Modules museum.`
    });
  }

  REDUNDANT_PAIRS.forEach(({ has, snark }) => {
    if (has.every(name => depNames.includes(name))) {
      findings.push({
        type: 'redundantDeps',
        severity: 'medium',
        detail: `Redundant: ${has.join(' + ')}`,
        snark
      });
    }
  });

  HEAVY_DEPS.forEach(({ name, alternative }) => {
    if (depNames.includes(name)) {
      findings.push({
        type: 'heavyDep',
        severity: 'low',
        detail: `${name} is heavy/legacy — consider ${alternative}.`,
        snark: `Why ship ${name} in ${new Date().getFullYear()}? Try ${alternative}.`
      });
    }
  });

  depNames.forEach(name => {
    SUSPICIOUS_PATTERNS.forEach(({ regex, reason }) => {
      if (regex.test(name)) {
        findings.push({
          type: 'suspiciousDep',
          severity: 'low',
          detail: `${name}: ${reason}`,
          snark: `${name}? Really?`
        });
      }
    });
  });

  if (!pkg.engines || !pkg.engines.node) {
    findings.push({
      type: 'noEngines',
      severity: 'low',
      detail: 'No "engines.node" field — runtime version is implicit.',
      snark: 'No engines specified. Hope your users guess right.'
    });
  }

  if (!pkg.license) {
    findings.push({
      type: 'noLicense',
      severity: 'medium',
      detail: 'No license field set.',
      snark: 'No license. Bold legal strategy.'
    });
  }

  const score = computeDependencyScore(findings, totalDeps);
  return { findings, totalDeps, score };
}

function computeDependencyScore(findings, totalDeps) {
  const weights = { critical: 3, high: 2, medium: 1, low: 0.5 };
  const penalty = findings.reduce((acc, f) => acc + (weights[f.severity] || 0), 0);
  const bloat = Math.max(0, (totalDeps - 20) / 20);
  return Math.max(0, Math.round((10 - penalty - bloat) * 10) / 10);
}

module.exports = {
  REDUNDANT_PAIRS,
  HEAVY_DEPS,
  critiquePackage,
  computeDependencyScore
};
