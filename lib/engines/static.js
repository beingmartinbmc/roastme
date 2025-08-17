const { analyzeCode } = require('../analyzer');

function roastStatic(codeAnalysis, mode, context = '') {
    const roasts = {
      gentle: [
        "This code could use some love. And maybe some refactoring.",
        "I've seen worse, but I've also seen better.",
        "It works, but at what cost to readability?",
        "Consider this a gentle nudge toward better practices.",
        "Your code is like a puzzle - it works, but the pieces could fit better.",
        "This feels like a draft, not the final version.",
        "Readable… if I squint really hard.",
        "This code has potential… hiding somewhere deep inside.",
        "Not broken, just… fragile.",
        "Looks like code written by someone multitasking between Netflix episodes."
      ],
      savage: [
        "This code is a masterpiece... of chaos.",
        "It works, but so does duct tape on a broken car.",
        "I've seen better code written by a cat walking on a keyboard.",
        "Your linter just rage quit.",
        "This looks like it was written in Notepad at 3am.",
        "Did you mean to write code or abstract art?",
        "This could pass as an example of what NOT to do.",
        "The bug reports will write themselves.",
        "Future maintainers will need therapy.",
        "This is the reason Stack Overflow exists."
      ],
      toxic: [
        "This code is what happens when you let a monkey write software.",
        "It works, but so does a broken clock twice a day.",
        "I've seen better code written by someone who just learned what a computer is.",
        "Your IDE is probably having an existential crisis.",
        "This code is so bad it should come with a warning label.",
        "Did you write this with your eyes closed?",
        "Burn it. Start over. Don’t look back.",
        "This isn’t spaghetti code—it’s a whole Italian buffet.",
        "If code crimes were real, you'd be serving life.",
        "This belongs in a museum… under 'What Went Wrong'."
      ]
    };
  
    const modeRoasts = roasts[mode] || roasts.savage;
    return modeRoasts[Math.floor(Math.random() * modeRoasts.length)];
  }
  


module.exports = { roastStatic };
