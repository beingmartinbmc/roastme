const prompts = require('../prompts');

async function roastOpenAI(codeAnalysis, mode, context = '', apiKey) {
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  // Use the context as the actual code content
  const codeContent = context || 'Code analysis provided';
  
  const prompt = prompts.roast(codeContent, mode);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
              body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: mode === 'toxic' ? 0.9 : mode === 'savage' ? 0.7 : 0.5,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    throw new Error(`OpenAI generation failed: ${error.message}`);
  }
}

module.exports = { roastOpenAI };
