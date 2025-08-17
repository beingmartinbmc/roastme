const { ROAST_PROMPTS } = require('../prompts');

async function roastOllama(codeAnalysis, mode, context = '', model = 'llama2') {
  // Use the context as the actual code content
  const codeContent = context || 'Code analysis provided';
  
  const prompt = ROAST_PROMPTS.roast(codeContent, mode);

  try {
    // Use Ollama's chat API
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are RoastBot, an AI that humorously roasts code. Be ${mode} in your criticism.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: mode === 'toxic' ? 0.9 : mode === 'savage' ? 0.7 : 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content.trim();
  } catch (error) {
    throw new Error("Ollama not found or not running. Install it: https://ollama.ai");
  }
}

module.exports = { roastOllama };
