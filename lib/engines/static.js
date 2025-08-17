const { STATIC_ROASTS } = require('../static-prompts');

function roastStatic(codeAnalysis, mode, context = '') {
  const modeRoasts = STATIC_ROASTS[mode] || STATIC_ROASTS.savage;
  return modeRoasts[Math.floor(Math.random() * modeRoasts.length)];
}

module.exports = { roastStatic };
