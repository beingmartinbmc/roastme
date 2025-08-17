const { roastStatic } = require('./engines/static');
const { roastOpenAI } = require('./engines/openai');
const { roastOllama } = require('./engines/ollama');
const { ENGINES, API_ENDPOINTS, ERROR_MESSAGES } = require('./constants');

/**
 * Roast code using the specified engine
 * @param {Object} codeAnalysis - Code analysis results
 * @param {string} mode - Roast mode
 * @param {string} context - Additional context
 * @param {string} engine - Engine to use
 * @param {Object} options - Engine-specific options
 * @returns {string} - Generated roast
 */
async function roast(codeAnalysis, mode, context = '', engine = ENGINES.STATIC, options = {}) {
  try {
    switch (engine) {
      case ENGINES.OPENAI:
        return await roastOpenAI(codeAnalysis, mode, context, options.apiKey || process.env.OPENAI_API_KEY);
      case ENGINES.OLLAMA:
        return await roastOllama(codeAnalysis, mode, context, options.model || 'llama2');
      case ENGINES.STATIC:
      default:
        return roastStatic(codeAnalysis, mode, context);
    }
  } catch (error) {
    // Fallback to static if AI engine fails
    if (engine !== ENGINES.STATIC) {
      console.log(`🤖 RoastBot: ${engine} engine failed, falling back to static: ${error.message}`);
      return roastStatic(codeAnalysis, mode, context);
    }
    throw error;
  }
}

/**
 * Check if an engine is available
 * @param {string} engine - Engine to check
 * @returns {Object} - Engine availability info
 */
async function checkEngineAvailability(engine) {
  switch (engine) {
    case ENGINES.STATIC:
      return { 
        available: true, 
        description: 'Pre-written roasts with zero setup required' 
      };
      
    case ENGINES.OPENAI:
      const hasOpenAIKey = process.env.OPENAI_API_KEY;
      return { 
        available: !!hasOpenAIKey, 
        description: 'Cloud AI-powered roasts using OpenAI API',
        setup: hasOpenAIKey ? null : 'Set OPENAI_API_KEY environment variable'
      };
      
    case ENGINES.OLLAMA:
      try {
        const response = await fetch(API_ENDPOINTS.OLLAMA_TAGS);
        const available = response.ok;
        return { 
          available, 
          description: 'Local AI-powered roasts using Ollama',
          setup: available ? null : 'Install and start Ollama: https://ollama.ai'
        };
      } catch {
        return { 
          available: false, 
          description: 'Local AI-powered roasts using Ollama',
          setup: 'Install and start Ollama: https://ollama.ai'
        };
      }
      
    default:
      return { 
        available: false, 
        description: 'Unknown engine' 
      };
  }
}

module.exports = { roast, checkEngineAvailability };
