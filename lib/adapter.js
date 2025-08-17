const { roastStatic } = require('./engines/static');
const { roastOpenAI } = require('./engines/openai');
const { roastOllama } = require('./engines/ollama');

async function roast(codeAnalysis, mode, context = '', engine = 'static', options = {}) {
  try {
    switch (engine) {
      case 'openai':
        return await roastOpenAI(codeAnalysis, mode, context, options.apiKey || process.env.OPENAI_API_KEY);
      case 'ollama':
        return await roastOllama(codeAnalysis, mode, context, options.model || 'llama2');
      case 'static':
      default:
        return roastStatic(codeAnalysis, mode, context);
    }
  } catch (error) {
    // Fallback to static if AI engine fails
    if (engine !== 'static') {
      console.log(`🤖 RoastBot: ${engine} engine failed, falling back to static: ${error.message}`);
      return roastStatic(codeAnalysis, mode, context);
    }
    throw error;
  }
}

async function checkEngineAvailability(engine) {
  switch (engine) {
    case 'static':
      return { available: true, description: 'Pre-written roasts with zero setup required' };
    case 'openai':
      const hasOpenAIKey = process.env.OPENAI_API_KEY;
      return { 
        available: !!hasOpenAIKey, 
        description: 'Cloud AI-powered roasts using OpenAI API',
        setup: hasOpenAIKey ? null : 'Set OPENAI_API_KEY environment variable'
      };
    case 'ollama':
      try {
        const response = await fetch('http://localhost:11434/api/tags');
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
      return { available: false, description: 'Unknown engine' };
  }
}

module.exports = { roast, checkEngineAvailability };
