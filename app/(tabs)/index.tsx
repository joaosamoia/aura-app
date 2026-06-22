import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AffirmationText from '../../components/AffirmationText';
import Aura from '../../components/Aura';
import { useApp } from '../../lib/AppContext';
import {
  affirmationsForTheme,
  affirmationToText,
  dailyIndexForDate,
} from '../../lib/affirmations';
import { useHaptics } from '../../lib/haptics';

export default function Today() {
  const { theme, themeKey, toggleFavorite, isFavorite } = useApp();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  const affirmations = useMemo(() => affirmationsForTheme(themeKey), [themeKey]);
  const [index, setIndex] = useState(() =>
    dailyIndexForDate(new Date(), affirmations.length)
  );
  const [playing, setPlaying] = useState(false);

  // When the desire/theme changes, settle back to that theme's daily affirmation.
  useEffect(() => {
    Speech.stop();
    setPlaying(false);
    setIndex(dailyIndexForDate(new Date(), affirmations.length));
  }, [themeKey, affirmations.length]);

  useEffect(() => () => { Speech.stop(); }, []);

  const current = affirmations[index];
  const favorited = isFavorite(current.id);

  const advance = useCallback(() => {
    Speech.stop();
    setPlaying(false);
    haptics.soft();
    setIndex((i) => (i + 1) % affirmations.length);
  }, [affirmations.length, haptics]);

  const swipeUp = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        'worklet';
        if (e.translationY < -55 || e.velocityY < -650) {
          runOnJS(advance)();
        }
      }),
    [advance]
  );

  const togglePlay = useCallback(() => {
    haptics.light();
    if (playing) {
      Speech.stop();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    Speech.speak(affirmationToText(current), {
      rate: 0.82,
      pitch: 1.05,
      onDone: () => setPlaying(false),
      onStopped: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }, [playing, current, haptics]);

  const onHeart = useCallback(() => {
    haptics.success();
    toggleFavorite(current);
  }, [current, toggleFavorite, haptics]);

  return (
    <View style={styles.root}>
      <Aura theme={theme} />

      <GestureDetector gesture={swipeUp}>
        <View style={styles.gestureArea}>
          <View style={[styles.center, { paddingTop: insets.top }]}>
            <Animated.View
              key={current.id}
              entering={FadeIn.duration(1200)}
              exiting={FadeOut.duration(500)}
            >
              <AffirmationText lines={current.lines} triggerKey={current.id} />
            </Animated.View>
          </View>

          <View style={[styles.controls, { bottom: insets.bottom + 96 }]}>
            <Pressable
              onPress={onHeart}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={12}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={24}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              onPress={togglePlay}
              style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
              hitSlop={12}
            >
              <Ionicons
                name={playing ? 'pause' : 'play'}
                size={26}
                color="#FFFFFF"
                style={!playing ? { marginLeft: 3 } : undefined}
              />
            </Pressable>

            <View style={styles.iconBtn} />
          </View>

          <Text style={[styles.swipeHint, { bottom: insets.bottom + 64 }]}>
            swipe up for another
          </Text>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3E356E' },
  gestureArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.85 },
  swipeHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
