import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Affirmation } from './affirmations';
import * as Storage from './storage';
import { AuraTheme, getTheme, ThemeKey } from './themes';

interface AppContextValue {
  ready: boolean;
  onboarded: boolean;
  themeKey: ThemeKey;
  theme: AuraTheme;
  hapticsEnabled: boolean;
  favorites: Affirmation[];

  completeOnboarding: (theme: ThemeKey) => Promise<void>;
  setTheme: (theme: ThemeKey) => Promise<void>;
  setHapticsEnabled: (v: boolean) => Promise<void>;
  toggleFavorite: (a: Affirmation) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>('peace');
  const [hapticsEnabled, setHapticsState] = useState(true);
  const [favorites, setFavorites] = useState<Affirmation[]>([]);

  useEffect(() => {
    (async () => {
      const [ob, t, h, favs] = await Promise.all([
        Storage.loadOnboarded(),
        Storage.loadTheme(),
        Storage.loadHaptics(),
        Storage.loadFavorites(),
      ]);
      setOnboarded(ob);
      if (t) setThemeKey(t);
      setHapticsState(h);
      setFavorites(favs);
      setReady(true);
    })();
  }, []);

  const completeOnboarding = useCallback(async (t: ThemeKey) => {
    setThemeKey(t);
    setOnboarded(true);
    await Promise.all([Storage.saveTheme(t), Storage.saveOnboarded(true)]);
  }, []);

  const setTheme = useCallback(async (t: ThemeKey) => {
    setThemeKey(t);
    await Storage.saveTheme(t);
  }, []);

  const setHapticsEnabled = useCallback(async (v: boolean) => {
    setHapticsState(v);
    await Storage.saveHaptics(v);
  }, []);

  const toggleFavorite = useCallback(async (a: Affirmation) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === a.id);
      const next = exists ? prev.filter((f) => f.id !== a.id) : [a, ...prev];
      Storage.saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      onboarded,
      themeKey,
      theme: getTheme(themeKey),
      hapticsEnabled,
      favorites,
      completeOnboarding,
      setTheme,
      setHapticsEnabled,
      toggleFavorite,
      isFavorite,
    }),
    [
      ready,
      onboarded,
      themeKey,
      hapticsEnabled,
      favorites,
      completeOnboarding,
      setTheme,
      setHapticsEnabled,
      toggleFavorite,
      isFavorite,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
