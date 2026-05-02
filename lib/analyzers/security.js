// Security analyzer
// Detects hardcoded secrets, unsafe patterns, weak crypto, and bad auth logic.

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/, severity: 'critical' },
  { name: 'AWS Secret Key', regex: /aws(.{0,20})?(secret|access)?[_-]?key[\s:='"]+([A-Za-z0-9/+=]{40})/i, severity: 'critical' },
  { name: 'Generic API Key', regex: /\b(api[_-]?key|apikey)\s*[:=]\s*["']([A-Za-z0-9_\-]{20,})["']/i, severity: 'high' },
  { name: 'Bearer Token', regex: /\b(bearer\s+[A-Za-z0-9._\-]{20,})/i, severity: 'high' },
  { name: 'Slack Token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}/, severity: 'critical' },
  { name: 'GitHub Token', regex: /\bghp_[A-Za-z0-9]{30,}\b/, severity: 'critical' },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/, severity: 'critical' },
  { name: 'Hardcoded Password', regex: /\b(password|passwd|pwd)\s*[:=]\s*["']([^"'\s]{4,})["']/i, severity: 'high' },
  { name: 'JWT Secret', regex: /\b(jwt[_-]?secret|jwt_key)\s*[:=]\s*["']([^"']{6,})["']/i, severity: 'high' }
];

const UNSAFE_PATTERNS = [
  { name: 'eval()', regex: /\beval\s*\(/, severity: 'critical', advice: 'Avoid eval — it is an arbitrary code execution risk.' },
  { name: 'new Function()', regex: /\bnew\s+Function\s*\(/, severity: 'high', advice: 'Dynamic Function constructors enable code injection.' },
  { name: 'child_process.exec', regex: /\b(child_process\.)?exec\s*\(/, severity: 'high', advice: 'Use execFile/spawn with args to avoid shell injection.' },
  { name: 'Unsafe Regex (catastrophic)', regex: /\(\.\*\)\+|\(\.\+\)\+|\(\\w\+\)\+/, severity: 'medium', advice: 'Possible ReDoS pattern.' },
  { name: 'Math.random for crypto', regex: /Math\.random\s*\(\s*\).{0,30}(token|secret|password|key|nonce|salt|otp)/i, severity: 'high', advice: 'Use crypto.randomBytes for security tokens.' },
  { name: 'Weak hash MD5', regex: /createHash\s*\(\s*["']md5["']\s*\)/i, severity: 'medium', advice: 'MD5 is broken — use SHA-256 or bcrypt/argon2 for passwords.' },
  { name: 'Weak hash SHA1', regex: /createHash\s*\(\s*["']sha1["']\s*\)/i, severity: 'medium', advice: 'SHA-1 is deprecated.' },
  { name: 'HTTP (not HTTPS)', regex: /["']http:\/\/(?!localhost|127\.|0\.0\.0\.0)/i, severity: 'low', advice: 'Use HTTPS for external endpoints.' },
  { name: 'innerHTML assignment', regex: /\.innerHTML\s*=/, severity: 'medium', advice: 'innerHTML can introduce XSS — prefer textContent or sanitize input.' },
  { name: 'document.write', regex: /\bdocument\.write\s*\(/, severity: 'medium', advice: 'document.write is unsafe and deprecated.' },
  { name: 'SQL string concat', regex: /(SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,80}["'`]\s*\+\s*\w+/i, severity: 'high', advice: 'Use parameterized queries to prevent SQL injection.' },
  { name: 'Disabled TLS verification', regex: /rejectUnauthorized\s*:\s*false/, severity: 'high', advice: 'Disabling TLS verification exposes you to MITM attacks.' }
];

const BAD_AUTH_PATTERNS = [
  { name: 'Plain text password compare', regex: /password\s*===?\s*["'][^"']+["']/i, severity: 'critical', advice: 'Never compare passwords against literals — use hashed comparison.' },
  { name: 'Password logged', regex: /console\.(log|info|debug|warn|error)\s*\([^)]*password/i, severity: 'high', advice: 'Do not log passwords or secrets.' },
  { name: 'No auth check', regex: /\/\/\s*TODO\s*[:\-]?\s*(add|implement)\s*auth/i, severity: 'medium', advice: 'Authentication TODO left in code.' }
];

/**
 * Scan content for hardcoded secrets.
 * @param {string} content
 * @returns {Array}
 */
function detectSecrets(content) {
  return scanPatterns(content, SECRET_PATTERNS, 'secret');
}

/**
 * Scan content for unsafe coding patterns.
 * @param {string} content
 * @returns {Array}
 */
function detectUnsafePatterns(content) {
  return scanPatterns(content, UNSAFE_PATTERNS, 'unsafe');
}

/**
 * Scan content for bad authentication logic.
 * @param {string} content
 * @returns {Array}
 */
function detectAuthIssues(content) {
  return scanPatterns(content, BAD_AUTH_PATTERNS, 'auth');
}

/**
 * Common scanner over a list of patterns.
 * @param {string} content
 * @param {Array} patterns
 * @param {string} category
 * @returns {Array}
 */
function scanPatterns(content, patterns, category) {
  if (typeof content !== 'string' || content.length === 0) {
    return [];
  }
  const lines = content.split('\n');
  const findings = [];

  patterns.forEach(p => {
    lines.forEach((line, idx) => {
      if (p.regex.test(line)) {
        findings.push({
          category,
          name: p.name,
          severity: p.severity,
          line: idx + 1,
          snippet: truncate(line.trim(), 160),
          advice: p.advice
        });
      }
    });
  });

  return findings;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

/**
 * Run the full security scan on a file's content.
 * @param {string} content
 * @returns {{findings: Array, score: number, summary: Object}}
 */
function analyzeSecurity(content) {
  const findings = [
    ...detectSecrets(content),
    ...detectUnsafePatterns(content),
    ...detectAuthIssues(content)
  ];
  const summary = summarize(findings);
  const score = computeSecurityScore(summary);
  return { findings, summary, score };
}

function summarize(findings) {
  const summary = { total: findings.length, bySeverity: {}, byCategory: {} };
  findings.forEach(f => {
    summary.bySeverity[f.severity] = (summary.bySeverity[f.severity] || 0) + 1;
    summary.byCategory[f.category] = (summary.byCategory[f.category] || 0) + 1;
  });
  return summary;
}

const SEVERITY_WEIGHTS = { critical: 4, high: 2.5, medium: 1.2, low: 0.6 };

function computeSecurityScore(summary) {
  const penalty = Object.entries(summary.bySeverity || {}).reduce((acc, [sev, count]) => {
    return acc + (SEVERITY_WEIGHTS[sev] || 0) * count;
  }, 0);
  const score = Math.max(0, 10 - penalty);
  return Math.round(score * 10) / 10;
}

module.exports = {
  SECRET_PATTERNS,
  UNSAFE_PATTERNS,
  BAD_AUTH_PATTERNS,
  detectSecrets,
  detectUnsafePatterns,
  detectAuthIssues,
  analyzeSecurity,
  computeSecurityScore
};
