// Pattern detection engine
// Heuristic detection of architectural & boilerplate patterns to give RoastMe personality.

/**
 * Detect simple, popular patterns from a set of files.
 * @param {Object<string,string>} files map of relative path -> content
 * @returns {Array<{pattern:string, confidence:number, reason:string, snark:string}>}
 */
function detectPatterns(files = {}) {
  const detected = [];
  const paths = Object.keys(files);
  const lowerPaths = paths.map(p => p.toLowerCase());

  // MVC boilerplate
  const hasControllers = lowerPaths.some(p => p.includes('/controllers/') || p.includes('controller.js'));
  const hasModels = lowerPaths.some(p => p.includes('/models/') || p.includes('model.js'));
  const hasViews = lowerPaths.some(p => p.includes('/views/') || p.includes('view.js') || p.includes('.ejs') || p.includes('.hbs'));
  if (hasControllers && hasModels && (hasViews || lowerPaths.some(p => p.includes('/routes/')))) {
    detected.push({
      pattern: 'MVC Boilerplate',
      confidence: 0.9,
      reason: 'Found controllers/, models/, and views or routes folders.',
      snark: 'This repo is just MVC boilerplate dressed up in different filenames.'
    });
  }

  // Custom queue / event bus
  const text = Object.values(files).join('\n').toLowerCase();
  if (/class\s+\w*queue\b/.test(text) || /function\s+enqueue|function\s+dequeue/.test(text)) {
    detected.push({
      pattern: 'Reinvented Queue',
      confidence: 0.7,
      reason: 'Custom queue/enqueue/dequeue implementation detected.',
      snark: 'You reinvented a queue. Badly.'
    });
  }

  // Custom logger
  if (/class\s+\w*logger\b/.test(text) && !text.includes('winston') && !text.includes('pino')) {
    detected.push({
      pattern: 'Reinvented Logger',
      confidence: 0.6,
      reason: 'Custom Logger class without winston/pino.',
      snark: 'console.log was right there. You really wanted to suffer.'
    });
  }

  // Excessive util/helper grab-bag
  const utilFiles = lowerPaths.filter(p => /\b(utils?|helpers?|common|misc)\b/.test(p));
  if (utilFiles.length >= 3) {
    detected.push({
      pattern: 'Util Junk Drawer',
      confidence: 0.65,
      reason: `${utilFiles.length} util/helper modules detected.`,
      snark: 'utils.js is where good code goes to die.'
    });
  }

  // Singleton pattern abuse
  if (/getinstance\s*\(\s*\)/.test(text)) {
    detected.push({
      pattern: 'Singleton Abuse',
      confidence: 0.55,
      reason: 'getInstance() pattern detected.',
      snark: 'Singletons: globals wearing a tuxedo.'
    });
  }

  // Callback hell
  const callbackHell = Object.values(files).some(c =>
    /\)\s*=>\s*\{[\s\S]{0,200}\)\s*=>\s*\{[\s\S]{0,200}\)\s*=>\s*\{/.test(c)
  );
  if (callbackHell) {
    detected.push({
      pattern: 'Callback Hell',
      confidence: 0.7,
      reason: 'Three or more nested callback arrows detected.',
      snark: 'Promises and async/await have entered the chat. They left disappointed.'
    });
  }

  // Express boilerplate
  if (/require\(["']express["']\)/.test(text) || /from\s+["']express["']/.test(text)) {
    detected.push({
      pattern: 'Express Boilerplate',
      confidence: 0.8,
      reason: 'Express imports found.',
      snark: 'Another Express app. The world thanks you for the redundancy.'
    });
  }

  // Test absence
  const testFiles = lowerPaths.filter(p => /(\btest\b|\bspec\b|__tests__)/.test(p));
  if (paths.length > 5 && testFiles.length === 0) {
    detected.push({
      pattern: 'No Tests',
      confidence: 0.95,
      reason: 'No test files detected anywhere.',
      snark: '"It works on my machine" is not a deployment strategy.'
    });
  }

  // Mixed module systems
  const usesCommonJS = /module\.exports/.test(text) || /\brequire\s*\(/.test(text);
  const usesESM = /\bexport\s+default\b|\bexport\s+const\b|\bimport\s+\w+\s+from/.test(text);
  if (usesCommonJS && usesESM) {
    detected.push({
      pattern: 'Module System Mashup',
      confidence: 0.75,
      reason: 'Both CommonJS and ESM syntax detected.',
      snark: 'Pick a module system, any module system. Just one.'
    });
  }

  return detected;
}

module.exports = { detectPatterns };
