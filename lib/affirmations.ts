import { ThemeKey } from './themes';

// Each affirmation is an ordered list of lines that fade in one by one.
export interface Affirmation {
  id: string;
  theme: ThemeKey;
  lines: string[];
}

const love: string[][] = [
  [
    'i always get what i want',
    'i literally always get what i want',
    'everything always works out in my favor',
    'because i always get what i want',
  ],
  [
    'i am deeply, easily loved',
    'love finds me wherever i go',
    'i am magnetic to the right person',
    'love flows to me effortlessly',
  ],
  [
    'i am worthy of a love that feels safe',
    'i no longer chase, i attract',
    'the right people stay',
    'i am chosen, always',
  ],
  [
    'my heart is open and protected',
    'i give and receive love freely',
    'i am surrounded by warmth',
    'i am so deeply adored',
  ],
];

const money: string[][] = [
  [
    'money flows to me easily',
    'money flows to me constantly',
    'i am a magnet for abundance',
    'there is always more than enough',
  ],
  [
    'i always have more than i need',
    'opportunities find me effortlessly',
    'wealth is my natural state',
    'i receive, and i receive again',
  ],
  [
    'i am safe to be wealthy',
    'money loves to stay with me',
    'every door opens for me',
    'abundance is already mine',
  ],
  [
    'i expect good things, and they come',
    'i am aligned with prosperity',
    'my income rises with ease',
    'i am wealthy in every way',
  ],
];

const peace: string[][] = [
  [
    'i am calm, i am here',
    'nothing can disturb my peace',
    'i breathe, and i soften',
    'all is well within me',
  ],
  [
    'i release what i cannot control',
    'my mind is quiet and clear',
    'i am safe in this moment',
    'peace lives inside me',
  ],
  [
    'i let go, gently',
    'i trust the way things unfold',
    'i am held by something greater',
    'i am at ease',
  ],
  [
    'i am grounded and serene',
    'stillness is my home',
    'i meet each moment softly',
    'i am deeply at peace',
  ],
];

const health: string[][] = [
  [
    'my body is healing, always',
    'i am full of gentle energy',
    'every cell of me is well',
    'i radiate vitality',
  ],
  [
    'i feel light and alive',
    'my body loves me back',
    'i am strong and whole',
    'wellness flows through me',
  ],
  [
    'i nourish myself with kindness',
    'my body knows how to heal',
    'i am glowing from within',
    'health is my natural state',
  ],
  [
    'i wake up restored',
    'i move through the world with ease',
    'i am vibrant and clear',
    'i am thriving',
  ],
];

const BY_THEME: Record<ThemeKey, string[][]> = { love, money, peace, health };

export function affirmationsForTheme(theme: ThemeKey): Affirmation[] {
  return BY_THEME[theme].map((lines, i) => ({
    id: `${theme}-${i}`,
    theme,
    lines,
  }));
}

/** Deterministic "affirmation of the day" based on the date. */
export function dailyIndexForDate(date: Date, count: number): number {
  const dayNumber = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return ((dayNumber % count) + count) % count;
}

export function affirmationToText(a: Affirmation): string {
  return a.lines.join('. ') + '.';
}
