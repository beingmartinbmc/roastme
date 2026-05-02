// Shareable Roast Card
// Renders a small text/SVG/JSON card from a health-score result.

/**
 * Render an ASCII shareable card.
 * @param {Object} health
 * @param {{title?:string, funniestLine?:string}} [opts]
 * @returns {string}
 */
function renderTextCard(health, opts = {}) {
  const title = opts.title || 'Repo Health Card';
  const fun = opts.funniestLine || '';
  const s = health.scores || {};
  const lines = [];
  lines.push('┌──────────────────────────────────────────────┐');
  lines.push(`│  🔥 ${pad(title, 41)}│`);
  lines.push('├──────────────────────────────────────────────┤');
  lines.push(`│  Overall            : ${score(s.overall)} / 10           │`);
  lines.push(`│  Code Quality       : ${score(s.codeQuality)} / 10           │`);
  lines.push(`│  Architecture       : ${score(s.architecture)} / 10           │`);
  lines.push(`│  Readability        : ${score(s.readability)} / 10           │`);
  lines.push(`│  Security           : ${score(s.security)} / 10           │`);
  lines.push(`│  Dependencies       : ${score(s.dependencies)} / 10           │`);
  lines.push(`│  Scalability Risk   : ${pad(s.scalabilityRisk || 'Unknown', 22)}│`);
  lines.push('├──────────────────────────────────────────────┤');
  if (fun) {
    chunk(fun, 42).forEach(l => lines.push(`│  ${pad(l, 42)}│`));
  }
  lines.push('└──────────────────────────────────────────────┘');
  return lines.join('\n');
}

/**
 * Render an SVG version of the card (for tweets / GitHub READMEs).
 * @param {Object} health
 * @param {{title?:string}} [opts]
 * @returns {string}
 */
function renderSvgCard(health, opts = {}) {
  const title = escapeXml(opts.title || 'Repo Health Card');
  const s = health.scores || {};
  const rows = [
    ['Overall', s.overall],
    ['Code Quality', s.codeQuality],
    ['Architecture', s.architecture],
    ['Readability', s.readability],
    ['Security', s.security],
    ['Dependencies', s.dependencies],
    ['Scalability Risk', s.scalabilityRisk]
  ];
  const lineSvg = rows.map(([label, value], i) => `
    <text x="24" y="${80 + i * 28}" font-family="monospace" font-size="16" fill="#e5e7eb">
      ${escapeXml(label)}: <tspan fill="#fbbf24">${escapeXml(String(value ?? '-'))}</tspan>
    </text>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="${80 + rows.length * 28 + 24}" viewBox="0 0 480 ${80 + rows.length * 28 + 24}">
    <rect width="100%" height="100%" rx="12" fill="#0f172a"/>
    <text x="24" y="40" font-family="sans-serif" font-size="22" fill="#f97316" font-weight="bold">🔥 ${title}</text>
    <line x1="24" y1="56" x2="456" y2="56" stroke="#1e293b" stroke-width="2"/>
    ${lineSvg}
  </svg>`;
}

/**
 * Build a JSON card payload (great for GitHub Action outputs).
 * @param {Object} health
 * @returns {Object}
 */
function renderJsonCard(health) {
  return {
    schema: 'roastme.card.v1',
    generatedAt: new Date().toISOString(),
    scores: health.scores || {},
    summary: health.summary || {}
  };
}

function pad(str, len) {
  const s = String(str ?? '');
  if (s.length >= len) return s.slice(0, len);
  return s + ' '.repeat(len - s.length);
}

function score(n) {
  if (n === null || n === undefined) return ' -  ';
  const s = Number(n).toFixed(1);
  return pad(s, 4);
}

function chunk(str, size) {
  const out = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { renderTextCard, renderSvgCard, renderJsonCard };
