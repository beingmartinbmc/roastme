// Architecture analyzer
// Heuristic-only (no full AST) detection of:
//  - God classes / God files
//  - Tight coupling (excessive imports / global usage)
//  - Circular dependencies (graph based)
//  - Excessive nesting / cyclomatic complexity proxy

const path = require('path');

const THRESHOLDS = {
  godFileLines: 400,
  godFileFunctions: 15,
  godClassMethods: 12,
  highFanOut: 10,
  deepNesting: 5,
  longFunctionLines: 40
};

/**
 * Detect "god" structures in a single file's content.
 * @param {string} content
 * @param {string} [filePath]
 * @returns {Array}
 */
function detectGodStructures(content, filePath = '') {
  const findings = [];
  if (typeof content !== 'string') return findings;

  const lines = content.split('\n');
  const lineCount = lines.length;

  if (lineCount > THRESHOLDS.godFileLines) {
    findings.push({
      type: 'godFile',
      severity: 'high',
      file: filePath,
      detail: `File has ${lineCount} lines (>${THRESHOLDS.godFileLines})`
    });
  }

  const functionMatches = content.match(/\bfunction\s+\w+|=>|\bclass\s+\w+/g) || [];
  if (functionMatches.length > THRESHOLDS.godFileFunctions) {
    findings.push({
      type: 'tooManyFunctions',
      severity: 'medium',
      file: filePath,
      detail: `File contains ~${functionMatches.length} functions/classes`
    });
  }

  const classes = extractClasses(content);
  classes.forEach(cls => {
    if (cls.methods.length > THRESHOLDS.godClassMethods) {
      findings.push({
        type: 'godClass',
        severity: 'high',
        file: filePath,
        detail: `Class "${cls.name}" has ${cls.methods.length} methods`
      });
    }
  });

  return findings;
}

/**
 * Extract class names + methods (lightweight regex parser).
 * @param {string} content
 * @returns {Array<{name:string, methods:string[]}>}
 */
function extractClasses(content) {
  const classes = [];
  const classRegex = /class\s+(\w+)[^{]*\{([\s\S]*?)\n\s*\}/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];
    const methods = (body.match(/^\s*(?:async\s+)?(?:static\s+)?(\w+)\s*\([^)]*\)\s*\{/gm) || [])
      .map(s => {
        const m = s.match(/(\w+)\s*\(/);
        return m ? m[1] : null;
      })
      .filter(n => n && n !== 'constructor' && n !== 'if' && n !== 'for' && n !== 'while' && n !== 'switch');
    classes.push({ name, methods });
  }
  return classes;
}

/**
 * Detect tight coupling — high number of imports/requires.
 * @param {string} content
 * @param {string} [filePath]
 * @returns {Array}
 */
function detectTightCoupling(content, filePath = '') {
  if (typeof content !== 'string') return [];
  const imports = extractImports(content);
  if (imports.length > THRESHOLDS.highFanOut) {
    return [{
      type: 'tightCoupling',
      severity: 'medium',
      file: filePath,
      detail: `${imports.length} imports/requires in one file (threshold ${THRESHOLDS.highFanOut})`
    }];
  }
  return [];
}

/**
 * Extract imported modules from JS/TS source.
 * @param {string} content
 * @returns {string[]}
 */
function extractImports(content) {
  if (typeof content !== 'string') return [];
  const out = new Set();
  const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
  const importRegex = /import\s+(?:[^"']*\s+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = requireRegex.exec(content)) !== null) out.add(m[1]);
  while ((m = importRegex.exec(content)) !== null) out.add(m[1]);
  return Array.from(out);
}

/**
 * Build a dependency graph from a map of filePath -> content.
 * Only includes relative imports (./ or ../).
 * @param {Object<string,string>} files
 * @returns {Object<string,string[]>}
 */
function buildDependencyGraph(files) {
  const graph = {};
  Object.entries(files).forEach(([file, content]) => {
    const imports = extractImports(content)
      .filter(i => i.startsWith('.'))
      .map(i => normalizeRelative(file, i, Object.keys(files)))
      .filter(Boolean);
    graph[file] = imports;
  });
  return graph;
}

function normalizeRelative(fromFile, importPath, allFiles) {
  const dir = path.dirname(fromFile);
  const resolved = path.normalize(path.join(dir, importPath));
  // Try exact, then with extensions, then index.js
  const candidates = [resolved, resolved + '.js', resolved + '.ts', path.join(resolved, 'index.js')];
  return candidates.find(c => allFiles.includes(c)) || null;
}

/**
 * Find circular dependencies (cycles) in a dependency graph.
 * @param {Object<string,string[]>} graph
 * @returns {string[][]}
 */
function detectCircularDependencies(graph) {
  const cycles = [];
  const seen = new Set();
  const stack = new Set();

  function dfs(node, path) {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat(node);
        const key = [...cycle].sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
      }
      return;
    }
    if (!graph[node]) return;
    stack.add(node);
    path.push(node);
    graph[node].forEach(next => dfs(next, path));
    path.pop();
    stack.delete(node);
  }

  Object.keys(graph).forEach(n => dfs(n, []));
  return cycles;
}

/**
 * Approximate cyclomatic complexity by counting branches.
 * @param {string} content
 * @returns {number}
 */
function approximateComplexity(content) {
  if (typeof content !== 'string') return 0;
  const branchTokens = content.match(/\b(if|else if|for|while|case|catch|\?\s|&&|\|\|)\b|\?\s/g) || [];
  return 1 + branchTokens.length;
}

/**
 * Run the full architecture analysis on a single file.
 * @param {string} content
 * @param {string} [filePath]
 * @returns {{findings: Array, complexity:number, imports:string[]}}
 */
function analyzeArchitecture(content, filePath = '') {
  const findings = [
    ...detectGodStructures(content, filePath),
    ...detectTightCoupling(content, filePath)
  ];
  const complexity = approximateComplexity(content);
  if (complexity > 30) {
    findings.push({
      type: 'highComplexity',
      severity: 'high',
      file: filePath,
      detail: `Approximate cyclomatic complexity ${complexity}`
    });
  }
  return {
    findings,
    complexity,
    imports: extractImports(content)
  };
}

module.exports = {
  THRESHOLDS,
  detectGodStructures,
  detectTightCoupling,
  detectCircularDependencies,
  buildDependencyGraph,
  extractImports,
  extractClasses,
  approximateComplexity,
  analyzeArchitecture
};
