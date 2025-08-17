const { execSync } = require('child_process');

async function roastOllama(codeAnalysis, mode, context = '', model = 'llama2') {
  const prompt = `Roast this code in ${mode} mode. Be funny and brutal but accurate.

Code Analysis:
${JSON.stringify(codeAnalysis, null, 2)}

Context: ${context}

Keep the roast under 200 characters and make it memorable!`;

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
