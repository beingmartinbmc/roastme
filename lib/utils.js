// Utility functions for RoastMe
// Centralized helpers to eliminate code duplication

const chalk = require('chalk').default;

/**
 * Count occurrences of issue types
 * @param {Array} issues - Array of code issues
 * @returns {Object} - Count of each issue type
 */
function countIssueTypes(issues) {
  const counts = {};
  issues.forEach(issue => {
    counts[issue.type] = (counts[issue.type] || 0) + 1;
  });
  return counts;
}

/**
 * Find the most common issue type
 * @param {Array} issues - Array of code issues
 * @returns {string} - Most common issue type
 */
function getMostCommonIssue(issues) {
  const counts = countIssueTypes(issues);
  return Object.keys(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b
  );
}

/**
 * Display roast with appropriate color based on mode
 * @param {string} roast - The roast message
 * @param {string} mode - Roast mode (gentle, savage, toxic)
 */
function displayRoast(roast, mode) {
  const colors = {
    gentle: chalk.blue,
    savage: chalk.yellow,
    toxic: chalk.red
  };
  
  const color = colors[mode] || chalk.white;
  console.log(`🤖 RoastBot: ${color(roast)}`);
}

/**
 * Generate timestamp for unique filenames
 * @returns {string} - Timestamp string
 */
function generateTimestamp() {
  return Date.now().toString();
}

/**
 * Create unique filename with timestamp
 * @param {string} prefix - File prefix
 * @param {string} extension - File extension
 * @returns {string} - Unique filename
 */
function createUniqueFilename(prefix = 'roast', extension = 'png') {
  return `${prefix}-${generateTimestamp()}.${extension}`;
}

/**
 * Safe JSON parsing with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed object or fallback
 */
function safeJsonParse(jsonString, fallback = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON, using fallback:', error.message);
    return fallback;
  }
}

/**
 * Validate and normalize configuration
 * @param {Object} config - User configuration
 * @returns {Object} - Normalized configuration
 */
function normalizeConfig(config = {}) {
  return {
    mode: config.mode || 'savage',
    engine: config.engine || 'static',
    model: config.model || 'llama2',
    generateMeme: config.generateMeme || false,
    ...config
  };
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
function formatFileSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if a value is empty or null
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty/null
 */
function isEmpty(value) {
  return value === null || value === undefined || 
         (typeof value === 'string' && value.trim() === '') ||
         (Array.isArray(value) && value.length === 0) ||
         (typeof value === 'object' && Object.keys(value).length === 0);
}

module.exports = {
  countIssueTypes,
  getMostCommonIssue,
  displayRoast,
  generateTimestamp,
  createUniqueFilename,
  safeJsonParse,
  normalizeConfig,
  formatFileSize,
  isEmpty
};
