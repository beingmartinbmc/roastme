# 🔥 RoastMe

> Because your code deserves tough love.

A CLI tool that humorously roasts your code files, commit messages, and diffs. Perfect for code reviews, team bonding, and keeping your codebase honest.

## 🎯 Features

- **Multiple Roast Modes**: Gentle, Savage, and Toxic (for the brave)
- **Git Integration**: Roast commits, staged changes, and diffs
- **Smart Analysis**: Detects console.log spam, nested ifs, magic numbers, and more
- **Configurable**: Customize behavior with `.roastmerc`
- **CI/CD Ready**: Perfect for GitHub Actions and automated code reviews
- **Zero Dependencies**: No external AI services or API keys required

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
# Roast a specific file
npx roastme index.js

# Roast with different modes
npx roastme index.js --mode gentle
npx roastme index.js --mode savage
npx roastme index.js --mode toxic

# Roast your latest commit
npx roastme --commit

# Roast staged changes
npx roastme --staged
```

## 📖 Examples

### Roasting Code Files

```bash
$ npx roastme examples/bad-code.js
🔥 Roasting: examples/bad-code.js
Mode: SAVAGE

🤖 RoastBot: Console.log everywhere? Are you debugging or just lost?
🤖 RoastBot: These nested ifs are deeper than the Mariana Trench.
🤖 RoastBot: This function is doing everything except your laundry.

🎯 Overall Assessment:
🤖 RoastBot: This code is a masterpiece... of chaos.
```

### Roasting Commits

```bash
$ npx roastme --commit
🔥 Roasting Commit: a1b2c3d4
Mode: SAVAGE

📝 Commit Message:
"fix stuff"

🤖 RoastBot: This commit message is shorter than my attention span.

📊 Code Changes:
🤖 RoastBot: Console.log spam is not a debugging strategy, it's a cry for help.
```

## ⚙️ Configuration

Create a `.roastmerc` file in your project root:

```json
{
  "mode": "savage",
  "targets": ["code", "commit"],
  "ci": false,
  "ignorePatterns": [
    "node_modules/**",
    "dist/**",
    "*.min.js"
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
      - run: roastme --staged --mode savage
```

## 🎭 Roast Modes

### Gentle Mode
Playful hints and constructive criticism:
```
🤖 RoastBot: I see you're using console.log for debugging. Have you heard of proper logging libraries?
```

### Savage Mode
Brutal but fair roasts:
```
🤖 RoastBot: Console.log everywhere? Are you debugging or just lost?
```

### Toxic Mode
Unfiltered chaos (use responsibly):
```
🤖 RoastBot: Console.log spam? Are you 12? Learn to debug properly.
```

## 🔍 What Gets Roasted

The tool analyzes your code for:

- **Console.log spam**: Excessive debugging statements
- **Nested ifs**: Deeply nested conditional logic
- **Long functions**: Functions doing too much
- **Magic numbers**: Hardcoded numbers without context
- **TODO comments**: Procrastination markers
- **Large files**: Monolithic code files

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
│   └── config.js          # Configuration handling
├── examples/
│   └── bad-code.js        # Sample bad code for testing
├── .roastmerc             # Default config
├── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your roasts to `lib/roaster.js`
4. Test with `npm test`
5. Submit a pull request

### Adding New Roasts

Edit `lib/roaster.js` and add new roast templates:

```javascript
const ROAST_TEMPLATES = {
  savage: {
    newPattern: [
      "Your new pattern is as welcome as a bug in production.",
      "This pattern is so bad it should come with a warning label."
    ]
  }
}
```

## 📄 License

MIT License - feel free to roast responsibly!

## 🙏 Acknowledgments

- Inspired by the countless hours spent reviewing code
- Built with love and a healthy dose of sarcasm
- Special thanks to all the console.log statements that made this possible

---

**Remember**: This tool is for fun and learning. Use it to improve your code, not to hurt feelings! 🎭
