// Static prompts and hardcoded content for RoastMe
// Used for static engine and fallback content

const STATIC_ROASTS = {
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
    "Burn it. Start over. Don't look back.",
    "This isn't spaghetti code—it's a whole Italian buffet.",
    "If code crimes were real, you'd be serving life.",
    "This belongs in a museum… under 'What Went Wrong'."
  ]
};

const STATIC_MEME_CAPTIONS = {
  consoleLog: {
    drake: {
      top: 'Write proper logging',
      bottom: 'Console.log everywhere'
    },
    doge: {
      top: 'Much debugging',
      bottom: 'Very console.log spam'
    },
    distractedBoyfriend: {
      top: 'Proper logging library',
      bottom: 'Console.log statements'
    }
  },
  magicNumbers: {
    drake: {
      top: 'Use constants',
      bottom: 'Magic numbers everywhere'
    },
    doge: {
      top: 'Much constants',
      bottom: 'Very magic numbers'
    },
    changeMyMind: {
      top: 'Change my mind',
      bottom: 'Magic numbers are fine'
    }
  },
  nestedIfs: {
    drake: {
      top: 'Clean code',
      bottom: 'Nested if hell'
    },
    doge: {
      top: 'Much nesting',
      bottom: 'Very spaghetti'
    },
    oneDoesNotSimply: {
      top: 'One does not simply',
      bottom: 'Navigate nested ifs'
    }
  },
  badVariableNames: {
    drake: {
      top: 'Descriptive names',
      bottom: 'x, y, z, temp, data'
    },
    doge: {
      top: 'Much naming',
      bottom: 'Very confusion'
    },
    twoButtons: {
      top: 'Good variable names',
      bottom: 'Single letter variables'
    }
  },
  todoComments: {
    drake: {
      top: 'Fix issues now',
      bottom: 'TODO comments everywhere'
    },
    doge: {
      top: 'Much procrastination',
      bottom: 'Very TODO'
    },
    changeMyMind: {
      top: 'Change my mind',
      bottom: 'TODO comments are fine'
    }
  },
  longFunctions: {
    drake: {
      top: 'Small functions',
      bottom: 'Monolithic functions'
    },
    doge: {
      top: 'Much function',
      bottom: 'Very long'
    },
    oneDoesNotSimply: {
      top: 'One does not simply',
      bottom: 'Read a 100-line function'
    }
  }
};

const STATIC_MEME_TEMPLATES = {
  drake: {
    name: 'drake',
    description: 'Drake Hotline Bling - Good vs Bad',
    goodFor: ['console.log spam', 'magic numbers', 'magicNumbers', 'bad variable names', 'badVariableNames', 'general comparisons']
  },
  doge: {
    name: 'doge',
    description: 'Much wow, very doge',
    goodFor: ['terrible code', 'spaghetti logic', 'TODO comments', 'todoComments', 'general humor']
  },
  distractedBoyfriend: {
    name: 'distracted-boyfriend',
    description: 'Distracted boyfriend',
    goodFor: ['copy-paste code', 'stack overflow solutions', 'ignoring best practices', 'choosing between options']
  },
  twoButtons: {
    name: 'two-buttons',
    description: 'Two buttons meme',
    goodFor: ['decision making', 'choosing between bad options', 'binary choices']
  },
  changeMyMind: {
    name: 'change-my-mind',
    description: 'Steven Crowder change my mind',
    goodFor: ['opinions about code quality', 'defending bad practices', 'controversial statements', 'magicNumbers', 'todoComments']
  },
  oneDoesNotSimply: {
    name: 'one-does-not-simply',
    description: 'Boromir meme',
    goodFor: ['impossible tasks', 'debugging production', 'refactoring legacy code', 'difficult challenges', 'nestedIfs', 'longFunctions']
  }
};

module.exports = {
  STATIC_ROASTS,
  STATIC_MEME_CAPTIONS,
  STATIC_MEME_TEMPLATES
};
