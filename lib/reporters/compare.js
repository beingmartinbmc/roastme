// Compare two health-score results side-by-side.

/**
 * Compare two repo health results.
 * @param {{name:string, health:Object}} left
 * @param {{name:string, health:Object}} right
 * @returns {{winner:string, deltas:Object, summary:string}}
 */
function compareRepos(left, right) {
  const a = left.health.scores || {};
  const b = right.health.scores || {};
  const dimensions = ['codeQuality', 'architecture', 'readability', 'security', 'dependencies', 'overall'];
  const deltas = {};
  let aWins = 0;
  let bWins = 0;

  dimensions.forEach(dim => {
    const av = numeric(a[dim]);
    const bv = numeric(b[dim]);
    deltas[dim] = { left: av, right: bv, diff: round1(av - bv) };
    if (av > bv) aWins += 1;
    else if (bv > av) bWins += 1;
  });

  const winner = aWins === bWins ? 'tie' : (aWins > bWins ? left.name : right.name);
  const summary = winner === 'tie'
    ? `${left.name} and ${right.name} tied. Equally suspect.`
    : `${winner} wins ${Math.max(aWins, bWins)} of ${dimensions.length} dimensions.`;

  return { winner, deltas, summary };
}

/**
 * Render a textual side-by-side compare report.
 * @param {{name:string, health:Object}} left
 * @param {{name:string, health:Object}} right
 * @returns {string}
 */
function renderCompare(left, right) {
  const cmp = compareRepos(left, right);
  const lines = [];
  lines.push(`Comparing: ${left.name}  vs  ${right.name}`);
  lines.push('-'.repeat(60));
  Object.entries(cmp.deltas).forEach(([dim, d]) => {
    const arrow = d.diff > 0 ? '←' : d.diff < 0 ? '→' : '=';
    lines.push(`${dim.padEnd(18)} ${String(d.left).padStart(5)}   ${arrow}   ${String(d.right).padStart(5)}   (Δ ${d.diff})`);
  });
  lines.push('-'.repeat(60));
  lines.push(`Verdict: ${cmp.summary}`);
  return lines.join('\n');
}

function numeric(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function round1(n) { return Math.round(n * 10) / 10; }

module.exports = { compareRepos, renderCompare };
