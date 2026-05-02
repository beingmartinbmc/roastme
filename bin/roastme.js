#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { roastFile, roastCommit, roastStaged, listEngines } = require('../lib/roaster');
const { loadConfig } = require('../lib/config');
const { normalizeConfig } = require('../lib/utils');
const { ENGINES, ROAST_MODES, UI_ELEMENTS } = require('../lib/constants');
const {
  scoreCommand,
  analyzeRepo,
  eli5Command,
  resumeCommand,
  fixCommand,
  seriousCommand,
  cardCommand,
  compareCommand,
  tonesCommand
} = require('../lib/commands');
const { listTones, isValidTone, describeTone } = require('../lib/tones');

const CLI_CONFIG = {
  name: 'roastme',
  description: 'Because your code deserves tough love. Roast, score, and improve repos and files.',
  version: '2.0.0'
};

function showUsageExamples() {
  const lines = [
    `${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: pick a command, soldier.`,
    '',
    'Examples:',
    '  npx roastme roast index.js',
    '  npx roastme roast --commit --tone savage',
    '  npx roastme roast --staged --engine ollama',
    '  npx roastme score .',
    '  npx roastme analyze .',
    '  npx roastme eli5 .',
    '  npx roastme resume .',
    '  npx roastme fix bad-code.js',
    '  npx roastme serious bad-code.js',
    '  npx roastme card . --format svg --out card.svg',
    '  npx roastme compare ./repo-a ./repo-b',
    '  npx roastme tones'
  ];
  console.log(lines.join('\n'));
}

function displayEngines(engines) {
  console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Available Engines\n`);
  engines.forEach(engine => {
    const status = engine.available ? '✅' : '❌';
    console.log(`${status} ${engine.name.toUpperCase()}: ${engine.description}`);
    if (engine.setup) console.log(`   Setup: ${engine.setup}`);
  });
}

async function handleRoast(file, options) {
  try {
    const config = await loadConfig(options.config);
    const tone = options.tone || config.tone || options.mode || config.mode || 'savage';
    const mode = (options.mode || config.mode || 'savage').toLowerCase();
    const normalizedConfig = normalizeConfig({
      ...config,
      tone,
      mode,
      engine: options.engine || config.engine,
      model: options.model || config.model,
      generateMeme: options.meme || config.generateMeme
    });
    if (options.commit) {
      await roastCommit(mode, normalizedConfig, normalizedConfig.engine);
    } else if (options.staged) {
      await roastStaged(mode, normalizedConfig, normalizedConfig.engine);
    } else if (file) {
      await roastFile(file, mode, normalizedConfig, normalizedConfig.engine);
    } else {
      showUsageExamples();
      process.exit(1);
    }
  } catch (error) {
    console.error(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Something went wrong:`, error.message);
    process.exit(1);
  }
}

async function handleEngines() {
  try {
    const engines = await listEngines();
    displayEngines(engines);
  } catch (error) {
    console.error('Error listing engines:', error.message);
  }
}

function handleScore(target, options) {
  const repoPath = path.resolve(target || '.');
  const result = scoreCommand(repoPath);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  printScore(result);
  if (options.failOn !== undefined && result.scores.overall < Number(options.failOn)) {
    process.exit(1);
  }
}

function printScore(result) {
  const s = result.scores;
  console.log(`🔥 RoastMe Repo Health Score`);
  console.log(`──────────────────────────────`);
  console.log(`Overall          : ${s.overall.toFixed(1)} / 10`);
  console.log(`Code Quality     : ${s.codeQuality.toFixed(1)} / 10`);
  console.log(`Architecture     : ${s.architecture.toFixed(1)} / 10`);
  console.log(`Readability      : ${s.readability.toFixed(1)} / 10`);
  console.log(`Security         : ${s.security.toFixed(1)} / 10`);
  console.log(`Dependencies     : ${s.dependencies.toFixed(1)} / 10`);
  console.log(`Scalability Risk : ${s.scalabilityRisk}`);
  console.log('');
  const sum = result.summary;
  console.log(`Files: ${sum.fileCount}, Lines: ${sum.totalLines}, Issues: ${sum.totalIssues}, Cycles: ${sum.circularDependencies}, Tech-debt: ${sum.techDebtItems}`);
}

function handleAnalyze(target, options) {
  const repoPath = path.resolve(target || '.');
  const result = analyzeRepo(repoPath);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  printScore(result.health);
  console.log('\nPatterns:');
  if (result.patterns.length === 0) console.log('  (none detected)');
  result.patterns.forEach(p => console.log(`  • [${p.pattern}] ${p.snark}`));
  console.log('\nSecurity findings:', result.security.findings.length);
  console.log('Architecture findings:', result.architecture.findings.length);
  console.log('Circular dependencies:', result.architecture.circularDependencies.length);
  if (result.dependencies) {
    console.log('\nDependency critique:');
    result.dependencies.findings.forEach(f => console.log(`  • ${f.snark || f.detail}`));
  }
}

