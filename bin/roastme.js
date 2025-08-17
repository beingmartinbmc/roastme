#!/usr/bin/env node

const { program } = require('commander');
const { roastFile, roastCommit, roastStaged, listEngines } = require('../lib/roaster');
const { loadConfig } = require('../lib/config');
const { normalizeConfig } = require('../lib/utils');
const { ENGINES, ROAST_MODES, UI_ELEMENTS, ERROR_MESSAGES } = require('../lib/constants');

// CLI configuration
const CLI_CONFIG = {
  name: 'roastme',
  description: 'Because your code deserves tough love. Roast your code files, commits, and diffs.',
  version: '1.0.0',
  examples: [
    'npx roastme index.js',
    'npx roastme --commit --mode savage',
    'npx roastme --staged --engine ollama',
    'npx roastme bad-code.js --mode toxic --engine openai',
    'npx roastme "console.log(\'hello\')" --engine ollama --model mistral',
    'npx roastme bad-code.js --engine openai --meme'
  ]
};

/**
 * Display usage examples
 */
function showUsageExamples() {
  console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: You need to specify a file, use --commit, or --staged. Even I can't roast nothing!`);
  console.log('');
  console.log('Examples:');
  CLI_CONFIG.examples.forEach(example => {
    console.log(`  ${example}`);
  });
}

/**
 * Display engine information
 * @param {Array} engines - Array of engine info
 */
function displayEngines(engines) {
  console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Available Engines\n`);
  
  engines.forEach(engine => {
    const status = engine.available ? '✅' : '❌';
    console.log(`${status} ${engine.name.toUpperCase()}: ${engine.description}`);
    if (engine.setup) {
      console.log(`   Setup: ${engine.setup}`);
    }
  });
  
  console.log('\nUsage:');
  console.log(`  npx roastme index.js --engine ${ENGINES.STATIC}`);
  console.log(`  npx roastme index.js --engine ${ENGINES.OLLAMA} --model mistral`);
  console.log(`  npx roastme index.js --engine ${ENGINES.OPENAI}`);
  console.log('');
  console.log('Environment Variables:');
  console.log('  OPENAI_API_KEY=sk-xxx (for OpenAI engine)');
  console.log('  Ollama must be installed and running (for Ollama engine)');
}

/**
 * Main action handler
 * @param {string} file - File to roast
 * @param {Object} options - CLI options
 */
async function handleRoast(file, options) {
  try {
    const config = await loadConfig(options.config);
    const normalizedConfig = normalizeConfig({
      ...config,
      mode: options.mode || config.mode,
      engine: options.engine || config.engine,
      model: options.model || config.model,
      generateMeme: options.meme || config.generateMeme
    });

    if (options.commit) {
      await roastCommit(normalizedConfig.mode, normalizedConfig, normalizedConfig.engine);
    } else if (options.staged) {
      await roastStaged(normalizedConfig.mode, normalizedConfig, normalizedConfig.engine);
    } else if (file) {
      await roastFile(file, normalizedConfig.mode, normalizedConfig, normalizedConfig.engine);
    } else {
      showUsageExamples();
      process.exit(1);
    }
  } catch (error) {
    console.error(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Something went wrong:`, error.message);
    process.exit(1);
  }
}

/**
 * Handle engines command
 */
async function handleEngines() {
  try {
    const engines = await listEngines();
    displayEngines(engines);
  } catch (error) {
    console.error('Error listing engines:', error.message);
  }
}

// Setup CLI program
program
  .name(CLI_CONFIG.name)
  .description(CLI_CONFIG.description)
  .version(CLI_CONFIG.version);

program
  .argument('[file]', 'File to roast')
  .option('-m, --mode <mode>', `Roast mode: ${Object.values(ROAST_MODES).join(', ')}`, ROAST_MODES.SAVAGE)
  .option('-c, --commit', 'Roast the latest commit message and diff')
  .option('-s, --staged', 'Roast staged changes')
  .option('--config <path>', 'Path to config file', '.roastmerc')
  .option('-e, --engine <engine>', `Roasting engine: ${Object.values(ENGINES).join(', ')}`, ENGINES.STATIC)
  .option('--model <model>', 'AI model to use (for ollama engine)', 'llama2')
  .option('--meme', 'Generate a funny meme based on the roast', false)
  .action(handleRoast);

// Add engines command
program
  .command('engines')
  .description('List available roasting engines')
  .action(handleEngines);

program.parse();
