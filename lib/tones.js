// Configurable tones for RoastMe
// Each tone defines voice rules + verbalization helpers used by reporters & roasters.

const TONES = {
  savage: {
    label: 'Savage',
    description: 'Cutting, sarcastic, brutal one-liners.',
    intensity: 8,
    style: 'Sarcastic and unforgiving. Aim straight for the ego.',
    rules: [
      'Hit hard, hit fast.',
      'Mock specifics, not vague generalities.',
      'No mercy, no fluff.'
    ]
  },
  polite: {
    label: 'Polite',
    description: 'Gentle, encouraging, constructive nudges.',
    intensity: 2,
    style: 'Kind and supportive. Soft suggestions wrapped in praise.',
    rules: [
      'Frame issues as opportunities.',
      'Always acknowledge effort.',
      'Suggest improvements, never insult.'
    ]
  },
  'senior-engineer': {
    label: 'Senior Engineer',
    description: 'Calm, technical, mentor-style review feedback.',
    intensity: 4,
    style: 'Direct, technical, mentorship-driven. Provide rationale.',
    rules: [
      'Cite the principle violated (SRP, DRY, KISS, etc.).',
      'Always pair criticism with the fix.',
      'No jokes — just clarity.'
    ]
  },
  cto: {
    label: 'CTO',
    description: 'Strategic, business-focused, risk-oriented.',
    intensity: 5,
    style: 'Speaks in risk, scale, cost, and team velocity.',
    rules: [
      'Frame issues as business risk.',
      'Mention scaling, cost, and team impact.',
      'Highlight what blocks shipping.'
    ]
  },
  corporate: {
    label: 'Corporate',
    description: 'Painfully formal HR-speak. Roasts disguised as feedback.',
    intensity: 3,
    style: 'Excessively formal corporate phrasing.',
    rules: [
      'Use phrases like "opportunity for growth".',
      'Replace insults with passive-aggressive praise.',
      'End with a calendar invite vibe.'
    ]
  },
  toxic: {
    label: 'Toxic',
    description: 'Nuclear meltdown roast mode. Use at your own risk.',
    intensity: 10,
    style: 'Absurd, chaotic, exaggerated humor with dark wit.',
    rules: [
      'Go full chaos.',
      'Use absurd metaphors and exaggerations.',
      'Still target real issues.'
    ]
  },
  gentle: {
    label: 'Gentle',
    description: 'Witty but kind, light teasing only.',
    intensity: 3,
    style: 'Playful and friendly with light sarcasm.',
    rules: [
      'Tease, do not wound.',
      'Pair every jab with a genuine compliment.'
    ]
  }
};

const DEFAULT_TONE = 'savage';

/**
 * List all available tone names.
 * @returns {string[]}
 */
function listTones() {
  return Object.keys(TONES);
}

/**
 * Resolve a tone name to its definition. Falls back to default if invalid.
 * @param {string} name
 * @returns {Object}
 */
function getTone(name) {
  if (!name || typeof name !== 'string') {
    return TONES[DEFAULT_TONE];
  }
  const key = name.toLowerCase();
  return TONES[key] || TONES[DEFAULT_TONE];
}

/**
 * Validate that a tone name is supported.
 * @param {string} name
 * @returns {boolean}
 */
function isValidTone(name) {
  return typeof name === 'string' && Object.prototype.hasOwnProperty.call(TONES, name.toLowerCase());
}

/**
 * Build a tone-aware system prompt fragment.
 * @param {string} name
 * @returns {string}
 */
function describeTone(name) {
  const tone = getTone(name);
  return `Tone: ${tone.label} (intensity ${tone.intensity}/10). ${tone.style} Rules: ${tone.rules.join(' ')}`;
}

module.exports = {
  TONES,
  DEFAULT_TONE,
  listTones,
  getTone,
  isValidTone,
  describeTone
};
