// Theme palettes for the living aura.
// Each theme has a deep `base` (gives depth + keeps white text legible) and a
// set of bright pastel `blobs` that float and breathe over it.

export type ThemeKey = 'love' | 'money' | 'peace' | 'health';

export interface AuraTheme {
  key: ThemeKey;
  /** Word the user is attracting (used in notifications & onboarding). */
  desire: string;
  /** Short label for UI. */
  label: string;
  /** Deep background tone behind the blobs. */
  base: string;
  /** Bright pastel colors for the floating aura blobs. */
  blobs: string[];
  /** Accent used for subtle UI highlights (e.g. active tab dot). */
  accent: string;
}

export const THEMES: Record<ThemeKey, AuraTheme> = {
  love: {
    key: 'love',
    desire: 'love',
    label: 'Love',
    base: '#5C2A47',
    blobs: ['#FFB6C1', '#FF9AA2', '#FFDAC1', '#FFC8DD', '#FFB7B2'],
    accent: '#FFD3E0',
  },
  money: {
    key: 'money',
    desire: 'abundance',
    label: 'Money',
    base: '#5E4A22',
    blobs: ['#F7D08A', '#FFE3A3', '#FFF1C9', '#E6C07B', '#FDE2B3'],
    accent: '#FFE9B8',
  },
  peace: {
    key: 'peace',
    desire: 'peace',
    label: 'Peace',
    base: '#3E356E',
    blobs: ['#C8B6FF', '#B8C0FF', '#D9CFFF', '#A9C7FF', '#CFC2FF'],
    accent: '#DCD3FF',
  },
  health: {
    key: 'health',
    desire: 'vitality',
    label: 'Health',
    base: '#23604F',
    blobs: ['#B8F2E6', '#AED9C9', '#FBF8CC', '#D6F5E3', '#FDF6E3'],
    accent: '#D6F7EC',
  },
};

export const THEME_ORDER: ThemeKey[] = ['love', 'money', 'peace', 'health'];

export function getTheme(key: ThemeKey): AuraTheme {
  return THEMES[key];
}
