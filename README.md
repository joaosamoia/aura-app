# Aura ✨

A dreamy manifestation & affirmations app. The whole experience floats over a
living, breathing **aura** — layered pastel radial gradients that drift, pulse,
and cross-fade between themes. Built with Expo.

> *"i always get what i want — i literally always get what i want."*

## The feeling

- **Living aura background** rendered procedurally with [Skia](https://shopify.github.io/react-native-skia/):
  five blurred radial-gradient blobs drift and breathe on slow, hypnotic cycles
  (8–30s), over a deep base tone that keeps white text legible.
- **Soft everything** — light rounded Quicksand type, white text with gentle
  shadows, long fades, delicate haptics. Nothing sharp or "techy."
- **Themes recolor the aura smoothly** (no hard cuts):
  - 💗 **Love** — pink, coral, peach
  - 💰 **Money** — gold, amber, champagne
  - 🕊️ **Peace** — lavender, soft blue, lilac
  - 🌿 **Health** — mint, soft gold, warm white

## Screens

- **Onboarding** — a couple of soft welcome beats, then *"What do you want to
  attract?"* (Love / Money / Peace / Health). The choice sets the theme and
  affirmations, saved on the device.
- **Today** (the star) — the daily affirmation fades in line by line over the
  animated aura. Subtle **play** button speaks it aloud (soft TTS voice), a
  discreet **heart** saves it, and **swipe up** brings the next one.
- **Favorites** — saved affirmations, each floating over its own mini-aura.
- **Rituals** — morning *("set your intention")* and night *("program your mind
  before sleep")* reminders at times you choose. Notifications are personalized
  with your desire (e.g. *"You are attracting love"*).
- **Settings** — change your desire/theme, toggle haptics, manage ritual times.

All data (desire, favorites, ritual times, haptics preference) is stored locally
with AsyncStorage. No login.

## Run it

```bash
npm install
# keep native module versions aligned with the Expo SDK:
npx expo install --fix
npx expo start
```

Open in **Expo Go** (or a dev build) on a physical device — notifications and
haptics need a real device. Press the play button on the Today screen to hear an
affirmation spoken aloud.

## Tech

- Expo SDK 51 + expo-router (file-based navigation)
- `@shopify/react-native-skia` — the animated aura
- `react-native-reanimated` — clock-driven motion, color cross-fades, fades
- `expo-speech` (text-to-speech), `expo-haptics`, `expo-notifications`
- `@react-native-async-storage/async-storage` — local persistence

## Project layout

```
app/
  _layout.tsx          root: fonts, providers, splash, stack
  index.tsx            redirect → onboarding or tabs
  onboarding.tsx       welcome + "what do you want to attract?"
  (tabs)/
    _layout.tsx        translucent blurred tab bar
    index.tsx          Today — daily affirmation (the star)
    favorites.tsx      saved affirmations on mini-auras
    rituals.tsx        morning & night reminders
    settings.tsx       theme, haptics, reminders
components/
  Aura.tsx             the living gradient aura (Skia)
  AffirmationText.tsx  sequential line-by-line fade-in
lib/
  themes.ts            palettes
  affirmations.ts      affirmation content per theme
  storage.ts           AsyncStorage helpers
  notifications.ts     local ritual notifications
  haptics.ts           preference-aware haptics
  AppContext.tsx       app state (theme, haptics, favorites)
```
