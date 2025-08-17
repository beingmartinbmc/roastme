const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk').default;
const { getGitInfo, getStagedChanges } = require('./git');
const { analyzeCode } = require('./analyzer');
const { roast, checkEngineAvailability } = require('./adapter');
const { createRoastMeme } = require('./meme-generator');
const { displayRoast, normalizeConfig } = require('./utils');
const { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  UI_ELEMENTS, 
  ENGINES,
  ROAST_MODES 
} = require('./constants');

/**
 * Roast a single file
 * @param {string} filePath - Path to the file to roast
 * @param {string} mode - Roast mode
 * @param {Object} config - Configuration object
 * @param {string} engineName - Roasting engine
 */
async function roastFile(filePath, mode, config, engineName = ENGINES.STATIC) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!await fs.pathExists(fullPath)) {
      console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: ${ERROR_MESSAGES.FILE_NOT_FOUND}`);
      return;
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const analysis = analyzeCode(content);
    
    console.log(chalk.bold(`\n${UI_ELEMENTS.EMOJIS.FIRE} Roasting: ${chalk.cyan(filePath)}`));
    console.log(chalk.dim(`Mode: ${mode.toUpperCase()}`));
    console.log(chalk.dim(`Engine: ${engineName.toUpperCase()}\n`));

    if (analysis.issues.length === 0) {
      console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: ${ERROR_MESSAGES.NO_ISSUES_FOUND}`);
      return;
    }

    // Generate roast using the adapter
    const roastResult = await roast(analysis, mode, content, engineName, {
      model: config.model || 'llama2'
    });
    
    console.log(chalk.bold(`${UI_ELEMENTS.EMOJIS.TARGET} Roast:`));
    displayRoast(roastResult, mode);

    // Generate meme if enabled
    if (analysis.issues.length > 0 && config.generateMeme) {
      await generateMemeForIssues(analysis.issues, mode, config, engineName);
    }

  } catch (error) {
    console.error(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Failed to roast ${filePath}:`, error.message);
  }
}

/**
 * Generate meme for code issues
 * @param {Array} issues - Code issues
 * @param {string} mode - Roast mode
 * @param {Object} config - Configuration
 * @param {string} engineName - Engine name
 */
async function generateMemeForIssues(issues, mode, config, engineName) {
  console.log(chalk.bold(`\n${UI_ELEMENTS.EMOJIS.MEME} Generating Meme...`));
  const meme = await createRoastMeme(issues, mode, './', engineName, {
    model: config.model || 'llama2',
    apiKey: process.env.OPENAI_API_KEY
  });
  
  if (meme) {
    console.log(chalk.green(`${UI_ELEMENTS.EMOJIS.CHECK} ${SUCCESS_MESSAGES.MEME_CREATED}: ${chalk.bold(meme.filename)}`));
    console.log(chalk.dim(`   Template: ${meme.template}`));
    console.log(chalk.dim(`   Caption: "${meme.topText}" / "${meme.bottomText}"`));
    console.log(chalk.cyan(`   ${UI_ELEMENTS.EMOJIS.FOLDER} Saved to: ${meme.filepath}`));
  }
}

/**
 * Roast the latest commit
 * @param {string} mode - Roast mode
 * @param {Object} config - Configuration object
 * @param {string} engineName - Roasting engine
 */
async function roastCommit(mode, config, engineName = ENGINES.STATIC) {
  try {
    const gitInfo = await getGitInfo();
    
    if (!gitInfo) {
      console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: ${ERROR_MESSAGES.NO_GIT_REPO}`);
      return;
    }

    console.log(chalk.bold(`\n${UI_ELEMENTS.EMOJIS.FIRE} Roasting Commit: ${chalk.cyan(gitInfo.hash)}`));
    console.log(chalk.dim(`Mode: ${mode.toUpperCase()}`));
    console.log(chalk.dim(`Engine: ${engineName.toUpperCase()}\n`));

    // Roast commit message
    console.log(chalk.bold(`${UI_ELEMENTS.EMOJIS.COMMIT} Commit Message:`));
    console.log(chalk.cyan(`"${gitInfo.message}"`));
    
    const commitAnalysis = { issues: [], summary: { totalIssues: 0, byType: {}, bySeverity: {} } };
    const messageRoast = await roast(commitAnalysis, mode, `Commit: ${gitInfo.message}`, engineName, {
      model: config.model || 'llama2'
    });
    
    console.log('');
    displayRoast(messageRoast, mode);

    // Roast code changes if available
    if (gitInfo.diff) {
      await roastCodeChanges(gitInfo.diff, mode, config, engineName);
    }

  } catch (error) {
    console.error(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Failed to roast commit:`, error.message);
  }
}

/**
 * Roast code changes from diff
 * @param {string} diff - Git diff content
 * @param {string} mode - Roast mode
 * @param {Object} config - Configuration
 * @param {string} engineName - Engine name
 */
async function roastCodeChanges(diff, mode, config, engineName) {
  console.log(chalk.bold(`\n${UI_ELEMENTS.EMOJIS.CHANGES} Code Changes:`));
  const diffAnalysis = analyzeCode(diff);
  
  if (diffAnalysis.issues.length > 0) {
    const diffRoast = await roast(diffAnalysis, mode, 'Code changes in commit', engineName, {
      model: config.model || 'llama2'
    });
    displayRoast(diffRoast, mode);
  } else {
    console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: ${ERROR_MESSAGES.CLEAN_CODE}`);
  }
}

/**
 * Roast staged changes
 * @param {string} mode - Roast mode
 * @param {Object} config - Configuration object
 * @param {string} engineName - Roasting engine
 */
async function roastStaged(mode, config, engineName = ENGINES.STATIC) {
  try {
    const stagedChanges = await getStagedChanges();
    
    if (!stagedChanges || stagedChanges.length === 0) {
      console.log(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: ${ERROR_MESSAGES.NO_STAGED_CHANGES}`);
      return;
    }

    console.log(chalk.bold(`\n${UI_ELEMENTS.EMOJIS.FIRE} Roasting Staged Changes`));
    console.log(chalk.dim(`Mode: ${mode.toUpperCase()}`));
    console.log(chalk.dim(`Engine: ${engineName.toUpperCase()}\n`));

    for (const file of stagedChanges) {
      await roastFile(file, mode, config, engineName);
    }

  } catch (error) {
    console.error(`${UI_ELEMENTS.EMOJIS.ROBOT} RoastBot: Failed to roast staged changes:`, error.message);
  }
}

/**
 * List available engines with their status
 * @returns {Array} - Array of engine information
 */
async function listEngines() {
  const engines = [ENGINES.STATIC, ENGINES.OLLAMA, ENGINES.OPENAI];
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
