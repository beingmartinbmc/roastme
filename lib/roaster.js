const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk').default;
const { getGitInfo, getStagedChanges } = require('./git');
const { analyzeCode } = require('./analyzer');
const { roast, checkEngineAvailability } = require('./adapter');

function displayRoast(roast, mode) {
  const colors = {
    gentle: chalk.blue,
    savage: chalk.yellow,
    toxic: chalk.red
  };
  
  const color = colors[mode] || chalk.white;
  console.log(`🤖 RoastBot: ${color(roast)}`);
}

async function roastFile(filePath, mode, config, engineName = 'static') {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!await fs.pathExists(fullPath)) {
      console.log(`🤖 RoastBot: File not found. Even I can't roast what doesn't exist!`);
      return;
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const analysis = analyzeCode(content);
    
    console.log(chalk.bold(`\n🔥 Roasting: ${chalk.cyan(filePath)}`));
    console.log(chalk.dim(`Mode: ${mode.toUpperCase()}`));
    console.log(chalk.dim(`Engine: ${engineName.toUpperCase()}\n`));

    if (analysis.issues.length === 0) {
      console.log('🤖 RoastBot: This code is actually... decent? I\'m as surprised as you are.');
      return;
    }

    // Generate roast using the adapter
    const roastResult = await roast(analysis, mode, content, engineName, {
      model: config.model || 'llama2'
    });
    
    console.log(chalk.bold('🎯 Roast:'));
    displayRoast(roastResult, mode);

  } catch (error) {
    console.error(`🤖 RoastBot: Failed to roast ${filePath}:`, error.message);
  }
}

async function roastCommit(mode, config, engineName = 'static') {
  try {
    const gitInfo = await getGitInfo();
    
    if (!gitInfo) {
      console.log('🤖 RoastBot: No git repository found. Even I need some context to roast!');
      return;
    }

    console.log(chalk.bold(`\n🔥 Roasting Commit: ${chalk.cyan(gitInfo.hash)}`));
    console.log(chalk.dim(`Mode: ${mode.toUpperCase()}`));
    console.log(chalk.dim(`Engine: ${engineName.toUpperCase()}\n`));

    // Roast commit message
    console.log(chalk.bold('📝 Commit Message:'));
    console.log(chalk.cyan(`"${gitInfo.message}"`));
    
    // Create a simple analysis for the commit
    const commitAnalysis = {
      issues: [],
      summary: {
        totalIssues: 0,
        byType: {},
        bySeverity: {}
      }
    };

    // Generate roast for commit message
    const messageRoast = await roast(commitAnalysis, mode, `Commit: ${gitInfo.message}`, engineName, {
      model: config.model || 'llama2'
    });
    
    console.log('');
    displayRoast(messageRoast, mode);

    // If there are code changes, analyze and roast them
    if (gitInfo.diff) {
      console.log(chalk.bold('\n📊 Code Changes:'));
      const diffAnalysis = analyzeCode(gitInfo.diff);
      
      if (diffAnalysis.issues.length > 0) {
        const diffRoast = await roast(diffAnalysis, mode, 'Code changes in commit', engineName, {
          model: config.model || 'llama2'
        });
        displayRoast(diffRoast, mode);
      } else {
        console.log('🤖 RoastBot: The code changes look surprisingly clean. Are you feeling okay?');
      }
    }

  } catch (error) {
    console.error('🤖 RoastBot: Failed to roast commit:', error.message);
  }
}

async function roastStaged(mode, config, engineName = 'static') {
  try {
    const stagedChanges = await getStagedChanges();
    
    if (!stagedChanges || stagedChanges.length === 0) {
      console.log('🤖 RoastBot: No staged changes found. Stage something first, then I\'ll roast it!');
      return;
    }

    console.log(chalk.bold(`\n🔥 Roasting Staged Changes`));
    console.log(chalk.dim(`Mode: ${mode.toUpperCase()}`));
    console.log(chalk.dim(`Engine: ${engineName.toUpperCase()}\n`));

    for (const file of stagedChanges) {
      await roastFile(file, mode, config, engineName);
    }

  } catch (error) {
    console.error('🤖 RoastBot: Failed to roast staged changes:', error.message);
  }
}

// Engine management functions
async function listEngines() {
  const engines = ['static', 'ollama', 'openai'];
  const available = [];
  
  for (const engine of engines) {
    const info = await checkEngineAvailability(engine);
    available.push({
      name: engine,
      ...info
    });
  }
  
  return available;
}

module.exports = {
  roastFile,
  roastCommit,
  roastStaged,
  listEngines
};
