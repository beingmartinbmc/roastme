// Resume mode
// Converts a repo into resume-ready bullet points.

const { detectPatterns } = require('../analyzers/patterns');

/**
 * Generate resume-style bullet points for a repo.
 * @param {Object} input
 * @param {Object<string,string>} input.files
 * @param {Object} [input.pkg]
 * @returns {{summary:string, bullets:string[]}}}
 */
function generateResumeBullets({ files = {}, pkg = null } = {}) {
  const fileCount = Object.keys(files).length;
  const totalLines = Object.values(files).reduce((a, c) => a + c.split('\n').length, 0);
  const patterns = detectPatterns(files);
  const lang = inferLanguage(files);
  const deps = pkg ? Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }) : [];

  const bullets = [];
  if (pkg && pkg.name) {
    bullets.push(`Built and maintained "${pkg.name}"${pkg.description ? ` — ${pkg.description}` : ''}.`);
  }
  bullets.push(`Authored ${fileCount}+ source modules totaling ~${totalLines.toLocaleString()} lines of ${lang} code.`);
  if (patterns.find(p => p.pattern === 'Express Boilerplate')) {
    bullets.push('Designed and shipped a Node.js HTTP service using Express.js with REST endpoints.');
  }
  if (patterns.find(p => p.pattern === 'MVC Boilerplate')) {
    bullets.push('Implemented an MVC architecture separating concerns across controllers, models, and views.');
  }
  if (deps.includes('jest') || deps.includes('mocha') || deps.includes('vitest')) {
    bullets.push(`Established automated testing with ${deps.find(d => ['jest', 'mocha', 'vitest'].includes(d))} to ensure reliability.`);
  } else {
    bullets.push('(Note: no test framework detected — adding tests will strengthen this bullet.)');
  }
  if (deps.includes('typescript')) {
    bullets.push('Migrated and typed the codebase using TypeScript to improve maintainability.');
  }
  if (deps.includes('docker') || deps.find(d => d.includes('docker'))) {
    bullets.push('Containerized the application for reproducible deployments.');
  }
  if (deps.includes('prom-client') || deps.find(d => d.includes('prometheus'))) {
    bullets.push('Instrumented the service with Prometheus metrics for observability.');
  }
  if (patterns.find(p => p.pattern === 'No Tests')) {
    bullets.push('(Action item: add tests before listing this on a resume.)');
  }

  const summary = pkg && pkg.description
    ? pkg.description
    : `${fileCount}-file ${lang} project showcasing software design and engineering execution.`;

  return { summary, bullets };
}

function inferLanguage(files) {
  const counts = { JavaScript: 0, TypeScript: 0, Python: 0, Java: 0, Go: 0 };
  Object.keys(files).forEach(p => {
    if (p.endsWith('.ts') || p.endsWith('.tsx')) counts.TypeScript += 1;
    else if (p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.mjs') || p.endsWith('.cjs')) counts.JavaScript += 1;
    else if (p.endsWith('.py')) counts.Python += 1;
    else if (p.endsWith('.java')) counts.Java += 1;
    else if (p.endsWith('.go')) counts.Go += 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] && sorted[0][1] > 0 ? sorted[0][0] : 'multi-language';
}

module.exports = { generateResumeBullets };
