const path = require('path');
const { ISSUE_TYPES, FILE_PATTERNS } = require('./constants');

/**
 * Analyze code content for various issues
 * @param {string} content - Code content to analyze
 * @returns {Object} - Analysis results with issues and summary
 */
function analyzeCode(content) {
  const issues = [];
  const lines = content.split('\n');
  
  // Analyze each line for patterns
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      return;
    }
    
    // Check for TODO comments (even in comment lines)
    if (trimmedLine.includes('TODO') || trimmedLine.includes('FIXME') || trimmedLine.includes('HACK')) {
      issues.push({
        type: ISSUE_TYPES.TODO_COMMENTS,
        line: lineNumber,
        description: 'TODO/FIXME comment found',
        severity: 'low'
      });
    }
    
    // Skip code analysis for comment lines
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      return;
    }
    
    // Check for console.log statements
    if (trimmedLine.includes('console.log') || trimmedLine.includes('console.error') || trimmedLine.includes('console.warn')) {
      issues.push({
        type: ISSUE_TYPES.CONSOLE_LOG,
        line: lineNumber,
        description: 'Console logging detected',
        severity: 'medium'
      });
    }
    

    
    // Check for magic numbers
    const magicNumberIssues = detectMagicNumbers(trimmedLine, lineNumber);
    issues.push(...magicNumberIssues);
    
    // Check for bad variable names
    const badVariableIssues = detectBadVariableNames(trimmedLine, lineNumber);
    issues.push(...badVariableIssues);
  });
  
  // Analyze function complexity
  const functionAnalysis = analyzeFunctions(content);
  issues.push(...functionAnalysis);
  
  // Analyze nesting depth
  const nestingAnalysis = analyzeNesting(content);
  issues.push(...nestingAnalysis);
  
  // Analyze file size
  const fileSizeAnalysis = analyzeFileSize(content);
  if (fileSizeAnalysis) {
    issues.push(fileSizeAnalysis);
  }
  
  return {
    issues,
    summary: generateSummary(issues)
  };
}

/**
 * Detect magic numbers in a line
 * @param {string} line - Line to analyze
 * @param {number} lineNumber - Line number
 * @returns {Array} - Array of magic number issues
 */
function detectMagicNumbers(line, lineNumber) {
  const issues = [];
  const magicNumberRegex = /\b([2-9]\d*|1\d+)\b/g;
  const matches = line.match(magicNumberRegex);
  
  if (matches) {
    // Filter out common exceptions
    const exceptions = ['100', '1000', '1024', '200', '300', '400', '500', '404', '403', '401'];
    const magicNumbers = matches.filter(num => !exceptions.includes(num));
    
    if (magicNumbers.length > 0) {
      issues.push({
        type: ISSUE_TYPES.MAGIC_NUMBERS,
        line: lineNumber,
        description: `Magic numbers found: ${magicNumbers.join(', ')}`,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

/**
 * Detect bad variable names in a line
 * @param {string} line - Line to analyze
 * @param {number} lineNumber - Line number
 * @returns {Array} - Array of bad variable name issues
 */
function detectBadVariableNames(line, lineNumber) {
  const issues = [];
  const badVariableRegex = /\b(let|const|var)\s+(x|y|z|temp|data|stuff|thing|obj|arr|str|num)\b/g;
  const matches = line.match(badVariableRegex);
  
  if (matches) {
    issues.push({
      type: ISSUE_TYPES.BAD_VARIABLE_NAMES,
      line: lineNumber,
      description: `Poor variable naming: ${matches.join(', ')}`,
      severity: 'medium'
    });
  }
  
  return issues;
}

/**
 * Analyze functions for complexity issues
 * @param {string} content - Code content
 * @returns {Array} - Array of function-related issues
 */
function analyzeFunctions(content) {
  const issues = [];
  const lines = content.split('\n');
  
  let inFunction = false;
  let functionStartLine = 0;
  let functionName = '';
  let lineCount = 0;
  let braceCount = 0;
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Detect function start
    if (!inFunction && isFunctionStart(trimmedLine)) {
      inFunction = true;
      functionStartLine = lineNumber;
      functionName = extractFunctionName(trimmedLine);
      lineCount = 0;
      braceCount = 0;
    }
    
    if (inFunction) {
      lineCount++;
      braceCount += countBraces(trimmedLine);
      
      // Function ended
      if (braceCount <= 0 && lineCount > 1) {
        inFunction = false;
        
        // Check function length
        if (lineCount > 20) {
          issues.push({
            type: ISSUE_TYPES.LONG_FUNCTIONS,
            line: functionStartLine,
            description: `Function "${functionName}" is ${lineCount} lines long`,
            severity: 'high'
          });
        }
      }
    }
  });
  
  return issues;
}

/**
 * Check if a line starts a function
 * @param {string} line - Line to check
 * @returns {boolean} - True if function start
 */
function isFunctionStart(line) {
  return line.includes('function ') || 
         line.includes('=>') || 
         (line.includes('(') && line.includes(')') && line.includes('{'));
}

/**
 * Count opening and closing braces in a line
 * @param {string} line - Line to analyze
 * @returns {number} - Net brace count
 */
function countBraces(line) {
  const openingBraces = (line.match(/{/g) || []).length;
  const closingBraces = (line.match(/}/g) || []).length;
  return openingBraces - closingBraces;
}

/**
 * Analyze nesting depth
 * @param {string} content - Code content
 * @returns {Array} - Array of nesting issues
 */
function analyzeNesting(content) {
  const issues = [];
  const lines = content.split('\n');
  
  let maxNesting = 0;
  let currentNesting = 0;
  let maxNestingLine = 0;
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    currentNesting += countBraces(trimmedLine);
    
    if (currentNesting > maxNesting) {
      maxNesting = currentNesting;
      maxNestingLine = lineNumber;
    }
  });
  
  if (maxNesting > 4) {
    issues.push({
      type: ISSUE_TYPES.NESTED_IFS,
      line: maxNestingLine,
      description: `Maximum nesting depth of ${maxNesting} levels`,
      severity: 'high'
    });
  }
  
  return issues;
}

/**
 * Analyze file size
 * @param {string} content - Code content
 * @returns {Object|null} - File size issue or null
 */
function analyzeFileSize(content) {
  const lineCount = content.split('\n').length;
  
  if (lineCount > 500) {
    return {
      type: ISSUE_TYPES.LONG_FUNCTIONS, // Reuse this type for large files
      line: 1,
      description: `File is ${lineCount} lines long`,
      severity: 'medium'
    };
  }
  
  return null;
}

/**
 * Extract function name from line
 * @param {string} line - Line containing function
 * @returns {string} - Function name
 */
function extractFunctionName(line) {
  const patterns = [
    /function\s+(\w+)/,
    /(\w+)\s*[:=]\s*function/,
    /(\w+)\s*[:=]\s*\(/,
    /(\w+)\s*\(/
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return 'anonymous';
}

/**
 * Generate summary statistics from issues
 * @param {Array} issues - Array of issues
 * @returns {Object} - Summary object
 */
function generateSummary(issues) {
  return {
    totalIssues: issues.length,
    byType: issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {}),
    bySeverity: issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {})
  };
}

module.exports = {
  analyzeCode
};
