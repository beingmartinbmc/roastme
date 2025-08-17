const { generateMeme, getAvailableTemplates } = require('meme-as-a-service');
const fs = require('fs-extra');
const path = require('path');
const { MEME_PROMPTS } = require('./prompts');
const { STATIC_MEME_CAPTIONS, STATIC_MEME_TEMPLATES } = require('./static-prompts');
const { getMostCommonIssue, createUniqueFilename, safeJsonParse } = require('./utils');
const { MEME_CONFIG, ERROR_MESSAGES, UI_ELEMENTS } = require('./constants');

/**
 * Select appropriate meme template based on code issues
 * @param {Array} codeIssues - Array of code issues
 * @returns {Object} - Selected template object
 */
function selectMemeTemplate(codeIssues) {
  try {
    const availableTemplates = getAvailableTemplates();
    const mostCommonIssue = getMostCommonIssue(codeIssues);
    
    // Filter available templates
    const templates = Object.values(STATIC_MEME_TEMPLATES).filter(template => 
      availableTemplates.includes(template.name)
    );
    
    // Find suitable templates for the most common issue
    const suitableTemplates = templates.filter(template => 
      template.goodFor.some(keyword => {
        const normalizedKeyword = keyword.replace(/\s+/g, '').toLowerCase();
        const normalizedIssue = mostCommonIssue.toLowerCase();
        return normalizedIssue.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedIssue);
      })
    );

    if (suitableTemplates.length > 0) {
      // Randomly select from suitable templates
      return suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)];
    }
    // Fallback to random template or drake
    return templates.length > 0 ? templates[Math.floor(Math.random() * templates.length)] : STATIC_MEME_TEMPLATES.drake;
  } catch (error) {
    console.warn('Could not get available templates, using default:', error.message);
    return STATIC_MEME_TEMPLATES.drake;
  }
}

/**
 * Select meme template using AI
 * @param {Array} codeIssues - Array of code issues
 * @param {string} mode - Roast mode
 * @param {Object} aiOptions - AI engine options
 * @returns {Object} - Selected template
 */
async function selectAITemplate(codeIssues, mode, aiOptions) {
  try {
    const prompt = MEME_PROMPTS.selectTemplate(codeIssues, mode);
    const { roast } = require('./adapter');
    
    const aiResponse = await roast(codeIssues, mode, prompt, aiOptions.engine || 'openai', {
      model: aiOptions.model || 'gpt-4.1-nano',
      apiKey: aiOptions.apiKey
    });

    const result = safeJsonParse(aiResponse, { template: 'drake' });
    const templateName = result.template || 'drake';
    
    // Validate template name
    const availableTemplates = getAvailableTemplates();
    if (!availableTemplates.includes(templateName)) {
      console.warn(`AI selected invalid template '${templateName}', falling back to drake`);
      return STATIC_MEME_TEMPLATES.drake;
    }
    
    return STATIC_MEME_TEMPLATES[templateName] || STATIC_MEME_TEMPLATES.drake;
  } catch (error) {
    console.error('Failed to select AI template:', error.message);
    return STATIC_MEME_TEMPLATES.drake;
  }
}

/**
 * Generate meme captions using AI engine
 * @param {Array} codeIssues - Array of code issues
 * @param {string} mode - Roast mode
 * @param {Object} template - Meme template
 * @param {Object} aiOptions - AI engine options
 * @returns {Object} - Caption configuration
 */
async function generateAIMemeCaptions(codeIssues, mode, template, aiOptions) {
  try {
    const prompt = MEME_PROMPTS.generateCaptions(codeIssues, mode, template);
    const { roast } = require('./adapter');
    
    const aiResponse = await roast(codeIssues, mode, prompt, aiOptions.engine || 'openai', {
      model: aiOptions.model || 'gpt-4.1-nano',
      apiKey: aiOptions.apiKey
    });

    const captions = safeJsonParse(aiResponse, { topText: 'Good code', bottomText: 'Bad code' });
    
    return {
      template: template.name,
      topText: captions.topText || 'Good code',
      bottomText: captions.bottomText || 'Bad code'
    };
  } catch (error) {
    console.error('Failed to generate AI meme captions:', error.message);
    return {
      template: template.name,
      topText: 'Good code',
      bottomText: 'Bad code'
    };
  }
}

/**
 * Generate meme captions (AI or static)
 * @param {Array} codeIssues - Array of code issues
 * @param {string} mode - Roast mode
 * @param {string} engine - Roasting engine
 * @param {Object} aiOptions - AI engine options
 * @returns {Object} - Caption configuration
 */
async function generateMemeCaptions(codeIssues, mode = 'savage', engine = 'static', aiOptions = {}) {
  const mostCommonIssue = getMostCommonIssue(codeIssues);

  // Use AI for AI engines, static for static engine
  if (engine === 'openai' || engine === 'ollama') {
    // Let AI choose the best template
    const template = await selectAITemplate(codeIssues, mode, aiOptions);
    return await generateAIMemeCaptions(codeIssues, mode, template, aiOptions);
  }

  // Static engine: use static template selection and captions
  const template = selectMemeTemplate(codeIssues);
  const captions = STATIC_MEME_CAPTIONS[mostCommonIssue] || STATIC_MEME_CAPTIONS.consoleLog;
  const templateCaptions = captions[template.name] || captions.drake;

  // Add mode-specific emojis
  const emojiPrefix = mode === 'toxic' ? { top: '🔥 ', bottom: '💀 ' } :
                     mode === 'gentle' ? { top: '💡 ', bottom: '🤔 ' } :
                     { top: '', bottom: '' };

  return {
    template: template.name,
    topText: emojiPrefix.top + templateCaptions.top,
    bottomText: emojiPrefix.bottom + templateCaptions.bottom
  };
}

/**
 * Create a roast meme
 * @param {Array} codeIssues - Array of code issues
 * @param {string} mode - Roast mode
 * @param {string} outputDir - Output directory
 * @param {string} engine - Roasting engine
 * @param {Object} aiOptions - AI engine options
 * @returns {Object|null} - Meme result or null if failed
 */
async function createRoastMeme(codeIssues, mode = 'savage', outputDir = './', engine = 'static', aiOptions = {}) {
  try {
    if (!codeIssues || codeIssues.length === 0) {
      return null;
    }

    const memeConfig = await generateMemeCaptions(codeIssues, mode, engine, aiOptions);
    
    // Generate meme with centralized config
    const memeBuffer = await generateMeme({
      template: memeConfig.template,
      topText: memeConfig.topText,
      bottomText: memeConfig.bottomText,
      fontSize: MEME_CONFIG.fontSize,
      textColor: MEME_CONFIG.textColor,
      strokeColor: MEME_CONFIG.strokeColor,
      strokeWidth: MEME_CONFIG.strokeWidth
    });

    // Save meme with unique filename
    const filename = createUniqueFilename('roast-meme', 'png');
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, memeBuffer);
    
    return {
      filepath,
      filename,
      template: memeConfig.template,
      topText: memeConfig.topText,
      bottomText: memeConfig.bottomText
    };
  } catch (error) {
    console.error('Failed to generate meme:', error.message);
    return null;
  }
}

module.exports = {
  createRoastMeme,
  generateMemeCaptions,
  generateAIMemeCaptions,
  selectAITemplate,
  selectMemeTemplate
};
