# 🔥 RoastMe

> Because your code deserves tough love.

A CLI tool that humorously roasts your code files, commit messages, and diffs with AI-powered savagery. Perfect for code reviews, team bonding, and keeping your codebase honest.

## 🎯 Features

- **Multiple Roast Modes**: Gentle, Savage, and Toxic (for the brave)
- **Multiple AI Engines**: Static (zero setup), OpenAI (cloud AI), Ollama (local AI)
- **Git Integration**: Roast commits, staged changes, and diffs
- **Smart Analysis**: Detects console.log spam, nested ifs, magic numbers, and more
- **Meme Generation**: Create hilarious memes based on your code issues
- **Configurable**: Customize behavior with `.roastmerc`
- **CI/CD Ready**: Perfect for GitHub Actions and automated code reviews
- **Graceful Fallback**: AI engines fail? Falls back to static roasts automatically

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g roastme

# Or use npx (recommended)
npx roastme [file]
```

### Basic Usage

```bash
# Roast a specific file (uses static engine by default)
npx roastme index.js

# Roast with different modes
npx roastme index.js --mode gentle
npx roastme index.js --mode savage
npx roastme index.js --mode toxic

# Use AI-powered roasting (OpenAI)
npx roastme index.js --engine openai

# Use local AI (Ollama)
npx roastme index.js --engine ollama

# Roast your latest commit
npx roastme --commit

# Roast staged changes
npx roastme --staged

# Generate a meme based on your code
npx roastme index.js --meme

# List available engines
npx roastme engines
```

## 🎭 Roast Modes

### Gentle Mode
Playful hints and constructive criticism:
```
🤖 RoastBot: This code could use some love. And maybe some refactoring.
```

### Savage Mode (Default)
Brutal but fair roasts:
```
🤖 RoastBot: This code is a masterpiece... of chaos.
```

### Toxic Mode
Unfiltered chaos (use responsibly):
```
🤖 RoastBot: This code is what happens when you let a monkey write software.
```

## 🤖 AI Engines

### Static Engine (Default)
- **Zero setup required** - works out of the box
- **Pre-written roasts** - consistent and reliable
- **Perfect for CI/CD** - no external dependencies

### OpenAI Engine
- **AI-powered roasts** - contextual and creative
- **Easy setup** - just set your API key

#### Setup OpenAI
1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set it as an environment variable:
   ```bash
   export OPENAI_API_KEY="sk-your-api-key-here"
   ```
3. Use it:
   ```bash
   npx roastme index.js --engine openai
   ```

### Ollama Engine
- **Local AI** - runs on your machine
- **Privacy-focused** - no data leaves your system
- **Free to use** - no API costs

#### Setup Ollama
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model:
   ```bash
   ollama pull llama2
   ```
3. Use it:
   ```bash
   npx roastme index.js --engine ollama --model llama2
   ```

## 🎭 Meme Generation

RoastMe can generate hilarious memes based on your code issues! Perfect for sharing on social media or team chats.

### Basic Meme Generation

```bash
# Generate meme with static engine (default)
npx roastme index.js --meme

# Generate meme with AI-powered captions
npx roastme index.js --engine openai --meme

# Generate meme with local AI
npx roastme index.js --engine ollama --meme
```

### Available Meme Templates

RoastMe automatically selects the best meme template based on your code issues:

| Template | Description | Best For |
|----------|-------------|----------|
| **drake** | Drake Hotline Bling | Good vs Bad comparisons |
| **doge** | Much wow, very doge | General humor and terrible code |
| **distracted-boyfriend** | Distracted boyfriend | Choosing between options |
| **two-buttons** | Two buttons meme | Decision making scenarios |
| **change-my-mind** | Steven Crowder format | Controversial opinions |
| **one-does-not-simply** | Boromir meme | Impossible tasks |

## 📖 Examples

### Roasting Code Files

```bash
# Static engine (default)
$ npx roastme examples/bad-code.js
🔥 Roasting: examples/bad-code.js
Mode: SAVAGE
Engine: STATIC

🤖 RoastBot: Console.log everywhere? Are you debugging or just lost?
🤖 RoastBot: These nested ifs are deeper than the Mariana Trench.
🤖 RoastBot: This function is doing everything except your laundry.

🎯 Overall Assessment:
🤖 RoastBot: This code is a masterpiece... of chaos.

# AI-powered roasting
$ npx roastme examples/bad-code.js --engine openai
🔥 Roasting: examples/bad-code.js
Mode: SAVAGE
Engine: OPENAI

🎯 Roast:
🤖 RoastBot: Congratulations, you've successfully created the coding equivalent of a migraine—repetitive, pointless, and deeply confusing. The nested conditionals are so deep even a submarine would get claustrophobic, and your variable names are as inspiring as a toddler's grocery list.
```

### Roasting Commits

```bash
$ npx roastme --commit --engine openai
🔥 Roasting Commit: a43d2856
Mode: SAVAGE
Engine: OPENAI

📝 Commit Message:
"fixed bug lol"

🤖 RoastBot: Congratulations, your commit message is so informative it leaves future developers questioning if you were trying to write code or just invent a new form of hieroglyphics.
```

### Meme Generation Examples

```bash
# Static engine meme (pre-written captions)
$ npx roastme examples/bad-code.js --meme --mode savage
🔥 Roasting: examples/bad-code.js
Mode: SAVAGE
Engine: STATIC

🎯 Roast:
🤖 RoastBot: This code is a masterpiece... of chaos.

