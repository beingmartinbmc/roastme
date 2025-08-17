// Constants and configuration for RoastMe
// Centralized configuration to eliminate hardcoded values

const ROAST_MODES = {
  GENTLE: 'gentle',
  SAVAGE: 'savage',
  TOXIC: 'toxic'
};

const ENGINES = {
  STATIC: 'static',
  OPENAI: 'openai',
  OLLAMA: 'ollama'
};

const DEFAULT_CONFIG = {
  mode: ROAST_MODES.SAVAGE,
  engine: ENGINES.STATIC,
  model: 'llama2',
  generateMeme: false,
  maxFileSize: 1000000, // 1MB
  ci: false,
  targets: ['code', 'commit'],
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '*.min.js',
    '*.bundle.js',
    '*.map'
  ],
  enabledChecks: [
    'consoleLog',
    'nestedIfs',
    'longFunctions',
    'magicNumbers',
    'todoComments',
    'badVariableNames'
  ]
};

const MEME_CONFIG = {
  fontSize: 50,
  textColor: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 3,
  defaultTemplate: 'drake'
};

const FILE_PATTERNS = {
  IGNORE: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '*.min.js',
    '*.bundle.js',
    '*.map'
  ],
  SUPPORTED_EXTENSIONS: [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala'
  ]
};

const ISSUE_TYPES = {
  CONSOLE_LOG: 'consoleLog',
  NESTED_IFS: 'nestedIfs',
  LONG_FUNCTIONS: 'longFunctions',
  MAGIC_NUMBERS: 'magicNumbers',
  TODO_COMMENTS: 'todoComments',
  BAD_VARIABLE_NAMES: 'badVariableNames'
};

const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  OLLAMA: 'http://localhost:11434/api/chat',
  OLLAMA_TAGS: 'http://localhost:11434/api/tags'
};

const ERROR_MESSAGES = {
  FILE_NOT_FOUND: 'File not found. Even I can\'t roast what doesn\'t exist!',
  NO_GIT_REPO: 'No git repository found. Even I need some context to roast!',
  NO_STAGED_CHANGES: 'No staged changes found. Stage something first, then I\'ll roast it!',
  NO_ISSUES_FOUND: 'This code is actually... decent? I\'m as surprised as you are.',
  CLEAN_CODE: 'The code changes look surprisingly clean. Are you feeling okay?',
  MISSING_OPENAI_KEY: 'Missing OPENAI_API_KEY environment variable',
  OLLAMA_NOT_FOUND: 'Ollama not found or not running. Install it: https://ollama.ai'
};

const SUCCESS_MESSAGES = {
  MEME_CREATED: 'Meme created',
  ROAST_COMPLETE: 'Roast complete'
};

const UI_ELEMENTS = {
  EMOJIS: {
    ROBOT: '🤖',
    FIRE: '🔥',
    TARGET: '🎯',
    MEME: '🎭',
    CHECK: '✅',
    FOLDER: '📁',
    COMMIT: '📝',
    CHANGES: '📊'
  },
  COLORS: {
    PRIMARY: 'cyan',
    SECONDARY: 'dim',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red'
  }
};

module.exports = {
  ROAST_MODES,
  ENGINES,
  DEFAULT_CONFIG,
  MEME_CONFIG,
  FILE_PATTERNS,
  ISSUE_TYPES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_ELEMENTS
};
