import AsyncStorage from '@react-native-async-storage/async-storage';
import { Affirmation } from './affirmations';
import { ThemeKey } from './themes';

const KEYS = {
  onboarded: 'aura.onboarded',
  theme: 'aura.theme',
  haptics: 'aura.haptics',
  favorites: 'aura.favorites',
  rituals: 'aura.rituals',
};

export interface RitualTime {
  enabled: boolean;
  hour: number;
  minute: number;
  /** notification identifier so we can cancel/reschedule. */
  notificationId?: string | null;
}

export interface RitualsState {
  morning: RitualTime;
  night: RitualTime;
}

export const DEFAULT_RITUALS: RitualsState = {
  morning: { enabled: false, hour: 8, minute: 0, notificationId: null },
  night: { enabled: false, hour: 22, minute: 0, notificationId: null },
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort local persistence
  }
}

// --- Onboarding ---
export const loadOnboarded = () => getJSON<boolean>(KEYS.onboarded, false);
export const saveOnboarded = (v: boolean) => setJSON(KEYS.onboarded, v);

// --- Theme / desire ---
export const loadTheme = () => getJSON<ThemeKey | null>(KEYS.theme, null);
export const saveTheme = (t: ThemeKey) => setJSON(KEYS.theme, t);

// --- Haptics preference ---
export const loadHaptics = () => getJSON<boolean>(KEYS.haptics, true);
export const saveHaptics = (v: boolean) => setJSON(KEYS.haptics, v);

// --- Favorites ---
export const loadFavorites = () => getJSON<Affirmation[]>(KEYS.favorites, []);
export const saveFavorites = (f: Affirmation[]) => setJSON(KEYS.favorites, f);

// --- Rituals ---
export const loadRituals = () => getJSON<RitualsState>(KEYS.rituals, DEFAULT_RITUALS);
export const saveRituals = (r: RitualsState) => setJSON(KEYS.rituals, r);