🎭 Generating Meme...
✅ Meme created: roast-meme-1234567890.png
   Template: drake
   Caption: "Use constants" / "Magic numbers everywhere"
   📁 Saved to: roast-meme-1234567890.png

# OpenAI AI-powered meme (dynamic captions)
$ npx roastme examples/terrible-code.js --engine openai --meme --mode toxic
🔥 Roasting: examples/terrible-code.js
Mode: TOXIC
Engine: OPENAI

🎯 Roast:
🤖 RoastBot: Your code is so lazy, even a sloth would refuse to copy-paste those 10 console.logs.

🎭 Generating Meme...
✅ Meme created: roast-meme-1234567891.png
   Template: doge
   Caption: "Much TODOs" / "Very Lazy"
   📁 Saved to: roast-meme-1234567891.png
```

## 🔍 What Gets Roasted

The tool analyzes your code for:

- **Console.log spam**: Excessive debugging statements
- **Nested ifs**: Deeply nested conditional logic
- **Long functions**: Functions doing too much
- **Magic numbers**: Hardcoded numbers without context
- **TODO comments**: Procrastination markers
- **Large files**: Monolithic code files

## ⚙️ Configuration

Create a `.roastmerc` file in your project root:

```json
{
  "mode": "savage",
  "targets": ["code", "commit"],
  "ci": false,
  "generateMeme": false,
  "ignorePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".git/**",
    "*.min.js",
    "*.bundle.js"
  ],
  "maxFileSize": 1000000,
  "enabledChecks": [
    "consoleLog",
    "nestedIfs",
    "longFunctions",
    "magicNumbers",
    "todoComments"
  ]
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | `"savage"` | Roast intensity: `gentle`, `savage`, `toxic` |
| `targets` | array | `["code", "commit"]` | What to roast: `code`, `commit`, `staged` |
| `ci` | boolean | `false` | CI mode (less verbose output) |
| `generateMeme` | boolean | `false` | Generate meme with roast |
| `ignorePatterns` | array | `["node_modules/**", ...]` | Files to ignore |
| `maxFileSize` | number | `1000000` | Maximum file size to analyze (bytes) |
| `enabledChecks` | array | `["consoleLog", ...]` | Which checks to run |

## 🔧 Git Integration

### Git Hooks

Add to your `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npx roastme --staged --mode savage
```

### GitHub Actions

Create `.github/workflows/roast.yml`:

```yaml
name: Roast PR
on: [pull_request]

jobs:
  roast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g roastme
      # Static engine (no API keys needed)
      - run: roastme --staged --mode savage
      
      # Or with AI and memes (requires secrets)
      # - run: roastme --staged --mode savage --engine openai --meme
      #   env:
      #     OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 🚀 Advanced Usage

### CLI Options

```bash
# Engine selection
--engine static          # Static roasts (default)
--engine openai          # OpenAI AI-powered roasts
--engine ollama          # Local Ollama AI roasts

# Model selection (for AI engines)
--model gpt-4o-mini      # OpenAI model (default)
--model llama2           # Ollama model (default)

# Mode selection
--mode gentle            # Playful criticism
--mode savage            # Brutal honesty
--mode toxic             # Unfiltered chaos

# Meme generation
--meme                   # Generate meme based on roast

# Git integration
--commit                 # Roast latest commit
--staged                 # Roast staged changes

# Configuration
--config .roastmerc      # Custom config file
```

## 🛠️ Development

### Local Development

```bash
# Clone and install
git clone <repo>
cd roastme
npm install

# Make executable
chmod +x bin/roastme.js

# Run locally
./bin/roastme.js index.js

# Test with AI engines
./bin/roastme.js examples/terrible-code.js --engine openai
./bin/roastme.js examples/terrible-code.js --engine ollama
```

### Project Structure

```
roastme/
├── bin/
│   └── roastme.js          # CLI entry point
├── lib/
│   ├── roaster.js          # Main roasting logic
│   ├── analyzer.js         # Code analysis
│   ├── git.js             # Git integration
│   ├── config.js          # Configuration handling
│   ├── adapter.js         # AI engine adapter
│   ├── prompts.js         # AI prompt templates
│   └── engines/
│       ├── static.js      # Static roast engine
│       ├── openai.js      # OpenAI AI engine
│       └── ollama.js      # Ollama AI engine
├── examples/
│   ├── bad-code.js        # Sample bad code for testing
│   └── terrible-code.js   # Terrible code examples
├── .roastmerc             # Default config
├── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your roasts or improvements
4. Test with the existing examples
5. Submit a pull request

### Adding New Roasts

#### Static Roasts
Edit `lib/engines/static.js` and add new roast templates:

```javascript
const roasts = {
  savage: [
    // ... existing roasts ...
    "Your new pattern is as welcome as a bug in production.",
    "This pattern is so bad it should come with a warning label."
  ]
}
```

#### AI Prompts
Edit `lib/prompts.js` to customize AI roasting behavior:

```javascript
const prompts = {
  roast: (code, mode = "savage") => `
    // Customize the AI prompt template
    You are RoastBot, a legendary code critic...
  `
}
```

## 📄 License

MIT License - feel free to roast responsibly!

## 🙏 Acknowledgments

- Inspired by the countless hours spent reviewing code
- Built with love and a healthy dose of sarcasm
- Special thanks to all the console.log statements that made this possible
- Powered by AI engines that are as savage as they are smart

---

**Remember**: This tool is for fun and learning. Use it to improve your code, not to hurt feelings! 🎭

**🔒 Privacy**: Your code and API keys are handled securely. OpenAI API calls use industry-standard encryption, and Ollama runs entirely on your local machine.