function handleEli5(target) {
  const repoPath = path.resolve(target || '.');
  const result = eli5Command(repoPath);
  console.log('🧒 ELI5\n──────');
  console.log(result.eli5);
  console.log('\n🔥 But also...\n──────────');
  console.log(result.roast);
}

function handleResume(target) {
  const repoPath = path.resolve(target || '.');
  const result = resumeCommand(repoPath);
  console.log('📄 Resume Bullets\n────────────────');
  console.log(`Summary: ${result.summary}\n`);
  result.bullets.forEach(b => console.log(`• ${b}`));
}

function handleFix(file) {
  const filePath = path.resolve(file);
  const { rendered, suggestions } = fixCommand(filePath);
  console.log(`🔧 Fix Suggestions for ${file} (${suggestions.length})\n`);
  console.log(rendered);
}

function handleSerious(target) {
  const filePath = path.resolve(target);
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    const result = analyzeRepo(filePath);
    printScore(result.health);
    return;
  }
  const { rendered } = seriousCommand(filePath);
  console.log(`🧑‍💻 Serious Review: ${target}\n`);
  console.log(rendered);
}

function handleCard(target, options) {
  const repoPath = path.resolve(target || '.');
  const card = cardCommand(repoPath, { title: options.title });
  const format = options.format || 'text';
  let payload;
  if (format === 'svg') payload = card.svg;
  else if (format === 'json') payload = JSON.stringify(card.json, null, 2);
  else payload = card.text;
  if (options.out) {
    fs.writeFileSync(options.out, payload);
    console.log(`Wrote card → ${options.out}`);
  } else {
    console.log(payload);
  }
}

function handleCompare(left, right) {
  const result = compareCommand(path.resolve(left), path.resolve(right));
  console.log(result.rendered);
}

function handleTones(name) {
  const result = tonesCommand(name);
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.tones) {
    console.log('Available tones:');
    result.tones.forEach(t => console.log(`  • ${t}`));
    return;
  }
  console.log(describeTone(name));
}

program.name(CLI_CONFIG.name).description(CLI_CONFIG.description).version(CLI_CONFIG.version);

program
  .command('roast [file]', { isDefault: true })
  .description('Roast a file, commit, or staged changes')
  .option('-m, --mode <mode>', `Roast mode: ${Object.values(ROAST_MODES).join(', ')}`, ROAST_MODES.SAVAGE)
  .option('--tone <tone>', `Tone: ${listTones().join(', ')}`)
  .option('-c, --commit', 'Roast the latest commit message and diff')
  .option('-s, --staged', 'Roast staged changes')
  .option('--config <path>', 'Path to config file', '.roastmerc')
  .option('-e, --engine <engine>', `Roasting engine: ${Object.values(ENGINES).join(', ')}`, ENGINES.STATIC)
  .option('--model <model>', 'AI model to use (for ollama engine)', 'llama2')
  .option('--meme', 'Generate a funny meme based on the roast', false)
  .action((file, options) => {
    if (options.tone && !isValidTone(options.tone)) {
      console.error(`Invalid tone "${options.tone}". Valid: ${listTones().join(', ')}`);
      process.exit(1);
    }
    handleRoast(file, options);
  });

program.command('engines').description('List available roasting engines').action(handleEngines);

program
  .command('score [path]')
  .description('Compute repo health scorecard')
  .option('--json', 'Output JSON', false)
  .option('--fail-on <threshold>', 'Exit non-zero if overall score < threshold')
  .action(handleScore);

program
  .command('analyze [path]')
  .description('Run a full architecture/security/pattern analysis')
  .option('--json', 'Output JSON', false)
  .action(handleAnalyze);

program.command('eli5 [path]').description('Explain Like I\'m 5 + a roast').action(handleEli5);
program.command('resume [path]').description('Generate resume bullet points from a repo').action(handleResume);
program.command('fix <file>').description('Generate before/after refactor suggestions').action(handleFix);
program.command('serious <pathOrFile>').description('Pure professional review (no roast)').action(handleSerious);

program
  .command('card [path]')
  .description('Build a shareable repo health card')
  .option('--format <fmt>', 'text | svg | json', 'text')
  .option('--out <file>', 'Write to file instead of stdout')
  .option('--title <title>', 'Card title')
  .action(handleCard);

program.command('compare <left> <right>').description('Compare two repos side-by-side').action(handleCompare);
program.command('tones [name]').description('List or describe available tones').action(handleTones);

if (process.argv.length <= 2) {
  showUsageExamples();
  process.exit(0);
}

program.parse();
