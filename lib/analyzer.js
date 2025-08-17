const path = require('path');

function analyzeCode(content) {
  const issues = [];
  const lines = content.split('\n');
  
  // Analyze each line for patterns
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      return;
    }
    
    // Check for console.log statements
    if (trimmedLine.includes('console.log') || trimmedLine.includes('console.error') || trimmedLine.includes('console.warn')) {
      issues.push({
        type: 'consoleLog',
        line: lineNumber,
        description: 'Console logging detected',
        severity: 'medium'
      });
    }
    
    // Check for TODO comments
    if (trimmedLine.includes('TODO') || trimmedLine.includes('FIXME') || trimmedLine.includes('HACK')) {
      issues.push({
        type: 'todoComments',
        line: lineNumber,
        description: 'TODO/FIXME comment found',
        severity: 'low'
      });
    }
    
    // Check for magic numbers (standalone numbers that aren't 0, 1, or obvious constants)
    const magicNumberRegex = /\b([2-9]\d*|1\d+)\b/g;
    const matches = trimmedLine.match(magicNumberRegex);
    if (matches) {
      // Filter out common exceptions
      const exceptions = ['100', '1000', '1024', '200', '300', '400', '500', '404', '403', '401'];
      const magicNumbers = matches.filter(num => !exceptions.includes(num));
      
      if (magicNumbers.length > 0) {
        issues.push({
          type: 'magicNumbers',
          line: lineNumber,
          description: `Magic numbers found: ${magicNumbers.join(', ')}`,
          severity: 'medium'
        });
      }
    }
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
    summary: {
      totalIssues: issues.length,
      byType: issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {})
    }
  };
}

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
    if (!inFunction && (trimmedLine.includes('function ') || trimmedLine.includes('=>') || trimmedLine.includes('(') && trimmedLine.includes(')') && trimmedLine.includes('{'))) {
      inFunction = true;
      functionStartLine = lineNumber;
      functionName = extractFunctionName(trimmedLine);
      lineCount = 0;
      braceCount = 0;
    }
    
    if (inFunction) {
      lineCount++;
      
      // Count braces
      braceCount += (trimmedLine.match(/{/g) || []).length;
      braceCount -= (trimmedLine.match(/}/g) || []).length;
      
      // Function ended
      if (braceCount <= 0 && lineCount > 1) {
        inFunction = false;
        
        // Check function length
        if (lineCount > 20) {
          issues.push({
            type: 'longFunctions',
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

function analyzeNesting(content) {
  const issues = [];
  const lines = content.split('\n');
  
  let maxNesting = 0;
  let currentNesting = 0;
  let maxNestingLine = 0;
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Count opening braces
    const openingBraces = (trimmedLine.match(/{/g) || []).length;
    const closingBraces = (trimmedLine.match(/}/g) || []).length;
    
    currentNesting += openingBraces - closingBraces;
    
    if (currentNesting > maxNesting) {
      maxNesting = currentNesting;
      maxNestingLine = lineNumber;
    }
  });
  
  if (maxNesting > 4) {
    issues.push({
      type: 'nestedIfs',
      line: maxNestingLine,
      description: `Maximum nesting depth of ${maxNesting} levels`,
      severity: 'high'
    });
  }
  
  return issues;
}

function analyzeFileSize(content) {
  const lineCount = content.split('\n').length;
  
  if (lineCount > 500) {
    return {
      type: 'longFunctions', // Reuse this type for large files
      line: 1,
      description: `File is ${lineCount} lines long`,
      severity: 'medium'
    };
  }
  
  return null;
}

function extractFunctionName(line) {
  // Try to extract function name from various patterns
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

module.exports = {
  analyzeCode
};
