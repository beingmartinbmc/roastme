const fs = require('fs-extra');
const path = require('path');

const DEFAULT_CONFIG = {
  mode: 'savage',
  targets: ['code', 'commit'],
  ci: false,
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '*.min.js',
    '*.bundle.js'
  ],
  maxFileSize: 1000000, // 1MB
  enabledChecks: [
    'consoleLog',
    'nestedIfs',
    'longFunctions',
    'magicNumbers',
    'todoComments'
  ]
};

async function loadConfig(configPath = '.roastmerc') {
  try {
    const fullPath = path.resolve(configPath);
    
    if (await fs.pathExists(fullPath)) {
      const configContent = await fs.readFile(fullPath, 'utf8');
      const userConfig = JSON.parse(configContent);
      
      // Merge with defaults
      return {
        ...DEFAULT_CONFIG,
        ...userConfig
      };
    }
  } catch (error) {
    console.warn(`Warning: Could not load config from ${configPath}:`, error.message);
  }
  
  return DEFAULT_CONFIG;
}

async function createDefaultConfig(configPath = '.roastmerc') {
  try {
    const fullPath = path.resolve(configPath);
    
    if (await fs.pathExists(fullPath)) {
      console.log(`Config file ${configPath} already exists.`);
      return false;
    }
    
    await fs.writeFile(fullPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log(`Created default config file: ${configPath}`);
    return true;
  } catch (error) {
    console.error(`Error creating config file:`, error.message);
    return false;
  }
}

function validateConfig(config) {
  const validModes = ['gentle', 'savage', 'toxic'];
  const validTargets = ['code', 'commit', 'staged'];
  const validChecks = [
    'consoleLog',
    'nestedIfs',
    'longFunctions',
    'magicNumbers',
    'todoComments'
  ];
  
  const errors = [];
  
  if (!validModes.includes(config.mode)) {
    errors.push(`Invalid mode: ${config.mode}. Must be one of: ${validModes.join(', ')}`);
  }
  
  if (!Array.isArray(config.targets)) {
    errors.push('targets must be an array');
  } else {
    config.targets.forEach(target => {
      if (!validTargets.includes(target)) {
        errors.push(`Invalid target: ${target}. Must be one of: ${validTargets.join(', ')}`);
      }
    });
  }
  
  if (!Array.isArray(config.enabledChecks)) {
    errors.push('enabledChecks must be an array');
  } else {
    config.enabledChecks.forEach(check => {
      if (!validChecks.includes(check)) {
        errors.push(`Invalid check: ${check}. Must be one of: ${validChecks.join(', ')}`);
      }
    });
  }
  
  if (typeof config.ci !== 'boolean') {
    errors.push('ci must be a boolean');
  }
  
  if (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0) {
    errors.push('maxFileSize must be a positive number');
  }
  
  return errors;
}

module.exports = {
  loadConfig,
  createDefaultConfig,
  validateConfig,
  DEFAULT_CONFIG
};
