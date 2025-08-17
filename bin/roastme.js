#!/usr/bin/env node

const { program } = require('commander');
const { roastFile, roastCommit, roastStaged, listEngines } = require('../lib/roaster');
const { loadConfig } = require('../lib/config');

program
  .name('roastme')
  .description('Because your code deserves tough love. Roast your code files, commits, and diffs.')
  .version('1.0.0');

program
  .argument('[file]', 'File to roast')
  .option('-m, --mode <mode>', 'Roast mode: gentle, savage, toxic', 'savage')
  .option('-c, --commit', 'Roast the latest commit message and diff')
  .option('-s, --staged', 'Roast staged changes')
  .option('--config <path>', 'Path to config file', '.roastmerc')
  .option('-e, --engine <engine>', 'Roasting engine: static, ollama, openai', 'static')
  .option('--model <model>', 'AI model to use (for ollama engine)', 'llama2')
  .action(async (file, options) => {
    try {
      const config = await loadConfig(options.config);
      const mode = options.mode || config.mode || 'savage';
      const engine = options.engine || config.engine || 'static';

      // Update config with model if specified
      if (options.model) {
        config.model = options.model;
      }

      if (options.commit) {
        await roastCommit(mode, config, engine);
      } else if (options.staged) {
        await roastStaged(mode, config, engine);
      } else if (file) {
        await roastFile(file, mode, config, engine);
      } else {
        console.log('🤖 RoastBot: You need to specify a file, use --commit, or --staged. Even I can\'t roast nothing!');
        console.log('');
        console.log('Examples:');
        console.log('  npx roastme index.js');
        console.log('  npx roastme --commit --mode savage');
        console.log('  npx roastme --staged --engine ollama');
        console.log('  npx roastme bad-code.js --mode toxic --engine openai');
        console.log('  npx roastme "console.log(\'hello\')" --engine ollama --model mistral');
        process.exit(1);
      }
    } catch (error) {
      console.error('🤖 RoastBot: Something went wrong:', error.message);
      process.exit(1);
    }
  });

// Add a command to list available engines
program
  .command('engines')
  .description('List available roasting engines')
  .action(async () => {
    try {
      const engines = await listEngines();
      
      console.log('🤖 RoastBot: Available Engines\n');
      
      engines.forEach(engine => {
        const status = engine.available ? '✅' : '❌';
        console.log(`${status} ${engine.name.toUpperCase()}: ${engine.description}`);
        if (engine.setup) {
          console.log(`   Setup: ${engine.setup}`);
        }
      });
      
      console.log('\nUsage:');
      console.log('  npx roastme index.js --engine static');
      console.log('  npx roastme index.js --engine ollama --model mistral');
      console.log('  npx roastme index.js --engine openai');
      console.log('');
      console.log('Environment Variables:');
      console.log('  OPENAI_API_KEY=sk-xxx (for OpenAI engine)');
      console.log('  Ollama must be installed and running (for Ollama engine)');
      
    } catch (error) {
      console.error('Error listing engines:', error.message);
    }
  });

program.parse();
