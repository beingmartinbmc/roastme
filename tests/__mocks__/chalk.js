// Minimal jest mock for the ESM-only chalk@5.
const identity = (s) => s;
const chalk = identity;
chalk.bold = identity;
chalk.dim = identity;
chalk.cyan = identity;
chalk.green = identity;
chalk.yellow = identity;
chalk.red = identity;
chalk.blue = identity;
chalk.white = identity;
chalk.magenta = identity;
chalk.gray = identity;
chalk.default = chalk;
module.exports = chalk;
module.exports.default = chalk;
